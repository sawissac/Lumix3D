"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  setTimelineCurrentTime,
  setTimelinePlaying,
} from "@/store/slices/sceneSlice";
import { shapeObjectRegistry } from "../shapeObjectRegistry";
import type { Keyframe } from "@/types";

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpArray(
  a: [number, number, number] | undefined,
  b: [number, number, number] | undefined,
  t: number,
): [number, number, number] {
  const from = a || [0, 0, 0];
  const to = b || from;
  return [
    lerp(from[0], to[0], t),
    lerp(from[1], to[1], t),
    lerp(from[2], to[2], t),
  ];
}

function cubicEaseInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Reusable scratch objects to avoid per-frame allocation.
const _q1 = new THREE.Quaternion();
const _q2 = new THREE.Quaternion();
const _qInterp = new THREE.Quaternion();
const _qShape = new THREE.Quaternion();
const _qBindLocal = new THREE.Quaternion();
const _qFinalLocal = new THREE.Quaternion();
const _eulShape = new THREE.Euler();
const _vOffsetBind = new THREE.Vector3();
const _vRotated = new THREE.Vector3();

function shareGroupContext(prev: Keyframe, next: Keyframe): boolean {
  return (
    !!prev.selectionId &&
    prev.selectionId === next.selectionId &&
    !!prev.pivot &&
    !!next.pivot &&
    !!prev.groupQuat &&
    !!next.groupQuat
  );
}

function safeDiv(n: number): number {
  return Math.abs(n) < 1e-8 ? 1 : n;
}

function applyGroupInterpolation(
  prev: Keyframe,
  next: Keyframe,
  ratio: number,
  shapeRot: [number, number, number],
  shapeScale: [number, number, number],
): {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
} {
  const p1 = prev.pivot!;
  const p2 = next.pivot!;
  const gq1 = prev.groupQuat!;
  const gq2 = next.groupQuat!;
  const gs1 = prev.groupScale ?? [1, 1, 1];
  const gs2 = next.groupScale ?? [1, 1, 1];

  _q1.set(gq1[0], gq1[1], gq1[2], gq1[3]);
  _q2.set(gq2[0], gq2[1], gq2[2], gq2[3]);
  _qInterp.copy(_q1).slerp(_q2, ratio);

  const pivot: [number, number, number] = [
    lerp(p1[0], p2[0], ratio),
    lerp(p1[1], p2[1], ratio),
    lerp(p1[2], p2[2], ratio),
  ];
  const groupScaleInterp: [number, number, number] = [
    lerp(gs1[0], gs2[0], ratio),
    lerp(gs1[1], gs2[1], ratio),
    lerp(gs1[2], gs2[2], ratio),
  ];

  // Recover shape's bind-frame offset from prev keyframe:
  //   prev.position = prev.pivot + prev.groupQuat * (prev.groupScale ⊙ offset)
  //   => offset = (1 / prev.groupScale) ⊙ (inverse(prev.groupQuat) * (prev.position - prev.pivot))
  const prevPos = prev.position || [0, 0, 0];
  _vOffsetBind.set(
    prevPos[0] - p1[0],
    prevPos[1] - p1[1],
    prevPos[2] - p1[2],
  );
  _vOffsetBind.applyQuaternion(_q1.clone().invert());
  _vOffsetBind.set(
    _vOffsetBind.x / safeDiv(gs1[0]),
    _vOffsetBind.y / safeDiv(gs1[1]),
    _vOffsetBind.z / safeDiv(gs1[2]),
  );

  // Final position = pivotInterp + qInterp * (groupScaleInterp ⊙ offset)
  _vRotated.set(
    _vOffsetBind.x * groupScaleInterp[0],
    _vOffsetBind.y * groupScaleInterp[1],
    _vOffsetBind.z * groupScaleInterp[2],
  );
  _vRotated.applyQuaternion(_qInterp);
  const position: [number, number, number] = [
    pivot[0] + _vRotated.x,
    pivot[1] + _vRotated.y,
    pivot[2] + _vRotated.z,
  ];

  // Shape rotation: bindLocal = inverse(prev.groupQuat) * shapeQuat(prev)
  // final = interpGroupQuat * bindLocal
  _eulShape.set(shapeRot[0], shapeRot[1], shapeRot[2]);
  _qShape.setFromEuler(_eulShape);
  _qBindLocal.copy(_q1).invert().multiply(_qShape);
  _qFinalLocal.copy(_qInterp).multiply(_qBindLocal);
  _eulShape.setFromQuaternion(_qFinalLocal);

  // Shape scale: localBindScale = shape.scale_prev / prev.groupScale
  // final = groupScaleInterp ⊙ localBindScale
  const localBindScale: [number, number, number] = [
    shapeScale[0] / safeDiv(gs1[0]),
    shapeScale[1] / safeDiv(gs1[1]),
    shapeScale[2] / safeDiv(gs1[2]),
  ];
  const scale: [number, number, number] = [
    groupScaleInterp[0] * localBindScale[0],
    groupScaleInterp[1] * localBindScale[1],
    groupScaleInterp[2] * localBindScale[2],
  ];

  return {
    position,
    rotation: [_eulShape.x, _eulShape.y, _eulShape.z],
    scale,
  };
}

export function TimelinePlayer() {
  const dispatch = useAppDispatch();
  const timeline = useAppSelector((s) => s.scene.timeline);
  const is3DMode = useAppSelector((s) => s.scene.is3DMode);
  const { invalidate } = useThree();
  const lastTimeRef = useRef<number>(0);
  const lastCurrentTimeRef = useRef<number>(-1);

  useEffect(() => {
    lastTimeRef.current = performance.now();
    if (timeline.isPlaying) invalidate();
  }, [timeline.isPlaying, invalidate]);

  useFrame(() => {
    if (!is3DMode) return;

    if (timeline.isPlaying) {
      const now = performance.now();
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      let newTime = timeline.currentTime + delta;
      if (newTime >= timeline.duration) {
        if (timeline.loop) {
          newTime = newTime % timeline.duration;
        } else {
          newTime = timeline.duration;
          dispatch(setTimelinePlaying(false));
        }
      }
      dispatch(setTimelineCurrentTime(newTime));
      invalidate();
    }

    const scrubbing = timeline.currentTime !== lastCurrentTimeRef.current;
    lastCurrentTimeRef.current = timeline.currentTime;

    // Only apply transforms when playing or when user scrubs the playhead
    if (!timeline.isPlaying && !scrubbing) return;

    for (const track of timeline.tracks) {
      const obj = shapeObjectRegistry.get(track.shapeId);
      if (!obj) continue;

      const keyframes = track.keyframes;
      if (keyframes.length === 0) continue;

      const t = timeline.currentTime;

      // Find surrounding keyframes
      let prev = keyframes[0];
      let next = keyframes[keyframes.length - 1];
      let ratio = 0;

      if (t <= prev.time) {
        ratio = 0;
      } else if (t >= next.time) {
        ratio = 1;
      } else {
        for (let i = 0; i < keyframes.length - 1; i++) {
          if (t >= keyframes[i].time && t <= keyframes[i + 1].time) {
            prev = keyframes[i];
            next = keyframes[i + 1];
            const span = next.time - prev.time;
            ratio = span > 0 ? (t - prev.time) / span : 0;
            ratio = cubicEaseInOut(ratio);
            break;
          }
        }
      }

      let pos: [number, number, number];
      let rot: [number, number, number];
      let scl: [number, number, number];

      if (shareGroupContext(prev, next)) {
        const interp = applyGroupInterpolation(
          prev,
          next,
          ratio,
          prev.rotation || [0, 0, 0],
          prev.scale || [1, 1, 1],
        );
        pos = interp.position;
        rot = interp.rotation;
        scl = interp.scale;
      } else {
        pos = lerpArray(prev.position, next.position, ratio);
        rot = lerpArray(prev.rotation, next.rotation, ratio);
        scl = lerpArray(prev.scale, next.scale, ratio);
      }

      obj.position.set(pos[0], pos[1], pos[2]);
      obj.rotation.set(rot[0], rot[1], rot[2]);
      obj.scale.set(scl[0], scl[1], scl[2]);
    }
  });

  return null;
}

"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  setTimelineCurrentTime,
  setTimelinePlaying,
} from "@/store/slices/sceneSlice";
import { shapeObjectRegistry } from "../shapeObjectRegistry";

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

export function TimelinePlayer() {
  const dispatch = useAppDispatch();
  const timeline = useAppSelector((s) => s.scene.timeline);
  const is3DMode = useAppSelector((s) => s.scene.is3DMode);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    lastTimeRef.current = performance.now();
  }, [timeline.isPlaying]);

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
    }

    // Apply keyframe transforms to scene objects
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

      const pos = lerpArray(prev.position, next.position, ratio);
      const rot = lerpArray(prev.rotation, next.rotation, ratio);
      const scl = lerpArray(prev.scale, next.scale, ratio);

      obj.position.set(pos[0], pos[1], pos[2]);
      obj.rotation.set(rot[0], rot[1], rot[2]);
      obj.scale.set(scl[0], scl[1], scl[2]);
    }
  });

  return null;
}

"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setBoxSelecting,
  setSelectedShapeIds,
} from "@/store/slices/sceneSlice";
import {
  cameraRef,
  canvasElementRef,
  shapeObjectRegistry,
} from "../shapeObjectRegistry";

type Rect = { x: number; y: number; w: number; h: number };

function computeRect(
  start: { x: number; y: number },
  end: { x: number; y: number },
): Rect {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    w: Math.abs(end.x - start.x),
    h: Math.abs(end.y - start.y),
  };
}

export function BoxSelectOverlay() {
  const dispatch = useAppDispatch();
  const isBoxSelecting = useAppSelector((s) => s.scene.isBoxSelecting);
  const selectedShapeIds = useAppSelector((s) => s.scene.selectedShapeIds);

  const [rect, setRect] = useState<Rect | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const additiveRef = useRef(false);
  const baseSelectionRef = useRef<string[]>([]);

  useEffect(() => {
    if (!isBoxSelecting) {
      setRect(null);
      startRef.current = null;
    }
  }, [isBoxSelecting]);

  useEffect(() => {
    if (!isBoxSelecting) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        dispatch(setBoxSelecting(false));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isBoxSelecting, dispatch]);

  if (!isBoxSelecting) return null;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const p = { x: e.clientX - bounds.left, y: e.clientY - bounds.top };
    startRef.current = p;
    additiveRef.current = e.shiftKey || e.ctrlKey || e.metaKey;
    baseSelectionRef.current = additiveRef.current ? [...selectedShapeIds] : [];
    setRect({ x: p.x, y: p.y, w: 0, h: 0 });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!startRef.current) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const p = { x: e.clientX - bounds.left, y: e.clientY - bounds.top };
    setRect(computeRect(startRef.current, p));
  };

  const finishSelection = (finalRect: Rect) => {
    const camera = cameraRef.current;
    const canvas = canvasElementRef.current;
    if (!camera || !canvas) return;
    const canvasBounds = canvas.getBoundingClientRect();
    const width = canvasBounds.width;
    const height = canvasBounds.height;

    const hits = new Set<string>(baseSelectionRef.current);
    const v = new THREE.Vector3();

    shapeObjectRegistry.forEach((obj, id) => {
      obj.getWorldPosition(v);
      v.project(camera);
      // NDC behind camera → z outside [-1, 1]
      if (v.z < -1 || v.z > 1) return;
      const sx = (v.x + 1) * 0.5 * width;
      const sy = (-v.y + 1) * 0.5 * height;
      const inside =
        sx >= finalRect.x &&
        sx <= finalRect.x + finalRect.w &&
        sy >= finalRect.y &&
        sy <= finalRect.y + finalRect.h;
      if (inside) hits.add(id);
    });

    dispatch(setSelectedShapeIds(Array.from(hits)));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!startRef.current) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const p = { x: e.clientX - bounds.left, y: e.clientY - bounds.top };
    const finalRect = computeRect(startRef.current, p);
    startRef.current = null;
    setRect(null);
    e.currentTarget.releasePointerCapture(e.pointerId);

    // Treat tiny drags as a cancel to avoid accidental selection dump.
    if (finalRect.w >= 3 && finalRect.h >= 3) {
      finishSelection(finalRect);
    }
    dispatch(setBoxSelecting(false));
  };

  return (
    <div
      className="absolute inset-0 z-30"
      style={{ cursor: "crosshair" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {rect && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: rect.x,
            top: rect.y,
            width: rect.w,
            height: rect.h,
            border: "1px dashed rgba(251, 191, 36, 0.9)",
            background: "rgba(251, 191, 36, 0.08)",
          }}
        />
      )}
      <div
        className="absolute top-5 left-1/2 -translate-x-1/2 pointer-events-none text-xs text-white/90 px-3 py-1.5 rounded-lg border border-white/10"
        style={{
          background: "rgba(15, 15, 25, 0.78)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        Box Select — drag to select (Shift/Ctrl to add) · Esc to cancel
      </div>
    </div>
  );
}

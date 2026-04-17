"use client";

import { Lock, Unlock } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleRotationLock } from "@/store/slices/sceneSlice";
import { cn } from "@/lib/utils";

export function RotationLockToolbar() {
  const dispatch = useAppDispatch();
  const selectedShapeId = useAppSelector((s) => s.scene.selectedShapeId);
  const transformMode = useAppSelector((s) => s.scene.transformMode);
  const rotationLock = useAppSelector((s) => s.scene.rotationLock);

  if (!selectedShapeId || transformMode !== "rotate") return null;

  const axes: Array<"x" | "y" | "z"> = ["x", "y", "z"];

  return (
    <div className="absolute bottom-5 right-5 z-20 pointer-events-auto">
      <div
        className="rounded-xl px-1 py-1 flex flex-col gap-0.5 shadow-2xl shadow-black/70 border border-white/8"
        style={{
          background: "rgba(15, 15, 25, 0.85)",
          backdropFilter: "blur(24px) saturate(200%)",
          WebkitBackdropFilter: "blur(24px) saturate(200%)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <div className="text-[10px] font-medium text-white/40 px-3 py-1 uppercase tracking-wider">
          Lock Axis
        </div>
        {axes.map((axis) => {
          const isLocked = rotationLock[axis];
          return (
            <button
              key={axis}
              onClick={() => dispatch(toggleRotationLock(axis))}
              title={`${isLocked ? "Unlock" : "Lock"} ${axis.toUpperCase()} rotation`}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-150 text-xs font-medium",
                isLocked
                  ? "bg-red-500/30 text-red-300 border border-red-500/40"
                  : "text-white/60 hover:text-white/90 hover:bg-white/6 border border-transparent",
              )}
            >
              {isLocked ? (
                <Lock className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <Unlock className="w-3.5 h-3.5 shrink-0" />
              )}
              <span className="uppercase font-bold">{axis}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

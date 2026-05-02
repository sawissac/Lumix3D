"use client";

import { Lock } from "lucide-react";
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
    <div className="absolute bottom-3 right-3 z-20 pointer-events-auto">
      <div
        className="rounded-lg p-0.5 flex gap-0.5 border border-white/8"
        style={{
          background: "rgba(15, 15, 25, 0.85)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
        }}
      >
        {axes.map((axis) => {
          const isLocked = rotationLock[axis];
          return (
            <button
              key={axis}
              onClick={() => dispatch(toggleRotationLock(axis))}
              title={`${isLocked ? "Unlock" : "Lock"} ${axis.toUpperCase()} rotation`}
              className={cn(
                "w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold uppercase relative transition-colors",
                isLocked
                  ? "bg-red-500/25 text-red-300"
                  : "text-white/55 hover:text-white/85 hover:bg-white/6",
              )}
            >
              {axis}
              {isLocked ? (
                <Lock className="absolute -top-px -right-px w-2 h-2 text-red-200" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

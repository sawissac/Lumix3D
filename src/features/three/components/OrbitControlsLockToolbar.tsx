"use client";

import { Lock, Unlock, RotateCw, Move, ZoomIn } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  toggleOrbitControlsLock,
  setExclusiveOrbitControlsAxis,
} from "@/store/slices/sceneSlice";
import { cn } from "@/lib/utils";

export function OrbitControlsLockToolbar() {
  const dispatch = useAppDispatch();
  const is3DMode = useAppSelector((s) => s.scene.is3DMode);
  const orbitControlsLock = useAppSelector((s) => s.scene.orbitControlsLock);

  if (!is3DMode) return null;

  const controls: Array<{
    key: "rotate" | "pan" | "zoom";
    label: string;
    Icon: typeof RotateCw;
  }> = [
    { key: "rotate", label: "Rotate", Icon: RotateCw },
    { key: "pan", label: "Pan", Icon: Move },
    { key: "zoom", label: "Zoom", Icon: ZoomIn },
  ];

  const rotateAxes: Array<"rotateX" | "rotateY" | "rotateZ"> = [
    "rotateX",
    "rotateY",
    "rotateZ",
  ];

  return (
    <div className="absolute top-5 right-5 z-20 pointer-events-auto">
      <div
        className="rounded-xl px-1 py-1 flex flex-col gap-0.5 shadow-2xl shadow-black/70 border border-white/8"
        style={{
          background: "rgba(15, 15, 25, 0.85)",
          backdropFilter: "blur(24px) saturate(200%)",
          WebkitBackdropFilter: "blur(24px) saturate(200%)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <div className="text-[10px] font-medium text-white/40 px-3 py-1 uppercase tracking-wider">
          Lock Camera
        </div>
        {controls.map(({ key, label, Icon }) => {
          const isLocked = orbitControlsLock[key];
          return (
            <button
              key={key}
              onClick={() => dispatch(toggleOrbitControlsLock(key))}
              title={`${isLocked ? "Unlock" : "Lock"} ${label}`}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-150 text-xs font-medium",
                "hover:bg-white/6 border border-transparent active:bg-white/10 active:scale-95",
                isLocked
                  ? "text-white/40"
                  : "text-blue-400 hover:text-blue-300",
              )}
            >
              {isLocked ? (
                <Lock className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <Unlock className="w-3.5 h-3.5 shrink-0" />
              )}
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium">{label}</span>
            </button>
          );
        })}

        {!orbitControlsLock.rotate && (
          <>
            <div className="h-px bg-white/10 my-0.5" />
            <div className="text-[9px] font-medium text-white/30 px-3 py-0.5 uppercase tracking-wider">
              Rotate Axis
            </div>
            {rotateAxes.map((axis) => {
              const isLocked = orbitControlsLock[axis];
              const axisLabel = axis.replace("rotate", "");
              return (
                <button
                  key={axis}
                  onClick={() => dispatch(setExclusiveOrbitControlsAxis(axis))}
                  title={
                    !isLocked &&
                    ["rotateX", "rotateY", "rotateZ"].every(
                      (a) =>
                        a === axis ||
                        orbitControlsLock[a as keyof typeof orbitControlsLock],
                    )
                      ? "Reset all rotation axes"
                      : `Rotate only on ${axisLabel}`
                  }
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-150 text-xs font-medium",
                    "hover:bg-white/6 border border-transparent active:bg-white/10 active:scale-95",
                    isLocked
                      ? "text-white/40"
                      : "text-blue-400 hover:text-blue-300",
                  )}
                >
                  {isLocked ? (
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span className="uppercase font-bold">{axisLabel}</span>
                </button>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

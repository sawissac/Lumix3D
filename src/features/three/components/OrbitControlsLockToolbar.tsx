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

  const rotateAxes: Array<{ key: "rotateX" | "rotateY" | "rotateZ"; label: string }> = [
    { key: "rotateX", label: "X" },
    { key: "rotateY", label: "Y" },
    { key: "rotateZ", label: "Z" },
  ];

  const panelStyle = {
    background: "rgba(15, 15, 25, 0.85)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
  } as const;

  return (
    <div className="absolute top-[120px] right-3 z-20 pointer-events-auto">
      <div
        className="rounded-lg p-0.5 flex flex-col gap-0.5 border border-white/8"
        style={panelStyle}
      >
        {/* Camera lock — icon-only row */}
        <div className="flex gap-0.5">
          {controls.map(({ key, label, Icon }) => {
            const isLocked = orbitControlsLock[key];
            return (
              <button
                key={key}
                onClick={() => dispatch(toggleOrbitControlsLock(key))}
                title={`${isLocked ? "Unlock" : "Lock"} ${label}`}
                className={cn(
                  "w-7 h-7 rounded-md flex items-center justify-center relative transition-colors",
                  isLocked
                    ? "text-white/35 hover:text-white/55 hover:bg-white/6"
                    : "text-blue-400 hover:text-blue-300 hover:bg-white/6",
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {isLocked ? (
                  <Lock className="absolute -top-px -right-px w-2 h-2 text-white/55" />
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Per-axis rotate locks — only when rotate enabled */}
        {!orbitControlsLock.rotate && (
          <>
            <div className="h-px bg-white/8" />
            <div className="flex gap-0.5">
              {rotateAxes.map(({ key, label }) => {
                const isLocked = orbitControlsLock[key];
                const isOnlyUnlocked = !isLocked &&
                  (["rotateX", "rotateY", "rotateZ"] as const).every(
                    (a) =>
                      a === key ||
                      orbitControlsLock[a as keyof typeof orbitControlsLock],
                  );
                return (
                  <button
                    key={key}
                    onClick={() => dispatch(setExclusiveOrbitControlsAxis(key))}
                    title={
                      isOnlyUnlocked
                        ? "Reset all rotation axes"
                        : `Rotate only on ${label}`
                    }
                    className={cn(
                      "w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold uppercase transition-colors",
                      isLocked
                        ? "text-white/35 hover:text-white/55 hover:bg-white/6"
                        : "text-blue-400 hover:text-blue-300 hover:bg-white/6",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

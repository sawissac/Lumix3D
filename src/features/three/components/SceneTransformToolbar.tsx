"use client";

import { Move, RotateCw, Maximize, MousePointer2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTransformMode } from "@/store/slices/sceneSlice";
import { cn } from "@/lib/utils";

export function SceneTransformToolbar() {
  const dispatch = useAppDispatch();
  const selectedShapeId = useAppSelector((s) => s.scene.selectedShapeId);
  const transformMode = useAppSelector((s) => s.scene.transformMode);

  if (!selectedShapeId) return null;

  const tools = [
    { mode: null as null, label: "Select", Icon: MousePointer2, shortcut: "Q" },
    { mode: "translate" as const, label: "Move", Icon: Move, shortcut: "W" },
    { mode: "rotate" as const, label: "Rotate", Icon: RotateCw, shortcut: "E" },
    { mode: "scale" as const, label: "Scale", Icon: Maximize, shortcut: "R" },
  ];

  return (
    <div className="absolute bottom-3 left-3 z-20 pointer-events-auto">
      <div
        className="rounded-lg p-0.5 flex gap-0.5 border border-white/8"
        style={{
          background: "rgba(15, 15, 25, 0.85)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
        }}
      >
        {tools.map(({ mode, label, Icon, shortcut }) => {
          const active = transformMode === mode;
          return (
            <button
              key={label}
              onClick={() => dispatch(setTransformMode(mode))}
              title={`${label} (${shortcut})`}
              className={cn(
                "w-7 h-7 rounded-md flex items-center justify-center transition-colors",
                active
                  ? "bg-indigo-500/30 text-indigo-300"
                  : "text-white/45 hover:text-white/85 hover:bg-white/6",
              )}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

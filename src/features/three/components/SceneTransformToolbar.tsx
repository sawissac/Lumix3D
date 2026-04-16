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
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
      <div className="glass-strong rounded-xl px-1 py-1 flex gap-0.5 shadow-2xl shadow-black/60">
        {tools.map(({ mode, label, Icon, shortcut }) => {
          const active = transformMode === mode;
          return (
            <button
              key={label}
              onClick={() => dispatch(setTransformMode(mode))}
              title={`${label} (${shortcut})`}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 text-xs font-medium",
                active
                  ? "bg-indigo-500/30 text-indigo-300 border border-indigo-500/40"
                  : "text-white/50 hover:text-white/90 hover:bg-white/8 border border-transparent",
              )}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{label}</span>
              <span className="text-[9px] opacity-40 -ml-0.5">{shortcut}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

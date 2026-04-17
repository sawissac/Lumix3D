"use client";

import { MousePointer2, Move, RotateCw, Scale, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTransformMode, clearSelection } from "@/store/slices/sceneSlice";
import { cn } from "@/lib/utils";

type HintRow = {
  keys: string[];
  label: string;
};

const HINTS: HintRow[] = [
  { keys: ["Click"], label: "Select" },
  { keys: ["Ctrl", "Click"], label: "Multi-select" },
  { keys: ["G"], label: "Move" },
  { keys: ["R"], label: "Rotate" },
  { keys: ["S"], label: "Scale" },
];

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-md text-[10px] font-semibold text-white/85 bg-white/8 border border-white/12 shadow-[inset_0_-1px_0_rgba(0,0,0,0.3)]">
      {children}
    </kbd>
  );
}

const PANEL_STYLE = {
  background: "rgba(15, 15, 25, 0.78)",
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
  boxShadow:
    "0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
} as const;

export function SelectionHint() {
  const dispatch = useAppDispatch();
  const selectedShapeId = useAppSelector((s) => s.scene.selectedShapeId);
  const selectedShapeIds = useAppSelector((s) => s.scene.selectedShapeIds);
  const is3DMode = useAppSelector((s) => s.scene.is3DMode);
  const svgShapes = useAppSelector((s) => s.scene.svgShapes);
  const transformMode = useAppSelector((s) => s.scene.transformMode);

  if (!is3DMode || svgShapes.length === 0) return null;

  const hasSelection = selectedShapeIds.length > 0;

  if (!hasSelection) {
    return (
      <div className="absolute top-5 left-5 z-20 pointer-events-none">
        <div
          className="rounded-xl p-3 w-56 shadow-2xl shadow-black/60 border border-white/8"
          style={PANEL_STYLE}
        >
          <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-white/8">
            <MousePointer2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] uppercase tracking-wider font-semibold text-white/70">
              Shortcuts
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {HINTS.map((hint) => (
              <div
                key={hint.label}
                className="flex items-center justify-between gap-3"
              >
                <span className="text-xs text-white/65">{hint.label}</span>
                <div className="flex items-center gap-1">
                  {hint.keys.map((key, i) => (
                    <span key={i} className="flex items-center gap-1">
                      {i > 0 && (
                        <span className="text-white/30 text-[10px]">+</span>
                      )}
                      <Kbd>{key}</Kbd>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const modes = [
    { id: "translate" as const, icon: Move, label: "Move", key: "G" },
    { id: "rotate" as const, icon: RotateCw, label: "Rotate", key: "R" },
    { id: "scale" as const, icon: Scale, label: "Scale", key: "S" },
  ];

  const handleModeChange = (mode: "translate" | "rotate" | "scale") => {
    dispatch(setTransformMode(transformMode === mode ? null : mode));
  };

  const selectionLabel =
    selectedShapeIds.length > 1
      ? `${selectedShapeIds.length} Objects`
      : selectedShapeId === "global"
        ? "All Objects"
        : "Object";

  return (
    <div className="absolute top-5 left-5 z-20 pointer-events-auto">
      <div
        className="rounded-xl p-3 w-56 shadow-2xl shadow-black/60 border border-white/8"
        style={PANEL_STYLE}
      >
        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-white/8">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
            <span className="text-[11px] uppercase tracking-wider font-semibold text-white/80">
              {selectionLabel}
            </span>
          </div>
          <button
            onClick={() => dispatch(clearSelection())}
            title="Deselect (Esc)"
            className="flex items-center justify-center w-5 h-5 rounded-md text-white/50 hover:text-white/90 hover:bg-white/8 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex flex-col gap-1">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = transformMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                title={`${mode.label} (${mode.key})`}
                className={cn(
                  "flex items-center justify-between gap-3 px-2 py-1.5 rounded-lg transition-all duration-150 text-xs font-medium border",
                  isActive
                    ? "bg-blue-500/20 text-blue-200 border-blue-500/40"
                    : "text-white/65 hover:text-white/90 hover:bg-white/6 border-transparent",
                )}
              >
                <span className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{mode.label}</span>
                </span>
                <Kbd>{mode.key}</Kbd>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

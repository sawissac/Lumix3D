"use client";

import { useState } from "react";
import { Keyboard, Move, RotateCw, Scale, X } from "lucide-react";
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
  { keys: ["A"], label: "Select all" },
  { keys: ["Alt", "A"], label: "Deselect all" },
  { keys: ["B"], label: "Box select" },
  { keys: ["G"], label: "Move" },
  { keys: ["R"], label: "Rotate" },
  { keys: ["S"], label: "Scale" },
];

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded text-[9px] font-semibold text-white/85 bg-white/8 border border-white/12">
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
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  if (!is3DMode || svgShapes.length === 0) return null;

  const hasSelection = selectedShapeIds.length > 0;

  if (!hasSelection) {
    return (
      <div
        className="absolute top-3 left-3 z-20 pointer-events-auto"
        onMouseEnter={() => setShortcutsOpen(true)}
        onMouseLeave={() => setShortcutsOpen(false)}
      >
        <button
          onClick={() => setShortcutsOpen((v) => !v)}
          title="Keyboard shortcuts"
          className="w-7 h-7 rounded-md flex items-center justify-center border border-white/8 text-white/55 hover:text-white/85 transition-colors"
          style={PANEL_STYLE}
        >
          <Keyboard className="w-3.5 h-3.5" />
        </button>
        {shortcutsOpen && (
          <div
            className="absolute top-8 left-0 mt-1 rounded-lg p-2 w-48 border border-white/8"
            style={PANEL_STYLE}
          >
            <div className="px-1 pb-1.5 mb-1 border-b border-white/8 text-[9px] uppercase tracking-wider font-semibold text-white/45">
              Shortcuts
            </div>
            <div className="flex flex-col gap-0.5">
              {HINTS.map((hint) => (
                <div
                  key={hint.label}
                  className="flex items-center justify-between gap-2 px-1 h-5"
                >
                  <span className="text-[10px] text-white/60">{hint.label}</span>
                  <div className="flex items-center gap-0.5">
                    {hint.keys.map((key, i) => (
                      <span key={i} className="flex items-center gap-0.5">
                        {i > 0 && (
                          <span className="text-white/25 text-[9px]">+</span>
                        )}
                        <Kbd>{key}</Kbd>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
    <div className="absolute top-3 left-3 z-20 pointer-events-auto">
      <div
        className="rounded-lg p-1.5 w-44 border border-white/8"
        style={PANEL_STYLE}
      >
        <div className="flex items-center justify-between px-1 mb-1 pb-1.5 border-b border-white/8">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span className="text-[10px] uppercase tracking-wider font-semibold text-white/80">
              {selectionLabel}
            </span>
          </div>
          <button
            onClick={() => dispatch(clearSelection())}
            title="Deselect (Esc)"
            className="flex items-center justify-center w-4 h-4 rounded text-white/45 hover:text-white/85 hover:bg-white/8 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        <div className="flex flex-col gap-0.5">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = transformMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                title={`${mode.label} (${mode.key})`}
                className={cn(
                  "flex items-center justify-between gap-2 px-1.5 h-6 rounded transition-colors text-[10px] font-medium",
                  isActive
                    ? "bg-blue-500/20 text-blue-200"
                    : "text-white/60 hover:text-white/90 hover:bg-white/6",
                )}
              >
                <span className="flex items-center gap-1.5">
                  <Icon className="w-3 h-3 shrink-0" />
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

"use client";

import { useEffect, useState } from "react";
import { Undo2, Redo2 } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { useStore } from "react-redux";
import { undo, redo } from "@/store/slices/sceneSlice";
import { canUndo, canRedo } from "@/store/historyMiddleware";
import { cn } from "@/lib/utils";

function useHistoryAvailability() {
  const store = useStore();
  const [state, setState] = useState({ canUndo: false, canRedo: false });

  useEffect(() => {
    const update = () => setState({ canUndo: canUndo(), canRedo: canRedo() });
    update();
    return store.subscribe(update);
  }, [store]);

  return state;
}

export function UndoRedoToolbar() {
  const dispatch = useAppDispatch();
  const { canUndo: hasUndo, canRedo: hasRedo } = useHistoryAvailability();

  const btnBase =
    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 text-xs font-medium border";
  const activeStyle =
    "text-white/80 hover:text-white hover:bg-white/8 border-transparent cursor-pointer";
  const disabledStyle =
    "text-white/20 border-transparent cursor-not-allowed";

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
      <div
        className="rounded-xl px-1 py-1 flex gap-0.5 shadow-2xl shadow-black/70 border border-white/8"
        style={{
          background: "rgba(15, 15, 25, 0.85)",
          backdropFilter: "blur(24px) saturate(200%)",
          WebkitBackdropFilter: "blur(24px) saturate(200%)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <button
          onClick={() => hasUndo && dispatch(undo())}
          disabled={!hasUndo}
          title="Undo (Ctrl+Z)"
          className={cn(btnBase, hasUndo ? activeStyle : disabledStyle)}
        >
          <Undo2 className="w-3.5 h-3.5 shrink-0" />
          <span>Undo</span>
          <span className="text-[9px] opacity-35 -ml-0.5">⌘Z</span>
        </button>

        <div className="w-px self-stretch bg-white/8 mx-0.5" />

        <button
          onClick={() => hasRedo && dispatch(redo())}
          disabled={!hasRedo}
          title="Redo (Ctrl+Shift+Z)"
          className={cn(btnBase, hasRedo ? activeStyle : disabledStyle)}
        >
          <Redo2 className="w-3.5 h-3.5 shrink-0" />
          <span>Redo</span>
          <span className="text-[9px] opacity-35 -ml-0.5">⇧⌘Z</span>
        </button>
      </div>
    </div>
  );
}

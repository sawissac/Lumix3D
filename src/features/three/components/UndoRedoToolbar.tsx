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

  const btn =
    "w-7 h-7 rounded-md flex items-center justify-center transition-colors";

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
      <div
        className="rounded-lg p-0.5 flex gap-0.5 border border-white/8"
        style={{
          background: "rgba(15, 15, 25, 0.85)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
        }}
      >
        <button
          onClick={() => hasUndo && dispatch(undo())}
          disabled={!hasUndo}
          title="Undo (⌘Z)"
          className={cn(
            btn,
            hasUndo
              ? "text-white/75 hover:text-white hover:bg-white/8 cursor-pointer"
              : "text-white/20 cursor-not-allowed",
          )}
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => hasRedo && dispatch(redo())}
          disabled={!hasRedo}
          title="Redo (⇧⌘Z)"
          className={cn(
            btn,
            hasRedo
              ? "text-white/75 hover:text-white hover:bg-white/8 cursor-pointer"
              : "text-white/20 cursor-not-allowed",
          )}
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useState } from "react";
import { Film, Play, Pencil, Trash2, Check, X } from "lucide-react";
import { CollapsibleCard } from "./CollapsibleCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  applyAnimation,
  deleteSavedAnimation,
  renameSavedAnimation,
} from "@/store/slices/sceneSlice";

export function SavedAnimationsList() {
  const dispatch = useAppDispatch();
  const savedAnimations = useAppSelector((s) => s.scene.savedAnimations);
  const selectedShapeId = useAppSelector((s) => s.scene.selectedShapeId);
  const selectedShapeIds = useAppSelector((s) => s.scene.selectedShapeIds);
  const is3DMode = useAppSelector((s) => s.scene.is3DMode);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  const targetIds =
    selectedShapeIds.length > 0
      ? selectedShapeIds
      : selectedShapeId
        ? [selectedShapeId]
        : [];

  const handleApply = useCallback(
    (animationId: string) => {
      if (targetIds.length === 0) return;
      dispatch(applyAnimation({ animationId, targetIds }));
    },
    [dispatch, targetIds],
  );

  const handleDelete = useCallback(
    (id: string) => {
      dispatch(deleteSavedAnimation(id));
    },
    [dispatch],
  );

  const startRename = (id: string, current: string) => {
    setEditingId(id);
    setDraftName(current);
  };

  const commitRename = () => {
    if (editingId && draftName.trim()) {
      dispatch(renameSavedAnimation({ id: editingId, name: draftName.trim() }));
    }
    setEditingId(null);
    setDraftName("");
  };

  if (!is3DMode) return null;
  if (savedAnimations.length === 0) return null;

  const canApply = targetIds.length > 0;

  return (
    <CollapsibleCard
      id="saved-animations"
      cardClassName="border-pink-500/20"
      title="Saved Animations"
      titleClassName="text-pink-400"
      description={
        canApply
          ? `Apply to ${targetIds.length} selected shape${targetIds.length > 1 ? "s" : ""}`
          : "Select shape(s) to apply an animation"
      }
      contentClassName="space-y-2 pt-3"
    >
      <ul className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
        {savedAnimations.map((anim) => {
          const isEditing = editingId === anim.id;
          return (
            <li
              key={anim.id}
              className="group flex items-center gap-2 px-2 py-1.5 rounded-md bg-black/20 border border-white/5 hover:border-pink-500/30 transition-colors"
            >
              <Film className="h-3.5 w-3.5 shrink-0 text-pink-300/80" />
              {isEditing ? (
                <Input
                  autoFocus
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename();
                    if (e.key === "Escape") {
                      setEditingId(null);
                      setDraftName("");
                    }
                  }}
                  className="flex-1 h-7 text-xs bg-black/30 border-pink-500/30"
                />
              ) : (
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/85 font-medium truncate">
                    {anim.name}
                  </div>
                  <div className="text-[10px] text-white/40 font-mono">
                    {anim.tracks.length} track{anim.tracks.length === 1 ? "" : "s"} · {anim.duration.toFixed(1)}s
                  </div>
                </div>
              )}
              {isEditing ? (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={commitRename}
                    className="h-7 w-7 text-emerald-300 hover:bg-emerald-500/10"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditingId(null);
                      setDraftName("");
                    }}
                    className="h-7 w-7 text-white/40 hover:bg-white/5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={!canApply}
                    onClick={() => handleApply(anim.id)}
                    title={canApply ? "Apply to current selection" : "Select shape(s) first"}
                    className="h-7 w-7 text-pink-300 hover:bg-pink-500/15 disabled:opacity-30"
                  >
                    <Play className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => startRename(anim.id, anim.name)}
                    title="Rename"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-white/50 hover:bg-white/5"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(anim.id)}
                    title="Delete"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-red-400 hover:bg-red-400/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </CollapsibleCard>
  );
}

"use client";

import { useState } from "react";
import { Users, Plus, Trash2, Layers, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createGroup,
  deleteGroup,
  selectGroup,
  ungroupSelected,
} from "@/store/slices/sceneSlice";
import { cn } from "@/lib/utils";

export function GroupManager() {
  const dispatch = useAppDispatch();
  const selectedShapeIds = useAppSelector((s) => s.scene.selectedShapeIds);
  const groups = useAppSelector((s) => s.scene.groups);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [groupName, setGroupName] = useState("");

  const canCreateGroup = selectedShapeIds.length >= 2;

  const handleCreateGroup = () => {
    if (groupName.trim() && canCreateGroup) {
      dispatch(createGroup({ name: groupName.trim() }));
      setGroupName("");
      setShowGroupDialog(false);
    }
  };

  const handleUngroup = () => {
    dispatch(ungroupSelected());
  };

  const isGroupSelected = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return false;
    return (
      group.shapeIds.length === selectedShapeIds.length &&
      group.shapeIds.every((id) => selectedShapeIds.includes(id))
    );
  };

  if (selectedShapeIds.length === 0 && groups.length === 0) return null;

  return (
    <div className="absolute bottom-5 left-5 z-20 pointer-events-auto">
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
          Selection & Groups
        </div>

        {selectedShapeIds.length > 0 && (
          <div className="px-3 py-1.5 text-xs text-white/60">
            <span className="font-medium text-blue-400">
              {selectedShapeIds.length}
            </span>{" "}
            object{selectedShapeIds.length > 1 ? "s" : ""} selected
          </div>
        )}

        {canCreateGroup && (
          <button
            onClick={() => setShowGroupDialog(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-150 text-xs font-medium text-white/60 hover:text-white/90 hover:bg-white/6 border border-transparent"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Create Group</span>
          </button>
        )}

        {selectedShapeIds.length >= 2 && (
          <button
            onClick={handleUngroup}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-150 text-xs font-medium text-white/60 hover:text-white/90 hover:bg-white/6 border border-transparent"
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>Ungroup</span>
          </button>
        )}

        {groups.length > 0 && (
          <>
            <div className="h-px bg-white/10 my-0.5" />
            <div className="text-[9px] font-medium text-white/30 px-3 py-0.5 uppercase tracking-wider">
              Groups ({groups.length})
            </div>
            {groups.map((group) => (
              <div
                key={group.id}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-150 text-xs font-medium",
                  isGroupSelected(group.id)
                    ? "bg-blue-500/30 text-blue-300 border border-blue-500/40"
                    : "text-white/60 hover:bg-white/6 border border-transparent",
                )}
              >
                <button
                  onClick={() => dispatch(selectGroup(group.id))}
                  className="flex items-center gap-2 flex-1"
                >
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate max-w-[120px]">{group.name}</span>
                  <span className="text-[10px] opacity-50">
                    ({group.shapeIds.length})
                  </span>
                </button>
                <button
                  onClick={() => dispatch(deleteGroup(group.id))}
                  className="hover:text-red-400 transition-colors"
                  title="Delete group"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {showGroupDialog && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowGroupDialog(false)}
        >
          <div
            className="rounded-xl p-4 shadow-2xl border border-white/10 w-80"
            style={{
              background: "rgba(15, 15, 25, 0.95)",
              backdropFilter: "blur(24px) saturate(200%)",
              WebkitBackdropFilter: "blur(24px) saturate(200%)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Create Group</h3>
              <button
                onClick={() => setShowGroupDialog(false)}
                className="text-white/40 hover:text-white/90 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-white/60 mb-3">
              Group {selectedShapeIds.length} selected objects together
            </p>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateGroup();
                if (e.key === "Escape") setShowGroupDialog(false);
              }}
              placeholder="Group name..."
              autoFocus
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setShowGroupDialog(false)}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white/90 hover:bg-white/6 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim()}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/30 text-blue-300 border border-blue-500/40 hover:bg-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

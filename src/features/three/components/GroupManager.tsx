"use client";

import { Users, Plus, Trash2, Layers, X, Eye, EyeOff } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createGroup,
  deleteGroup,
  toggleGroupVisibility,
  selectGroup,
  ungroupSelected,
  setGroupName,
  setShowGroupDialog,
} from "@/store/slices/sceneSlice";
import { cn } from "@/lib/utils";

const PANEL_STYLE = {
  background: "rgba(15, 15, 25, 0.85)",
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
  boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
} as const;

export function GroupManager() {
  const dispatch = useAppDispatch();
  const selectedShapeIds = useAppSelector((s) => s.scene.selectedShapeIds);
  const groups = useAppSelector((s) => s.scene.groups);
  const { showGroupDialog, groupName } = useAppSelector((s) => s.scene);

  const canCreateGroup = selectedShapeIds.length >= 2;

  const handleCreateGroup = () => {
    if (groupName.trim() && canCreateGroup) {
      dispatch(createGroup({ name: groupName.trim() }));
      dispatch(setGroupName(""));
      dispatch(setShowGroupDialog(false));
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
    <div
      className={cn(
        "absolute left-3 z-20 pointer-events-auto flex flex-col gap-1.5 max-w-[200px]",
        selectedShapeIds.length > 0 ? "bottom-14" : "bottom-3",
      )}
    >
      {/* Selection actions */}
      {(selectedShapeIds.length > 0 || canCreateGroup) && (
        <div
          className="rounded-lg p-0.5 flex flex-col gap-0.5 border border-white/8"
          style={PANEL_STYLE}
        >
          {selectedShapeIds.length > 0 && (
            <div className="px-2 h-6 flex items-center text-[10px] text-white/55">
              <span className="font-semibold text-blue-400 mr-1">
                {selectedShapeIds.length}
              </span>
              selected
            </div>
          )}
          {canCreateGroup && (
            <button
              onClick={() => dispatch(setShowGroupDialog(true))}
              className="flex items-center gap-1.5 px-2 h-6 rounded-md text-[10px] text-white/65 hover:text-white hover:bg-white/6 transition-colors"
            >
              <Plus className="w-3 h-3 shrink-0" />
              <span>Create Group</span>
            </button>
          )}
          {selectedShapeIds.length >= 2 && (
            <button
              onClick={handleUngroup}
              className="flex items-center gap-1.5 px-2 h-6 rounded-md text-[10px] text-white/65 hover:text-white hover:bg-white/6 transition-colors"
            >
              <Layers className="w-3 h-3 shrink-0" />
              <span>Ungroup</span>
            </button>
          )}
        </div>
      )}

      {/* Groups list */}
      {groups.length > 0 && (
        <div
          className="rounded-lg p-0.5 flex flex-col gap-0.5 border border-white/8"
          style={PANEL_STYLE}
        >
          <div className="px-2 pt-1 pb-0.5 text-[9px] font-semibold text-white/35 uppercase tracking-wider">
            Groups · {groups.length}
          </div>
          {groups.map((group) => {
            const groupHidden = group.visible === false;
            return (
              <div
                key={group.id}
                className={cn(
                  "flex items-center gap-1 px-1.5 h-6 rounded-md text-[10px]",
                  isGroupSelected(group.id) && !groupHidden
                    ? "bg-blue-500/25 text-blue-200"
                    : groupHidden
                      ? "text-white/30"
                      : "text-white/65 hover:bg-white/6",
                )}
              >
                <button
                  onClick={() => dispatch(selectGroup(group.id))}
                  className="flex items-center gap-1.5 flex-1 min-w-0"
                >
                  <Users className="w-3 h-3 shrink-0" />
                  <span className="truncate">{group.name}</span>
                  <span className="text-[9px] text-white/35 shrink-0">
                    {group.shapeIds.length}
                  </span>
                </button>
                <button
                  onClick={() => dispatch(toggleGroupVisibility(group.id))}
                  className="text-white/35 hover:text-white/85 transition-colors p-0.5"
                  title={groupHidden ? "Show group" : "Hide group"}
                >
                  {groupHidden ? (
                    <EyeOff className="w-2.5 h-2.5" />
                  ) : (
                    <Eye className="w-2.5 h-2.5" />
                  )}
                </button>
                <button
                  onClick={() => dispatch(deleteGroup(group.id))}
                  className="text-white/35 hover:text-red-400 transition-colors p-0.5"
                  title="Delete group"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showGroupDialog && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => dispatch(setShowGroupDialog(false))}
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
                onClick={() => dispatch(setShowGroupDialog(false))}
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
              onChange={(e) => dispatch(setGroupName(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateGroup();
                if (e.key === "Escape") dispatch(setShowGroupDialog(false));
              }}
              placeholder="Group name..."
              autoFocus
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => dispatch(setShowGroupDialog(false))}
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

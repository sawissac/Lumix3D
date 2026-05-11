"use client";

import { memo, useCallback, useState } from "react";
import {
  Trash2,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  Users,
} from "lucide-react";
import { CollapsibleCard } from "./CollapsibleCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setSelectedShapeId,
  setSvgFocusIndex,
  removeShape,
  toggleShapeVisibility,
  selectGroup,
  toggleGroupVisibility,
  deleteGroup,
} from "@/store/slices/sceneSlice";
import { SvgShape, ObjectGroup } from "@/types";

type ListMode = "svg" | "3d" | "preview";

type ObjectListItemProps = {
  shape: SvgShape;
  index: number;
  mode: ListMode;
  selected: boolean;
  hasOverride: boolean;
  hidden: boolean;
  indent?: boolean;
  onClick: (id: string, index: number) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string) => void;
};

const ObjectListItem = memo(function ObjectListItem({
  shape,
  index,
  mode,
  selected,
  hasOverride,
  hidden,
  indent,
  onClick,
  onDelete,
  onToggleVisibility,
}: ObjectListItemProps) {
  return (
    <li
      onClick={() => onClick(shape.id, index)}
      className={[
        "group flex items-center gap-2 py-1.5 cursor-pointer transition-colors text-xs",
        indent ? "pl-7 pr-3" : "px-3",
        selected
          ? "bg-indigo-500/20 text-white"
          : "text-white/60 hover:bg-white/5 hover:text-white/80",
        mode === "preview" ? "cursor-default" : "",
        hidden ? "opacity-40" : "",
      ].join(" ")}
    >
      <span
        className="w-3 h-3 rounded-sm shrink-0 border border-white/20"
        style={{ background: shape.fill }}
      />
      <span className="flex-1 font-mono truncate">Shape {index + 1}</span>
      {hasOverride && (
        <span className="text-[9px] bg-indigo-500/30 text-indigo-300 px-1 py-0.5 rounded shrink-0">
          custom
        </span>
      )}
      {selected && mode !== "preview" && !hidden && (
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
      )}
      {mode !== "preview" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility(shape.id);
          }}
          title={hidden ? "Show shape" : "Hide shape"}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-white/70 rounded p-0.5"
        >
          {hidden ? (
            <EyeOff className="w-3 h-3" />
          ) : (
            <Eye className="w-3 h-3" />
          )}
        </button>
      )}
      {mode !== "preview" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(shape.id);
          }}
          title="Delete shape"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded p-0.5"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </li>
  );
});

type GroupRowProps = {
  group: ObjectGroup;
  expanded: boolean;
  selected: boolean;
  childCount: number;
  onToggleExpand: (id: string) => void;
  onSelectGroup: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onDelete: (id: string) => void;
};

const GroupRow = memo(function GroupRow({
  group,
  expanded,
  selected,
  childCount,
  onToggleExpand,
  onSelectGroup,
  onToggleVisibility,
  onDelete,
}: GroupRowProps) {
  const hidden = group.visible === false;
  return (
    <li
      onClick={() => onSelectGroup(group.id)}
      className={[
        "group flex items-center gap-1.5 px-2 py-1.5 cursor-pointer transition-colors text-xs",
        selected
          ? "bg-indigo-500/20 text-white"
          : "text-white/65 hover:bg-white/5 hover:text-white/85",
        hidden ? "opacity-40" : "",
      ].join(" ")}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleExpand(group.id);
        }}
        className="text-white/40 hover:text-white/80 p-0.5"
        title={expanded ? "Collapse" : "Expand"}
      >
        {expanded ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
      </button>
      <Users className="w-3 h-3 shrink-0 text-indigo-300/80" />
      <span className="flex-1 truncate font-medium">{group.name}</span>
      <span className="text-[9px] text-white/35 font-mono shrink-0">
        {childCount}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility(group.id);
        }}
        title={hidden ? "Show group" : "Hide group"}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-white/70 rounded p-0.5"
      >
        {hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(group.id);
        }}
        title="Delete group"
        className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded p-0.5"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </li>
  );
});

export function ObjectsList() {
  const dispatch = useAppDispatch();
  const svgShapes = useAppSelector((s) => s.scene.svgShapes);
  const is3DMode = useAppSelector((s) => s.scene.is3DMode);
  const isEditMode = useAppSelector((s) => s.scene.isEditMode);
  const selectedShapeId = useAppSelector((s) => s.scene.selectedShapeId);
  const selectedShapeIds = useAppSelector((s) => s.scene.selectedShapeIds);
  const svgSelection = useAppSelector((s) => s.scene.svgSelection);
  const groups = useAppSelector((s) => s.scene.groups);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const visibleShapes = svgShapes.filter((s) => s.visible !== false);

  const mode: ListMode = isEditMode ? "svg" : is3DMode ? "3d" : "preview";

  const handleClick = useCallback(
    (id: string, index: number) => {
      if (mode === "3d") {
        dispatch(setSelectedShapeId(id));
      } else if (mode === "svg") {
        dispatch(setSvgFocusIndex(index));
      }
    },
    [dispatch, mode],
  );

  const handleDelete = useCallback(
    (id: string) => {
      dispatch(removeShape(id));
    },
    [dispatch],
  );

  const handleToggleVisibility = useCallback(
    (id: string) => {
      dispatch(toggleShapeVisibility(id));
    },
    [dispatch],
  );

  const handleSelectGroup = useCallback(
    (id: string) => {
      dispatch(selectGroup(id));
    },
    [dispatch],
  );

  const handleToggleGroupVisibility = useCallback(
    (id: string) => {
      dispatch(toggleGroupVisibility(id));
    },
    [dispatch],
  );

  const handleDeleteGroup = useCallback(
    (id: string) => {
      dispatch(deleteGroup(id));
    },
    [dispatch],
  );

  const handleToggleExpand = useCallback((id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const isShapeSelected = (id: string, index: number): boolean => {
    if (mode === "3d") {
      if (selectedShapeIds.length > 1) return selectedShapeIds.includes(id);
      return selectedShapeId === id;
    }
    if (mode === "svg") return svgSelection?.firstIndex === index;
    return false;
  };

  const isGroupSelected = (group: ObjectGroup): boolean => {
    if (mode !== "3d") return false;
    if (group.shapeIds.length !== selectedShapeIds.length) return false;
    return group.shapeIds.every((id) => selectedShapeIds.includes(id));
  };

  if (svgShapes.length === 0) return null;

  const shapeIndex = new Map(svgShapes.map((s, i) => [s.id, i]));
  const groupedIds = new Set<string>();
  for (const g of groups) for (const id of g.shapeIds) groupedIds.add(id);
  const ungrouped = svgShapes.filter((s) => !groupedIds.has(s.id));

  const showGroups = mode === "3d" && groups.length > 0;

  return (
    <CollapsibleCard
      id="objects-list"
      cardClassName="border-white/10 bg-white/3"
      headerClassName="pb-2 pt-3 px-3"
      titleClassName="text-white/70 text-xs font-semibold uppercase tracking-wider"
      title={mode === "3d" ? "3D Objects" : "SVG Shapes"}
      headerExtra={
        <span className="text-[10px] text-white/30 font-mono">
          {visibleShapes.length}/{svgShapes.length}
        </span>
      }
      contentClassName="p-0"
    >
      <ul
        className="max-h-64 overflow-y-auto divide-y divide-white/5"
        style={{ scrollbarWidth: "thin" }}
      >
        {showGroups &&
          groups.map((group) => {
            const isOpen = expanded[group.id] ?? true;
            return (
              <li key={group.id} className="contents">
                <GroupRow
                  group={group}
                  expanded={isOpen}
                  selected={isGroupSelected(group)}
                  childCount={group.shapeIds.length}
                  onToggleExpand={handleToggleExpand}
                  onSelectGroup={handleSelectGroup}
                  onToggleVisibility={handleToggleGroupVisibility}
                  onDelete={handleDeleteGroup}
                />
                {isOpen &&
                  group.shapeIds.map((sid) => {
                    const shape = svgShapes.find((s) => s.id === sid);
                    if (!shape) return null;
                    const index = shapeIndex.get(sid) ?? 0;
                    const selected = isShapeSelected(shape.id, index);
                    const hasOverride =
                      mode === "3d" && !!shape.shapeExtrusion;
                    const hidden = shape.visible === false;
                    return (
                      <ObjectListItem
                        key={shape.id}
                        shape={shape}
                        index={index}
                        mode={mode}
                        selected={selected}
                        hasOverride={hasOverride}
                        hidden={hidden}
                        indent
                        onClick={handleClick}
                        onDelete={handleDelete}
                        onToggleVisibility={handleToggleVisibility}
                      />
                    );
                  })}
              </li>
            );
          })}
        {ungrouped.map((shape) => {
          const index = shapeIndex.get(shape.id) ?? 0;
          const selected = isShapeSelected(shape.id, index);
          const hasOverride = mode === "3d" && !!shape.shapeExtrusion;
          const hidden = shape.visible === false;
          return (
            <ObjectListItem
              key={shape.id}
              shape={shape}
              index={index}
              mode={mode}
              selected={selected}
              hasOverride={hasOverride}
              hidden={hidden}
              onClick={handleClick}
              onDelete={handleDelete}
              onToggleVisibility={handleToggleVisibility}
            />
          );
        })}
      </ul>
    </CollapsibleCard>
  );
}

"use client";

import { memo, useCallback } from "react";
import { Trash2, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setSelectedShapeId,
  setSvgFocusIndex,
  removeShape,
  toggleShapeVisibility,
} from "@/store/slices/sceneSlice";
import { SvgShape } from "@/types";

type ObjectListItemProps = {
  shape: SvgShape;
  index: number;
  mode: "svg" | "3d" | "preview";
  selected: boolean;
  hasOverride: boolean;
  hidden: boolean;
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
  onClick,
  onDelete,
  onToggleVisibility,
}: ObjectListItemProps) {
  return (
    <li
      onClick={() => onClick(shape.id, index)}
      className={[
        "group flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors text-xs",
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

export function ObjectsList() {
  const dispatch = useAppDispatch();
  const svgShapes = useAppSelector((s) => s.scene.svgShapes);
  const is3DMode = useAppSelector((s) => s.scene.is3DMode);
  const isEditMode = useAppSelector((s) => s.scene.isEditMode);
  const selectedShapeId = useAppSelector((s) => s.scene.selectedShapeId);
  const svgSelection = useAppSelector((s) => s.scene.svgSelection);

  const visibleShapes = svgShapes.filter((s) => s.visible !== false);

  const mode: "svg" | "3d" | "preview" = isEditMode
    ? "svg"
    : is3DMode
      ? "3d"
      : "preview";

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

  const isSelected = (id: string, index: number): boolean => {
    if (mode === "3d") return selectedShapeId === id;
    if (mode === "svg") return svgSelection?.firstIndex === index;
    return false;
  };

  if (svgShapes.length === 0) return null;

  return (
    <Card className="border-white/10 bg-white/3">
      <CardHeader className="pb-2 pt-3 px-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white/70 text-xs font-semibold uppercase tracking-wider">
            {mode === "3d" ? "3D Objects" : "SVG Shapes"}
          </CardTitle>
          <span className="text-[10px] text-white/30 font-mono">
            {visibleShapes.length}/{svgShapes.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ul
          className="max-h-48 overflow-y-auto divide-y divide-white/5"
          style={{ scrollbarWidth: "thin" }}
        >
          {svgShapes.map((shape, index) => {
            const selected = isSelected(shape.id, index);
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
      </CardContent>
    </Card>
  );
}

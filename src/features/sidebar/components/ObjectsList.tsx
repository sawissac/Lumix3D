"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSelectedShapeId, setSvgFocusIndex } from "@/store/slices/sceneSlice";

export function ObjectsList() {
  const dispatch = useAppDispatch();
  const svgShapes = useAppSelector((s) => s.scene.svgShapes);
  const is3DMode = useAppSelector((s) => s.scene.is3DMode);
  const isEditMode = useAppSelector((s) => s.scene.isEditMode);
  const selectedShapeId = useAppSelector((s) => s.scene.selectedShapeId);
  const svgSelection = useAppSelector((s) => s.scene.svgSelection);

  if (svgShapes.length === 0) return null;

  const mode: "svg" | "3d" | "preview" = isEditMode ? "svg" : is3DMode ? "3d" : "preview";

  const handleClick = (id: string, index: number) => {
    if (mode === "3d") {
      dispatch(setSelectedShapeId(id));
    } else if (mode === "svg") {
      dispatch(setSvgFocusIndex(index));
    }
  };

  const isSelected = (id: string, index: number): boolean => {
    if (mode === "3d") return selectedShapeId === id;
    if (mode === "svg") return svgSelection?.firstIndex === index;
    return false;
  };

  return (
    <Card className="border-white/10 bg-white/3">
      <CardHeader className="pb-2 pt-3 px-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white/70 text-xs font-semibold uppercase tracking-wider">
            {mode === "3d" ? "3D Objects" : "SVG Shapes"}
          </CardTitle>
          <span className="text-[10px] text-white/30 font-mono">
            {svgShapes.length}
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

            return (
              <li
                key={shape.id}
                onClick={() => handleClick(shape.id, index)}
                className={[
                  "flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors text-xs",
                  selected
                    ? "bg-indigo-500/20 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white/80",
                  mode === "preview" ? "cursor-default" : "",
                ].join(" ")}
              >
                {/* Color swatch */}
                <span
                  className="w-3 h-3 rounded-sm shrink-0 border border-white/20"
                  style={{ background: shape.fill }}
                />

                {/* Label */}
                <span className="flex-1 font-mono truncate">
                  Shape {index + 1}
                </span>

                {/* Badges */}
                {hasOverride && (
                  <span className="text-[9px] bg-indigo-500/30 text-indigo-300 px-1 py-0.5 rounded shrink-0">
                    custom
                  </span>
                )}
                {selected && mode !== "preview" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

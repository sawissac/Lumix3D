"use client";

import { CollapsibleCard } from "./CollapsibleCard";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateShapeTransform,
  updateGlbObjectTransform,
  setGlobalTransform,
} from "@/store/slices/sceneSlice";

type Vec3 = [number, number, number];

const RAD_TO_DEG = 180 / Math.PI;
const DEG_TO_RAD = Math.PI / 180;

const ZERO: Vec3 = [0, 0, 0];
const ONE: Vec3 = [1, 1, 1];

function Vec3Row({
  label,
  value,
  onChange,
  step = 0.1,
  display = "raw",
  disabled = false,
}: {
  label: string;
  value: Vec3;
  onChange: (v: Vec3) => void;
  step?: number;
  display?: "raw" | "deg";
  disabled?: boolean;
}) {
  const toDisplay = (n: number) =>
    display === "deg" ? n * RAD_TO_DEG : n;
  const fromDisplay = (n: number) =>
    display === "deg" ? n * DEG_TO_RAD : n;

  const setAxis = (axis: 0 | 1 | 2, raw: string) => {
    const n = parseFloat(raw);
    if (isNaN(n)) return;
    const next: Vec3 = [...value] as Vec3;
    next[axis] = fromDisplay(n);
    onChange(next);
  };

  const axes: ("X" | "Y" | "Z")[] = ["X", "Y", "Z"];
  return (
    <div className="space-y-1">
      <Label className="text-white/70 text-xs">
        {label}
        {display === "deg" && (
          <span className="text-white/30 text-[9px] ml-1">(deg)</span>
        )}
      </Label>
      <div className="grid grid-cols-3 gap-1">
        {axes.map((ax, i) => (
          <div key={ax} className="flex items-center gap-1">
            <span className="text-[10px] text-white/40 font-mono w-3">{ax}</span>
            <Input
              type="number"
              step={step}
              disabled={disabled}
              value={Number(toDisplay(value[i]).toFixed(3))}
              onChange={(e) => setAxis(i as 0 | 1 | 2, e.target.value)}
              className="h-7 px-1 text-[11px] font-mono bg-black/30 border-white/10 disabled:opacity-40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ObjectTransformInspector() {
  const dispatch = useAppDispatch();
  const selectedShapeId = useAppSelector((s) => s.scene.selectedShapeId);
  const selectedShapeIds = useAppSelector((s) => s.scene.selectedShapeIds);
  const svgShapes = useAppSelector((s) => s.scene.svgShapes);
  const glbObjects = useAppSelector((s) => s.scene.glbObjects);
  const globalTransform = useAppSelector((s) => s.scene.globalTransform);

  const isGlobal = selectedShapeId === "global";
  const isMulti = selectedShapeIds.length > 1;

  const glb = selectedShapeId
    ? glbObjects.find((g) => g.id === selectedShapeId)
    : undefined;
  const shape =
    !isGlobal && !glb && selectedShapeId
      ? svgShapes.find((s) => s.id === selectedShapeId)
      : undefined;
  const firstMultiShape =
    isMulti && selectedShapeIds[0]
      ? svgShapes.find((s) => s.id === selectedShapeIds[0])
      : undefined;

  const targetType: "none" | "global" | "shape" | "glb" | "multi" = isGlobal
    ? "global"
    : isMulti
      ? "multi"
      : glb
        ? "glb"
        : shape
          ? "shape"
          : "none";

  if (targetType === "none") {
    return (
      <CollapsibleCard
        id="inspector-transform"
        cardClassName="border-cyan-500/20"
        title="Transform"
        titleClassName="text-cyan-400 text-sm"
        description="Position / Rotation / Scale"
        contentClassName="pt-3 text-xs"
      >
        <p className="text-white/40">
          Select an object to edit its transform.
        </p>
      </CollapsibleCard>
    );
  }

  const source =
    targetType === "global"
      ? globalTransform
      : targetType === "glb"
        ? {
            position: glb!.position ?? ZERO,
            rotation: glb!.rotation ?? ZERO,
            scale: glb!.scale ?? ONE,
          }
        : targetType === "shape"
          ? {
              position: shape!.position ?? ZERO,
              rotation: shape!.rotation ?? ZERO,
              scale: shape!.scale ?? ONE,
            }
          : {
              position: firstMultiShape?.position ?? ZERO,
              rotation: firstMultiShape?.rotation ?? ZERO,
              scale: firstMultiShape?.scale ?? ONE,
            };

  const dispatchPatch = (patch: {
    position?: Vec3;
    rotation?: Vec3;
    scale?: Vec3;
  }) => {
    if (targetType === "global") {
      dispatch(setGlobalTransform(patch));
    } else if (targetType === "glb") {
      dispatch(updateGlbObjectTransform({ id: glb!.id, ...patch }));
    } else if (targetType === "shape") {
      dispatch(updateShapeTransform({ id: shape!.id, ...patch }));
    } else if (targetType === "multi") {
      selectedShapeIds.forEach((id) =>
        dispatch(updateShapeTransform({ id, ...patch })),
      );
    }
  };

  const label =
    targetType === "global"
      ? "Global"
      : targetType === "glb"
        ? glb!.name
        : targetType === "multi"
          ? `${selectedShapeIds.length} shapes`
          : `Shape ${svgShapes.findIndex((s) => s.id === shape!.id) + 1}`;

  return (
    <CollapsibleCard
      id="inspector-transform"
      cardClassName="border-cyan-500/20"
      title="Transform"
      titleClassName="text-cyan-400 text-sm"
      description={label}
      contentClassName="pt-3 space-y-3 text-xs"
    >
      <Vec3Row
        label="Position"
        value={source.position}
        onChange={(position) => dispatchPatch({ position })}
        step={0.1}
      />
      <Vec3Row
        label="Rotation"
        value={source.rotation}
        onChange={(rotation) => dispatchPatch({ rotation })}
        step={1}
        display="deg"
      />
      <Vec3Row
        label="Scale"
        value={source.scale}
        onChange={(scale) => dispatchPatch({ scale })}
        step={0.1}
      />
      <div className="flex gap-1 pt-1">
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] flex-1 text-white/60 border-white/10 hover:border-cyan-400/40 hover:text-cyan-300"
          onClick={() => dispatchPatch({ position: ZERO })}
        >
          Reset Pos
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] flex-1 text-white/60 border-white/10 hover:border-cyan-400/40 hover:text-cyan-300"
          onClick={() => dispatchPatch({ rotation: ZERO })}
        >
          Reset Rot
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] flex-1 text-white/60 border-white/10 hover:border-cyan-400/40 hover:text-cyan-300"
          onClick={() => dispatchPatch({ scale: ONE })}
        >
          Reset Scale
        </Button>
      </div>
    </CollapsibleCard>
  );
}

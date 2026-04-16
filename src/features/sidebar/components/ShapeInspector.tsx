"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Move, RotateCw, Maximize, MousePointer2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateShapeColor,
  updateShapeExtrusion,
  resetShapeExtrusion,
  setSelectedShapeId,
  setTransformMode,
  updateShapeMaterial,
  setGlobalMaterial,
} from "@/store/slices/sceneSlice";
import { ExtrusionSettings, MaterialSettings, MaterialPreset } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── SVG Inspector (shown during edit mode) ─────────────────────────────────

function SVGInspector() {
  const svgSelection = useAppSelector((s) => s.scene.svgSelection);
  const svgShapes = useAppSelector((s) => s.scene.svgShapes);
  const total = svgShapes.length;

  return (
    <Card className="border-blue-500/20 bg-blue-500/5">
      <CardHeader className="pb-3 border-b border-white/5">
        <CardTitle className="text-blue-400 text-sm">Inspector</CardTitle>
        <CardDescription className="text-xs">SVG Edit Mode</CardDescription>
      </CardHeader>
      <CardContent className="pt-3 space-y-2 text-xs text-white/70">
        {svgSelection ? (
          <>
            <div className="flex items-center justify-between">
              <span className="font-medium text-white/90">
                {svgSelection.count === 1
                  ? `Shape ${svgSelection.firstIndex + 1}${total > 0 ? ` of ${total}` : ""}`
                  : `${svgSelection.count} shapes selected`}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div
                className="w-4 h-4 rounded border border-white/20 shrink-0"
                style={{ background: svgSelection.fill }}
                title="Fill"
              />
              <span className="font-mono">{svgSelection.fill}</span>
              {svgSelection.stroke && svgSelection.stroke !== "#000000" && (
                <>
                  <div
                    className="w-4 h-4 rounded border border-white/20 shrink-0 ml-1"
                    style={{ background: svgSelection.stroke }}
                    title="Stroke"
                  />
                  <span className="font-mono">{svgSelection.stroke}</span>
                </>
              )}
            </div>
            <p className="text-white/40 text-xs mt-1">
              Edit fill / stroke in the toolbar above
            </p>
          </>
        ) : (
          <p className="text-white/40">
            Click a shape in the editor to inspect it
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── 3D Inspector (shown in 3D mode) ────────────────────────────────────────

function ThreeDInspector() {
  const dispatch = useAppDispatch();
  const selectedShapeId = useAppSelector((s) => s.scene.selectedShapeId);
  const svgShapes = useAppSelector((s) => s.scene.svgShapes);
  const globalExtrusion = useAppSelector((s) => s.scene.extrusion);
  const globalMaterial = useAppSelector((s) => s.scene.globalMaterial);
  const transformMode = useAppSelector((s) => s.scene.transformMode);

  const isGlobal = selectedShapeId === "global";
  const shape = isGlobal
    ? undefined
    : svgShapes.find((s) => s.id === selectedShapeId);
  const shapeIndex = isGlobal
    ? -1
    : svgShapes.findIndex((s) => s.id === selectedShapeId);

  // Resolved values: per-shape override takes priority, falls back to global
  const resolved: ExtrusionSettings = shape?.shapeExtrusion
    ? { ...globalExtrusion, ...shape.shapeExtrusion }
    : { ...globalExtrusion };

  const resolvedMaterial: MaterialSettings = shape?.material
    ? { ...globalMaterial, ...shape.material }
    : { ...globalMaterial };

  const hasOverride = !!shape?.shapeExtrusion;
  const hasMaterialOverride = !!shape?.material;

  const set = (key: keyof ExtrusionSettings, value: number | boolean) => {
    if (!selectedShapeId || isGlobal) return;
    dispatch(
      updateShapeExtrusion({
        id: selectedShapeId,
        extrusion: { [key]: value },
      }),
    );
  };

  const setMaterial = (key: keyof MaterialSettings, value: string | number) => {
    if (isGlobal) {
      dispatch(setGlobalMaterial({ [key]: value }));
    } else if (selectedShapeId) {
      dispatch(
        updateShapeMaterial({
          id: selectedShapeId,
          material: { [key]: value },
        }),
      );
    }
  };

  const materialPresets: {
    label: string;
    value: MaterialPreset;
    settings: Partial<MaterialSettings>;
  }[] = [
    {
      label: "Plastic",
      value: "plastic",
      settings: {
        roughness: 0.4,
        metalness: 0.1,
        transmission: 0,
        ior: 1.5,
        clearcoat: 0,
        emissive: "#000000",
        emissiveIntensity: 0,
      },
    },
    {
      label: "Metallic",
      value: "metallic",
      settings: {
        roughness: 0.2,
        metalness: 1.0,
        transmission: 0,
        ior: 1.5,
        clearcoat: 0,
        emissive: "#000000",
        emissiveIntensity: 0,
      },
    },
    {
      label: "Matte",
      value: "matte",
      settings: {
        roughness: 0.8,
        metalness: 0.0,
        transmission: 0,
        ior: 1.5,
        clearcoat: 0,
        emissive: "#000000",
        emissiveIntensity: 0,
      },
    },
    {
      label: "Glass",
      value: "glass",
      settings: {
        roughness: 0.0,
        metalness: 0.1,
        transmission: 1.0,
        ior: 1.5,
        clearcoat: 1.0,
        emissive: "#000000",
        emissiveIntensity: 0,
      },
    },
    {
      label: "Wood",
      value: "wood",
      settings: {
        roughness: 0.6,
        metalness: 0.0,
        transmission: 0,
        ior: 1.5,
        clearcoat: 0,
        emissive: "#000000",
        emissiveIntensity: 0,
      },
    },
    {
      label: "Chrome",
      value: "chrome",
      settings: {
        roughness: 0.0,
        metalness: 1.0,
        transmission: 0,
        ior: 1.5,
        clearcoat: 0,
        emissive: "#000000",
        emissiveIntensity: 0,
      },
    },
    {
      label: "Clay",
      value: "clay",
      settings: {
        roughness: 0.9,
        metalness: 0.0,
        transmission: 0,
        ior: 1.5,
        clearcoat: 0,
        emissive: "#000000",
        emissiveIntensity: 0,
      },
    },
    { label: "Custom", value: "custom", settings: {} },
  ];

  return (
    <Card className="border-indigo-500/20 bg-indigo-500/5 flex flex-col shrink-0">
      <CardHeader className="pb-3 border-b border-white/5 shrink-0">
        <CardTitle className="text-indigo-400 text-sm">Inspector</CardTitle>
        <CardDescription className="text-xs">3D View</CardDescription>
      </CardHeader>
      <CardContent className="pt-3 space-y-4 text-xs">
        {!selectedShapeId ? (
          <p className="text-white/40 text-xs">
            Click a shape or the empty space in the 3D view to inspect it
          </p>
        ) : (
          <>
            {/* Shape header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isGlobal ? (
                  <span className="font-medium text-white/90 text-xs">
                    Global SVG Object
                  </span>
                ) : (
                  <>
                    <div
                      className="w-4 h-4 rounded border border-white/20 shrink-0"
                      style={{ background: shape?.fill }}
                    />
                    <span className="font-medium text-white/90 text-xs">
                      Shape {shapeIndex + 1} of {svgShapes.length}
                    </span>
                    {hasOverride && (
                      <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded">
                        custom
                      </span>
                    )}
                  </>
                )}
              </div>
              <button
                onClick={() => dispatch(setSelectedShapeId(null))}
                className="text-white/30 hover:text-white/60 text-base leading-none"
                title="Deselect"
              >
                ×
              </button>
            </div>

            {/* Transform Controls */}
            <div className="flex gap-1 bg-black/20 p-1 rounded-md border border-white/5">
              <Button
                variant={!transformMode ? "secondary" : "ghost"}
                size="sm"
                className="flex-1 h-7 text-[10px]"
                onClick={() => dispatch(setTransformMode(null))}
                title="Select only"
              >
                <MousePointer2 className="w-3 h-3 mr-1" /> Select
              </Button>
              <Button
                variant={transformMode === "translate" ? "secondary" : "ghost"}
                size="sm"
                className="flex-1 h-7 text-[10px]"
                onClick={() => dispatch(setTransformMode("translate"))}
                title="Move"
              >
                <Move className="w-3 h-3 mr-1" /> Move
              </Button>
              <Button
                variant={transformMode === "rotate" ? "secondary" : "ghost"}
                size="sm"
                className="flex-1 h-7 text-[10px]"
                onClick={() => dispatch(setTransformMode("rotate"))}
                title="Rotate"
              >
                <RotateCw className="w-3 h-3 mr-1" /> Rotate
              </Button>
              <Button
                variant={transformMode === "scale" ? "secondary" : "ghost"}
                size="sm"
                className="flex-1 h-7 text-[10px]"
                onClick={() => dispatch(setTransformMode("scale"))}
                title="Scale"
              >
                <Maximize className="w-3 h-3 mr-1" /> Scale
              </Button>
            </div>

            {!isGlobal && shape && (
              <>
                {/* Fill color */}
                <div className="flex items-center justify-between">
                  <Label className="text-white/70 text-xs">Fill</Label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-white/50">
                      {shape.fill}
                    </span>
                    <input
                      type="color"
                      value={shape.fill}
                      onChange={(e) =>
                        dispatch(
                          updateShapeColor({
                            id: shape.id,
                            color: e.target.value,
                          }),
                        )
                      }
                      className="w-7 h-7 rounded cursor-pointer border border-border bg-transparent p-0.5"
                    />
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 text-[11px] uppercase tracking-wider">
                      Geometry
                    </span>
                    {hasOverride && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-5 text-[10px] px-2 text-white/50 border-white/10 hover:border-white/30"
                        onClick={() =>
                          dispatch(resetShapeExtrusion(selectedShapeId!))
                        }
                      >
                        Reset to global
                      </Button>
                    )}
                  </div>

                  {/* Depth */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-white/70 text-xs">Depth</Label>
                      <span className="text-xs font-mono bg-black/40 px-1.5 py-0.5 rounded text-indigo-300">
                        {resolved.depth}
                      </span>
                    </div>
                    <Slider
                      value={[resolved.depth]}
                      onValueChange={([v]) => set("depth", v)}
                      min={1}
                      max={50}
                      step={1}
                      className="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                    />
                  </div>

                  {/* Curve Segments */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-white/70 text-xs">
                        Curve Segments (Smoothness)
                      </Label>
                      <span className="text-xs font-mono bg-black/40 px-1.5 py-0.5 rounded text-indigo-300">
                        {resolved.curveSegments}
                      </span>
                    </div>
                    <Slider
                      value={[resolved.curveSegments]}
                      onValueChange={([v]) => set("curveSegments", v)}
                      min={1}
                      max={64}
                      step={1}
                      className="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                    />
                  </div>

                  {/* Bevel Thickness */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-white/70 text-xs">
                        Bevel Thickness
                      </Label>
                      <span className="text-xs font-mono bg-black/40 px-1.5 py-0.5 rounded text-indigo-300">
                        {resolved.bevelThickness}
                      </span>
                    </div>
                    <Slider
                      value={[resolved.bevelThickness]}
                      onValueChange={([v]) => set("bevelThickness", v)}
                      min={0}
                      max={5}
                      step={0.1}
                      className="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                    />
                  </div>

                  {/* Bevel Size */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-white/70 text-xs">
                        Bevel Size
                      </Label>
                      <span className="text-xs font-mono bg-black/40 px-1.5 py-0.5 rounded text-indigo-300">
                        {resolved.bevelSize}
                      </span>
                    </div>
                    <Slider
                      value={[resolved.bevelSize]}
                      onValueChange={([v]) => set("bevelSize", v)}
                      min={0}
                      max={3}
                      step={0.1}
                      className="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                    />
                  </div>

                  {/* Bevel Segments */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-white/70 text-xs">
                        Bevel Segments
                      </Label>
                      <span className="text-xs font-mono bg-black/40 px-1.5 py-0.5 rounded text-indigo-300">
                        {resolved.bevelSegments}
                      </span>
                    </div>
                    <Slider
                      value={[resolved.bevelSegments]}
                      onValueChange={([v]) => set("bevelSegments", v)}
                      min={1}
                      max={8}
                      step={1}
                      className="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Material Section (Global & Per-shape) */}
            <div className="border-t border-white/5 pt-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-[11px] uppercase tracking-wider">
                  Material {isGlobal ? "(Global)" : ""}
                </span>
                {hasMaterialOverride && !isGlobal && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-5 text-[10px] px-2 text-white/50 border-white/10 hover:border-white/30"
                    onClick={() =>
                      dispatch(
                        updateShapeMaterial({
                          id: selectedShapeId,
                          material: {}, // reset
                        }),
                      )
                    }
                  >
                    Reset
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-white/70 text-xs">Material Preset</Label>
                <Select
                  value={resolvedMaterial.preset}
                  onValueChange={(val: string | null) => {
                    if (!val) return;
                    const preset = materialPresets.find((p) => p.value === val);
                    if (preset) {
                      setMaterial("preset", val);
                      Object.entries(preset.settings).forEach(([k, v]) => {
                        setMaterial(k as keyof MaterialSettings, v as number);
                      });
                    }
                  }}
                >
                  <SelectTrigger className="w-full h-8 text-xs bg-black/20 border-white/10 focus:ring-indigo-500">
                    <SelectValue placeholder="Select preset" />
                  </SelectTrigger>
                  <SelectContent>
                    {materialPresets.map((p) => (
                      <SelectItem
                        key={p.value}
                        value={p.value}
                        className="text-xs"
                      >
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Roughness */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-white/70 text-xs">Roughness</Label>
                  <span className="text-xs font-mono bg-black/40 px-1.5 py-0.5 rounded text-indigo-300">
                    {resolvedMaterial.roughness.toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={[resolvedMaterial.roughness]}
                  onValueChange={([v]) => {
                    setMaterial("preset", "custom");
                    setMaterial("roughness", v);
                  }}
                  min={0}
                  max={1}
                  step={0.01}
                  className="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                />
              </div>

              {/* Metalness */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-white/70 text-xs">Metalness</Label>
                  <span className="text-xs font-mono bg-black/40 px-1.5 py-0.5 rounded text-indigo-300">
                    {resolvedMaterial.metalness.toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={[resolvedMaterial.metalness]}
                  onValueChange={([v]) => {
                    setMaterial("preset", "custom");
                    setMaterial("metalness", v);
                  }}
                  min={0}
                  max={1}
                  step={0.01}
                  className="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                />
              </div>

              {/* Transmission (Glass) */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-white/70 text-xs">Transmission</Label>
                  <span className="text-xs font-mono bg-black/40 px-1.5 py-0.5 rounded text-indigo-300">
                    {resolvedMaterial.transmission.toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={[resolvedMaterial.transmission]}
                  onValueChange={([v]) => {
                    setMaterial("preset", "custom");
                    setMaterial("transmission", v);
                  }}
                  min={0}
                  max={1}
                  step={0.01}
                  className="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                />
              </div>

              {/* IOR (Index of Refraction) */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-white/70 text-xs">IOR</Label>
                  <span className="text-xs font-mono bg-black/40 px-1.5 py-0.5 rounded text-indigo-300">
                    {resolvedMaterial.ior.toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={[resolvedMaterial.ior]}
                  onValueChange={([v]) => {
                    setMaterial("preset", "custom");
                    setMaterial("ior", v);
                  }}
                  min={1}
                  max={2.33}
                  step={0.01}
                  className="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                />
              </div>

              {/* Clearcoat */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-white/60">Clearcoat</Label>
                  <span className="text-[10px] text-white/40">
                    {resolvedMaterial.clearcoat.toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={[resolvedMaterial.clearcoat]}
                  onValueChange={(v) => {
                    setMaterial("clearcoat", v[0]);
                    setMaterial("preset", "custom");
                  }}
                  min={0}
                  max={1}
                  step={0.05}
                  className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
                />
              </div>

              {/* Emissive Color */}
              <div className="space-y-2">
                <Label className="text-xs text-white/60">Emissive Color</Label>
                <div className="flex gap-2">
                  <div className="relative w-8 h-8 rounded overflow-hidden border border-white/10 shrink-0">
                    <Input
                      type="color"
                      value={resolvedMaterial.emissive || "#000000"}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setMaterial("emissive", e.target.value);
                        setMaterial("preset", "custom");
                      }}
                      className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer border-0 p-0"
                    />
                  </div>
                  <Input
                    type="text"
                    value={resolvedMaterial.emissive || "#000000"}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setMaterial("emissive", e.target.value);
                      setMaterial("preset", "custom");
                    }}
                    className="flex-1 h-8 bg-black/20 border-white/10 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Emissive Intensity */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-white/60">
                    Emissive Intensity
                  </Label>
                  <span className="text-[10px] text-white/40">
                    {(resolvedMaterial.emissiveIntensity || 0).toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={[resolvedMaterial.emissiveIntensity || 0]}
                  onValueChange={(v) => {
                    setMaterial("emissiveIntensity", v[0]);
                    setMaterial("preset", "custom");
                  }}
                  min={0}
                  max={10}
                  step={0.1}
                  className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Public export ───────────────────────────────────────────────────────────

export function ShapeInspector() {
  const is3DMode = useAppSelector((s) => s.scene.is3DMode);
  const isEditMode = useAppSelector((s) => s.scene.isEditMode);
  const svgFile = useAppSelector((s) => s.scene.svgFile);

  if (!svgFile) return null;
  if (isEditMode) return <SVGInspector />;
  if (is3DMode) return <ThreeDInspector />;
  return null;
}

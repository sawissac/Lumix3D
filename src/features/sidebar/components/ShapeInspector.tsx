"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SliderWithInput } from "@/components/ui/slider-with-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Move, RotateCw, Maximize, MousePointer2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateShapeColor,
  updateShapeExtrusion,
  updateShapesExtrusion,
  resetShapeExtrusion,
  resetShapesExtrusion,
  setSelectedShapeId,
  setTransformMode,
  updateShapeMaterial,
  updateShapesMaterial,
  resetShapeMaterial,
  resetShapesMaterial,
  setGlobalMaterial,
  setGlobalTransform,
  removeShape,
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
    <Card className="glass-card border-blue-500/20">
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
  const selectedShapeIds = useAppSelector((s) => s.scene.selectedShapeIds);
  const svgShapes = useAppSelector((s) => s.scene.svgShapes);
  const globalExtrusion = useAppSelector((s) => s.scene.extrusion);
  const globalMaterial = useAppSelector((s) => s.scene.globalMaterial);
  const transformMode = useAppSelector((s) => s.scene.transformMode);

  const isGlobal = selectedShapeId === "global";
  const isMulti = selectedShapeIds.length > 1;
  const firstShape = isMulti ? svgShapes.find((s) => s.id === selectedShapeIds[0]) : (isGlobal ? undefined : svgShapes.find((s) => s.id === selectedShapeId));
  const shape = isGlobal ? undefined : svgShapes.find((s) => s.id === selectedShapeId);
  const shapeIndex = isGlobal
    ? -1
    : svgShapes.findIndex((s) => s.id === selectedShapeId);

  const resolved: ExtrusionSettings = firstShape?.shapeExtrusion
    ? { ...globalExtrusion, ...firstShape.shapeExtrusion }
    : { ...globalExtrusion };

  const resolvedMaterial: MaterialSettings = firstShape?.material
    ? { ...globalMaterial, ...firstShape.material }
    : { ...globalMaterial };

  const hasOverride = isMulti 
    ? selectedShapeIds.some(id => !!svgShapes.find(s => s.id === id)?.shapeExtrusion)
    : !!shape?.shapeExtrusion;
  const hasMaterialOverride = isMulti
    ? selectedShapeIds.some(id => !!svgShapes.find(s => s.id === id)?.material)
    : !!shape?.material;

  const P = Math.PI;
  const rotationPresets: { label: string; r: [number, number, number] }[] = [
    { label: "Front",    r: [0,        0,      0] },
    { label: "Back",     r: [0,        P,      0] },
    { label: "Top",      r: [-P / 2,   0,      0] },
    { label: "Bottom",   r: [P / 2,    0,      0] },
    { label: "Right",    r: [0,        -P / 2, 0] },
    { label: "Left",     r: [0,        P / 2,  0] },
    { label: "Iso ↗",   r: [-P / 6,   P / 4,  0] },
    { label: "Iso ↙",   r: [-P / 6,  -P * 3/4, 0] },
  ];

  const emissiveColorPresets = [
    { label: "Off",     color: "#000000" },
    { label: "Red",     color: "#ff2020" },
    { label: "Orange",  color: "#ff6600" },
    { label: "Yellow",  color: "#ffdd00" },
    { label: "Cyan",    color: "#00eeff" },
    { label: "Blue",    color: "#0066ff" },
    { label: "Purple",  color: "#aa00ff" },
    { label: "White",   color: "#ffffff" },
  ];

  const emissiveIntensityPresets = [
    { label: "Off",   value: 0 },
    { label: "Dim",   value: 0.5 },
    { label: "Low",   value: 1 },
    { label: "Med",   value: 3 },
    { label: "High",  value: 6 },
    { label: "Max",   value: 10 },
  ];

  const set = (key: keyof ExtrusionSettings, value: number | boolean) => {
    if (isGlobal) return;
    if (isMulti) {
      dispatch(
        updateShapesExtrusion({
          ids: selectedShapeIds,
          extrusion: { [key]: value },
        })
      );
    } else if (selectedShapeId) {
      dispatch(
        updateShapeExtrusion({
          id: selectedShapeId,
          extrusion: { [key]: value },
        }),
      );
    }
  };

  const setMaterial = (key: keyof MaterialSettings, value: string | number) => {
    if (isGlobal) {
      dispatch(setGlobalMaterial({ [key]: value }));
    } else if (isMulti) {
      dispatch(
        updateShapesMaterial({
          ids: selectedShapeIds,
          material: { [key]: value },
        })
      );
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
    <Card className="glass-card border-indigo-500/20 flex flex-col shrink-0">
      <CardHeader className="pb-3 border-b border-white/5 shrink-0">
        <CardTitle className="text-indigo-400 text-sm">Inspector</CardTitle>
        <CardDescription className="text-xs">3D View</CardDescription>
      </CardHeader>
      <CardContent className="pt-3 space-y-4 text-xs">
        {!selectedShapeId && !isMulti ? (
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
                ) : isMulti ? (
                  <span className="font-medium text-white/90 text-xs">
                    {selectedShapeIds.length} Shapes Selected
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
              <div className="flex items-center gap-1">
                {!isGlobal && (
                  <button
                    onClick={() => dispatch(removeShape(selectedShapeId!))}
                    className="text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded p-0.5 transition-colors"
                    title="Delete shape"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => dispatch(setSelectedShapeId(null))}
                  className="text-white/30 hover:text-white/60 text-base leading-none"
                  title="Deselect"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Transform Controls */}
            <div className="grid grid-cols-4 gap-1 glass p-1 rounded-md">
              {(
                [
                  { mode: null, label: "Select", Icon: MousePointer2 },
                  { mode: "translate" as const, label: "Move", Icon: Move },
                  { mode: "rotate" as const, label: "Rotate", Icon: RotateCw },
                  { mode: "scale" as const, label: "Scale", Icon: Maximize },
                ] as const
              ).map(({ mode, label, Icon }) => (
                <button
                  key={label}
                  onClick={() => dispatch(setTransformMode(mode))}
                  title={label}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-1.5 rounded transition-all text-[9px] font-medium",
                    transformMode === mode
                      ? "bg-indigo-500/30 text-indigo-300"
                      : "text-white/40 hover:text-white/80 hover:bg-white/8",
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>

            {/* Rotation Presets — global only */}
            {isGlobal && (
              <div className="border-t border-white/5 pt-3 space-y-2">
                <span className="text-white/50 text-[11px] uppercase tracking-wider">
                  Rotation Preset
                </span>
                <div className="grid grid-cols-4 gap-1">
                  {rotationPresets.map(({ label, r }) => (
                    <button
                      key={label}
                      onClick={() =>
                        dispatch(setGlobalTransform({ rotation: r }))
                      }
                      className="py-1.5 rounded-md text-[10px] font-medium glass text-white/60 hover:text-white hover:bg-indigo-500/20 transition-all border border-transparent hover:border-indigo-500/30"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isGlobal && (shape || isMulti) && (
              <>
                {/* Fill color - disable if multi-selection with different colors */}
                <div className="flex items-center justify-between">
                  <Label className="text-white/70 text-xs">Fill</Label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-white/50">
                      {isMulti ? "Multiple" : shape?.fill}
                    </span>
                    <input
                      type="color"
                      value={isMulti ? "#888888" : shape?.fill}
                      onChange={(e) => {
                        if (isMulti) {
                          selectedShapeIds.forEach(id => {
                            dispatch(updateShapeColor({ id, color: e.target.value }));
                          });
                        } else if (shape) {
                          dispatch(updateShapeColor({ id: shape.id, color: e.target.value }));
                        }
                      }}
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
                          isMulti ? dispatch(resetShapesExtrusion(selectedShapeIds)) : dispatch(resetShapeExtrusion(selectedShapeId!))
                        }
                      >
                        Reset to global
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/70 text-xs">Depth</Label>
                    <SliderWithInput
                      value={resolved.depth}
                      onChange={(v) => set("depth", v)}
                      min={1}
                      max={50}
                      step={1}
                      sliderClassName="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                      inputClassName="focus-visible:ring-indigo-500/50 text-indigo-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/70 text-xs">
                      Curve Segments (Smoothness)
                    </Label>
                    <SliderWithInput
                      value={resolved.curveSegments}
                      onChange={(v) => set("curveSegments", v)}
                      min={1}
                      max={64}
                      step={1}
                      sliderClassName="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                      inputClassName="focus-visible:ring-indigo-500/50 text-indigo-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/70 text-xs">
                      Bevel Thickness
                    </Label>
                    <SliderWithInput
                      value={resolved.bevelThickness}
                      onChange={(v) => set("bevelThickness", v)}
                      min={0}
                      max={5}
                      step={0.1}
                      sliderClassName="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                      inputClassName="focus-visible:ring-indigo-500/50 text-indigo-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/70 text-xs">Bevel Size</Label>
                    <SliderWithInput
                      value={resolved.bevelSize}
                      onChange={(v) => set("bevelSize", v)}
                      min={0}
                      max={3}
                      step={0.1}
                      sliderClassName="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                      inputClassName="focus-visible:ring-indigo-500/50 text-indigo-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/70 text-xs">
                      Bevel Segments
                    </Label>
                    <SliderWithInput
                      value={resolved.bevelSegments}
                      onChange={(v) => set("bevelSegments", v)}
                      min={1}
                      max={8}
                      step={1}
                      sliderClassName="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                      inputClassName="focus-visible:ring-indigo-500/50 text-indigo-300"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Material Section */}
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
                      isMulti
                        ? dispatch(resetShapesMaterial(selectedShapeIds))
                        : dispatch(resetShapeMaterial(selectedShapeId!))
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

              <div className="space-y-2">
                <Label className="text-white/70 text-xs">Roughness</Label>
                <SliderWithInput
                  value={resolvedMaterial.roughness}
                  onChange={(v) => {
                    setMaterial("preset", "custom");
                    setMaterial("roughness", v);
                  }}
                  min={0}
                  max={1}
                  step={0.01}
                  sliderClassName="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                  inputClassName="focus-visible:ring-indigo-500/50 text-indigo-300"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white/70 text-xs">Metalness</Label>
                <SliderWithInput
                  value={resolvedMaterial.metalness}
                  onChange={(v) => {
                    setMaterial("preset", "custom");
                    setMaterial("metalness", v);
                  }}
                  min={0}
                  max={1}
                  step={0.01}
                  sliderClassName="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                  inputClassName="focus-visible:ring-indigo-500/50 text-indigo-300"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white/70 text-xs">Transmission</Label>
                <SliderWithInput
                  value={resolvedMaterial.transmission}
                  onChange={(v) => {
                    setMaterial("preset", "custom");
                    setMaterial("transmission", v);
                  }}
                  min={0}
                  max={1}
                  step={0.01}
                  sliderClassName="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                  inputClassName="focus-visible:ring-indigo-500/50 text-indigo-300"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white/70 text-xs">IOR</Label>
                <SliderWithInput
                  value={resolvedMaterial.ior}
                  onChange={(v) => {
                    setMaterial("preset", "custom");
                    setMaterial("ior", v);
                  }}
                  min={1}
                  max={2.33}
                  step={0.01}
                  sliderClassName="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                  inputClassName="focus-visible:ring-indigo-500/50 text-indigo-300"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-white/60">Clearcoat</Label>
                <SliderWithInput
                  value={resolvedMaterial.clearcoat}
                  onChange={(v) => {
                    setMaterial("clearcoat", v);
                    setMaterial("preset", "custom");
                  }}
                  min={0}
                  max={1}
                  step={0.05}
                  sliderClassName="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                  inputClassName="focus-visible:ring-indigo-500/50 text-indigo-300"
                />
              </div>

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
                {/* Emissive color presets */}
                <div className="flex gap-1 flex-wrap pt-0.5">
                  {emissiveColorPresets.map(({ label, color }) => {
                    const active =
                      (resolvedMaterial.emissive || "#000000").toLowerCase() ===
                      color.toLowerCase();
                    return (
                      <button
                        key={label}
                        title={label}
                        onClick={() => {
                          setMaterial("emissive", color);
                          setMaterial("preset", "custom");
                        }}
                        className={cn(
                          "w-6 h-6 rounded border-2 transition-all hover:scale-110",
                          active
                            ? "border-white/60 scale-110"
                            : "border-white/10 hover:border-white/30",
                        )}
                        style={{ background: color }}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-white/60">
                  Emissive Intensity
                </Label>
                <SliderWithInput
                  value={resolvedMaterial.emissiveIntensity || 0}
                  onChange={(v) => {
                    setMaterial("emissiveIntensity", v);
                    setMaterial("preset", "custom");
                  }}
                  min={0}
                  max={10}
                  step={0.1}
                  sliderClassName="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                  inputClassName="focus-visible:ring-indigo-500/50 text-indigo-300"
                />
                {/* Emissive intensity presets */}
                <div className="grid grid-cols-6 gap-1 pt-0.5">
                  {emissiveIntensityPresets.map(({ label, value }) => {
                    const active =
                      Math.abs((resolvedMaterial.emissiveIntensity || 0) - value) <
                      0.05;
                    return (
                      <button
                        key={label}
                        onClick={() => {
                          setMaterial("emissiveIntensity", value);
                          setMaterial("preset", "custom");
                        }}
                        className={cn(
                          "py-1 rounded text-[9px] font-medium transition-all",
                          active
                            ? "bg-indigo-500/30 text-indigo-300 border border-indigo-500/40"
                            : "glass text-white/50 hover:text-white/80 hover:bg-white/8 border border-transparent",
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
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

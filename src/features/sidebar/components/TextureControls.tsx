"use client";

import { useMemo, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setGlobalTexture,
  clearTextureChannel,
  updateShapesTexture,
  clearShapesTextureChannel,
  resetShapesTexture,
} from "@/store/slices/sceneSlice";
import { TextureSettings } from "@/types";
import { SliderWithInput } from "@/components/ui/slider-with-input";
import { CollapsibleCard } from "./CollapsibleCard";

type TextureChannel = {
  key: keyof Pick<
    TextureSettings,
    | "map"
    | "normalMap"
    | "roughnessMap"
    | "metalnessMap"
    | "displacementMap"
    | "aoMap"
    | "emissiveMap"
    | "alphaMap"
    | "lightMap"
  >;
  label: string;
  hint: string;
};

const CHANNELS: TextureChannel[] = [
  { key: "map", label: "Base Color", hint: "Albedo / color" },
  { key: "normalMap", label: "Normal", hint: "Surface detail" },
  { key: "roughnessMap", label: "Roughness", hint: "Rough vs. smooth" },
  { key: "metalnessMap", label: "Metalness", hint: "Metallic areas" },
  { key: "displacementMap", label: "Displacement", hint: "Vertex offset" },
  { key: "aoMap", label: "Ambient Occlusion", hint: "Soft shadows" },
  { key: "emissiveMap", label: "Emissive", hint: "Self-glow areas" },
  { key: "alphaMap", label: "Alpha", hint: "Transparency mask" },
  { key: "lightMap", label: "Light Map", hint: "Indirect lighting" },
];

const SUPPORTED = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/bmp", "image/avif"];

export function TextureControls() {
  const dispatch = useAppDispatch();
  const globalTexture = useAppSelector((s) => s.scene.globalTexture);
  const svgShapes = useAppSelector((s) => s.scene.svgShapes);
  const selectedShapeId = useAppSelector((s) => s.scene.selectedShapeId);
  const selectedShapeIds = useAppSelector((s) => s.scene.selectedShapeIds);
  const is3DMode = useAppSelector((s) => s.scene.is3DMode);
  const isGlbSelected = useAppSelector((s) =>
    s.scene.selectedShapeId
      ? s.scene.glbObjects.some((g) => g.id === s.scene.selectedShapeId)
      : false,
  );
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const targetIds = useMemo(() => {
    if (selectedShapeIds.length > 0) return selectedShapeIds;
    if (selectedShapeId && selectedShapeId !== "global") return [selectedShapeId];
    return [];
  }, [selectedShapeId, selectedShapeIds]);

  const isLocalMode = targetIds.length > 0;

  // In local mode, surface the first selected shape's texture (UI reference).
  // Writes propagate to all selected shapes.
  const primaryShape = useMemo(
    () => (isLocalMode ? svgShapes.find((s) => s.id === targetIds[0]) : undefined),
    [isLocalMode, targetIds, svgShapes],
  );

  const displayTexture: Partial<TextureSettings> = isLocalMode
    ? primaryShape?.texture ?? {}
    : globalTexture;

  if (!is3DMode) return null;
  if (svgShapes.length === 0) return null;
  if (isGlbSelected) return null;

  const upload = (key: keyof TextureSettings, file: File) => {
    if (!SUPPORTED.includes(file.type)) {
      alert(`"${file.name}" is not supported.\nUse PNG, JPG, WebP, or BMP.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (isLocalMode) {
        dispatch(updateShapesTexture({ ids: targetIds, texture: { [key]: dataUrl } }));
      } else {
        dispatch(setGlobalTexture({ [key]: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const setParam = (patch: Partial<TextureSettings>) => {
    if (isLocalMode) {
      dispatch(updateShapesTexture({ ids: targetIds, texture: patch }));
    } else {
      dispatch(setGlobalTexture(patch));
    }
  };

  const clearChannel = (key: keyof TextureSettings) => {
    if (isLocalMode) {
      dispatch(clearShapesTextureChannel({ ids: targetIds, key }));
    } else {
      dispatch(clearTextureChannel(key));
    }
  };

  const resetToGlobal = () => {
    dispatch(resetShapesTexture(targetIds));
  };

  const clearAllChannels = () => {
    const empty: Partial<TextureSettings> = {
      map: null, normalMap: null, roughnessMap: null,
      metalnessMap: null, displacementMap: null, aoMap: null,
      emissiveMap: null, alphaMap: null, lightMap: null,
    };
    if (isLocalMode) {
      dispatch(updateShapesTexture({ ids: targetIds, texture: empty }));
    } else {
      dispatch(setGlobalTexture(empty));
    }
  };

  const hasAny = CHANNELS.some((c) => !!displayTexture[c.key]);

  const cardBorder = isLocalMode ? "border-emerald-500/25" : "border-blue-500/20";
  const titleClass = isLocalMode ? "text-emerald-300" : "text-blue-400";
  const accentSlider = isLocalMode
    ? "**:[[role=slider]]:bg-emerald-400 **:[[role=slider]]:border-emerald-400"
    : "**:[[role=slider]]:bg-blue-400 **:[[role=slider]]:border-blue-400";
  const accentInput = isLocalMode
    ? "focus-visible:ring-emerald-500/50 text-emerald-200"
    : "focus-visible:ring-blue-500/50 text-blue-300";
  const accentBtn = isLocalMode
    ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300/80 hover:text-emerald-200 border border-emerald-500/15"
    : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-300/70 hover:text-blue-300 border border-blue-500/10";

  const description = isLocalMode
    ? `Local override for ${targetIds.length} shape${targetIds.length > 1 ? "s" : ""} — global maps ignored`
    : "Applies to all objects in the scene";

  return (
    <CollapsibleCard
      id="textures"
      cardClassName={cardBorder}
      title={isLocalMode ? "Textures (Local)" : "Textures"}
      titleClassName={titleClass}
      description={description}
      headerExtra={
        <div className="flex items-center gap-2 shrink-0">
          {isLocalMode && (
            <button
              onClick={resetToGlobal}
              className="text-[10px] text-emerald-300/70 hover:text-emerald-200 transition-colors"
              title="Remove local overrides and use global textures"
            >
              Reset to global
            </button>
          )}
          {hasAny && (
            <button
              onClick={clearAllChannels}
              className="text-[10px] text-red-400/60 hover:text-red-400 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      }
      contentClassName="pt-3 space-y-3"
    >
        {/* Texture channels */}
        <div className="space-y-1.5">
          {CHANNELS.map(({ key, label, hint }) => {
            const url = displayTexture[key] as string | null | undefined;
            return (
              <div
                key={key}
                className="flex items-center gap-2.5 p-2 rounded-lg bg-white/3 hover:bg-white/6 border border-white/5 transition-colors"
              >
                {/* Thumbnail */}
                <div
                  className="w-9 h-9 rounded-md shrink-0 border border-white/10 overflow-hidden cursor-pointer"
                  style={
                    url
                      ? { backgroundImage: `url(${url})`, backgroundSize: "cover", backgroundPosition: "center" }
                      : { background: "rgba(255,255,255,0.04)" }
                  }
                  onClick={() => fileRefs.current[key]?.click()}
                  title={hint}
                >
                  {!url && (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white/80">{label}</div>
                  <div className="text-[10px] text-muted-foreground/50 truncate">{hint}</div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => fileRefs.current[key]?.click()}
                    className={`text-[10px] px-2 py-1 rounded transition-colors ${accentBtn}`}
                  >
                    {url ? "Change" : "Upload"}
                  </button>
                  {url && (
                    <button
                      onClick={() => clearChannel(key)}
                      className="w-6 h-6 flex items-center justify-center rounded bg-red-500/10 hover:bg-red-500/20 text-red-400/60 hover:text-red-400 transition-colors text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <input
                  ref={(el) => { fileRefs.current[key] = el; }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) upload(key, file);
                    e.target.value = "";
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Parameters — only shown when at least one map is active */}
        {hasAny && (
          <div className="space-y-3 pt-3 border-t border-white/5">

            <div className="space-y-1.5">
              <div>
                <p className="text-[10px] text-white/70 font-medium">Texture Scale</p>
                <p className="text-[10px] text-muted-foreground/45 leading-tight mt-0.5">Tiling repeat — smaller values zoom in, larger zoom out</p>
              </div>
              <SliderWithInput
                value={displayTexture.repeat ?? 1}
                min={0.01} max={100} step={0.01}
                onChange={(v) => setParam({ repeat: v })}
                sliderClassName={accentSlider}
                inputClassName={accentInput}
              />
            </div>

            {displayTexture.normalMap && (
              <div className="space-y-1.5">
                <div>
                  <p className="text-[10px] text-white/70 font-medium">Normal Strength</p>
                  <p className="text-[10px] text-muted-foreground/45 leading-tight mt-0.5">How pronounced the surface bump detail appears</p>
                </div>
                <SliderWithInput
                  value={displayTexture.normalScale ?? 1}
                  min={0} max={3} step={0.01}
                  onChange={(v) => setParam({ normalScale: v })}
                  sliderClassName={accentSlider}
                  inputClassName={accentInput}
                />
              </div>
            )}

            {displayTexture.displacementMap && (
              <div className="space-y-1.5">
                <div>
                  <p className="text-[10px] text-white/70 font-medium">Displacement Scale</p>
                  <p className="text-[10px] text-muted-foreground/45 leading-tight mt-0.5">How far vertices are pushed by the displacement map</p>
                </div>
                <SliderWithInput
                  value={displayTexture.displacementScale ?? 0.1}
                  min={0} max={2} step={0.01}
                  onChange={(v) => setParam({ displacementScale: v })}
                  sliderClassName={accentSlider}
                  inputClassName={accentInput}
                />
              </div>
            )}

            {displayTexture.aoMap && (
              <div className="space-y-1.5">
                <div>
                  <p className="text-[10px] text-white/70 font-medium">AO Intensity</p>
                  <p className="text-[10px] text-muted-foreground/45 leading-tight mt-0.5">Strength of ambient occlusion / contact shadows</p>
                </div>
                <SliderWithInput
                  value={displayTexture.aoMapIntensity ?? 1}
                  min={0} max={2} step={0.01}
                  onChange={(v) => setParam({ aoMapIntensity: v })}
                  sliderClassName={accentSlider}
                  inputClassName={accentInput}
                />
              </div>
            )}

          </div>
        )}
    </CollapsibleCard>
  );
}

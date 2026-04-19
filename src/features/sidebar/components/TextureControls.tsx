"use client";

import { useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setGlobalTexture } from "@/store/slices/sceneSlice";
import { TextureSettings } from "@/types";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const upload = (key: keyof TextureSettings, file: File) => {
    if (!SUPPORTED.includes(file.type)) {
      alert(`"${file.name}" is not supported.\nUse PNG, JPG, WebP, or BMP.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      dispatch(setGlobalTexture({ [key]: e.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const hasAny = CHANNELS.some((c) => !!globalTexture[c.key]);

  return (
    <Card className="glass-card border-blue-500/20">
      <CardHeader className="pb-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-blue-400">Textures</CardTitle>
            <CardDescription>Applies to all objects in the scene</CardDescription>
          </div>
          {hasAny && (
            <button
              onClick={() =>
                dispatch(
                  setGlobalTexture({
                    map: null, normalMap: null, roughnessMap: null,
                    metalnessMap: null, displacementMap: null, aoMap: null,
                    emissiveMap: null, alphaMap: null, lightMap: null,
                  }),
                )
              }
              className="text-[10px] text-red-400/60 hover:text-red-400 transition-colors shrink-0"
            >
              Clear all
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Texture channels */}
        <div className="space-y-1.5">
          {CHANNELS.map(({ key, label, hint }) => {
            const url = globalTexture[key] as string | null | undefined;
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
                    className="text-[10px] px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-300/70 hover:text-blue-300 border border-blue-500/10 transition-colors"
                  >
                    {url ? "Change" : "Upload"}
                  </button>
                  {url && (
                    <button
                      onClick={() => dispatch(setGlobalTexture({ [key]: null }))}
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
              <div className="flex justify-between text-[10px] text-muted-foreground/70">
                <span>Texture Scale</span>
                <span className="text-blue-300/70">{(globalTexture.repeat ?? 1).toFixed(2)}×</span>
              </div>
              <Slider
                min={0.01} max={100} step={0.01}
                value={[globalTexture.repeat ?? 1]}
                onValueChange={([v]) => dispatch(setGlobalTexture({ repeat: v }))}
              />
              <div className="flex justify-between text-[9px] text-muted-foreground/35">
                <span>smaller</span>
                <span>larger</span>
              </div>
            </div>

            {globalTexture.normalMap && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-muted-foreground/70">
                  <span>Normal Strength</span>
                  <span className="text-blue-300/70">{(globalTexture.normalScale ?? 1).toFixed(2)}</span>
                </div>
                <Slider
                  min={0} max={3} step={0.01}
                  value={[globalTexture.normalScale ?? 1]}
                  onValueChange={([v]) => dispatch(setGlobalTexture({ normalScale: v }))}
                />
              </div>
            )}

            {globalTexture.displacementMap && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-muted-foreground/70">
                  <span>Displacement Scale</span>
                  <span className="text-blue-300/70">{(globalTexture.displacementScale ?? 0.1).toFixed(2)}</span>
                </div>
                <Slider
                  min={0} max={2} step={0.01}
                  value={[globalTexture.displacementScale ?? 0.1]}
                  onValueChange={([v]) => dispatch(setGlobalTexture({ displacementScale: v }))}
                />
              </div>
            )}

            {globalTexture.aoMap && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-muted-foreground/70">
                  <span>AO Intensity</span>
                  <span className="text-blue-300/70">{(globalTexture.aoMapIntensity ?? 1).toFixed(2)}</span>
                </div>
                <Slider
                  min={0} max={2} step={0.01}
                  value={[globalTexture.aoMapIntensity ?? 1]}
                  onValueChange={([v]) => dispatch(setGlobalTexture({ aoMapIntensity: v }))}
                />
              </div>
            )}

          </div>
        )}
      </CardContent>
    </Card>
  );
}

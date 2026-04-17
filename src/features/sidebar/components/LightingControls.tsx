"use client";

import { Lightbulb, Trash2 } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateLight,
  removeLight,
  setLights,
  setLightingPreset,
} from "@/store/slices/sceneSlice";
import {
  SIDEBAR_PRESET_DESCRIPTIONS,
  SIDEBAR_LIGHTING_PRESETS,
} from "../constants/lightingPresets";
import { LightingPreset } from "@/types";

export function LightingControls() {
  const dispatch = useAppDispatch();
  const lights = useAppSelector((state) => state.scene.lights);
  const currentPreset = useAppSelector((state) => state.scene.currentPreset);
  const is3DMode = useAppSelector((state) => state.scene.is3DMode);

  if (!is3DMode) return null;

  const handlePresetChange = (preset: LightingPreset) => {
    dispatch(setLightingPreset(preset));
    const presetLights = SIDEBAR_LIGHTING_PRESETS[preset];
    if (presetLights.length > 0) {
      dispatch(setLights(presetLights));
    }
  };

  return (
    <Card className="glass-card border-amber-500/20">
      <CardHeader className="pb-3 border-b border-white/5">
        <CardTitle className="flex items-center gap-2 text-amber-400">
          <Lightbulb className="h-5 w-5" />
          Lighting
        </CardTitle>
        <CardDescription>Control scene lighting</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs defaultValue="presets" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/20 border border-white/5 p-1 rounded-lg">
            <TabsTrigger
              value="presets"
              className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 rounded-md"
            >
              Presets
            </TabsTrigger>
            <TabsTrigger
              value="custom"
              className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 rounded-md"
            >
              Custom
            </TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="space-y-4 mt-4">
            <div className="space-y-3">
              <Label className="text-white/80">Lighting Preset</Label>
              <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {Object.keys(SIDEBAR_LIGHTING_PRESETS).map((key) => (
                  <Button
                    key={key}
                    variant={currentPreset === key ? "default" : "outline"}
                    onClick={() => handlePresetChange(key as LightingPreset)}
                    className={`justify-start text-left h-auto py-3 transition-all ${
                      currentPreset === key
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30"
                        : "bg-black/20 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div>
                      <div className="font-medium capitalize mb-1">
                        {key.replace("-", " ")}
                      </div>
                      <div className="text-xs opacity-70 leading-relaxed whitespace-normal wrap-break-word">
                        {SIDEBAR_PRESET_DESCRIPTIONS[key as LightingPreset]}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="custom"
            className="space-y-6 mt-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2"
          >
            {lights.map((light, index) => (
              <div
                key={light.id}
                className="space-y-4 pb-4 glass rounded-xl p-4 relative group"
              >
                <div className="flex items-center justify-between">
                  <Label className="capitalize text-amber-200/90 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span>
                    {light.type} Light #{index + 1}
                  </Label>
                  {lights.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-white/40 hover:text-red-400 hover:bg-red-400/10 absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => dispatch(removeLight(light.id))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-white/60">Intensity</Label>
                  <SliderWithInput
                    value={light.intensity}
                    onChange={(v) =>
                      dispatch(updateLight({ ...light, intensity: v }))
                    }
                    min={0}
                    max={3}
                    step={0.1}
                    sliderClassName="**:[[role=slider]]:bg-amber-400 **:[[role=slider]]:border-amber-400"
                    inputClassName="focus-visible:ring-amber-500/50 text-amber-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-white/60">Color</Label>
                  <div className="flex gap-3">
                    <div className="relative w-12 h-9 rounded-md overflow-hidden border border-white/10 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                      <Input
                        type="color"
                        value={light.color}
                        onChange={(e) =>
                          dispatch(
                            updateLight({ ...light, color: e.target.value }),
                          )
                        }
                        className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer border-0 p-0"
                      />
                    </div>
                    <Input
                      type="text"
                      value={light.color}
                      onChange={(e) =>
                        dispatch(
                          updateLight({ ...light, color: e.target.value }),
                        )
                      }
                      className="flex-1 bg-black/20 border-white/10 text-amber-100/90 font-mono text-sm focus-visible:ring-amber-500"
                    />
                  </div>
                </div>

                {light.type !== "ambient" && (
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/5">
                    {(["X", "Y", "Z"] as const).map((axis, ai) => (
                      <div key={axis} className="space-y-2">
                        <Label className="text-[10px] text-white/50 uppercase tracking-wider">
                          {axis} Pos
                        </Label>
                        <Input
                          type="number"
                          value={light.position[ai]}
                          onChange={(e) => {
                            const pos = [...light.position] as [
                              number,
                              number,
                              number,
                            ];
                            pos[ai] = parseFloat(e.target.value);
                            dispatch(updateLight({ ...light, position: pos }));
                          }}
                          className="h-8 bg-black/20 border-white/10 text-xs text-center"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

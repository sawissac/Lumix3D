"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SliderWithInput } from "@/components/ui/slider-with-input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setBloomSettings, setGroundSettings } from "@/store/slices/sceneSlice";

export function EffectControls() {
  const dispatch = useAppDispatch();
  const is3DMode = useAppSelector((state) => state.scene.is3DMode);
  const bloom = useAppSelector((state) => state.scene.bloom);
  const ground = useAppSelector((state) => state.scene.ground);

  if (!is3DMode) return null;

  return (
    <Card className="border-indigo-500/20 bg-indigo-500/5">
      <CardHeader className="pb-3 border-b border-white/5">
        <CardTitle className="text-indigo-400">Effects & Ground</CardTitle>
        <CardDescription>
          Adjust scene bloom effects and ground plane
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {/* Bloom Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="enable-bloom"
              className="text-white/80 font-semibold"
            >
              Enable Bloom
            </Label>
            <Switch
              id="enable-bloom"
              checked={bloom.enabled}
              onCheckedChange={(checked: boolean) =>
                dispatch(setBloomSettings({ enabled: checked }))
              }
            />
          </div>

          {bloom.enabled && (
            <div className="space-y-4 pl-2 border-l-2 border-white/10">
              <div className="space-y-2">
                <Label className="text-white/80 text-xs">Intensity</Label>
                <SliderWithInput
                  value={bloom.intensity}
                  onChange={(v) => dispatch(setBloomSettings({ intensity: v }))}
                  min={0}
                  max={5}
                  step={0.1}
                  sliderClassName="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                  inputClassName="focus-visible:ring-indigo-500/50 text-indigo-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80 text-xs">
                  Luminance Threshold
                </Label>
                <SliderWithInput
                  value={bloom.luminanceThreshold}
                  onChange={(v) =>
                    dispatch(setBloomSettings({ luminanceThreshold: v }))
                  }
                  min={0}
                  max={1}
                  step={0.01}
                  sliderClassName="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                  inputClassName="focus-visible:ring-indigo-500/50 text-indigo-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80 text-xs">
                  Luminance Smoothing
                </Label>
                <SliderWithInput
                  value={bloom.luminanceSmoothing}
                  onChange={(v) =>
                    dispatch(setBloomSettings({ luminanceSmoothing: v }))
                  }
                  min={0}
                  max={1}
                  step={0.01}
                  sliderClassName="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                  inputClassName="focus-visible:ring-indigo-500/50 text-indigo-300"
                />
              </div>
            </div>
          )}
        </div>

        <div className="h-px bg-white/10" />

        {/* Ground Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="enable-ground"
              className="text-white/80 font-semibold"
            >
              Ground Shadows
            </Label>
            <Switch
              id="enable-ground"
              checked={ground.enabled}
              onCheckedChange={(checked: boolean) =>
                dispatch(setGroundSettings({ enabled: checked }))
              }
            />
          </div>

          {ground.enabled && (
            <div className="space-y-4 pl-2 border-l-2 border-white/10">
              <div className="space-y-3">
                <Label className="text-white/80 text-xs">Shadow Color</Label>
                <div className="flex gap-3">
                  <div className="relative w-10 h-8 rounded-md overflow-hidden border border-white/10 shadow-sm cursor-pointer">
                    <Input
                      type="color"
                      value={ground.color}
                      onChange={(e) =>
                        dispatch(setGroundSettings({ color: e.target.value }))
                      }
                      className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer border-0 p-0"
                    />
                  </div>
                  <Input
                    type="text"
                    value={ground.color}
                    onChange={(e) =>
                      dispatch(setGroundSettings({ color: e.target.value }))
                    }
                    className="flex-1 bg-black/20 border-white/10 text-indigo-200 font-mono uppercase text-sm h-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white/80 text-xs">Shadow Opacity</Label>
                <SliderWithInput
                  value={ground.metalness}
                  onChange={(v) =>
                    dispatch(setGroundSettings({ metalness: v }))
                  }
                  min={0}
                  max={5}
                  step={0.01}
                  sliderClassName="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                  inputClassName="focus-visible:ring-indigo-500/50 text-indigo-300"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white/80 text-xs">Shadow Blur</Label>
                <SliderWithInput
                  value={ground.roughness}
                  onChange={(v) =>
                    dispatch(setGroundSettings({ roughness: v }))
                  }
                  min={0}
                  max={1}
                  step={0.01}
                  sliderClassName="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                  inputClassName="focus-visible:ring-indigo-500/50 text-indigo-300"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white/80 text-xs">Y Position</Label>
                <SliderWithInput
                  value={ground.position[1]}
                  onChange={(v) =>
                    dispatch(
                      setGroundSettings({
                        position: [ground.position[0], v, ground.position[2]],
                      }),
                    )
                  }
                  min={-50}
                  max={50}
                  step={1}
                  sliderClassName="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                  inputClassName="focus-visible:ring-indigo-500/50 text-indigo-300"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

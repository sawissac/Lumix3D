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
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setExtrusionSettings } from "@/store/slices/sceneSlice";

export function ExtrusionControls() {
  const dispatch = useAppDispatch();
  const extrusion = useAppSelector((state) => state.scene.extrusion);
  const is3DMode = useAppSelector((state) => state.scene.is3DMode);

  if (!is3DMode) return null;

  return (
    <Card className="glass-card border-purple-500/20">
      <CardHeader className="pb-3 border-b border-white/5">
        <CardTitle className="text-purple-400">3D Settings</CardTitle>
        <CardDescription>
          Applies to all shapes — overrides any per-shape settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-4">
        <div className="space-y-2">
          <Label className="text-white/80 text-xs">Depth</Label>
          <SliderWithInput
            value={extrusion.depth}
            onChange={(v) => dispatch(setExtrusionSettings({ depth: v }))}
            min={1}
            max={50}
            step={1}
            sliderClassName="**:[[role=slider]]:bg-purple-400 **:[[role=slider]]:border-purple-400"
            inputClassName="focus-visible:ring-purple-500/50 text-purple-300"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white/80 text-xs">
            Curve Segments (Smoothness)
          </Label>
          <SliderWithInput
            value={extrusion.curveSegments}
            onChange={(v) =>
              dispatch(setExtrusionSettings({ curveSegments: v }))
            }
            min={1}
            max={64}
            step={1}
            sliderClassName="**:[[role=slider]]:bg-purple-400 **:[[role=slider]]:border-purple-400"
            inputClassName="focus-visible:ring-purple-500/50 text-purple-300"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white/80 text-xs">Bevel Thickness</Label>
          <SliderWithInput
            value={extrusion.bevelThickness}
            onChange={(v) =>
              dispatch(setExtrusionSettings({ bevelThickness: v }))
            }
            min={0}
            max={5}
            step={0.1}
            sliderClassName="**:[[role=slider]]:bg-purple-400 **:[[role=slider]]:border-purple-400"
            inputClassName="focus-visible:ring-purple-500/50 text-purple-300"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white/80 text-xs">Bevel Size</Label>
          <SliderWithInput
            value={extrusion.bevelSize}
            onChange={(v) => dispatch(setExtrusionSettings({ bevelSize: v }))}
            min={0}
            max={3}
            step={0.1}
            sliderClassName="**:[[role=slider]]:bg-purple-400 **:[[role=slider]]:border-purple-400"
            inputClassName="focus-visible:ring-purple-500/50 text-purple-300"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white/80 text-xs">Bevel Segments</Label>
          <SliderWithInput
            value={extrusion.bevelSegments}
            onChange={(v) =>
              dispatch(setExtrusionSettings({ bevelSegments: v }))
            }
            min={1}
            max={8}
            step={1}
            sliderClassName="**:[[role=slider]]:bg-purple-400 **:[[role=slider]]:border-purple-400"
            inputClassName="focus-visible:ring-purple-500/50 text-purple-300"
          />
        </div>
      </CardContent>
    </Card>
  );
}

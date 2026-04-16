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
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setExtrusionSettings } from "@/store/slices/sceneSlice";

export function ExtrusionControls() {
  const dispatch = useAppDispatch();
  const extrusion = useAppSelector((state) => state.scene.extrusion);
  const is3DMode = useAppSelector((state) => state.scene.is3DMode);

  if (!is3DMode) return null;

  return (
    <Card className="border-purple-500/20 bg-purple-500/5">
      <CardHeader className="pb-3 border-b border-white/5">
        <CardTitle className="text-purple-400">3D Settings</CardTitle>
        <CardDescription>
          Applies to all shapes — overrides any per-shape settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-white/80">Depth</Label>
            <span className="text-xs font-mono bg-black/40 px-2 py-1 rounded-md text-purple-300">
              {extrusion.depth}
            </span>
          </div>
          <Slider
            value={[extrusion.depth]}
            onValueChange={(value) =>
              dispatch(setExtrusionSettings({ depth: value[0] }))
            }
            min={1}
            max={50}
            step={1}
            className="**:[[role=slider]]:bg-purple-400 **:[[role=slider]]:border-purple-400"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-white/80">Curve Segments (Smoothness)</Label>
            <span className="text-xs font-mono bg-black/40 px-2 py-1 rounded-md text-purple-300">
              {extrusion.curveSegments}
            </span>
          </div>
          <Slider
            value={[extrusion.curveSegments]}
            onValueChange={(value) =>
              dispatch(setExtrusionSettings({ curveSegments: value[0] }))
            }
            min={1}
            max={64}
            step={1}
            className="**:[[role=slider]]:bg-purple-400 **:[[role=slider]]:border-purple-400"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-white/80">Bevel Thickness</Label>
            <span className="text-xs font-mono bg-black/40 px-2 py-1 rounded-md text-purple-300">
              {extrusion.bevelThickness}
            </span>
          </div>
          <Slider
            value={[extrusion.bevelThickness]}
            onValueChange={(value) =>
              dispatch(setExtrusionSettings({ bevelThickness: value[0] }))
            }
            min={0}
            max={5}
            step={0.1}
            className="**:[[role=slider]]:bg-purple-400 **:[[role=slider]]:border-purple-400"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-white/80">Bevel Size</Label>
            <span className="text-xs font-mono bg-black/40 px-2 py-1 rounded-md text-purple-300">
              {extrusion.bevelSize}
            </span>
          </div>
          <Slider
            value={[extrusion.bevelSize]}
            onValueChange={(value) =>
              dispatch(setExtrusionSettings({ bevelSize: value[0] }))
            }
            min={0}
            max={3}
            step={0.1}
            className="**:[[role=slider]]:bg-purple-400 **:[[role=slider]]:border-purple-400"
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-white/80">Bevel Segments</Label>
            <span className="text-xs font-mono bg-black/40 px-2 py-1 rounded-md text-purple-300">
              {extrusion.bevelSegments}
            </span>
          </div>
          <Slider
            value={[extrusion.bevelSegments]}
            onValueChange={(value) =>
              dispatch(setExtrusionSettings({ bevelSegments: value[0] }))
            }
            min={1}
            max={8}
            step={1}
            className="**:[[role=slider]]:bg-purple-400 **:[[role=slider]]:border-purple-400"
          />
        </div>
      </CardContent>
    </Card>
  );
}

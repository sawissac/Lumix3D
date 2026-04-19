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

function Field({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div>
        <Label className="text-white/80 text-xs">{label}</Label>
        <p className="text-[10px] text-muted-foreground/45 leading-tight mt-0.5">{hint}</p>
      </div>
      {children}
    </div>
  );
}

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
        <Field label="Depth" hint="How far the shape extends into 3D space">
          <SliderWithInput
            value={extrusion.depth}
            onChange={(v) => dispatch(setExtrusionSettings({ depth: v }))}
            min={1}
            max={50}
            step={1}
            sliderClassName="**:[[role=slider]]:bg-purple-400 **:[[role=slider]]:border-purple-400"
            inputClassName="focus-visible:ring-purple-500/50 text-purple-300"
          />
        </Field>

        <Field label="Curve Segments (Smoothness)" hint="Higher = smoother curves, lower = faster render">
          <SliderWithInput
            value={extrusion.curveSegments}
            onChange={(v) => dispatch(setExtrusionSettings({ curveSegments: v }))}
            min={1}
            max={64}
            step={1}
            sliderClassName="**:[[role=slider]]:bg-purple-400 **:[[role=slider]]:border-purple-400"
            inputClassName="focus-visible:ring-purple-500/50 text-purple-300"
          />
        </Field>

        <Field label="Bevel Thickness" hint="Depth of the bevel along the extrusion side">
          <SliderWithInput
            value={extrusion.bevelThickness}
            onChange={(v) => dispatch(setExtrusionSettings({ bevelThickness: v }))}
            min={0}
            max={5}
            step={0.1}
            sliderClassName="**:[[role=slider]]:bg-purple-400 **:[[role=slider]]:border-purple-400"
            inputClassName="focus-visible:ring-purple-500/50 text-purple-300"
          />
        </Field>

        <Field label="Bevel Size" hint="Outward spread of the bevel from shape edges">
          <SliderWithInput
            value={extrusion.bevelSize}
            onChange={(v) => dispatch(setExtrusionSettings({ bevelSize: v }))}
            min={0}
            max={3}
            step={0.1}
            sliderClassName="**:[[role=slider]]:bg-purple-400 **:[[role=slider]]:border-purple-400"
            inputClassName="focus-visible:ring-purple-500/50 text-purple-300"
          />
        </Field>

        <Field label="Bevel Segments" hint="Number of steps in the bevel curve — higher is smoother">
          <SliderWithInput
            value={extrusion.bevelSegments}
            onChange={(v) => dispatch(setExtrusionSettings({ bevelSegments: v }))}
            min={1}
            max={8}
            step={1}
            sliderClassName="**:[[role=slider]]:bg-purple-400 **:[[role=slider]]:border-purple-400"
            inputClassName="focus-visible:ring-purple-500/50 text-purple-300"
          />
        </Field>
      </CardContent>
    </Card>
  );
}

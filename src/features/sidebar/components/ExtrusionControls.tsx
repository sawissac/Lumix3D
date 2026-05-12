"use client";

import { CollapsibleCard } from "./CollapsibleCard";
import { Label } from "@/components/ui/label";
import { SliderWithInput } from "@/components/ui/slider-with-input";
import { Switch } from "@/components/ui/switch";
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
  const svgShapesCount = useAppSelector((state) => state.scene.svgShapes.length);
  const selectedShapeId = useAppSelector((s) => s.scene.selectedShapeId);
  const isGlbSelected = useAppSelector((s) =>
    selectedShapeId
      ? s.scene.glbObjects.some((g) => g.id === selectedShapeId)
      : false,
  );

  if (!is3DMode) return null;
  if (svgShapesCount === 0) return null;
  if (isGlbSelected) return null;

  return (
    <CollapsibleCard
      id="extrusion"
      cardClassName="border-purple-500/20"
      title="3D Settings"
      titleClassName="text-purple-400"
      description="Applies to all shapes — overrides any per-shape settings"
      contentClassName="space-y-4 pt-3"
    >
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

        <div className="flex items-center justify-between pt-1">
          <div>
            <Label htmlFor="enable-bevel" className="text-white/80 text-xs">
              Enable Bevel
            </Label>
            <p className="text-[10px] text-muted-foreground/45 leading-tight mt-0.5">
              Toggle rounded edges on extrusion
            </p>
          </div>
          <Switch
            id="enable-bevel"
            checked={extrusion.bevelEnabled}
            onCheckedChange={(checked: boolean) =>
              dispatch(setExtrusionSettings({ bevelEnabled: checked }))
            }
          />
        </div>

        {extrusion.bevelEnabled && (
          <div className="space-y-4 pl-2 border-l-2 border-white/10">
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
          </div>
        )}
    </CollapsibleCard>
  );
}

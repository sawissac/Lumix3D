"use client";

import { CollapsibleCard } from "./CollapsibleCard";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCameraState } from "@/store/slices/sceneSlice";
import { CameraState } from "@/types";

const DEFAULT_CAMERA: CameraState = {
  position: [5, 5, 5],
  target: [0, 0, 0],
  zoom: 1,
};

type Vec3 = [number, number, number];

function Vec3Row({
  label,
  value,
  onChange,
  step = 0.1,
}: {
  label: string;
  value: Vec3;
  onChange: (v: Vec3) => void;
  step?: number;
}) {
  const setAxis = (axis: 0 | 1 | 2, raw: string) => {
    const n = parseFloat(raw);
    if (isNaN(n)) return;
    const next: Vec3 = [...value] as Vec3;
    next[axis] = n;
    onChange(next);
  };
  const axes: ("X" | "Y" | "Z")[] = ["X", "Y", "Z"];
  return (
    <div className="space-y-1">
      <Label className="text-white/70 text-xs">{label}</Label>
      <div className="grid grid-cols-3 gap-1">
        {axes.map((ax, i) => (
          <div key={ax} className="flex items-center gap-1">
            <span className="text-[10px] text-white/40 font-mono w-3">{ax}</span>
            <Input
              type="number"
              step={step}
              value={Number(value[i].toFixed(3))}
              onChange={(e) => setAxis(i as 0 | 1 | 2, e.target.value)}
              className="h-7 px-1 text-[11px] font-mono bg-black/30 border-white/10 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CameraInspector() {
  const dispatch = useAppDispatch();
  const cameraState = useAppSelector((s) => s.scene.cameraState);
  const cam = cameraState ?? DEFAULT_CAMERA;

  const update = (patch: Partial<CameraState>) => {
    dispatch(setCameraState({ ...cam, ...patch }));
  };

  return (
    <CollapsibleCard
      id="inspector-camera"
      cardClassName="border-amber-500/20"
      title="Camera"
      titleClassName="text-amber-400 text-sm"
      description="View Properties"
      contentClassName="pt-3 space-y-3 text-xs"
    >
      <Vec3Row
        label="Position"
        value={cam.position}
        onChange={(position) => update({ position })}
        step={0.1}
      />
      <Vec3Row
        label="Target"
        value={cam.target}
        onChange={(target) => update({ target })}
        step={0.1}
      />
      <div className="space-y-1">
        <Label className="text-white/70 text-xs">Zoom</Label>
        <Input
          type="number"
          step={0.05}
          min={0.05}
          value={Number(cam.zoom.toFixed(3))}
          onChange={(e) => {
            const n = parseFloat(e.target.value);
            if (!isNaN(n) && n > 0) update({ zoom: n });
          }}
          className="h-7 px-2 text-[11px] font-mono bg-black/30 border-white/10 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
      <div className="flex gap-1 pt-1">
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] flex-1 text-white/60 border-white/10 hover:border-amber-400/40 hover:text-amber-300"
          onClick={() => dispatch(setCameraState(DEFAULT_CAMERA))}
        >
          Reset
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] flex-1 text-white/60 border-white/10 hover:border-amber-400/40 hover:text-amber-300"
          onClick={() => update({ position: [0, 0, 10], target: [0, 0, 0] })}
        >
          Front
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] flex-1 text-white/60 border-white/10 hover:border-amber-400/40 hover:text-amber-300"
          onClick={() => update({ position: [0, 10, 0], target: [0, 0, 0] })}
        >
          Top
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] flex-1 text-white/60 border-white/10 hover:border-amber-400/40 hover:text-amber-300"
          onClick={() => update({ position: [10, 0, 0], target: [0, 0, 0] })}
        >
          Side
        </Button>
      </div>
    </CollapsibleCard>
  );
}

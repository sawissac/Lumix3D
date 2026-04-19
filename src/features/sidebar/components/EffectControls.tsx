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
import { setBloomSettings, setGroundSettings, setViewMode } from "@/store/slices/sceneSlice";
import { ViewMode } from "@/types";

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

const VIEW_MODES: { value: ViewMode; label: string; icon: React.ReactNode; hint: string }[] = [
  {
    value: "normal",
    label: "Normal",
    hint: "Full materials, lighting & effects",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a10 10 0 0 1 0 20" fill="currentColor" fillOpacity="0.3" />
      </svg>
    ),
  },
  {
    value: "solid",
    label: "Solid",
    hint: "Flat color, no textures or effects",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
  {
    value: "wireframe",
    label: "Wireframe",
    hint: "Shows mesh edges only",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
        <polygon points="12,2 22,20 2,20" />
        <line x1="12" y1="2" x2="12" y2="20" />
        <line x1="2" y1="20" x2="22" y2="20" />
        <line x1="7" y1="11" x2="17" y2="11" />
      </svg>
    ),
  },
];

const MODE_COLORS: Record<ViewMode, { active: string; ring: string; text: string }> = {
  normal:    { active: "bg-indigo-500/30 border-indigo-400/50", ring: "ring-indigo-400/40", text: "text-indigo-300" },
  solid:     { active: "bg-amber-500/25 border-amber-400/50",   ring: "ring-amber-400/40",  text: "text-amber-300"  },
  wireframe: { active: "bg-cyan-500/25 border-cyan-400/50",     ring: "ring-cyan-400/40",   text: "text-cyan-300"   },
};

export function EffectControls() {
  const dispatch = useAppDispatch();
  const is3DMode = useAppSelector((state) => state.scene.is3DMode);
  const bloom = useAppSelector((state) => state.scene.bloom);
  const ground = useAppSelector((state) => state.scene.ground);
  const viewMode = useAppSelector((state) => state.scene.viewMode);

  if (!is3DMode) return null;

  const activeColors = MODE_COLORS[viewMode];

  return (
    <Card className="border-indigo-500/20 bg-indigo-500/5">
      <CardHeader className="pb-3 border-b border-white/5">
        <CardTitle className="text-indigo-400">Effects &amp; Ground</CardTitle>
        <CardDescription>
          Adjust viewport mode, bloom effects and ground plane
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">

        {/* Viewport Mode Selector */}
        <div className="space-y-2.5">
          <div>
            <Label className="text-white/80 font-semibold text-xs">Viewport Mode</Label>
            <p className="text-[10px] text-muted-foreground/45 leading-tight mt-0.5">
              {VIEW_MODES.find(m => m.value === viewMode)?.hint}
            </p>
          </div>

          {/* Segmented button group */}
          <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-black/30 border border-white/8">
            {VIEW_MODES.map((mode) => {
              const isActive = viewMode === mode.value;
              const colors = MODE_COLORS[mode.value];
              return (
                <button
                  key={mode.value}
                  id={`viewport-mode-${mode.value}`}
                  onClick={() => dispatch(setViewMode(mode.value))}
                  className={[
                    "flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-md border text-center transition-all duration-200 cursor-pointer",
                    isActive
                      ? `${colors.active} ${colors.text} shadow-sm`
                      : "border-transparent text-white/40 hover:text-white/70 hover:bg-white/5",
                  ].join(" ")}
                >
                  <span className={isActive ? colors.text : ""}>{mode.icon}</span>
                  <span className="text-[10px] font-medium leading-none">{mode.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active mode badge */}
          {viewMode !== "normal" && (
            <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border ${activeColors.active}`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-3 h-3 ${activeColors.text} shrink-0`}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className={`text-[10px] leading-tight ${activeColors.text}/80`}>
                {viewMode === "solid"
                  ? "Textures, metalness, bloom & shadows are disabled"
                  : "Mesh edges shown — bloom & shadows are disabled"}
              </p>
            </div>
          )}
        </div>

        <div className="h-px bg-white/10" />

        {/* Bloom Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-bloom" className="text-white/80 font-semibold">
                Enable Bloom
              </Label>
              <p className="text-[10px] text-muted-foreground/45 leading-tight mt-0.5">
                Adds a glow around bright areas
              </p>
            </div>
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
              <Field label="Intensity" hint="Overall brightness of the bloom glow">
                <SliderWithInput
                  value={bloom.intensity}
                  onChange={(v) => dispatch(setBloomSettings({ intensity: v }))}
                  min={0}
                  max={5}
                  step={0.1}
                  sliderClassName="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                  inputClassName="focus-visible:ring-indigo-500/50 text-indigo-300"
                />
              </Field>

              <Field label="Luminance Threshold" hint="Only pixels brighter than this value will glow">
                <SliderWithInput
                  value={bloom.luminanceThreshold}
                  onChange={(v) => dispatch(setBloomSettings({ luminanceThreshold: v }))}
                  min={0}
                  max={1}
                  step={0.01}
                  sliderClassName="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                  inputClassName="focus-visible:ring-indigo-500/50 text-indigo-300"
                />
              </Field>

              <Field label="Luminance Smoothing" hint="Softens the transition at the glow edge">
                <SliderWithInput
                  value={bloom.luminanceSmoothing}
                  onChange={(v) => dispatch(setBloomSettings({ luminanceSmoothing: v }))}
                  min={0}
                  max={1}
                  step={0.01}
                  sliderClassName="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                  inputClassName="focus-visible:ring-indigo-500/50 text-indigo-300"
                />
              </Field>
            </div>
          )}
        </div>

        <div className="h-px bg-white/10" />

        {/* Ground Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enable-ground" className="text-white/80 font-semibold">
                Ground Shadows
              </Label>
              <p className="text-[10px] text-muted-foreground/45 leading-tight mt-0.5">
                Reflective ground plane beneath the scene
              </p>
            </div>
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
              <div className="space-y-1.5">
                <div>
                  <Label className="text-white/80 text-xs">Shadow Color</Label>
                  <p className="text-[10px] text-muted-foreground/45 leading-tight mt-0.5">
                    Tint color of the ground reflection
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="relative w-10 h-8 rounded-md overflow-hidden border border-white/10 shadow-sm cursor-pointer">
                    <Input
                      type="color"
                      value={ground.color}
                      onChange={(e) => dispatch(setGroundSettings({ color: e.target.value }))}
                      className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer border-0 p-0"
                    />
                  </div>
                  <Input
                    type="text"
                    value={ground.color}
                    onChange={(e) => dispatch(setGroundSettings({ color: e.target.value }))}
                    className="flex-1 bg-black/20 border-white/10 text-indigo-200 font-mono uppercase text-sm h-8"
                  />
                </div>
              </div>

              <Field label="Shadow Opacity" hint="Strength and darkness of the shadow reflection">
                <SliderWithInput
                  value={ground.metalness}
                  onChange={(v) => dispatch(setGroundSettings({ metalness: v }))}
                  min={0}
                  max={5}
                  step={0.01}
                  sliderClassName="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                  inputClassName="focus-visible:ring-indigo-500/50 text-indigo-300"
                />
              </Field>

              <Field label="Shadow Blur" hint="How spread out / soft the shadow edges appear">
                <SliderWithInput
                  value={ground.roughness}
                  onChange={(v) => dispatch(setGroundSettings({ roughness: v }))}
                  min={0}
                  max={1}
                  step={0.01}
                  sliderClassName="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                  inputClassName="focus-visible:ring-indigo-500/50 text-indigo-300"
                />
              </Field>

              <Field label="Y Position" hint="Height of the shadow plane — move down to create space">
                <SliderWithInput
                  value={ground.position[1]}
                  onChange={(v) =>
                    dispatch(setGroundSettings({ position: [ground.position[0], v, ground.position[2]] }))
                  }
                  min={-50}
                  max={50}
                  step={1}
                  sliderClassName="**:[[role=slider]]:bg-indigo-400 **:[[role=slider]]:border-indigo-400"
                  inputClassName="focus-visible:ring-indigo-500/50 text-indigo-300"
                />
              </Field>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

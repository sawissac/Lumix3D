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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SliderWithInput } from "@/components/ui/slider-with-input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setBackground, setShowGrid } from "@/store/slices/sceneSlice";
import { BackgroundType } from "@/types";

export function BackgroundControls() {
  const dispatch = useAppDispatch();
  const background = useAppSelector((state) => state.scene.background);
  const showGrid = useAppSelector((state) => state.scene.showGrid);
  const is3DMode = useAppSelector((state) => state.scene.is3DMode);

  if (!is3DMode) return null;

  return (
    <Card className="border-pink-500/20 bg-pink-500/5">
      <CardHeader className="pb-3 border-b border-white/5">
        <CardTitle className="text-pink-400">Background & Grid</CardTitle>
        <CardDescription>
          Customize scene background and helpers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="show-grid" className="text-white/80">
              Show Grid Helper
            </Label>
            <p className="text-[10px] text-muted-foreground/45 leading-tight mt-0.5">
              Displays a reference grid on the ground plane
            </p>
          </div>
          <Switch
            id="show-grid"
            checked={showGrid}
            onCheckedChange={(checked: boolean) => dispatch(setShowGrid(checked))}
          />
        </div>

        <div className="space-y-1.5">
          <div>
            <Label className="text-white/80">Background Type</Label>
            <p className="text-[10px] text-muted-foreground/45 leading-tight mt-0.5">
              Choose how the scene background is rendered
            </p>
          </div>
          <Select
            value={background.type}
            onValueChange={(value: string | null) => {
              if (!value) return;
              dispatch(setBackground({ ...background, type: value as BackgroundType }));
            }}
          >
            <SelectTrigger className="w-full bg-black/20 border-white/10 text-white focus:ring-pink-500">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="color">Solid Color</SelectItem>
              <SelectItem value="gradient">Linear Gradient</SelectItem>
              <SelectItem value="radial-gradient">Radial Gradient</SelectItem>
              <SelectItem value="image">Image/Texture</SelectItem>
              <SelectItem value="transparent">Transparent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {background.type === "color" && (
          <div className="space-y-1.5">
            <div>
              <Label htmlFor="bg-color" className="text-white/80">Color</Label>
              <p className="text-[10px] text-muted-foreground/45 leading-tight mt-0.5">
                Solid fill color for the scene background
              </p>
            </div>
            <div className="flex gap-3">
              <div className="relative w-12 h-10 rounded-md overflow-hidden border border-white/10 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                <Input
                  id="bg-color"
                  type="color"
                  value={background.value}
                  onChange={(e) =>
                    dispatch(setBackground({ ...background, value: e.target.value }))
                  }
                  className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer border-0 p-0"
                />
              </div>
              <Input
                type="text"
                value={background.value}
                onChange={(e) =>
                  dispatch(setBackground({ ...background, value: e.target.value }))
                }
                className="flex-1 bg-black/20 border-white/10 text-pink-200 font-mono uppercase focus-visible:ring-pink-500"
              />
            </div>
          </div>
        )}

        {(background.type === "gradient" || background.type === "radial-gradient") && (
          <>
            <div className="space-y-1.5">
              <div>
                <Label className="text-white/80">
                  {background.type === "radial-gradient" ? "Center Color" : "Start Color"}
                </Label>
                <p className="text-[10px] text-muted-foreground/45 leading-tight mt-0.5">
                  {background.type === "radial-gradient"
                    ? "Color at the center of the radial gradient"
                    : "Color at the top of the linear gradient"}
                </p>
              </div>
              <div className="flex gap-3">
                <div className="relative w-12 h-10 rounded-md overflow-hidden border border-white/10 shadow-sm cursor-pointer">
                  <Input
                    type="color"
                    value={background.value}
                    onChange={(e) =>
                      dispatch(setBackground({ ...background, value: e.target.value }))
                    }
                    className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer border-0 p-0"
                  />
                </div>
                <Input
                  type="text"
                  value={background.value}
                  onChange={(e) =>
                    dispatch(setBackground({ ...background, value: e.target.value }))
                  }
                  className="flex-1 bg-black/20 border-white/10 text-pink-200 font-mono uppercase focus-visible:ring-pink-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div>
                <Label className="text-white/80">
                  {background.type === "radial-gradient" ? "Edge Color" : "End Color"}
                </Label>
                <p className="text-[10px] text-muted-foreground/45 leading-tight mt-0.5">
                  {background.type === "radial-gradient"
                    ? "Color at the outer edge of the radial gradient"
                    : "Color at the bottom of the linear gradient"}
                </p>
              </div>
              <div className="flex gap-3">
                <div className="relative w-12 h-10 rounded-md overflow-hidden border border-white/10 shadow-sm cursor-pointer">
                  <Input
                    type="color"
                    value={background.gradientEnd || "#000000"}
                    onChange={(e) =>
                      dispatch(setBackground({ ...background, gradientEnd: e.target.value }))
                    }
                    className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer border-0 p-0"
                  />
                </div>
                <Input
                  type="text"
                  value={background.gradientEnd || "#000000"}
                  onChange={(e) =>
                    dispatch(setBackground({ ...background, gradientEnd: e.target.value }))
                  }
                  className="flex-1 bg-black/20 border-white/10 text-pink-200 font-mono uppercase focus-visible:ring-pink-500"
                />
              </div>
            </div>
          </>
        )}

        {background.type === "image" && (
          <div className="space-y-1.5">
            <div>
              <Label className="text-white/80">Image URL</Label>
              <p className="text-[10px] text-muted-foreground/45 leading-tight mt-0.5">
                Direct link to a PNG, JPG, or WebP image
              </p>
            </div>
            <Input
              type="text"
              placeholder="https://example.com/texture.jpg"
              value={background.imageUrl || ""}
              onChange={(e) =>
                dispatch(setBackground({ ...background, imageUrl: e.target.value }))
              }
              className="bg-black/20 border-white/10 text-white focus-visible:ring-pink-500"
            />
          </div>
        )}

        {background.type !== "transparent" && (
          <div className="space-y-1.5 pt-1 border-t border-white/5">
            <div>
              <Label className="text-white/80 text-xs">Noise Intensity</Label>
              <p className="text-[10px] text-muted-foreground/45 leading-tight mt-0.5">
                Adds a subtle film grain overlay to the background
              </p>
            </div>
            <SliderWithInput
              value={background.noise ?? 0}
              onChange={(v) => dispatch(setBackground({ ...background, noise: v }))}
              min={0}
              max={1}
              step={0.01}
              sliderClassName="**:[[role=slider]]:bg-pink-400 **:[[role=slider]]:border-pink-400"
              inputClassName="focus-visible:ring-pink-500/50 text-pink-300"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

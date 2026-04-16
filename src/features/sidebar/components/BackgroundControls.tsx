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
          <Label htmlFor="show-grid" className="text-white/80">
            Show Grid Helper
          </Label>
          <Switch
            id="show-grid"
            checked={showGrid}
            onCheckedChange={(checked: boolean) =>
              dispatch(setShowGrid(checked))
            }
          />
        </div>

        <div className="space-y-3">
          <Label className="text-white/80">Background Type</Label>
          <Select
            value={background.type}
            onValueChange={(value: string | null) => {
              if (!value) return;
              dispatch(
                setBackground({ ...background, type: value as BackgroundType }),
              );
            }}
          >
            <SelectTrigger className="w-full bg-black/20 border-white/10 text-white focus:ring-pink-500">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="color">Solid Color</SelectItem>
              <SelectItem value="gradient">Gradient</SelectItem>
              <SelectItem value="image">Image/Texture</SelectItem>
              <SelectItem value="transparent">Transparent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {background.type === "color" && (
          <div className="space-y-3">
            <Label htmlFor="bg-color" className="text-white/80">
              Color
            </Label>
            <div className="flex gap-3">
              <div className="relative w-12 h-10 rounded-md overflow-hidden border border-white/10 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                <Input
                  id="bg-color"
                  type="color"
                  value={background.value}
                  onChange={(e) =>
                    dispatch(
                      setBackground({ ...background, value: e.target.value }),
                    )
                  }
                  className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer border-0 p-0"
                />
              </div>
              <Input
                type="text"
                value={background.value}
                onChange={(e) =>
                  dispatch(
                    setBackground({ ...background, value: e.target.value }),
                  )
                }
                className="flex-1 bg-black/20 border-white/10 text-pink-200 font-mono uppercase focus-visible:ring-pink-500"
              />
            </div>
          </div>
        )}

        {background.type === "gradient" && (
          <>
            <div className="space-y-3">
              <Label className="text-white/80">Start Color</Label>
              <div className="flex gap-3">
                <div className="relative w-12 h-10 rounded-md overflow-hidden border border-white/10 shadow-sm cursor-pointer">
                  <Input
                    type="color"
                    value={background.value}
                    onChange={(e) =>
                      dispatch(
                        setBackground({ ...background, value: e.target.value }),
                      )
                    }
                    className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer border-0 p-0"
                  />
                </div>
                <Input
                  type="text"
                  value={background.value}
                  onChange={(e) =>
                    dispatch(
                      setBackground({ ...background, value: e.target.value }),
                    )
                  }
                  className="flex-1 bg-black/20 border-white/10 text-pink-200 font-mono uppercase focus-visible:ring-pink-500"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-white/80">End Color</Label>
              <div className="flex gap-3">
                <div className="relative w-12 h-10 rounded-md overflow-hidden border border-white/10 shadow-sm cursor-pointer">
                  <Input
                    type="color"
                    value={background.gradientEnd || "#000000"}
                    onChange={(e) =>
                      dispatch(
                        setBackground({
                          ...background,
                          gradientEnd: e.target.value,
                        }),
                      )
                    }
                    className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer border-0 p-0"
                  />
                </div>
                <Input
                  type="text"
                  value={background.gradientEnd || "#000000"}
                  onChange={(e) =>
                    dispatch(
                      setBackground({
                        ...background,
                        gradientEnd: e.target.value,
                      }),
                    )
                  }
                  className="flex-1 bg-black/20 border-white/10 text-pink-200 font-mono uppercase focus-visible:ring-pink-500"
                />
              </div>
            </div>
          </>
        )}

        {background.type === "image" && (
          <div className="space-y-3">
            <Label className="text-white/80">Image URL</Label>
            <Input
              type="text"
              placeholder="https://example.com/texture.jpg"
              value={background.imageUrl || ""}
              onChange={(e) =>
                dispatch(
                  setBackground({ ...background, imageUrl: e.target.value }),
                )
              }
              className="bg-black/20 border-white/10 text-white focus-visible:ring-pink-500"
            />
            <p className="text-xs text-white/50">
              Provide a valid image URL for background, texture, or pattern.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

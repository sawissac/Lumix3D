"use client";

import { Wand2, Zap, Star, MessageCircle, PawPrint } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAppDispatch } from "@/store/hooks";
import {
  setSvgFile,
  setSvgShapes,
  setExtrusionSettings,
  setGlobalMaterial,
  setGlobalTransform,
  setBackground,
  setLights,
  setLightingPreset,
  set3DMode,
  setShowGrid,
  setSelectedShapeId,
  clearSvgSelection,
  setSvgFocusIndex,
  setEditMode,
} from "@/store/slices/sceneSlice";
import { SIDEBAR_DEMO_SCENES, DemoScene } from "../constants/demoScenes";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { SvgShape } from "@/types";

const SCENE_ICONS: Record<
  string,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  bolt: Zap,
  star: Star,
  chat: MessageCircle,
  paw: PawPrint,
};

function loadDemoScene(scene: DemoScene) {
  const loader = new SVGLoader();
  const svgData = loader.parse(scene.svgContent);
  let count = 0;
  const shapes: SvgShape[] = [];
  svgData.paths.forEach((path) => {
    SVGLoader.createShapes(path).forEach(() => {
      shapes.push({
        id: `shape-${count++}`,
        path: scene.svgContent,
        fill: path.color?.getStyle() || "#cccccc",
        stroke: path.userData?.style?.stroke || undefined,
        opacity: 1,
      });
    });
  });
  return shapes;
}

export function QuickScenes() {
  const dispatch = useAppDispatch();

  const handleLoad = (scene: DemoScene) => {
    const shapes = loadDemoScene(scene);

    dispatch(setEditMode(false));
    dispatch(setSvgFile(scene.svgContent));
    dispatch(setSvgShapes(shapes));
    dispatch(setExtrusionSettings(scene.extrusion));
    dispatch(setGlobalMaterial(scene.material));
    dispatch(
      setGlobalTransform({
        position: [0, 0, 0],
        rotation: scene.rotation,
        scale: [1, 1, 1],
      }),
    );
    dispatch(setBackground(scene.background));
    dispatch(setLights(scene.lights));
    dispatch(setLightingPreset(scene.lightingPreset));
    dispatch(setShowGrid(false));
    dispatch(setSelectedShapeId(null));
    dispatch(clearSvgSelection());
    dispatch(setSvgFocusIndex(null));
    dispatch(set3DMode(true));
  };

  return (
    <Card className="bg-[#1f2123]/80 backdrop-blur-2xl border border-white/8 shadow-2xl rounded-2xl overflow-hidden relative">
      {/* Subtle top reflection */}
      <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

      <CardHeader className="pb-3 border-b border-white/4 relative z-10 pt-4 px-4">
        <CardTitle className="flex items-center gap-2 text-[#ff6b9e] text-[1.1rem] font-semibold tracking-wide">
          <Wand2 className="h-[1.1rem] w-[1.1rem]" />
          Quick Scenes
        </CardTitle>
        <CardDescription className="text-[#a1a1aa] text-[13px] font-medium mt-1">
          One-click 3D app icon demos
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 pb-4 px-4 relative z-10">
        <div className="grid grid-cols-4 gap-3">
          {SIDEBAR_DEMO_SCENES.map((scene: DemoScene) => {
            const Icon = SCENE_ICONS[scene.id];
            return (
              <button
                key={scene.id}
                onClick={() => handleLoad(scene)}
                className="group flex flex-col items-center gap-2.5 focus:outline-none"
              >
                <div
                  className="w-full aspect-square rounded-[0.85rem] shadow-[0_4px_12px_-4px_rgba(0,0,0,0.5)] group-hover:-translate-y-1 group-hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.6)] group-focus-visible:ring-2 group-focus-visible:ring-white/40 transition-all duration-300 flex items-center justify-center relative overflow-hidden"
                  style={{ background: scene.color }}
                >
                  {/* Glassmorphic reflection on the button itself */}
                  <div className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/15 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {Icon && (
                    <Icon
                      className="w-5 h-5 text-white/95 relative z-10"
                      strokeWidth={2.5}
                    />
                  )}
                </div>
                <span className="text-[11px] font-medium text-[#a1a1aa] group-hover:text-white transition-colors">
                  {scene.name}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

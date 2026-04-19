"use client";

import { Wand2, Zap, Star, MessageCircle, PawPrint } from "lucide-react";
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
    <div className="space-y-1.5">
      {/* Section label */}
      <div className="flex items-center gap-2 px-1">
        <Wand2 className="w-3 h-3 text-[#ff6b9e] shrink-0" />
        <span className="text-[11px] font-semibold text-[#ff6b9e] uppercase tracking-widest">
          Quick Scenes
        </span>
      </div>

      {/* Scene 2×2 grid */}
      <div className="grid grid-cols-4 gap-2">
        {SIDEBAR_DEMO_SCENES.map((scene: DemoScene) => {
          const Icon = SCENE_ICONS[scene.id];
          return (
            <button
              key={scene.id}
              onClick={() => handleLoad(scene)}
              className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/6 hover:border-white/10 transition-all duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
            >
              {/* Colour icon tile */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden shadow-[0_2px_8px_-2px_rgba(0,0,0,0.5)] group-hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.6)] group-hover:-translate-y-0.5 transition-all duration-200"
                style={{ background: scene.color }}
              >
                <div className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                {Icon && (
                  <Icon
                    className="w-4 h-4 text-white relative z-10"
                    strokeWidth={2.5}
                  />
                )}
              </div>

              {/* Name */}
              <span className="text-[11px] font-medium text-muted-foreground/70 group-hover:text-white transition-colors leading-none">
                {scene.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { Wand2 } from "lucide-react";
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
import { demoScenes, DemoScene } from "../constants/demoScenes";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { SvgShape } from "@/types";

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
    <Card className="glass-card border-pink-500/20">
      <CardHeader className="pb-3 border-b border-white/5">
        <CardTitle className="flex items-center gap-2 text-pink-400">
          <Wand2 className="h-4 w-4" />
          Quick Scenes
        </CardTitle>
        <CardDescription>One-click 3D app icon demos</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-4 gap-2">
          {demoScenes.map((scene) => (
            <button
              key={scene.id}
              onClick={() => handleLoad(scene)}
              className="group flex flex-col items-center gap-1.5 focus:outline-none"
            >
              <div
                className="w-full aspect-square rounded-xl shadow-md group-hover:scale-110 group-hover:shadow-lg group-focus-visible:ring-2 group-focus-visible:ring-white/40 transition-all duration-200 border border-white/10"
                style={{ background: scene.color }}
              />
              <span className="text-[10px] text-white/50 group-hover:text-white/80 transition-colors">
                {scene.name}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useRef } from "react";
import { Upload, Sparkles, PencilIcon, Waypoints } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "./CollapsibleCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setSvgFile,
  setSvgShapes,
  set3DMode,
  setEditMode,
} from "@/store/slices/sceneSlice";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { SvgShape } from "@/types";

export function SVGUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const svgFile = useAppSelector((state) => state.scene.svgFile);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const svgText = e.target?.result as string;
      dispatch(setSvgFile(svgText));
      parseSVG(svgText);
    };
    reader.readAsText(file);
  };

  const parseSVG = (svgText: string) => {
    try {
      const loader = new SVGLoader();
      const svgData = loader.parse(svgText);

      let shapeCount = 0;
      const shapes: SvgShape[] = [];

      svgData.paths.forEach((path) => {
        const subShapes = SVGLoader.createShapes(path);
        subShapes.forEach(() => {
          shapes.push({
            id: `shape-${shapeCount}`,
            path: svgText,
            fill: path.color?.getStyle() || "#cccccc",
            stroke: path.userData?.style?.stroke || undefined,
            opacity: 1,
          });
          shapeCount++;
        });
      });

      dispatch(setSvgShapes(shapes));
    } catch (error) {
      console.error("Error parsing SVG:", error);
    }
  };

  const handleConvertTo3D = () => {
    if (svgFile) {
      dispatch(set3DMode(true));
    }
  };

  const handleEditSVG = () => {
    dispatch(set3DMode(false));
    dispatch(setEditMode(true));
  };

  return (
    <CollapsibleCard
      id="svg-uploader"
      cardClassName="overflow-hidden border-indigo-500/20 bg-indigo-500/5"
      title="SVG Import"
      titleClassName="text-indigo-400"
      description="Upload an SVG file to get started"
      contentClassName="space-y-3 pt-3"
    >
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-indigo-500/30 hover:border-indigo-400 hover:bg-indigo-500/10 transition-all rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Upload className="h-5 w-5 text-indigo-400" />
            </div>
            <span className="text-xs font-medium text-indigo-200">
              {svgFile ? "Click to change SVG" : "Click to upload SVG"}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              SVG files only
            </span>
          </div>
        </div>

        {svgFile && (
          <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
            <Button
              onClick={handleConvertTo3D}
              className="w-full bg-linear-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-0 shadow-lg shadow-indigo-500/25 text-white font-semibold"
              >
              <Sparkles className="h-4 w-4" />
              Convert to 3D
            </Button>
            <Button
              onClick={handleEditSVG}
              className="w-full bg-white/5 hover:bg-white/10 text-white border-white/10"
              variant="outline"
            >
              <Waypoints className="h-4 w-4" />
              Edit SVG 2D
            </Button>
          </div>
        )}
    </CollapsibleCard>
  );
}

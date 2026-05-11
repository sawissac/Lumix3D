"use client";

import { useRef } from "react";
import { Upload, Sparkles, Waypoints, Trash2, Lock, FileCode2 } from "lucide-react";
import { CollapsibleCard } from "./CollapsibleCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addImportedSvg,
  convertImportedSvgTo3D,
  deleteImportedSvg,
  setEditImportedSvg,
} from "@/store/slices/sceneSlice";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { ImportedSvg, SvgShape } from "@/types";

function parseSvgShapes(svgId: string, svgText: string): SvgShape[] {
  try {
    const loader = new SVGLoader();
    const svgData = loader.parse(svgText);
    let shapeCount = 0;
    const shapes: SvgShape[] = [];
    svgData.paths.forEach((path) => {
      const subShapes = SVGLoader.createShapes(path);
      subShapes.forEach(() => {
        shapes.push({
          id: `${svgId}-shape-${shapeCount}`,
          path: svgText,
          fill: path.color?.getStyle() || "#cccccc",
          stroke: path.userData?.style?.stroke || undefined,
          opacity: 1,
        });
        shapeCount++;
      });
    });
    return shapes;
  } catch {
    return [];
  }
}

export function SVGUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const importedSvgs = useAppSelector((state) => state.scene.importedSvgs);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const svgText = e.target?.result as string;
      const id = `svg-${Date.now()}`;
      const shapes = parseSvgShapes(id, svgText);
      const imported: ImportedSvg = {
        id,
        name: file.name,
        svgText,
        is3D: false,
        shapes,
      };
      dispatch(addImportedSvg(imported));
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  return (
    <CollapsibleCard
      id="svg-uploader"
      title="SVG Import"
      description="Upload SVG files"
      contentClassName="space-y-2 pt-2"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".svg"
        onChange={handleFileUpload}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full h-8 text-[11px] text-white/70 hover:text-white border-b border-white/10 hover:border-white/30 flex items-center justify-center gap-1.5 transition-colors"
      >
        <Upload className="h-3 w-3" />
        Import SVG
      </button>

      {importedSvgs.length > 0 && (
        <div className="flex flex-col">
          {importedSvgs.map((svg) => (
            <div
              key={svg.id}
              className={`px-1 py-1.5 flex items-center gap-1.5 border-b border-white/5 ${
                svg.is3D ? "text-indigo-300" : "text-white/80"
              }`}
            >
              <FileCode2 className="h-3 w-3 shrink-0 opacity-60" />
              <span
                className="text-[11px] truncate flex-1 min-w-0"
                title={svg.name}
              >
                {svg.name}
              </span>

              <button
                onClick={() => dispatch(convertImportedSvgTo3D(svg.id))}
                disabled={svg.is3D}
                className="h-5 w-5 flex items-center justify-center text-white/60 hover:text-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title={svg.is3D ? "Active in 3D" : "Convert to 3D"}
              >
                <Sparkles className="h-3 w-3" />
              </button>

              <button
                onClick={() => dispatch(setEditImportedSvg(svg.id))}
                disabled={svg.is3D}
                className="h-5 w-5 flex items-center justify-center text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title={svg.is3D ? "Locked - in 3D mode" : "Edit SVG"}
              >
                {svg.is3D ? <Lock className="h-3 w-3" /> : <Waypoints className="h-3 w-3" />}
              </button>

              <button
                onClick={() => dispatch(deleteImportedSvg(svg.id))}
                className="h-5 w-5 flex items-center justify-center text-white/60 hover:text-red-400 transition-colors"
                title="Delete SVG"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </CollapsibleCard>
  );
}

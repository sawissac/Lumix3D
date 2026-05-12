"use client";

import { useRef } from "react";
import { Upload, Sparkles, Trash2, Box } from "lucide-react";
import { CollapsibleCard } from "./CollapsibleCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addImportedGlb,
  convertImportedGlbTo3D,
  deleteImportedGlb,
} from "@/store/slices/sceneSlice";
import { ImportedGlb } from "@/types";

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      bytes.subarray(i, i + chunk) as unknown as number[],
    );
  }
  return btoa(binary);
}

export function GLBUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const importedGlbs = useAppSelector((state) => state.scene.importedGlbs);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      const data = arrayBufferToBase64(buf);
      const imported: ImportedGlb = {
        id: `glb-${Date.now()}`,
        name: file.name,
        data,
        is3D: false,
      };
      dispatch(addImportedGlb(imported));
    } catch {
      // Ignore read errors — file may be unreadable.
    }
    event.target.value = "";
  };

  return (
    <CollapsibleCard
      id="glb-uploader"
      title="GLB Import"
      description="Upload .glb / .gltf models"
      contentClassName="space-y-2 pt-2"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
        onChange={handleFileUpload}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full py-4 rounded-lg border border-dashed border-white/15 hover:border-emerald-400/50 bg-white/[0.02] hover:bg-emerald-500/[0.06] text-[11px] text-white/50 hover:text-emerald-300 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 group"
      >
        <Upload className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
        <span>Import GLB</span>
      </button>

      {importedGlbs.length > 0 && (
        <div className="flex flex-col">
          {importedGlbs.map((glb) => (
            <div
              key={glb.id}
              className={`px-1 py-1.5 flex items-center gap-1.5 border-b border-white/5 ${
                glb.is3D ? "text-emerald-300" : "text-white/80"
              }`}
            >
              <Box className="h-3 w-3 shrink-0 opacity-60" />
              <span
                className="text-[11px] truncate flex-1 min-w-0"
                title={glb.name}
              >
                {glb.name}
              </span>

              <button
                onClick={() => dispatch(convertImportedGlbTo3D(glb.id))}
                disabled={glb.is3D}
                className="h-5 w-5 flex items-center justify-center text-white/60 hover:text-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title={glb.is3D ? "Active in 3D" : "Spawn in scene"}
              >
                <Sparkles className="h-3 w-3" />
              </button>

              <button
                onClick={() => dispatch(deleteImportedGlb(glb.id))}
                className="h-5 w-5 flex items-center justify-center text-white/60 hover:text-red-400 transition-colors"
                title="Delete GLB"
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

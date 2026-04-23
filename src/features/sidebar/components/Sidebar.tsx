"use client";

import { SVGUploader } from "./SVGUploader";
import { QuickScenes } from "./QuickScenes";
import { ExtrusionControls } from "./ExtrusionControls";
import { BackgroundControls } from "./BackgroundControls";
import { EffectControls } from "./EffectControls";
import { LightingControls } from "./LightingControls";
import { ShapeInspector } from "./ShapeInspector";
import { ObjectsList } from "./ObjectsList";
import { ProjectActions } from "./ProjectActions";
import { TextureControls } from "./TextureControls";
import Image from "next/image";

export function Sidebar() {
  return (
    <div className="h-full glass-strong border-r border-white/8 flex flex-col z-10 min-w-0">
      <div className="space-y-1 p-4 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2.5">
          <Image
            src="/product/app_logo.svg"
            alt="Lumix3D"
            width={28}
            height={28}
            unoptimized
            className="rounded-md object-cover bg-black"
          />
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400 flex-1">
            Lumix3D
          </h1>
          <ProjectActions />
        </div>
        <p className="text-xs text-muted-foreground/80 font-medium pl-9.5">
          SVG to 3D Converter
        </p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        <QuickScenes />
        <SVGUploader />
        <ObjectsList />
        <ShapeInspector />
        <ExtrusionControls />
        <TextureControls />
        <BackgroundControls />
        <EffectControls />
        <LightingControls />
      </div>
    </div>
  );
}

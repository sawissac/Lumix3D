"use client";

import { SVGUploader } from "./SVGUploader";
import { ExtrusionControls } from "./ExtrusionControls";
import { BackgroundControls } from "./BackgroundControls";
import { LightingControls } from "./LightingControls";
import { ShapeInspector } from "./ShapeInspector";
import { ObjectsList } from "./ObjectsList";

export function Sidebar() {
  return (
    <div className="h-full glass-strong border-r border-white/8 flex flex-col z-10 min-w-0">
      <div className="space-y-1 p-4 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 text-white"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">
            Lumix3D
          </h1>
        </div>
        <p className="text-xs text-muted-foreground/80 font-medium pl-9.5">
          SVG to 3D Converter
        </p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        <SVGUploader />
        <ObjectsList />
        <ShapeInspector />
        <ExtrusionControls />
        <BackgroundControls />
        <LightingControls />
      </div>
    </div>
  );
}

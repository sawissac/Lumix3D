"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Pencil,
  Image as ImageIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SVGUploader } from "./SVGUploader";
import { GLBUploader } from "./GLBUploader";
import { QuickScenes } from "./QuickScenes";
import { ExtrusionControls } from "./ExtrusionControls";
import { BackgroundControls } from "./BackgroundControls";
import { EffectControls } from "./EffectControls";
import { LightingControls } from "./LightingControls";
import { ShapeInspector } from "./ShapeInspector";
import { ObjectTransformInspector } from "./ObjectTransformInspector";
import { CameraInspector } from "./CameraInspector";
import { ObjectsList } from "./ObjectsList";
import { ProjectActions } from "./ProjectActions";
import { TextureControls } from "./TextureControls";
import { SavedAnimationsList } from "./SavedAnimationsList";
import { TimelineLog } from "@/features/three/components/TimelineLog";

type TabId = "design" | "scene";

const TABS: { id: TabId; label: string; Icon: LucideIcon }[] = [
  { id: "design", label: "Design", Icon: Pencil },
  { id: "scene", label: "Scene", Icon: ImageIcon },
];

export function Sidebar() {
  const [tab, setTab] = useState<TabId>("design");

  return (
    <div className="h-full bg-[#1e1e1e] border-r border-white/8 flex flex-col z-10 min-w-0">
      {/* ── Header ───────────────────────────── */}
      <div className="flex items-center gap-2 h-10 px-2.5 border-b border-white/8 shrink-0">
        <Image
          src="/product/app_logo.svg"
          alt="Lumix3D"
          width={18}
          height={18}
          unoptimized
          className="rounded-sm object-cover bg-black shrink-0"
        />
        <h1 className="flex-1 min-w-0 text-[12px] font-semibold text-white/90 leading-none truncate">
          Lumix3D
        </h1>
        <ProjectActions />
      </div>

      {/* ── Tabs ─────────────────────────────── */}
      <div
        role="tablist"
        className="flex items-center h-8 px-1 gap-0.5 border-b border-white/8 shrink-0"
      >
        {TABS.map(({ id, label, Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(id)}
              className={cn(
                "flex-1 h-6 rounded-md text-[11px] font-medium tracking-tight transition-colors flex items-center justify-center gap-1.5",
                active
                  ? "bg-white/8 text-white"
                  : "text-white/45 hover:text-white/75 hover:bg-white/3",
              )}
            >
              <Icon className="h-3 w-3 shrink-0" strokeWidth={2} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Content ──────────────────────────── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
        {tab === "design" ? (
          <>
            <SVGUploader />
            <GLBUploader />
            <ObjectsList />
            <ShapeInspector />
            <ObjectTransformInspector />
            <CameraInspector />
            <ExtrusionControls />
            <TextureControls />
          </>
        ) : (
          <>
            <QuickScenes />
            <BackgroundControls />
            <LightingControls />
            <EffectControls />
            <SavedAnimationsList />
            <TimelineLog />
          </>
        )}
      </div>
    </div>
  );
}

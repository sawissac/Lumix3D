"use client";

import * as React from "react";
import {
  ChevronDown,
  Wand2,
  Upload,
  Layers,
  PenLine,
  SlidersHorizontal,
  Box,
  Image as ImageIcon,
  Mountain,
  Sparkles,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSectionCollapsed } from "@/store/slices/sceneSlice";

const SECTION_ICONS: Record<string, LucideIcon> = {
  "quick-scenes": Wand2,
  "svg-uploader": Upload,
  "glb-uploader": Box,
  "objects-list": Layers,
  "inspector-svg": PenLine,
  "inspector-3d": SlidersHorizontal,
  "inspector-glb": Box,
  extrusion: Box,
  textures: ImageIcon,
  background: Mountain,
  effects: Sparkles,
  lighting: Lightbulb,
};

type CollapsibleCardProps = {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Kept for API compat — visuals now uniform across the sidebar. */
  titleClassName?: string;
  /** Kept for API compat — visuals now uniform across the sidebar. */
  cardClassName?: string;
  /** Kept for API compat — visuals now uniform across the sidebar. */
  headerClassName?: string;
  contentClassName?: string;
  headerExtra?: React.ReactNode;
  defaultCollapsed?: boolean;
  children: React.ReactNode;
};

export function CollapsibleCard({
  id,
  title,
  description,
  contentClassName,
  headerExtra,
  defaultCollapsed = true,
  children,
}: CollapsibleCardProps) {
  const dispatch = useAppDispatch();
  const stored = useAppSelector(
    (state) => state.scene.collapsedSections[id],
  );
  const collapsed = stored ?? defaultCollapsed;

  const onToggle = () =>
    dispatch(setSectionCollapsed({ id, collapsed: !collapsed }));
  const Icon = SECTION_ICONS[id];

  return (
    <section className="border-b border-white/5 last:border-b-0">
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        className={cn(
          "w-full flex items-center gap-1.5 h-7 px-2.5 cursor-pointer select-none",
          "hover:bg-white/2.5 transition-colors",
        )}
      >
        <ChevronDown
          className={cn(
            "h-3 w-3 text-white/35 transition-transform shrink-0",
            collapsed && "-rotate-90",
          )}
        />
        {Icon ? (
          <Icon className="h-3 w-3 text-white/55 shrink-0" strokeWidth={2} />
        ) : null}
        <span className="flex-1 min-w-0 text-[10.5px] font-semibold text-white/70 uppercase tracking-[0.08em] truncate">
          {title}
        </span>
        {headerExtra ? (
          <div
            onClick={(e) => e.stopPropagation()}
            className="shrink-0"
          >
            {headerExtra}
          </div>
        ) : null}
      </div>
      {!collapsed ? (
        <div className={cn("px-2.5 pb-3 pt-0.5", contentClassName)}>
          {description ? (
            <p className="text-[10px] text-white/35 leading-snug mb-2">
              {description}
            </p>
          ) : null}
          {children}
        </div>
      ) : null}
    </section>
  );
}

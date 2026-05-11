"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Sidebar } from "@/features/sidebar/components/Sidebar";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setSvgFile, setSvgShapes } from "@/store/slices/sceneSlice";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { SvgShape } from "@/types";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ParticleBackground } from "@/components/ParticleBackground";
import { UndoRedoToolbar } from "@/features/three/components/UndoRedoToolbar";
import { TimelinePanel } from "@/features/three/components/TimelinePanel";
import Image from "next/image";
import {
  Upload,
  Boxes,
  Sun,
  Image as ImageIcon,
  Film,
  Grid2X2,
  Code2,
  Undo2,
  type LucideIcon,
} from "lucide-react";

const Canvas3D = dynamic(
  () =>
    import("@/features/three/components/Canvas3D").then((mod) => ({
      default: mod.Canvas3D,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading 3D Scene...</p>
        </div>
      </div>
    ),
  },
);

const SVGEditor = dynamic(
  () =>
    import("@/features/three/components/SVGEditor").then((mod) => ({
      default: mod.SVGEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    ),
  },
);

const SceneTransformToolbar = dynamic(
  () =>
    import("@/features/three/components/SceneTransformToolbar").then((mod) => ({
      default: mod.SceneTransformToolbar,
    })),
  { ssr: false },
);

export default function Home() {
  const is3DMode = useAppSelector((state) => state.scene.is3DMode);
  const isEditMode = useAppSelector((state) => state.scene.isEditMode);
  const dispatch = useAppDispatch();
  const [showTimeline, setShowTimeline] = useState(false);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Don't intercept if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;

      const pastedText = e.clipboardData?.getData("text");
      // Check if it looks like an SVG
      if (pastedText && pastedText.trim().toLowerCase().startsWith("<svg")) {
        try {
          const loader = new SVGLoader();
          const svgData = loader.parse(pastedText);

          let shapeCount = 0;
          const shapes: SvgShape[] = [];

          svgData.paths.forEach((path) => {
            const subShapes = SVGLoader.createShapes(path);
            subShapes.forEach(() => {
              shapes.push({
                id: `shape-${shapeCount}`,
                path: pastedText,
                fill: path.color?.getStyle() || "#cccccc",
                stroke: path.userData?.style?.stroke || undefined,
                opacity: 1,
              });
              shapeCount++;
            });
          });

          dispatch(setSvgFile(pastedText));
          dispatch(setSvgShapes(shapes));

          e.preventDefault(); // Prevent further handling since we captured the SVG
        } catch (error) {
          console.error("Error parsing pasted SVG:", error);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable ctrl/cmd + s, p, and o natively to prevent browser popups
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (["s", "p", "o", "g"].includes(key)) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("paste", handlePaste);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <ResizablePanelGroup orientation="horizontal">
        {/* ── Sidebar panel ── */}
        <ResizablePanel
          defaultSize="22%"
          minSize="14%"
          maxSize="45%"
          className="min-w-0"
        >
          <Sidebar />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* ── Main canvas panel ── */}
        <ResizablePanel defaultSize="78%" className="min-w-0">
          <main className="relative w-full h-full overflow-hidden bg-linear-to-br from-background to-muted/20">
            {/* Decorative background blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

            {isEditMode ? (
              <SVGEditor />
            ) : !is3DMode ? (
              <div className="h-full w-full flex items-center justify-center relative z-10 px-6 py-6">
                <ParticleBackground />
                <div className="relative w-full max-w-3xl">
                  {/* Ambient glow */}
                  <div className="absolute -inset-2 bg-linear-to-r from-indigo-500/8 via-purple-500/8 to-indigo-500/8 rounded-3xl blur-2xl pointer-events-none" />

                  <div className="relative bg-background/25 backdrop-blur-3xl border border-white/6 shadow-2xl rounded-2xl overflow-hidden">
                    {/* Top shine */}
                    <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-white/12 to-transparent" />

                    {/* ── Header bar ── */}
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                      <Image
                        src="/product/app_logo.svg"
                        alt="Lumix3D"
                        width={32}
                        height={32}
                        unoptimized
                        className="rounded-xl object-cover bg-black border border-white/10"
                      />
                      <div className="flex-1 min-w-0">
                        <h1 className="text-sm font-semibold tracking-tight text-foreground leading-none">
                          Lumix
                          <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">
                            3D
                          </span>
                        </h1>
                        <p className="text-xs text-muted-foreground/60 mt-0.5 truncate">
                          SVG → 3D Converter · Cinematic Renderer
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Ready
                        </span>
                      </div>
                    </div>

                    {/* ── Body ── */}
                    <div className="grid grid-cols-5 divide-x divide-white/5">
                      {/* Left col — features */}
                      <div className="col-span-3 p-5 space-y-4">
                        <p className="text-xs font-medium text-muted-foreground/50 uppercase tracking-widest">
                          Features
                        </p>
                        <div className="grid grid-cols-2 gap-2.5">
                          {(
                            [
                              {
                                Icon: Upload,
                                iconBox:
                                  "bg-indigo-500/15 border-indigo-500/20",
                                iconColor: "text-indigo-400",
                                title: "SVG Import & Edit",
                                desc: "Upload, paste, or edit SVG paths in-app",
                              },
                              {
                                Icon: Boxes,
                                iconBox:
                                  "bg-purple-500/15 border-purple-500/20",
                                iconColor: "text-purple-400",
                                title: "3D Extrusion",
                                desc: "Depth, bevel toggle, and curve smoothing",
                              },
                              {
                                Icon: Sun,
                                iconBox: "bg-amber-500/15 border-amber-500/20",
                                iconColor: "text-amber-400",
                                title: "Cinematic Lighting",
                                desc: "HDRI presets, custom rigs, per-light toggle",
                              },
                              {
                                Icon: ImageIcon,
                                iconBox: "bg-blue-500/15 border-blue-500/20",
                                iconColor: "text-blue-400",
                                title: "PBR Textures",
                                desc: "Global maps or local per-shape overrides",
                              },
                              {
                                Icon: Film,
                                iconBox: "bg-pink-500/15 border-pink-500/20",
                                iconColor: "text-pink-400",
                                title: "Animation Timeline",
                                desc: "Keyframes, looping, and saved animations",
                              },
                              {
                                Icon: Grid2X2,
                                iconBox: "bg-rose-500/15 border-rose-500/20",
                                iconColor: "text-rose-400",
                                title: "Multi-Select & Groups",
                                desc: "Batch transform, group, and box-select",
                              },
                              {
                                Icon: Code2,
                                iconBox: "bg-sky-500/15 border-sky-500/20",
                                iconColor: "text-sky-400",
                                title: "Embed Export",
                                desc: "JS or React snippet with control toggles",
                              },
                              {
                                Icon: Undo2,
                                iconBox:
                                  "bg-emerald-500/15 border-emerald-500/20",
                                iconColor: "text-emerald-400",
                                title: "Undo / Redo + Autosave",
                                desc: "Full history, local persistence",
                              },
                            ] as {
                              Icon: LucideIcon;
                              iconBox: string;
                              iconColor: string;
                              title: string;
                              desc: string;
                            }[]
                          ).map(({ Icon, iconBox, iconColor, title, desc }) => (
                            <div
                              key={title}
                              className="group/feat flex gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all duration-200"
                            >
                              <div
                                className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${iconBox}`}
                              >
                                <Icon
                                  className={`w-4 h-4 ${iconColor}`}
                                  strokeWidth={1.5}
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-foreground/90 leading-none">
                                  {title}
                                </p>
                                <p className="text-xs text-muted-foreground/55 mt-1 leading-snug">
                                  {desc}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right col — get started + shortcuts */}
                      <div className="col-span-2 p-5 space-y-5">
                        {/* Get started steps */}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground/50 uppercase tracking-widest mb-3">
                            Get Started
                          </p>
                          <ol className="space-y-3">
                            {(
                              [
                                {
                                  badge:
                                    "bg-indigo-500/20 border-indigo-500/30 text-indigo-400",
                                  title: "Upload an SVG",
                                  desc: "Sidebar uploader, paste, or open a demo scene",
                                },
                                {
                                  badge:
                                    "bg-purple-500/20 border-purple-500/30 text-purple-400",
                                  title: "Tune the 3D scene",
                                  desc: "Extrusion, materials, textures, lighting",
                                },
                                {
                                  badge:
                                    "bg-pink-500/20 border-pink-500/30 text-pink-400",
                                  title: "Animate (optional)",
                                  desc: "Add keyframes from the timeline panel",
                                },
                                {
                                  badge:
                                    "bg-emerald-500/20 border-emerald-500/30 text-emerald-400",
                                  title: "Export & share",
                                  desc: "Save project JSON or grab an embed snippet",
                                },
                              ] as {
                                badge: string;
                                title: string;
                                desc: string;
                              }[]
                            ).map(({ badge, title, desc }, i) => (
                              <li
                                key={title}
                                className="flex gap-3 items-start"
                              >
                                <span
                                  className={`w-5 h-5 rounded-full border text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${badge}`}
                                >
                                  {i + 1}
                                </span>
                                <div>
                                  <p className="text-xs font-semibold text-foreground/85 leading-none">
                                    {title}
                                  </p>
                                  <p className="text-xs text-muted-foreground/55 mt-0.5 leading-snug">
                                    {desc}
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-white/5" />

                        {/* Keyboard shortcuts */}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground/50 uppercase tracking-widest mb-3">
                            Shortcuts
                          </p>
                          <div className="space-y-2">
                            {[
                              { key: "⌘ Z", label: "Undo" },
                              { key: "⌘ ⇧ Z", label: "Redo" },
                              {
                                key: "Paste",
                                label: "Load SVG from clipboard",
                              },
                              { key: "⌘ Click", label: "Add to selection" },
                              { key: "Drag", label: "Orbit camera / box-select" },
                              { key: "Scroll", label: "Zoom in / out" },
                            ].map(({ key, label }) => (
                              <div
                                key={key}
                                className="flex items-center justify-between gap-2"
                              >
                                <span className="text-xs text-muted-foreground/55">
                                  {label}
                                </span>
                                <kbd className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-foreground/60 text-xs font-mono whitespace-nowrap">
                                  {key}
                                </kbd>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── Footer ── */}
                    <div className="flex items-center justify-between px-5 py-3 border-t border-white/5 bg-white/1">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground/40">
                            Developer
                          </span>
                          <span className="text-xs font-medium text-foreground/70">
                            Saw Issac
                          </span>
                        </div>
                        <div className="w-px h-3 bg-white/10" />
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground/40">
                            Studio
                          </span>
                          <span className="text-xs font-medium text-foreground/70">
                            Waux Studio
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground/30">
                        v1.0
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              (() => {
                const canvasArea = (
                  <div className="relative w-full h-full min-h-0">
                    <Canvas3D />
                    <SceneTransformToolbar />
                    <UndoRedoToolbar />
                    <button
                      onClick={() => setShowTimeline((v) => !v)}
                      className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2 h-7 rounded-md bg-black/50 backdrop-blur-sm border border-white/10 text-[10px] text-white/55 hover:text-white/85 hover:border-white/20 transition-colors"
                    >
                      <svg
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <path d="M8 21h8M12 17v4" />
                      </svg>
                      {showTimeline ? "Hide" : "Show"} Timeline
                    </button>
                  </div>
                );

                return showTimeline ? (
                  <ResizablePanelGroup orientation="vertical" className="h-full">
                    <ResizablePanel defaultSize="70%" minSize="20%">
                      {canvasArea}
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel
                      defaultSize="30%"
                      minSize="10%"
                      maxSize="70%"
                    >
                      <TimelinePanel />
                    </ResizablePanel>
                  </ResizablePanelGroup>
                ) : (
                  canvasArea
                );
              })()
            )}
          </main>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

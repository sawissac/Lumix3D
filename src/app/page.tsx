"use client";

import { useEffect } from "react";
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
                      <div className="w-8 h-8 rounded-xl bg-linear-to-br from-indigo-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-indigo-300">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                          <line x1="12" y1="22.08" x2="12" y2="12" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h1 className="text-sm font-semibold tracking-tight text-foreground leading-none">
                          Lumix<span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">3D</span>
                        </h1>
                        <p className="text-xs text-muted-foreground/60 mt-0.5 truncate">SVG → 3D Converter · Cinematic Renderer</p>
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
                        <p className="text-xs font-medium text-muted-foreground/50 uppercase tracking-widest">Features</p>
                        <div className="grid grid-cols-2 gap-2.5">
                          {/* SVG Import */}
                          <div className="group/feat flex gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all duration-200">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-indigo-400">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground/90 leading-none">SVG Import</p>
                              <p className="text-xs text-muted-foreground/55 mt-1 leading-snug">Upload or paste any SVG file to begin</p>
                            </div>
                          </div>
                          {/* Extrusion */}
                          <div className="group/feat flex gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all duration-200">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/20 flex items-center justify-center shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-purple-400">
                                <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground/90 leading-none">3D Extrusion</p>
                              <p className="text-xs text-muted-foreground/55 mt-1 leading-snug">Tune depth, bevel, and surface detail</p>
                            </div>
                          </div>
                          {/* Lighting */}
                          <div className="group/feat flex gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all duration-200">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-amber-400">
                                <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground/90 leading-none">Cinematic Lighting</p>
                              <p className="text-xs text-muted-foreground/55 mt-1 leading-snug">HDRI presets & custom light rigs</p>
                            </div>
                          </div>
                          {/* Quick Scenes */}
                          <div className="group/feat flex gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all duration-200">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-emerald-400">
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground/90 leading-none">Quick Scenes</p>
                              <p className="text-xs text-muted-foreground/55 mt-1 leading-snug">One-click app icon demos to explore</p>
                            </div>
                          </div>
                          {/* Export */}
                          <div className="group/feat flex gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all duration-200">
                            <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/20 flex items-center justify-center shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-sky-400">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground/90 leading-none">Scene Export</p>
                              <p className="text-xs text-muted-foreground/55 mt-1 leading-snug">Export embed code for any website</p>
                            </div>
                          </div>
                          {/* Multi-Select */}
                          <div className="group/feat flex gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all duration-200">
                            <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/20 flex items-center justify-center shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-rose-400">
                                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground/90 leading-none">Multi-Select Edit</p>
                              <p className="text-xs text-muted-foreground/55 mt-1 leading-snug">Batch-edit material & extrusion props</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right col — get started + shortcuts */}
                      <div className="col-span-2 p-5 space-y-5">
                        {/* Get started steps */}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground/50 uppercase tracking-widest mb-3">Get Started</p>
                          <ol className="space-y-3">
                            <li className="flex gap-3 items-start">
                              <span className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                              <div>
                                <p className="text-xs font-semibold text-foreground/85 leading-none">Upload an SVG</p>
                                <p className="text-xs text-muted-foreground/55 mt-0.5 leading-snug">Use the sidebar uploader or paste SVG code directly</p>
                              </div>
                            </li>
                            <li className="flex gap-3 items-start">
                              <span className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                              <div>
                                <p className="text-xs font-semibold text-foreground/85 leading-none">Tune the 3D scene</p>
                                <p className="text-xs text-muted-foreground/55 mt-0.5 leading-snug">Adjust extrusion depth, materials & lighting</p>
                              </div>
                            </li>
                            <li className="flex gap-3 items-start">
                              <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                              <div>
                                <p className="text-xs font-semibold text-foreground/85 leading-none">Export & share</p>
                                <p className="text-xs text-muted-foreground/55 mt-0.5 leading-snug">Save the scene or grab an embed snippet</p>
                              </div>
                            </li>
                          </ol>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-white/5" />

                        {/* Keyboard shortcuts */}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground/50 uppercase tracking-widest mb-3">Shortcuts</p>
                          <div className="space-y-2">
                            {[
                              { key: "⌘ Z", label: "Undo" },
                              { key: "⌘ ⇧ Z", label: "Redo" },
                              { key: "Paste", label: "Load SVG from clipboard" },
                              { key: "Drag", label: "Orbit camera" },
                              { key: "Scroll", label: "Zoom in / out" },
                            ].map(({ key, label }) => (
                              <div key={key} className="flex items-center justify-between gap-2">
                                <span className="text-xs text-muted-foreground/55">{label}</span>
                                <kbd className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-foreground/60 text-xs font-mono whitespace-nowrap">{key}</kbd>
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
                          <span className="text-xs text-muted-foreground/40">Developer</span>
                          <span className="text-xs font-medium text-foreground/70">Saw Issac</span>
                        </div>
                        <div className="w-px h-3 bg-white/10" />
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground/40">Studio</span>
                          <span className="text-xs font-medium text-foreground/70">Waux Studio</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground/30">v1.0</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Canvas3D />
                <SceneTransformToolbar />
                <UndoRedoToolbar />
              </>
            )}
          </main>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

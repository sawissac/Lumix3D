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
              <div className="h-full w-full flex items-center justify-center relative z-10 px-6">
                <ParticleBackground />
                <div className="relative group max-w-2xl w-full">
                  {/* Subtle ambient glow behind the card */}
                  <div className="absolute -inset-1 bg-linear-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-70 transition duration-1000 pointer-events-none" />

                  <div className="relative flex flex-col items-center text-center p-10 sm:p-16 bg-background/30 backdrop-blur-3xl border border-white/5 shadow-2xl rounded-[2.5rem] overflow-hidden">
                    {/* Decorative top reflection line */}
                    <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
                    {/* Decorative bottom reflection line */}
                    <div className="absolute bottom-0 inset-x-0 h-px bg-linear-to-r from-transparent via-white/5 to-transparent" />

                    <div className="relative w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8 shadow-inner shadow-white/5 backdrop-blur-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-8 h-8 text-foreground/80"
                      >
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                      </svg>
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-foreground">
                      Lumix
                      <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">
                        3D
                      </span>
                    </h1>

                    <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-lg mx-auto mb-12 font-light">
                      Upload an SVG file from the sidebar to begin creating your
                      3D masterpiece. Experiment with extrusion settings and
                      cinematic lighting presets.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 pt-8 border-t border-white/5 w-full justify-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground/60">
                          Developer
                        </span>
                        <span className="text-sm font-medium text-foreground/80">
                          Saw Issac
                        </span>
                      </div>
                      <div className="hidden sm:block w-1 h-1 rounded-full bg-white/10" />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground/60">
                          Studio
                        </span>
                        <span className="text-sm font-medium text-foreground/80">
                          Waux Studio
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Canvas3D />
                <SceneTransformToolbar />
              </>
            )}
          </main>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

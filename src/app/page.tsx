"use client";

import dynamic from "next/dynamic";
import { Sidebar } from "@/features/sidebar/components/Sidebar";
import { useAppSelector } from "@/store/hooks";

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

export default function Home() {
  const is3DMode = useAppSelector((state) => state.scene.is3DMode);
  const isEditMode = useAppSelector((state) => state.scene.isEditMode);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden bg-linear-to-br from-background to-muted/20">
        {/* Decorative background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

        {isEditMode ? (
          <SVGEditor />
        ) : !is3DMode ? (
          <div className="h-full flex items-center justify-center relative z-10">
            <div className="text-center space-y-6 p-8 border border-border/50 bg-background/50 backdrop-blur-md rounded-2xl shadow-2xl max-w-xl">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-8 h-8 text-white"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold tracking-tight">
                Welcome to{" "}
                <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-purple-400">
                  Lumix3D
                </span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Upload an SVG file from the sidebar to begin creating your 3D
                masterpiece. Experiment with extrusion settings and cinematic
                lighting presets.
              </p>
            </div>
          </div>
        ) : (
          <Canvas3D />
        )}
      </main>
    </div>
  );
}

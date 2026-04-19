"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAppDispatch } from "@/store/hooks";
import {
  loadScene,
  set3DMode,
  setEditMode,
  setTransformMode,
} from "@/store/slices/sceneSlice";
import { AppState } from "@/types";

const Canvas3D = dynamic(
  () =>
    import("@/features/three/components/Canvas3D").then((mod) => ({
      default: mod.Canvas3D,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    ),
  },
);

export default function EmbedPage() {
  const dispatch = useAppDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Allow any origin for ease of use in embedding
      if (event.data && event.data.type === "LUMIX_INIT") {
        const state: AppState = event.data.state;
        if (state) {
          // Ensure we are in 3D view, not editing, and no transform controls
          state.is3DMode = true;
          state.isEditMode = false;
          state.transformMode = null;
          dispatch(loadScene(state));
          setIsLoaded(true);
        }
      }
    };

    window.addEventListener("message", handleMessage);

    // Tell parent frame we are ready to receive data
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "LUMIX_READY" }, "*");
    }

    return () => window.removeEventListener("message", handleMessage);
  }, [dispatch]);

  // Ensure transform controls stay disabled
  useEffect(() => {
    if (isLoaded) {
      dispatch(setTransformMode(null));
    }
  }, [dispatch, isLoaded]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {isLoaded ? (
        <Canvas3D />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-background text-muted-foreground">
          Waiting for scene data...
        </div>
      )}
    </div>
  );
}

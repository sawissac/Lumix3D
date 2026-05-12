import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { Provider } from "react-redux";
import { EmbedModeContext } from "./EmbedModeContext";
import { createEmbedStore, type EmbedStore } from "./embedStore";
import { loadScene, setTransformMode } from "@/store/slices/sceneSlice";
import { Canvas3D } from "@/features/three/components/Canvas3D";
import type { AppState } from "@/types";

type SceneInput = Partial<AppState> & Record<string, unknown>;

const STYLE_ID = "lumix-embed-base-styles";
const BASE_CSS = `
lumix-scene { display: block; position: relative; width: 100%; height: 100%; overflow: hidden; }
lumix-scene * { box-sizing: border-box; }
lumix-scene .w-full { width: 100%; }
lumix-scene .h-full { height: 100%; }
lumix-scene .w-screen { width: 100%; }
lumix-scene .h-screen { height: 100%; }
lumix-scene .relative { position: relative; }
lumix-scene .absolute { position: absolute; }
lumix-scene .fixed { position: absolute; }
lumix-scene .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
lumix-scene .flex { display: flex; }
lumix-scene .overflow-hidden { overflow: hidden; }
lumix-scene .pointer-events-none { pointer-events: none; }
lumix-scene canvas { display: block; }
`;

function injectBaseStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = BASE_CSS;
  document.head.appendChild(style);
}

function EmbedRoot() {
  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <Canvas3D />
    </div>
  );
}

class LumixSceneElement extends HTMLElement {
  private root: Root | null = null;
  private store: EmbedStore | null = null;
  private pendingScene: SceneInput | null = null;

  connectedCallback() {
    if (this.root) return;
    injectBaseStyles();
    this.style.display = this.style.display || "block";
    this.store = createEmbedStore();
    this.root = createRoot(this);
    this.root.render(
      <Provider store={this.store}>
        <EmbedModeContext.Provider value={true}>
          <EmbedRoot />
        </EmbedModeContext.Provider>
      </Provider>,
    );
    if (this.pendingScene) {
      this.applyScene(this.pendingScene);
      this.pendingScene = null;
    }
  }

  disconnectedCallback() {
    this.root?.unmount();
    this.root = null;
    this.store = null;
  }

  set scene(value: SceneInput | null | undefined) {
    if (!value) return;
    if (!this.store) {
      this.pendingScene = value;
      return;
    }
    this.applyScene(value);
  }

  get scene(): SceneInput | null {
    return null;
  }

  private applyScene(value: SceneInput) {
    if (!this.store) return;
    const state = { ...value, is3DMode: true, isEditMode: false, transformMode: null } as AppState;
    this.store.dispatch(loadScene(state));
    this.store.dispatch(setTransformMode(null));
  }
}

if (typeof window !== "undefined" && !customElements.get("lumix-scene")) {
  customElements.define("lumix-scene", LumixSceneElement);
}

declare global {
  interface HTMLElementTagNameMap {
    "lumix-scene": LumixSceneElement;
  }
}

export { LumixSceneElement };

import type { Middleware } from "@reduxjs/toolkit";
import type { RootState } from "./index";
import type { HistorySnapshot } from "./slices/sceneSlice";
import { restoreSnapshot } from "./slices/sceneSlice";

const UNDOABLE_ACTIONS = new Set([
  // recordSnapshot is dispatched at the START of drag/significant changes
  // so the snapshot captured is the pre-change state
  "scene/recordSnapshot",
  "scene/setSvgShapes",
  "scene/setSvgFile",
  "scene/updateShapeColor",
  "scene/setExtrusionDepth",
  "scene/setExtrusionSettings",
  "scene/setBackground",
  "scene/addLight",
  "scene/removeLight",
  "scene/updateLight",
  "scene/toggleLight",
  "scene/setLightingPreset",
  "scene/setLights",
  "scene/updateShapeExtrusion",
  "scene/updateShapesExtrusion",
  "scene/resetShapeExtrusion",
  "scene/resetShapesExtrusion",
  // updateShapeTransform / setGlobalTransform / updateGroupTransform are
  // excluded here — they fire every frame during drag. Instead, a
  // recordSnapshot is dispatched on mouseDown before the drag begins.
  "scene/setShowGrid",
  "scene/setGlobalMaterial",
  "scene/setGlobalTexture",
  "scene/clearTextureChannel",
  "scene/updateShapeMaterial",
  "scene/updateShapesMaterial",
  "scene/resetShapeMaterial",
  "scene/resetShapesMaterial",
  "scene/removeShape",
  "scene/setBloomSettings",
  "scene/setGroundSettings",
  "scene/createGroup",
  "scene/deleteGroup",
  "scene/ungroupSelected",
  "scene/resetScene",
  "scene/loadScene",
]);

const MAX_HISTORY = 50;

const past: HistorySnapshot[] = [];
const future: HistorySnapshot[] = [];

function getSnapshot(state: RootState): HistorySnapshot {
  const s = state.scene;
  return {
    svgShapes: s.svgShapes,
    svgFile: s.svgFile,
    extrusion: s.extrusion,
    globalMaterial: s.globalMaterial,
    globalTexture: s.globalTexture,
    globalTransform: s.globalTransform,
    background: s.background,
    lights: s.lights,
    currentPreset: s.currentPreset,
    bloom: s.bloom,
    ground: s.ground,
    showGrid: s.showGrid,
    groups: s.groups,
  };
}

export const historyMiddleware: Middleware =
  (store) => (next) => (action) => {
    const type = (action as { type: string }).type;

    if (type === "scene/undo") {
      if (past.length === 0) return;
      const snapshot = past.pop()!;
      future.push(getSnapshot(store.getState() as RootState));
      store.dispatch(restoreSnapshot(snapshot));
      return;
    }

    if (type === "scene/redo") {
      if (future.length === 0) return;
      const snapshot = future.pop()!;
      past.push(getSnapshot(store.getState() as RootState));
      store.dispatch(restoreSnapshot(snapshot));
      return;
    }

    if (UNDOABLE_ACTIONS.has(type)) {
      past.push(getSnapshot(store.getState() as RootState));
      if (past.length > MAX_HISTORY) past.shift();
      future.length = 0;
    }

    return next(action);
  };

export function canUndo() {
  return past.length > 0;
}

export function canRedo() {
  return future.length > 0;
}

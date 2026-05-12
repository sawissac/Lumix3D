import { AppState, EmbedControls } from "@/types";

export type EmbedPayload = Pick<
  AppState,
  | "svgShapes"
  | "svgFile"
  | "importedSvgs"
  | "extrusion"
  | "globalMaterial"
  | "globalTexture"
  | "globalTransform"
  | "background"
  | "lights"
  | "currentPreset"
  | "bloom"
  | "ground"
  | "showGrid"
  | "viewMode"
  | "groups"
  | "cameraState"
  | "timeline"
  | "savedAnimations"
> & {
  is3DMode: true;
  isEditMode: false;
  transformMode: null;
  embedControls: EmbedControls;
};

export function toEmbedPayload(
  state: AppState,
  embedControls: EmbedControls,
): EmbedPayload {
  return {
    svgShapes: state.svgShapes,
    svgFile: state.svgFile,
    importedSvgs: state.importedSvgs,
    extrusion: state.extrusion,
    globalMaterial: state.globalMaterial,
    globalTexture: state.globalTexture,
    globalTransform: state.globalTransform,
    background: state.background,
    lights: state.lights,
    currentPreset: state.currentPreset,
    bloom: state.bloom,
    ground: state.ground,
    showGrid: state.showGrid,
    viewMode: state.viewMode,
    groups: state.groups,
    cameraState: state.cameraState,
    timeline: state.timeline,
    savedAnimations: state.savedAnimations,
    is3DMode: true,
    isEditMode: false,
    transformMode: null,
    embedControls,
  };
}

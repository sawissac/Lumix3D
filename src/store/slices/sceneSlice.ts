import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  AppState,
  SvgShape,
  Light,
  Background,
  ExtrusionSettings,
  LightingPreset,
  SvgSelectionInfo,
  MaterialSettings,
  TextureSettings,
  BloomSettings,
  GroundSettings,
  ObjectGroup,
  CameraState,
  ViewMode,
} from "@/types";

export type HistorySnapshot = Pick<
  AppState,
  | "svgShapes"
  | "svgFile"
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
  | "groups"
>;

const initialState: AppState = {
  svgShapes: [],
  svgFile: null,
  extrusion: {
    depth: 10,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 1,
    bevelSize: 0.5,
    bevelSegments: 3,
  },
  globalMaterial: {
    preset: "plastic",
    roughness: 0.4,
    metalness: 0.1,
    transmission: 0,
    ior: 1.5,
    clearcoat: 0,
    emissive: "#000000",
    emissiveIntensity: 0,
  },
  globalTexture: {},
  globalTransform: {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  },
  background: {
    type: "color",
    value: "#1a1a1a",
  },
  lights: [
    {
      id: "ambient-1",
      type: "ambient",
      intensity: 0.5,
      color: "#ffffff",
      position: [0, 0, 0],
      enabled: true,
    },
    {
      id: "directional-1",
      type: "directional",
      intensity: 1,
      color: "#ffffff",
      position: [5, 5, 5],
      enabled: true,
    },
  ],
  bloom: {
    enabled: false,
    intensity: 1.5,
    luminanceThreshold: 0.9,
    luminanceSmoothing: 0.025,
  },
  ground: {
    enabled: true,
    color: "#000000",
    metalness: 2.0,
    roughness: 0.15,
    position: [0, -20, 0],
  },
  currentPreset: "custom",
  is3DMode: false,
  isEditMode: false,
  viewMode: "normal" as ViewMode,
  showGrid: true,
  selectedShapeId: null,
  selectedShapeIds: [],
  groups: [],
  svgSelection: null,
  svgFocusIndex: null,
  transformMode: null,
  rotationLock: {
    x: false,
    y: false,
    z: false,
  },
  orbitControlsLock: {
    rotate: false,
    pan: false,
    zoom: false,
    rotateX: false,
    rotateY: false,
    rotateZ: false,
  },
  isBoxSelecting: false,
};

const sceneSlice = createSlice({
  name: "scene",
  initialState,
  reducers: {
    setSvgShapes: (state, action: PayloadAction<SvgShape[]>) => {
      state.svgShapes = action.payload;
    },
    setSvgFile: (state, action: PayloadAction<string | null>) => {
      state.svgFile = action.payload;
    },
    updateShapeColor: (
      state,
      action: PayloadAction<{ id: string; color: string }>,
    ) => {
      const shape = state.svgShapes.find((s) => s.id === action.payload.id);
      if (shape) {
        shape.fill = action.payload.color;
      }
    },
    setExtrusionDepth: (state, action: PayloadAction<number>) => {
      state.extrusion.depth = action.payload;
      // Global wins: clear per-shape depth overrides so all shapes follow global
      state.svgShapes.forEach((shape) => {
        if (shape.shapeExtrusion && "depth" in shape.shapeExtrusion) {
          delete shape.shapeExtrusion.depth;
          if (Object.keys(shape.shapeExtrusion).length === 0) {
            delete shape.shapeExtrusion;
          }
        }
      });
    },
    setExtrusionSettings: (
      state,
      action: PayloadAction<Partial<ExtrusionSettings>>,
    ) => {
      state.extrusion = { ...state.extrusion, ...action.payload };
      // Global wins: clear matching per-shape overrides for every changed key
      const changedKeys = Object.keys(action.payload) as Array<
        keyof ExtrusionSettings
      >;
      state.svgShapes.forEach((shape) => {
        if (!shape.shapeExtrusion) return;
        changedKeys.forEach((key) => {
          delete shape.shapeExtrusion![key];
        });
        if (Object.keys(shape.shapeExtrusion).length === 0) {
          delete shape.shapeExtrusion;
        }
      });
    },
    setBackground: (state, action: PayloadAction<Background>) => {
      state.background = action.payload;
    },
    addLight: (state, action: PayloadAction<Light>) => {
      state.lights.push(action.payload);
    },
    removeLight: (state, action: PayloadAction<string>) => {
      state.lights = state.lights.filter((l) => l.id !== action.payload);
    },
    updateLight: (state, action: PayloadAction<Light>) => {
      const index = state.lights.findIndex((l) => l.id === action.payload.id);
      if (index !== -1) {
        state.lights[index] = action.payload;
      }
    },
    toggleLight: (state, action: PayloadAction<string>) => {
      const light = state.lights.find((l) => l.id === action.payload);
      if (light) {
        light.enabled = !light.enabled;
      }
    },
    setLightingPreset: (state, action: PayloadAction<LightingPreset>) => {
      state.currentPreset = action.payload;
    },
    setLights: (state, action: PayloadAction<Light[]>) => {
      state.lights = action.payload;
    },
    toggle3DMode: (state) => {
      state.is3DMode = !state.is3DMode;
    },
    set3DMode: (state, action: PayloadAction<boolean>) => {
      state.is3DMode = action.payload;
    },
    setEditMode: (state, action: PayloadAction<boolean>) => {
      state.isEditMode = action.payload;
    },
    setSelectedShapeId: (state, action: PayloadAction<string | null>) => {
      state.selectedShapeId = action.payload;
    },
    updateShapeExtrusion: (
      state,
      action: PayloadAction<{
        id: string;
        extrusion: Partial<ExtrusionSettings>;
      }>,
    ) => {
      const shape = state.svgShapes.find((s) => s.id === action.payload.id);
      if (shape) {
        shape.shapeExtrusion = {
          ...shape.shapeExtrusion,
          ...action.payload.extrusion,
        };
      }
    },
    updateShapesExtrusion: (
      state,
      action: PayloadAction<{
        ids: string[];
        extrusion: Partial<ExtrusionSettings>;
      }>,
    ) => {
      state.svgShapes.forEach((shape) => {
        if (action.payload.ids.includes(shape.id)) {
          shape.shapeExtrusion = {
            ...shape.shapeExtrusion,
            ...action.payload.extrusion,
          };
        }
      });
    },
    resetShapeExtrusion: (state, action: PayloadAction<string>) => {
      const shape = state.svgShapes.find((s) => s.id === action.payload);
      if (shape) {
        delete shape.shapeExtrusion;
      }
    },
    resetShapesExtrusion: (state, action: PayloadAction<string[]>) => {
      state.svgShapes.forEach((shape) => {
        if (action.payload.includes(shape.id)) {
          delete shape.shapeExtrusion;
        }
      });
    },
    setSvgSelection: (state, action: PayloadAction<SvgSelectionInfo>) => {
      state.svgSelection = action.payload;
    },
    clearSvgSelection: (state) => {
      state.svgSelection = null;
    },
    setSvgFocusIndex: (state, action: PayloadAction<number | null>) => {
      state.svgFocusIndex = action.payload;
    },
    setTransformMode: (
      state,
      action: PayloadAction<"translate" | "rotate" | "scale" | null>,
    ) => {
      state.transformMode = action.payload;
    },
    updateShapeTransform: (
      state,
      action: PayloadAction<{
        id: string;
        position?: [number, number, number];
        rotation?: [number, number, number];
        scale?: [number, number, number];
      }>,
    ) => {
      const shape = state.svgShapes.find((s) => s.id === action.payload.id);
      if (shape) {
        if (action.payload.position) shape.position = action.payload.position;
        if (action.payload.rotation) shape.rotation = action.payload.rotation;
        if (action.payload.scale) shape.scale = action.payload.scale;
      }
    },
    setShowGrid: (state, action: PayloadAction<boolean>) => {
      state.showGrid = action.payload;
    },
    setGlobalTransform: (
      state,
      action: PayloadAction<{
        position?: [number, number, number];
        rotation?: [number, number, number];
        scale?: [number, number, number];
      }>,
    ) => {
      if (action.payload.position)
        state.globalTransform.position = action.payload.position;
      if (action.payload.rotation)
        state.globalTransform.rotation = action.payload.rotation;
      if (action.payload.scale)
        state.globalTransform.scale = action.payload.scale;
    },
    setGlobalMaterial: (
      state,
      action: PayloadAction<Partial<MaterialSettings>>,
    ) => {
      state.globalMaterial = { ...state.globalMaterial, ...action.payload };
    },
    setGlobalTexture: (
      state,
      action: PayloadAction<Partial<TextureSettings>>,
    ) => {
      state.globalTexture = { ...state.globalTexture, ...action.payload };
    },
    clearTextureChannel: (
      state,
      action: PayloadAction<keyof TextureSettings>,
    ) => {
      state.globalTexture = { ...state.globalTexture, [action.payload]: null };
    },
    updateShapeMaterial: (
      state,
      action: PayloadAction<{
        id: string;
        material: Partial<MaterialSettings>;
      }>,
    ) => {
      const shape = state.svgShapes.find((s) => s.id === action.payload.id);
      if (shape) {
        shape.material = { ...shape.material, ...action.payload.material };
      }
    },
    updateShapesMaterial: (
      state,
      action: PayloadAction<{
        ids: string[];
        material: Partial<MaterialSettings>;
      }>,
    ) => {
      state.svgShapes.forEach((shape) => {
        if (action.payload.ids.includes(shape.id)) {
          shape.material = { ...shape.material, ...action.payload.material };
        }
      });
    },
    resetShapeMaterial: (state, action: PayloadAction<string>) => {
      const shape = state.svgShapes.find((s) => s.id === action.payload);
      if (shape) {
        delete shape.material;
      }
    },
    resetShapesMaterial: (state, action: PayloadAction<string[]>) => {
      state.svgShapes.forEach((shape) => {
        if (action.payload.includes(shape.id)) {
          delete shape.material;
        }
      });
    },
    removeShape: (state, action: PayloadAction<string>) => {
      const shape = state.svgShapes.find((s) => s.id === action.payload);
      if (shape) {
        shape.visible = false;
      }
      if (state.selectedShapeId === action.payload) {
        state.selectedShapeId = null;
      }
    },
    setBloomSettings: (
      state,
      action: PayloadAction<Partial<BloomSettings>>,
    ) => {
      state.bloom = { ...state.bloom, ...action.payload };
    },
    setGroundSettings: (
      state,
      action: PayloadAction<Partial<GroundSettings>>,
    ) => {
      state.ground = { ...state.ground, ...action.payload };
    },
    toggleRotationLock: (state, action: PayloadAction<"x" | "y" | "z">) => {
      const axis = action.payload;
      state.rotationLock[axis] = !state.rotationLock[axis];
    },
    toggleOrbitControlsLock: (
      state,
      action: PayloadAction<
        "rotate" | "pan" | "zoom" | "rotateX" | "rotateY" | "rotateZ"
      >,
    ) => {
      const control = action.payload;
      state.orbitControlsLock[control] = !state.orbitControlsLock[control];
    },
    setExclusiveOrbitControlsAxis: (
      state,
      action: PayloadAction<"rotateX" | "rotateY" | "rotateZ">,
    ) => {
      const axis = action.payload;
      const axes: Array<"rotateX" | "rotateY" | "rotateZ"> = ["rotateX", "rotateY", "rotateZ"];
      
      const isOnlyUnlocked = !state.orbitControlsLock[axis] && axes.every(a => a === axis || state.orbitControlsLock[a]);
      
      if (isOnlyUnlocked) {
        axes.forEach(a => { state.orbitControlsLock[a] = false; });
      } else {
        axes.forEach(a => { state.orbitControlsLock[a] = a !== axis; });
      }
    },
    toggleShapeSelection: (
      state,
      action: PayloadAction<{ id: string; additive: boolean }>,
    ) => {
      const { id, additive } = action.payload;
      if (additive) {
        const index = state.selectedShapeIds.indexOf(id);
        if (index > -1) {
          state.selectedShapeIds.splice(index, 1);
        } else {
          state.selectedShapeIds.push(id);
        }
      } else {
        state.selectedShapeIds = [id];
      }
      state.selectedShapeId =
        state.selectedShapeIds.length === 1 ? state.selectedShapeIds[0] : null;

      // Auto-enable translate mode when shapes are selected
      if (state.selectedShapeIds.length > 0) {
        state.transformMode = "translate";
      } else {
        state.transformMode = null;
      }
    },
    setSelectedShapeIds: (state, action: PayloadAction<string[]>) => {
      state.selectedShapeIds = action.payload;
      state.selectedShapeId =
        state.selectedShapeIds.length === 1 ? state.selectedShapeIds[0] : null;

      // Auto-enable translate mode when shapes are selected
      if (state.selectedShapeIds.length > 0) {
        state.transformMode = "translate";
      } else {
        state.transformMode = null;
      }
    },
    clearSelection: (state) => {
      state.selectedShapeIds = [];
      state.selectedShapeId = null;
      state.transformMode = null;
    },
    createGroup: (state, action: PayloadAction<{ name: string }>) => {
      if (state.selectedShapeIds.length < 2) return;
      const newGroup: ObjectGroup = {
        id: `group-${Date.now()}`,
        name: action.payload.name,
        shapeIds: [...state.selectedShapeIds],
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      };
      state.groups.push(newGroup);
      state.selectedShapeIds = [];
      state.selectedShapeId = null;
    },
    deleteGroup: (state, action: PayloadAction<string>) => {
      state.groups = state.groups.filter((g) => g.id !== action.payload);
    },
    updateGroupTransform: (
      state,
      action: PayloadAction<{
        id: string;
        position?: [number, number, number];
        rotation?: [number, number, number];
        scale?: [number, number, number];
      }>,
    ) => {
      const group = state.groups.find((g) => g.id === action.payload.id);
      if (group) {
        if (action.payload.position) group.position = action.payload.position;
        if (action.payload.rotation) group.rotation = action.payload.rotation;
        if (action.payload.scale) group.scale = action.payload.scale;
      }
    },
    selectGroup: (state, action: PayloadAction<string>) => {
      const group = state.groups.find((g) => g.id === action.payload);
      if (group) {
        state.selectedShapeIds = [...group.shapeIds];
        state.selectedShapeId = null;
        state.transformMode = "translate";
      }
    },
    setBoxSelecting: (state, action: PayloadAction<boolean>) => {
      state.isBoxSelecting = action.payload;
    },
    setViewMode: (state, action: PayloadAction<ViewMode>) => {
      state.viewMode = action.payload;
    },
    loadScene: (state, action: PayloadAction<AppState>) => {
      return { ...initialState, ...action.payload };
    },
    resetScene: () => initialState,
    restoreSnapshot: (state, action: PayloadAction<HistorySnapshot>) => {
      const snap = action.payload;
      state.svgShapes = snap.svgShapes;
      state.svgFile = snap.svgFile;
      state.extrusion = snap.extrusion;
      state.globalMaterial = snap.globalMaterial;
      state.globalTexture = snap.globalTexture;
      state.globalTransform = snap.globalTransform;
      state.background = snap.background;
      state.lights = snap.lights;
      state.currentPreset = snap.currentPreset;
      state.bloom = snap.bloom;
      state.ground = snap.ground;
      state.showGrid = snap.showGrid;
      state.groups = snap.groups;
    },
    // No-op: triggers a history snapshot before a drag begins
    recordSnapshot: () => {},
    // Sentinel actions — actual logic is handled by historyMiddleware
    undo: () => {},
    redo: () => {},
    selectAllShapes: (state) => {
      state.selectedShapeIds = state.svgShapes
        .filter((s) => s.visible !== false)
        .map((s) => s.id);
      state.selectedShapeId =
        state.selectedShapeIds.length === 1 ? state.selectedShapeIds[0] : null;

      // Auto-enable translate mode when shapes are selected
      if (state.selectedShapeIds.length > 0) {
        state.transformMode = "translate";
      }
    },
    ungroupSelected: (state) => {
      const groupsToRemove: string[] = [];
      for (const group of state.groups) {
        const hasAllShapes = group.shapeIds.every((id) =>
          state.selectedShapeIds.includes(id),
        );
        if (
          hasAllShapes &&
          group.shapeIds.length === state.selectedShapeIds.length
        ) {
          groupsToRemove.push(group.id);
        }
      }
      state.groups = state.groups.filter((g) => !groupsToRemove.includes(g.id));
    },
    setCameraState: (state, action: PayloadAction<CameraState>) => {
      state.cameraState = action.payload;
    },
  },
});

export const {
  setSvgShapes,
  setSvgFile,
  updateShapeColor,
  setExtrusionDepth,
  setExtrusionSettings,
  setBackground,
  addLight,
  removeLight,
  updateLight,
  toggleLight,
  setLightingPreset,
  setLights,
  toggle3DMode,
  set3DMode,
  setEditMode,
  setSelectedShapeId,
  updateShapeExtrusion,
  updateShapesExtrusion,
  resetShapeExtrusion,
  resetShapesExtrusion,
  setSvgSelection,
  clearSvgSelection,
  setSvgFocusIndex,
  setTransformMode,
  updateShapeTransform,
  setShowGrid,
  setGlobalTransform,
  setGlobalMaterial,
  updateShapeMaterial,
  updateShapesMaterial,
  resetShapeMaterial,
  resetShapesMaterial,
  removeShape,
  setBloomSettings,
  setGroundSettings,
  toggleRotationLock,
  toggleOrbitControlsLock,
  setExclusiveOrbitControlsAxis,
  toggleShapeSelection,
  setSelectedShapeIds,
  clearSelection,
  createGroup,
  deleteGroup,
  updateGroupTransform,
  selectGroup,
  ungroupSelected,
  setBoxSelecting,
  setViewMode,
  resetScene,
  loadScene,
  selectAllShapes,
  setCameraState,
  setGlobalTexture,
  clearTextureChannel,
  restoreSnapshot,
  recordSnapshot,
  undo,
  redo,
} = sceneSlice.actions;

export default sceneSlice.reducer;

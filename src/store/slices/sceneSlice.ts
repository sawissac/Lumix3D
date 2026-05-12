import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  AppState,
  SvgShape,
  ImportedSvg,
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
  SavedAnimation,
  Keyframe,
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
  | "timeline"
>;

const initialState: AppState = {
  svgShapes: [],
  svgFile: null,
  importedSvgs: [],
  editingSvgId: null,
  extrusion: {
    depth: 10,
    curveSegments: 8,
    bevelEnabled: true,
    bevelThickness: 1,
    bevelSize: 0.5,
    bevelSegments: 2,
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
  // UI State
  showCodeModal: false,
  codeType: "js",
  copied: false,
  embedRotate: true,
  embedZoom: false,
  embedPan: false,
  embedRotateX: true,
  embedRotateY: true,
  embedRotateZ: true,
  showGroupDialog: false,
  groupName: "",
  timeline: {
    tracks: [],
    duration: 5,
    currentTime: 0,
    isPlaying: false,
    fps: 60,
    loop: true,
  },
  collapsedSections: {},
  savedAnimations: [],
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
      if (!action.payload) state.editingSvgId = null;
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
    updateShapesTexture: (
      state,
      action: PayloadAction<{
        ids: string[];
        texture: Partial<TextureSettings>;
      }>,
    ) => {
      state.svgShapes.forEach((shape) => {
        if (action.payload.ids.includes(shape.id)) {
          shape.texture = { ...shape.texture, ...action.payload.texture };
        }
      });
    },
    clearShapesTextureChannel: (
      state,
      action: PayloadAction<{
        ids: string[];
        key: keyof TextureSettings;
      }>,
    ) => {
      state.svgShapes.forEach((shape) => {
        if (!action.payload.ids.includes(shape.id) || !shape.texture) return;
        shape.texture = { ...shape.texture, [action.payload.key]: null };
      });
    },
    resetShapesTexture: (state, action: PayloadAction<string[]>) => {
      state.svgShapes.forEach((shape) => {
        if (action.payload.includes(shape.id)) {
          delete shape.texture;
        }
      });
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
      const id = action.payload;
      state.svgShapes = state.svgShapes.filter((s) => s.id !== id);
      state.importedSvgs.forEach((svg) => {
        svg.shapes = svg.shapes.filter((s) => s.id !== id);
      });
      state.selectedShapeIds = state.selectedShapeIds.filter((sid) => sid !== id);
      if (state.selectedShapeId === id) {
        state.selectedShapeId = null;
        state.transformMode = null;
      }
      state.timeline.tracks = state.timeline.tracks.filter(
        (t) => t.shapeId !== id,
      );
      state.groups.forEach((g) => {
        g.shapeIds = g.shapeIds.filter((sid) => sid !== id);
      });
      state.groups = state.groups.filter((g) => g.shapeIds.length > 0);
    },
    toggleShapeVisibility: (state, action: PayloadAction<string>) => {
      const shape = state.svgShapes.find((s) => s.id === action.payload);
      if (shape) {
        shape.visible = shape.visible === false ? undefined : false;
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
      const axes: Array<"rotateX" | "rotateY" | "rotateZ"> = [
        "rotateX",
        "rotateY",
        "rotateZ",
      ];

      const isOnlyUnlocked =
        !state.orbitControlsLock[axis] &&
        axes.every((a) => a === axis || state.orbitControlsLock[a]);

      if (isOnlyUnlocked) {
        axes.forEach((a) => {
          state.orbitControlsLock[a] = false;
        });
      } else {
        axes.forEach((a) => {
          state.orbitControlsLock[a] = a !== axis;
        });
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
    toggleGroupVisibility: (state, action: PayloadAction<string>) => {
      const group = state.groups.find((g) => g.id === action.payload);
      if (!group) return;
      const willShow = group.visible === false;
      group.visible = willShow;
      group.shapeIds.forEach((id) => {
        const shape = state.svgShapes.find((s) => s.id === id);
        if (shape) {
          shape.visible = willShow ? undefined : false;
        }
      });
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
    // UI Reducers
    setShowCodeModal: (state, action: PayloadAction<boolean>) => {
      state.showCodeModal = action.payload;
    },
    setCodeType: (state, action: PayloadAction<"js" | "react">) => {
      state.codeType = action.payload;
    },
    setCopied: (state, action: PayloadAction<boolean>) => {
      state.copied = action.payload;
    },
    setEmbedRotate: (state, action: PayloadAction<boolean>) => {
      state.embedRotate = action.payload;
    },
    setEmbedZoom: (state, action: PayloadAction<boolean>) => {
      state.embedZoom = action.payload;
    },
    setEmbedPan: (state, action: PayloadAction<boolean>) => {
      state.embedPan = action.payload;
    },
    setEmbedRotateX: (state, action: PayloadAction<boolean>) => {
      state.embedRotateX = action.payload;
    },
    setEmbedRotateY: (state, action: PayloadAction<boolean>) => {
      state.embedRotateY = action.payload;
    },
    setEmbedRotateZ: (state, action: PayloadAction<boolean>) => {
      state.embedRotateZ = action.payload;
    },
    setShowGroupDialog: (state, action: PayloadAction<boolean>) => {
      state.showGroupDialog = action.payload;
    },
    setGroupName: (state, action: PayloadAction<string>) => {
      state.groupName = action.payload;
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
      if (snap.timeline) state.timeline = snap.timeline;
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
    // Timeline reducers
    setTimelinePlaying: (state, action: PayloadAction<boolean>) => {
      state.timeline.isPlaying = action.payload;
    },
    setTimelineCurrentTime: (state, action: PayloadAction<number>) => {
      state.timeline.currentTime = Math.max(
        0,
        Math.min(action.payload, state.timeline.duration),
      );
    },
    setTimelineDuration: (state, action: PayloadAction<number>) => {
      state.timeline.duration = Math.max(0.1, action.payload);
      state.timeline.currentTime = Math.min(
        state.timeline.currentTime,
        state.timeline.duration,
      );
    },
    setTimelineLoop: (state, action: PayloadAction<boolean>) => {
      state.timeline.loop = action.payload;
    },
    addKeyframe: (
      state,
      action: PayloadAction<{
        shapeId: string;
        keyframe: import("@/types").Keyframe;
      }>,
    ) => {
      const { shapeId, keyframe } = action.payload;
      let track = state.timeline.tracks.find((t) => t.shapeId === shapeId);
      if (!track) {
        track = { shapeId, keyframes: [] };
        state.timeline.tracks.push(track);
      }
      const existingIndex = track.keyframes.findIndex(
        (k) => k.time === keyframe.time,
      );
      if (existingIndex >= 0) {
        track.keyframes[existingIndex] = keyframe;
      } else {
        track.keyframes.push(keyframe);
      }
      track.keyframes.sort((a, b) => a.time - b.time);
    },
    removeKeyframe: (
      state,
      action: PayloadAction<{ shapeId: string; keyframeId: string }>,
    ) => {
      const track = state.timeline.tracks.find(
        (t) => t.shapeId === action.payload.shapeId,
      );
      if (track) {
        track.keyframes = track.keyframes.filter(
          (k) => k.id !== action.payload.keyframeId,
        );
        if (track.keyframes.length === 0) {
          state.timeline.tracks = state.timeline.tracks.filter(
            (t) => t.shapeId !== action.payload.shapeId,
          );
        }
      }
    },
    updateKeyframe: (
      state,
      action: PayloadAction<{
        shapeId: string;
        keyframe: import("@/types").Keyframe;
      }>,
    ) => {
      const track = state.timeline.tracks.find(
        (t) => t.shapeId === action.payload.shapeId,
      );
      if (track) {
        const index = track.keyframes.findIndex(
          (k) => k.id === action.payload.keyframe.id,
        );
        if (index >= 0) {
          track.keyframes[index] = action.payload.keyframe;
          track.keyframes.sort((a, b) => a.time - b.time);
        }
      }
    },
    clearTimelineTracks: (state) => {
      state.timeline.tracks = [];
      state.timeline.currentTime = 0;
      state.timeline.isPlaying = false;
    },

    // Save the current keyframe tracks for the given shape IDs (in order)
    // as a named, reusable animation. Saved tracks index by selection order,
    // not by shape ID, so the animation can be applied to a different
    // selection later.
    saveAnimation: (
      state,
      action: PayloadAction<{ name: string; shapeIds: string[] }>,
    ) => {
      const { name, shapeIds } = action.payload;
      const tracks = shapeIds
        .map((id, index) => {
          const track = state.timeline.tracks.find((t) => t.shapeId === id);
          if (!track || track.keyframes.length === 0) return null;
          // Strip per-keyframe ids; they will be regenerated on apply.
          return {
            index,
            keyframes: track.keyframes.map((k) => {
              const stripped: Omit<Keyframe, "id"> = {
                time: k.time,
                position: k.position,
                rotation: k.rotation,
                scale: k.scale,
              };
              if (k.selectionId !== undefined) stripped.selectionId = k.selectionId;
              if (k.pivot !== undefined) stripped.pivot = k.pivot;
              if (k.groupQuat !== undefined) stripped.groupQuat = k.groupQuat;
              if (k.groupScale !== undefined) stripped.groupScale = k.groupScale;
              return stripped;
            }),
          };
        })
        .filter((t): t is { index: number; keyframes: Omit<Keyframe, "id">[] } => !!t);

      if (tracks.length === 0) return;

      const saved: SavedAnimation = {
        id: `anim-${Date.now()}`,
        name: name.trim() || `Animation ${state.savedAnimations.length + 1}`,
        duration: state.timeline.duration,
        tracks,
      };
      state.savedAnimations.push(saved);
    },

    // Apply a saved animation to the given target shape IDs (selection
    // order). The i-th saved track maps to the i-th target shape.
    applyAnimation: (
      state,
      action: PayloadAction<{ animationId: string; targetIds: string[] }>,
    ) => {
      const { animationId, targetIds } = action.payload;
      const saved = state.savedAnimations.find((a) => a.id === animationId);
      if (!saved) return;

      // Rewrite group selectionId to match the new target so playback
      // group-interpolation still recognises a coherent selection.
      const newSelectionId = [...targetIds].sort().join("|");
      const now = Date.now();

      saved.tracks.forEach((src) => {
        const targetId = targetIds[src.index];
        if (!targetId) return;

        // Replace any existing track for this target.
        state.timeline.tracks = state.timeline.tracks.filter(
          (t) => t.shapeId !== targetId,
        );

        const newKeyframes: Keyframe[] = src.keyframes.map((k, i) => ({
          ...k,
          id: `kf-${now}-${targetId}-${i}`,
          ...(k.selectionId !== undefined ? { selectionId: newSelectionId } : {}),
        }));

        state.timeline.tracks.push({
          shapeId: targetId,
          keyframes: newKeyframes,
        });
      });

      // Bump duration if saved animation is longer than current timeline.
      if (saved.duration > state.timeline.duration) {
        state.timeline.duration = saved.duration;
      }
    },

    deleteSavedAnimation: (state, action: PayloadAction<string>) => {
      state.savedAnimations = state.savedAnimations.filter(
        (a) => a.id !== action.payload,
      );
    },

    renameSavedAnimation: (
      state,
      action: PayloadAction<{ id: string; name: string }>,
    ) => {
      const a = state.savedAnimations.find((x) => x.id === action.payload.id);
      if (a) a.name = action.payload.name;
    },
    toggleSectionCollapsed: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.collapsedSections[id] = !state.collapsedSections[id];
    },
    setSectionCollapsed: (
      state,
      action: PayloadAction<{ id: string; collapsed: boolean }>,
    ) => {
      state.collapsedSections[action.payload.id] = action.payload.collapsed;
    },
    addImportedSvg: (state, action: PayloadAction<ImportedSvg>) => {
      state.importedSvgs.push(action.payload);
    },
    convertImportedSvgTo3D: (state, action: PayloadAction<string>) => {
      const svg = state.importedSvgs.find((s) => s.id === action.payload);
      if (!svg || svg.is3D) return;
      svg.is3D = true;
      const existingIds = new Set(state.svgShapes.map((s) => s.id));
      const newShapes = svg.shapes
        .filter((s) => !existingIds.has(s.id))
        .map((s) => ({ ...s }));
      state.svgShapes.push(...newShapes);
      state.svgFile = svg.svgText;
      state.is3DMode = true;
      state.isEditMode = false;
    },
    deleteImportedSvg: (state, action: PayloadAction<string>) => {
      const svg = state.importedSvgs.find((s) => s.id === action.payload);
      if (!svg) return;
      const wasEditing = state.isEditMode && state.svgFile === svg.svgText;
      if (svg.is3D) {
        const shapeIds = new Set(svg.shapes.map((s) => s.id));
        state.svgShapes = state.svgShapes.filter((s) => !shapeIds.has(s.id));
        state.selectedShapeIds = state.selectedShapeIds.filter(
          (id) => !shapeIds.has(id),
        );
        if (state.selectedShapeId && shapeIds.has(state.selectedShapeId)) {
          state.selectedShapeId = null;
          state.transformMode = null;
        }
        state.timeline.tracks = state.timeline.tracks.filter(
          (t) => !shapeIds.has(t.shapeId),
        );
        state.groups.forEach((g) => {
          g.shapeIds = g.shapeIds.filter((id) => !shapeIds.has(id));
        });
        state.groups = state.groups.filter((g) => g.shapeIds.length > 0);
      }
      state.importedSvgs = state.importedSvgs.filter(
        (s) => s.id !== action.payload,
      );
      if (wasEditing) {
        state.svgFile = null;
        state.isEditMode = false;
      }
      const stillHas3D = state.importedSvgs.some((s) => s.is3D);
      if (!stillHas3D && !state.isEditMode) {
        state.is3DMode = false;
        state.svgFile = null;
      }
    },
    setEditImportedSvg: (state, action: PayloadAction<string>) => {
      const svg = state.importedSvgs.find((s) => s.id === action.payload);
      if (!svg || svg.is3D) return;
      state.svgFile = svg.svgText;
      state.isEditMode = true;
      state.is3DMode = false;
      state.editingSvgId = svg.id;
    },
    saveEditedSvg: (
      state,
      action: PayloadAction<{ svgText: string; shapes: SvgShape[] }>,
    ) => {
      const editingId = state.editingSvgId;
      if (!editingId) return;
      const svg = state.importedSvgs.find((s) => s.id === editingId);
      if (!svg) return;
      svg.svgText = action.payload.svgText;
      svg.shapes = action.payload.shapes.map((s) => ({ ...s }));
      state.svgFile = action.payload.svgText;
      state.isEditMode = false;
      state.editingSvgId = null;
    },
    commitEditedSvgTo3D: (
      state,
      action: PayloadAction<{ svgText: string; shapes: SvgShape[] }>,
    ) => {
      const editingId = state.editingSvgId;
      if (!editingId) return;
      const svg = state.importedSvgs.find((s) => s.id === editingId);
      if (!svg) return;
      svg.svgText = action.payload.svgText;
      svg.shapes = action.payload.shapes.map((s) => ({ ...s }));
      svg.is3D = true;
      const existingIds = new Set(state.svgShapes.map((s) => s.id));
      const newShapes = svg.shapes
        .filter((s) => !existingIds.has(s.id))
        .map((s) => ({ ...s }));
      state.svgShapes.push(...newShapes);
      state.is3DMode = true;
      state.isEditMode = false;
      state.editingSvgId = null;
      state.svgFile = action.payload.svgText;
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
  toggleShapeVisibility,
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
  toggleGroupVisibility,
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
  updateShapesTexture,
  clearShapesTextureChannel,
  resetShapesTexture,
  restoreSnapshot,
  recordSnapshot,
  undo,
  redo,
  // UI Actions
  setShowCodeModal,
  setCodeType,
  setCopied,
  setEmbedRotate,
  setEmbedZoom,
  setEmbedPan,
  setEmbedRotateX,
  setEmbedRotateY,
  setEmbedRotateZ,
  setShowGroupDialog,
  setGroupName,
  setTimelinePlaying,
  setTimelineCurrentTime,
  setTimelineDuration,
  setTimelineLoop,
  addKeyframe,
  removeKeyframe,
  updateKeyframe,
  clearTimelineTracks,
  saveAnimation,
  applyAnimation,
  deleteSavedAnimation,
  renameSavedAnimation,
  toggleSectionCollapsed,
  setSectionCollapsed,
  addImportedSvg,
  convertImportedSvgTo3D,
  deleteImportedSvg,
  setEditImportedSvg,
  commitEditedSvgTo3D,
  saveEditedSvg,
} = sceneSlice.actions;

// --- Selectors ---
import { createSelector } from "@reduxjs/toolkit";

const selectSceneState = (state: { scene: AppState }) => state.scene;

export const selectVisibleShapes = createSelector([selectSceneState], (scene) =>
  scene.svgShapes.filter((shape) => shape.visible !== false),
);

export const selectActiveShape = createSelector([selectSceneState], (scene) =>
  scene.selectedShapeId
    ? scene.svgShapes.find((s) => s.id === scene.selectedShapeId) || null
    : null,
);

export default sceneSlice.reducer;

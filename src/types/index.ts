export type MaterialPreset =
  | "custom"
  | "plastic"
  | "metallic"
  | "matte"
  | "glass"
  | "wood"
  | "chrome"
  | "clay";

export type MaterialSettings = {
  preset: MaterialPreset;
  roughness: number;
  metalness: number;
  transmission: number;
  ior: number;
  clearcoat: number;
  emissive: string;
  emissiveIntensity: number;
};

export type SvgShape = {
  id: string;
  path: string;
  fill: string;
  stroke?: string;
  opacity?: number;
  visible?: boolean;
  shapeExtrusion?: Partial<ExtrusionSettings>;
  material?: Partial<MaterialSettings>;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
};

export type LightType = "ambient" | "directional" | "point" | "spot";

export type Light = {
  id: string;
  type: LightType;
  intensity: number;
  color: string;
  position: [number, number, number];
  enabled: boolean;
};

export type LightingPreset =
  | "three-point"
  | "high-key"
  | "low-key"
  | "soft"
  | "hard"
  | "backlighting"
  | "side-lighting"
  | "frontal"
  | "underlighting"
  | "top-lighting"
  | "silhouette"
  | "custom";

export type BackgroundType = "color" | "gradient" | "transparent" | "image";

export type Background = {
  type: BackgroundType;
  value: string;
  gradientEnd?: string;
  imageUrl?: string;
};

export type ExtrusionSettings = {
  depth: number;
  curveSegments: number;
  bevelEnabled: boolean;
  bevelThickness: number;
  bevelSize: number;
  bevelSegments: number;
};

export type SvgSelectionInfo = {
  count: number;
  firstIndex: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
};

export type GlobalTransform = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
};

export type AppState = {
  svgShapes: SvgShape[];
  svgFile: string | null;
  extrusion: ExtrusionSettings;
  globalMaterial: MaterialSettings;
  globalTransform: GlobalTransform;
  background: Background;
  lights: Light[];
  currentPreset: LightingPreset;
  is3DMode: boolean;
  isEditMode: boolean;
  showGrid: boolean;
  selectedShapeId: string | "global" | null;
  svgSelection: SvgSelectionInfo | null;
  svgFocusIndex: number | null;
  transformMode: "translate" | "rotate" | "scale" | null;
};

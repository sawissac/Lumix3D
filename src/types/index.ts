export type TextureSettings = {
  map?: string | null;
  normalMap?: string | null;
  roughnessMap?: string | null;
  metalnessMap?: string | null;
  displacementMap?: string | null;
  aoMap?: string | null;
  emissiveMap?: string | null;
  alphaMap?: string | null;
  lightMap?: string | null;
  displacementScale?: number;
  aoMapIntensity?: number;
  normalScale?: number;
  repeat?: number;
};

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

export type BackgroundType =
  | "color"
  | "gradient"
  | "radial-gradient"
  | "transparent"
  | "image";

export type Background = {
  type: BackgroundType;
  value: string;
  gradientEnd?: string;
  imageUrl?: string;
  noise?: number;
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

export type GroundSettings = {
  enabled: boolean;
  color: string;
  metalness: number;
  roughness: number;
  position: [number, number, number];
};

export type BloomSettings = {
  enabled: boolean;
  intensity: number;
  luminanceThreshold: number;
  luminanceSmoothing: number;
};

export type RotationLock = {
  x: boolean;
  y: boolean;
  z: boolean;
};

export type OrbitControlsLock = {
  rotate: boolean;
  pan: boolean;
  zoom: boolean;
  rotateX: boolean;
  rotateY: boolean;
  rotateZ: boolean;
};

export type ObjectGroup = {
  id: string;
  name: string;
  shapeIds: string[];
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
};

export type CameraState = {
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
};

export type EmbedControls = {
  enableRotate: boolean;
  enableZoom: boolean;
  enablePan: boolean;
};

export type AppState = {
  svgShapes: SvgShape[];
  svgFile: string | null;
  extrusion: ExtrusionSettings;
  globalMaterial: MaterialSettings;
  globalTexture: TextureSettings;
  globalTransform: GlobalTransform;
  background: Background;
  lights: Light[];
  currentPreset: LightingPreset;
  bloom: BloomSettings;
  ground: GroundSettings;
  is3DMode: boolean;
  isEditMode: boolean;
  showGrid: boolean;
  selectedShapeId: string | "global" | null;
  selectedShapeIds: string[];
  groups: ObjectGroup[];
  svgSelection: SvgSelectionInfo | null;
  svgFocusIndex: number | null;
  transformMode: "translate" | "rotate" | "scale" | null;
  rotationLock: RotationLock;
  orbitControlsLock: OrbitControlsLock;
  isBoxSelecting: boolean;
  cameraState?: CameraState;
  embedControls?: EmbedControls;
};

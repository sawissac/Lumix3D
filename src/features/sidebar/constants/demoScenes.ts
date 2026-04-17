import {
  ExtrusionSettings,
  Light,
  MaterialSettings,
  Background,
  LightingPreset,
} from "@/types";

export type DemoScene = {
  id: string;
  name: string;
  color: string;
  svgContent: string;
  extrusion: ExtrusionSettings;
  material: MaterialSettings;
  background: Background;
  lights: Light[];
  lightingPreset: LightingPreset;
  rotation: [number, number, number];
};

const SIDEBAR_APP_ICON_EXTRUSION: ExtrusionSettings = {
  depth: 1,
  curveSegments: 32,
  bevelEnabled: true,
  bevelThickness: 2,
  bevelSize: 1.5,
  bevelSegments: 6,
};

const SIDEBAR_APP_ICON_MATERIAL: MaterialSettings = {
  preset: "plastic",
  roughness: 0.15,
  metalness: 0.0,
  transmission: 0,
  ior: 1.5,
  clearcoat: 1.0,
  emissive: "#000000",
  emissiveIntensity: 0,
};

const SIDEBAR_APP_ICON_LIGHTS: Light[] = [
  {
    id: "key-light",
    type: "directional",
    intensity: 1.8,
    color: "#ffffff",
    position: [5, 8, 5],
    enabled: true,
  },
  {
    id: "fill-light",
    type: "directional",
    intensity: 0.6,
    color: "#ffffff",
    position: [-4, 3, 4],
    enabled: true,
  },
  {
    id: "rim-light",
    type: "directional",
    intensity: 0.4,
    color: "#ffffff",
    position: [0, 5, -5],
    enabled: true,
  },
  {
    id: "ambient",
    type: "ambient",
    intensity: 0.4,
    color: "#ffffff",
    position: [0, 0, 0],
    enabled: true,
  },
];

// Isometric-style tilt: tilt top forward, rotate left
const SIDEBAR_APP_ICON_ROTATION: [number, number, number] = [-0.45, 0.55, -0.1];

// Paw-specific settings for smooth, rounded appearance
const SIDEBAR_PAW_EXTRUSION: ExtrusionSettings = {
  depth: 1,
  curveSegments: 48,
  bevelEnabled: true,
  bevelThickness: 3,
  bevelSize: 2.5,
  bevelSegments: 12,
};

const SIDEBAR_PAW_MATERIAL: MaterialSettings = {
  preset: "plastic",
  roughness: 0.08,
  metalness: 0.0,
  transmission: 0,
  ior: 1.5,
  clearcoat: 1.0,
  emissive: "#000000",
  emissiveIntensity: 0,
};

const SIDEBAR_PAW_LIGHTS: Light[] = [
  {
    id: "key-light",
    type: "directional",
    intensity: 1.6,
    color: "#ffffff",
    position: [6, 8, 6],
    enabled: true,
  },
  {
    id: "fill-light",
    type: "directional",
    intensity: 0.8,
    color: "#ffffff",
    position: [-4, 4, 5],
    enabled: true,
  },
  {
    id: "rim-light",
    type: "directional",
    intensity: 0.5,
    color: "#ffffff",
    position: [0, 5, -6],
    enabled: true,
  },
  {
    id: "ambient",
    type: "ambient",
    intensity: 0.5,
    color: "#ffffff",
    position: [0, 0, 0],
    enabled: true,
  },
];

export const SIDEBAR_DEMO_SCENES: DemoScene[] = [
  {
    id: "bolt",
    name: "Bolt",
    color: "#f53d5b",
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f53d5b">
  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
</svg>`,
    extrusion: SIDEBAR_APP_ICON_EXTRUSION,
    material: SIDEBAR_APP_ICON_MATERIAL,
    background: { type: "color", value: "#c02040" },
    lights: SIDEBAR_APP_ICON_LIGHTS,
    lightingPreset: "custom",
    rotation: SIDEBAR_APP_ICON_ROTATION,
  },
  {
    id: "star",
    name: "Star",
    color: "#1d9bf0",
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1d9bf0">
  <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>
</svg>`,
    extrusion: SIDEBAR_APP_ICON_EXTRUSION,
    material: SIDEBAR_APP_ICON_MATERIAL,
    background: { type: "color", value: "#1065a8" },
    lights: SIDEBAR_APP_ICON_LIGHTS,
    lightingPreset: "custom",
    rotation: SIDEBAR_APP_ICON_ROTATION,
  },
  {
    id: "chat",
    name: "Chat",
    color: "#9b59b6",
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9b59b6">
  <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/>
</svg>`,
    extrusion: SIDEBAR_APP_ICON_EXTRUSION,
    material: SIDEBAR_APP_ICON_MATERIAL,
    background: { type: "color", value: "#6b3a8a" },
    lights: SIDEBAR_APP_ICON_LIGHTS,
    lightingPreset: "custom",
    rotation: SIDEBAR_APP_ICON_ROTATION,
  },
  {
    id: "paw",
    name: "Paw",
    color: "#1abc9c",
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1abc9c">
  <circle cx="11" cy="4" r="2" fill="#1abc9c"/>
  <circle cx="18" cy="8" r="2" fill="#1abc9c"/>
  <circle cx="20" cy="16" r="2" fill="#1abc9c"/>
  <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" fill="#1abc9c"/>
</svg>`,
    extrusion: SIDEBAR_PAW_EXTRUSION,
    material: SIDEBAR_PAW_MATERIAL,
    background: { type: "color", value: "#1abc9c" },
    lights: SIDEBAR_PAW_LIGHTS,
    lightingPreset: "custom",
    rotation: SIDEBAR_APP_ICON_ROTATION,
  },
];

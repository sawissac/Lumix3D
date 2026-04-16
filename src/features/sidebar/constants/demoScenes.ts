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

const APP_ICON_EXTRUSION: ExtrusionSettings = {
  depth: 8,
  curveSegments: 32,
  bevelEnabled: true,
  bevelThickness: 2,
  bevelSize: 1.5,
  bevelSegments: 6,
};

const APP_ICON_MATERIAL: MaterialSettings = {
  preset: "plastic",
  roughness: 0.15,
  metalness: 0.0,
  transmission: 0,
  ior: 1.5,
  clearcoat: 1.0,
  emissive: "#000000",
  emissiveIntensity: 0,
};

const APP_ICON_LIGHTS: Light[] = [
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
const APP_ICON_ROTATION: [number, number, number] = [-0.45, 0.55, -0.1];

export const demoScenes: DemoScene[] = [
  {
    id: "bolt",
    name: "Bolt",
    color: "#f53d5b",
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect x="8" y="8" width="184" height="184" rx="44" ry="44" fill="#f53d5b"/>
  <polygon points="114,22 68,108 100,108 84,178 148,82 112,82" fill="white"/>
</svg>`,
    extrusion: APP_ICON_EXTRUSION,
    material: APP_ICON_MATERIAL,
    background: { type: "color", value: "#c02040" },
    lights: APP_ICON_LIGHTS,
    lightingPreset: "custom",
    rotation: APP_ICON_ROTATION,
  },
  {
    id: "star",
    name: "Star",
    color: "#1d9bf0",
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect x="8" y="8" width="184" height="184" rx="44" ry="44" fill="#1d9bf0"/>
  <path d="M100 35 L112 72 L152 72 L120 95 L133 133 L100 110 L67 133 L80 95 L48 72 L88 72 Z" fill="white"/>
</svg>`,
    extrusion: APP_ICON_EXTRUSION,
    material: APP_ICON_MATERIAL,
    background: { type: "color", value: "#1065a8" },
    lights: APP_ICON_LIGHTS,
    lightingPreset: "custom",
    rotation: APP_ICON_ROTATION,
  },
  {
    id: "chat",
    name: "Chat",
    color: "#9b59b6",
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect x="8" y="8" width="184" height="184" rx="44" ry="44" fill="#9b59b6"/>
  <path d="M45 65 Q45 45 65 45 L135 45 Q155 45 155 65 L155 115 Q155 135 135 135 L95 135 L70 160 L70 135 L65 135 Q45 135 45 115 Z" fill="white"/>
</svg>`,
    extrusion: APP_ICON_EXTRUSION,
    material: APP_ICON_MATERIAL,
    background: { type: "color", value: "#6b3a8a" },
    lights: APP_ICON_LIGHTS,
    lightingPreset: "custom",
    rotation: APP_ICON_ROTATION,
  },
  {
    id: "music",
    name: "Music",
    color: "#1abc9c",
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect x="8" y="8" width="184" height="184" rx="44" ry="44" fill="#1abc9c"/>
  <ellipse cx="82" cy="148" rx="22" ry="17" fill="white"/>
  <rect x="100" y="55" width="10" height="96" fill="white"/>
  <path d="M110 55 Q158 72 148 115 Q136 92 110 92 Z" fill="white"/>
</svg>`,
    extrusion: APP_ICON_EXTRUSION,
    material: APP_ICON_MATERIAL,
    background: { type: "color", value: "#0e7a60" },
    lights: APP_ICON_LIGHTS,
    lightingPreset: "custom",
    rotation: APP_ICON_ROTATION,
  },
];

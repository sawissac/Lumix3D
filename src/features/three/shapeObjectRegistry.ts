import * as THREE from "three";

/**
 * Module-level registry mapping shape IDs to their Three.js Group objects.
 * Used by box-select to read world positions outside the R3F render tree.
 */
export const shapeObjectRegistry = new Map<string, THREE.Object3D>();

export const cameraRef = { current: null as THREE.Camera | null };
export const canvasElementRef = {
  current: null as HTMLCanvasElement | null,
};

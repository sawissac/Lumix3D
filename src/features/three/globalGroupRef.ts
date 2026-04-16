import * as THREE from "three";

/**
 * Mutable ref shared between ExtrudedSVG (writer) and TransformTracker (reader).
 * Not React state — always holds the current Three.js Group instance.
 */
export const globalGroupRef = { current: null as THREE.Group | null };

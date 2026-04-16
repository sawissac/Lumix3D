/**
 * Module-level mutable store for the live global object transform.
 * Written every frame by ExtrudedSVG via useFrame.
 * Read every frame by TransformLog via requestAnimationFrame.
 * No Redux, no re-renders — pure direct update.
 */
export const liveTransform = {
  position: [0, 0, 0] as [number, number, number],
  rotation: [0, 0, 0] as [number, number, number],
  scale:    [1, 1, 1] as [number, number, number],
};

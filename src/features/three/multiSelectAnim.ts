import * as THREE from "three";

export type MultiSelectAnimState = {
  selectionId: string;
  pivot: [number, number, number];
  quat: [number, number, number, number];
  scale: [number, number, number];
  // Unwrapped Euler (XYZ) mirroring `quat` with winding preserved.
  // applyDeltaQuat updates this by deriving Euler from the new quat and
  // unwrapping each component relative to the previous value, so multi-turn
  // gestures (>180° per axis) survive into keyframes for proper lerp playback.
  eulerUnwrapped: [number, number, number];
};

export const multiSelectAnimRef: { current: MultiSelectAnimState | null } = {
  current: null,
};

export function selectionIdFromIds(ids: readonly string[]): string {
  return [...ids].sort().join("|");
}

type PivotInput = THREE.Vector3 | readonly [number, number, number];

function pivotToTuple(p: PivotInput): [number, number, number] {
  if (Array.isArray(p)) return [p[0], p[1], p[2]];
  const v = p as THREE.Vector3;
  return [v.x, v.y, v.z];
}

export function bindMultiSelect(
  ids: readonly string[],
  pivot: PivotInput,
): void {
  multiSelectAnimRef.current = {
    selectionId: selectionIdFromIds(ids),
    pivot: pivotToTuple(pivot),
    quat: [0, 0, 0, 1],
    scale: [1, 1, 1],
    eulerUnwrapped: [0, 0, 0],
  };
}

export function ensureBound(
  ids: readonly string[],
  pivot: PivotInput,
): void {
  const id = selectionIdFromIds(ids);
  if (!multiSelectAnimRef.current || multiSelectAnimRef.current.selectionId !== id) {
    bindMultiSelect(ids, pivot);
  }
}

// Refresh the stored pivot without resetting the accumulated rotation quat.
// Called when adding a keyframe so the saved pivot reflects the current group
// center (which may have shifted due to translate gestures since the bind).
export function updatePivot(ids: readonly string[], pivot: PivotInput): void {
  const id = selectionIdFromIds(ids);
  const cur = multiSelectAnimRef.current;
  if (cur && cur.selectionId === id) {
    cur.pivot = pivotToTuple(pivot);
  }
}

const _scratchEuler = new THREE.Euler(0, 0, 0, "XYZ");

function unwrapAngle(prev: number, next: number): number {
  let diff = next - prev;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  return prev + diff;
}

export function applyDeltaQuat(delta: THREE.Quaternion): void {
  const cur = multiSelectAnimRef.current;
  if (!cur) return;
  const accum = new THREE.Quaternion(cur.quat[0], cur.quat[1], cur.quat[2], cur.quat[3]);
  accum.premultiply(delta);
  accum.normalize();
  cur.quat = [accum.x, accum.y, accum.z, accum.w];
  _scratchEuler.setFromQuaternion(accum, "XYZ");
  cur.eulerUnwrapped = [
    unwrapAngle(cur.eulerUnwrapped[0], _scratchEuler.x),
    unwrapAngle(cur.eulerUnwrapped[1], _scratchEuler.y),
    unwrapAngle(cur.eulerUnwrapped[2], _scratchEuler.z),
  ];
}

// Multiplicative per-axis scale accumulation. delta = currentGroupScale / initialGroupScale.
export function applyDeltaScale(delta: readonly [number, number, number]): void {
  const cur = multiSelectAnimRef.current;
  if (!cur) return;
  cur.scale = [
    cur.scale[0] * delta[0],
    cur.scale[1] * delta[1],
    cur.scale[2] * delta[2],
  ];
}

export function resetMultiSelectAnim(): void {
  multiSelectAnimRef.current = null;
}

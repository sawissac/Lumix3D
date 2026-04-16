"use client";

import { useFrame } from "@react-three/fiber";
import { globalGroupRef } from "../globalGroupRef";
import { liveTransform } from "../liveTransform";

export function TransformTracker() {
  useFrame(() => {
    const obj = globalGroupRef.current;
    if (!obj) return;
    liveTransform.position = [obj.position.x, obj.position.y, obj.position.z];
    liveTransform.rotation = [obj.rotation.x, obj.rotation.y, obj.rotation.z];
    liveTransform.scale    = [obj.scale.x,    obj.scale.y,    obj.scale.z];
  });
  return null;
}

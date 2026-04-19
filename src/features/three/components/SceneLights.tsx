"use client";

import { useAppSelector } from "@/store/hooks";
import * as THREE from "three";

export function SceneLights() {
  const lights = useAppSelector((state) => state.scene.lights);
  const viewMode = useAppSelector((state) => state.scene.viewMode);

  // In solid/wireframe mode: replace all lighting with a neutral full-intensity ambient
  // so objects show their flat color with no highlights or shadows.
  if (viewMode !== "normal") {
    return <ambientLight intensity={2} color="#ffffff" />;
  }

  return (
    <>
      {lights.map((light) => {
        if (!light.enabled) return null;

        const color = new THREE.Color(light.color);

        switch (light.type) {
          case "ambient":
            return (
              <ambientLight
                key={light.id}
                intensity={light.intensity}
                color={color}
              />
            );
          case "directional":
            return (
              <directionalLight
                key={light.id}
                position={light.position}
                intensity={light.intensity}
                color={color}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-bias={-0.0005}
              >
                <orthographicCamera
                  attach="shadow-camera"
                  args={[-20, 20, 20, -20, 0.1, 100]}
                />
              </directionalLight>
            );
          case "point":
            return (
              <pointLight
                key={light.id}
                position={light.position}
                intensity={light.intensity}
                color={color}
                castShadow
                shadow-bias={-0.0005}
              />
            );
          case "spot":
            return (
              <spotLight
                key={light.id}
                position={light.position}
                intensity={light.intensity}
                color={color}
                castShadow
                shadow-bias={-0.0005}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}

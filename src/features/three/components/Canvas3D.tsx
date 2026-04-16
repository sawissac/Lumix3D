"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import { useAppSelector } from "@/store/hooks";
import { ExtrudedSVG } from "./ExtrudedSVG";
import { SceneLights } from "./SceneLights";
import * as THREE from "three";

export function Canvas3D() {
  const background = useAppSelector((state) => state.scene.background);
  const is3DMode = useAppSelector((state) => state.scene.is3DMode);
  const showGrid = useAppSelector((state) => state.scene.showGrid);

  const getBackgroundStyle = () => {
    switch (background.type) {
      case "color":
        return { background: background.value };
      case "gradient":
        return {
          background: `linear-gradient(to bottom, ${background.value}, ${
            background.gradientEnd || "#000000"
          })`,
        };
      case "image":
        return {
          background: `url(${background.imageUrl}) center/cover no-repeat`,
        };
      case "transparent":
      default:
        return { background: "transparent" };
    }
  };

  if (!is3DMode) {
    return null;
  }

  return (
    <div className="w-full h-full" style={getBackgroundStyle()}>
      <Canvas
        camera={{ position: [0, 0, 50], fov: 50 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true }}
        shadows={{ type: THREE.PCFShadowMap }}
      >
        <SceneLights />
        <ExtrudedSVG />
        {showGrid && (
          <Grid
            args={[100, 100]}
            position={[0, 0, -1]}
            rotation={[Math.PI / 2, 0, 0]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#6f6f6f"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#9d4b4b"
            fadeDistance={100}
            fadeStrength={1}
          />
        )}
        <OrbitControls
          makeDefault
          enablePan
          enableZoom
          enableRotate
          zoomSpeed={0.4}
        />
      </Canvas>
    </div>
  );
}

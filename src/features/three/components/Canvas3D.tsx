"use client";

import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setTransformMode, clearSelection } from "@/store/slices/sceneSlice";
import { ExtrudedSVG } from "./ExtrudedSVG";
import { SceneLights } from "./SceneLights";
import { RotationLockToolbar } from "./RotationLockToolbar";
import { OrbitControlsLockToolbar } from "./OrbitControlsLockToolbar";
import { SelectionHint } from "./SelectionHint";
import { GroupManager } from "./GroupManager";
import * as THREE from "three";
import { globalGroupRef } from "../globalGroupRef";
import { liveTransform } from "../liveTransform";

// Runs inside <Canvas> — writes the live group transform every frame
function TransformTracker() {
  useFrame(() => {
    const o = globalGroupRef.current;
    if (!o) return;
    liveTransform.position = [o.position.x, o.position.y, o.position.z];
    liveTransform.rotation = [o.rotation.x, o.rotation.y, o.rotation.z];
    liveTransform.scale = [o.scale.x, o.scale.y, o.scale.z];
  });
  return null;
}

export function Canvas3D() {
  const dispatch = useAppDispatch();
  const background = useAppSelector((state) => state.scene.background);
  const is3DMode = useAppSelector((state) => state.scene.is3DMode);
  const showGrid = useAppSelector((state) => state.scene.showGrid);
  const bloom = useAppSelector((state) => state.scene.bloom);
  const ground = useAppSelector((state) => state.scene.ground);
  const selectedShapeIds = useAppSelector(
    (state) => state.scene.selectedShapeIds,
  );
  const transformMode = useAppSelector((state) => state.scene.transformMode);
  const orbitControlsLock = useAppSelector(
    (state) => state.scene.orbitControlsLock,
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orbitControlsRef = useRef<any>(null);
  const lockedAnglesRef = useRef({ polar: 0, azimuth: 0 });

  useEffect(() => {
    if (orbitControlsRef.current) {
      const controls = orbitControlsRef.current;

      if (orbitControlsLock.rotateX) {
        lockedAnglesRef.current.polar = controls.getPolarAngle();
        controls.minPolarAngle = lockedAnglesRef.current.polar;
        controls.maxPolarAngle = lockedAnglesRef.current.polar;
      } else {
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI;
      }

      if (orbitControlsLock.rotateY) {
        lockedAnglesRef.current.azimuth = controls.getAzimuthalAngle();
        controls.minAzimuthAngle = lockedAnglesRef.current.azimuth;
        controls.maxAzimuthAngle = lockedAnglesRef.current.azimuth;
      } else {
        controls.minAzimuthAngle = -Infinity;
        controls.maxAzimuthAngle = Infinity;
      }
    }
  }, [orbitControlsLock.rotateX, orbitControlsLock.rotateY]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedShapeIds.length === 0) return;

      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      switch (e.key.toLowerCase()) {
        case "g":
          e.preventDefault();
          dispatch(
            setTransformMode(
              transformMode === "translate" ? null : "translate",
            ),
          );
          break;
        case "r":
          e.preventDefault();
          dispatch(
            setTransformMode(transformMode === "rotate" ? null : "rotate"),
          );
          break;
        case "s":
          e.preventDefault();
          dispatch(
            setTransformMode(transformMode === "scale" ? null : "scale"),
          );
          break;
        case "escape":
          e.preventDefault();
          dispatch(clearSelection());
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, selectedShapeIds, transformMode]);

  const getBackgroundStyle = (): React.CSSProperties => {
    switch (background.type) {
      case "color":
        return { background: background.value };
      case "gradient":
        return {
          background: `linear-gradient(to bottom, ${background.value}, ${
            background.gradientEnd || "#000000"
          })`,
        };
      case "radial-gradient":
        return {
          background: `radial-gradient(circle at center, ${background.value}, ${
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

  if (!is3DMode) return null;

  return (
    <div className="w-full h-full relative" style={getBackgroundStyle()}>
      {/* Noise overlay */}
      {(background.noise ?? 0) > 0 && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            opacity: background.noise,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            mixBlendMode: "overlay",
          }}
        />
      )}
      <Canvas
        camera={{ position: [0, 0, 50], fov: 50 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true }}
        shadows={{ type: THREE.PCFShadowMap }}
      >
        <SceneLights />
        <ExtrudedSVG />
        <TransformTracker />
        {showGrid && (
          <Grid
            args={[100, 100]}
            position={[0, 0, -20]}
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

        {ground.enabled && (
          <ContactShadows
            position={ground.position}
            opacity={ground.metalness}
            scale={100}
            blur={ground.roughness * 10}
            far={20}
            color={ground.color}
            resolution={512}
          />
        )}

        {bloom.enabled && (
          <EffectComposer>
            <Bloom
              luminanceThreshold={bloom.luminanceThreshold}
              mipmapBlur
              luminanceSmoothing={bloom.luminanceSmoothing}
              intensity={bloom.intensity}
            />
          </EffectComposer>
        )}
        <OrbitControls
          ref={orbitControlsRef}
          makeDefault
          enablePan={!orbitControlsLock.pan}
          enableZoom={!orbitControlsLock.zoom}
          enableRotate={!orbitControlsLock.rotate}
          zoomSpeed={0.4}
        />
      </Canvas>
      <SelectionHint />
      <GroupManager />
      <RotationLockToolbar />
      <OrbitControlsLockToolbar />
    </div>
  );
}

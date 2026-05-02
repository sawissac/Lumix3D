"use client";

import React, { useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Grid,
  ContactShadows,
  Stats,
  GizmoHelper,
  GizmoViewport,
} from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  setTransformMode,
  clearSelection,
  selectAllShapes,
  setBoxSelecting,
  undo,
  redo,
} from "@/store/slices/sceneSlice";
import { ExtrudedSVG } from "./ExtrudedSVG";
import { SceneLights } from "./SceneLights";
import { RotationLockToolbar } from "./RotationLockToolbar";
import { OrbitControlsLockToolbar } from "./OrbitControlsLockToolbar";
import { SelectionHint } from "./SelectionHint";
import { GroupManager } from "./GroupManager";
import * as THREE from "three";
import { globalGroupRef } from "../globalGroupRef";
import { liveTransform } from "../liveTransform";
import {
  cameraRef,
  canvasElementRef,
  shapeObjectRegistry,
} from "../shapeObjectRegistry";
import { BoxSelectOverlay } from "./BoxSelectOverlay";
import { TimelinePlayer } from "./TimelinePlayer";
import { usePathname } from "next/navigation";

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

// Captures the active camera and canvas element for the box-select overlay,
// which lives outside the R3F tree and can't use hooks to reach them.
function CanvasRefsCapture() {
  const { camera, gl } = useThree();
  useEffect(() => {
    cameraRef.current = camera;
    canvasElementRef.current = gl.domElement;
    return () => {
      if (cameraRef.current === camera) cameraRef.current = null;
      if (canvasElementRef.current === gl.domElement)
        canvasElementRef.current = null;
    };
  }, [camera, gl]);
  return null;
}

// Handles camera restoration and locks inside the R3F context
function CameraController({
  controlsRef,
  cameraState,
  orbitControlsLock,
  isEmbedMode,
  embedRotateX,
  embedRotateY,
}: {
  controlsRef: React.MutableRefObject<any>;
  cameraState: any;
  orbitControlsLock: any;
  isEmbedMode: boolean;
  embedRotateX: boolean;
  embedRotateY: boolean;
}) {
  const { camera } = useThree();

  useEffect(() => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;

    if (cameraState) {
      const { position, target } = cameraState;
      camera.position.set(position[0], position[1], position[2]);
      controls.target.set(target[0], target[1], target[2]);
      controls.update();
    }

    const isRotateXLocked = isEmbedMode
      ? !embedRotateX
      : orbitControlsLock.rotateX;
    if (isRotateXLocked) {
      const polar = controls.getPolarAngle();
      controls.minPolarAngle = polar;
      controls.maxPolarAngle = polar;
    } else {
      controls.minPolarAngle = 0;
      controls.maxPolarAngle = Math.PI;
    }

    const isRotateYLocked = isEmbedMode
      ? !embedRotateY
      : orbitControlsLock.rotateY;
    if (isRotateYLocked) {
      const azimuth = controls.getAzimuthalAngle();
      controls.minAzimuthAngle = azimuth;
      controls.maxAzimuthAngle = azimuth;
    } else {
      controls.minAzimuthAngle = -Infinity;
      controls.maxAzimuthAngle = Infinity;
    }
  }, [
    camera,
    controlsRef,
    cameraState,
    orbitControlsLock.rotateX,
    orbitControlsLock.rotateY,
    isEmbedMode,
    embedRotateX,
    embedRotateY,
  ]);

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
  const isBoxSelecting = useAppSelector((state) => state.scene.isBoxSelecting);
  const svgShapes = useAppSelector((state) => state.scene.svgShapes);
  const viewMode = useAppSelector((state) => state.scene.viewMode);

  const orbitControlsRef = useRef<any>(null);
  const lockedAnglesRef = useRef({ polar: 0, azimuth: 0 });
  const cameraState = useAppSelector((state) => state.scene.cameraState);
  const embedControls = useAppSelector((state) => state.scene.embedControls);
  const pathname = usePathname();

  // Check if we're in embed mode (iframe or direct /embed route)
  const isEmbedMode =
    (typeof window !== "undefined" && window.self !== window.top) ||
    pathname === "/embed";

  // Default embed controls: rotation enabled, zoom and pan disabled
  const embedRotate = embedControls?.enableRotate ?? true;
  const embedZoom = embedControls?.enableZoom ?? false;
  const embedPan = embedControls?.enablePan ?? false;
  const embedRotateX = embedControls?.enableRotateX ?? true;
  const embedRotateY = embedControls?.enableRotateY ?? true;

  // Re-target OrbitControls to AABB center of selection (or all visible
  // shapes when nothing selected) so camera orbits around the visual center
  // instead of world origin.
  useEffect(() => {
    const controls = orbitControlsRef.current;
    if (!controls) return;

    const ids =
      selectedShapeIds.length > 0
        ? selectedShapeIds
        : svgShapes.filter((s) => s.visible !== false).map((s) => s.id);

    if (ids.length === 0) return;

    const box = new THREE.Box3();
    const tmp = new THREE.Box3();
    for (const id of ids) {
      const obj = shapeObjectRegistry.get(id);
      if (!obj) continue;
      obj.updateMatrixWorld(true);
      tmp.setFromObject(obj);
      if (!tmp.isEmpty()) box.union(tmp);
    }

    if (!box.isEmpty()) {
      const center = box.getCenter(new THREE.Vector3());
      controls.target.copy(center);
      controls.update();
    }
  }, [selectedShapeIds, svgShapes]);

  useEffect(() => {
    // Expose a way for ProjectActions to get the current camera state
    // @ts-expect-error augmenting window for project actions
    window.getLumixCameraState = () => {
      if (cameraRef.current && orbitControlsRef.current) {
        const pos = cameraRef.current.position;
        const tgt = orbitControlsRef.current.target;
        return {
          position: [pos.x, pos.y, pos.z] as [number, number, number],
          target: [tgt.x, tgt.y, tgt.z] as [number, number, number],
          zoom: pos.distanceTo(tgt),
        };
      }
      return undefined;
    };
    return () => {
      // @ts-expect-error cleanup window augmentation
      delete window.getLumixCameraState;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      // Disable keyboard shortcuts if in embed mode
      if (isEmbedMode) return;

      const key = e.key.toLowerCase();

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          dispatch(redo());
        } else {
          dispatch(undo());
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && key === "y") {
        e.preventDefault();
        dispatch(redo());
        return;
      }

      // Selection shortcuts — available even with no current selection.
      if (key === "a") {
        if (svgShapes.length === 0) return;
        e.preventDefault();
        if (e.altKey) {
          dispatch(clearSelection());
        } else {
          dispatch(selectAllShapes());
        }
        return;
      }
      if (key === "b") {
        if (svgShapes.length === 0) return;
        e.preventDefault();
        dispatch(setBoxSelecting(!isBoxSelecting));
        return;
      }
      if (key === "escape") {
        e.preventDefault();
        if (isBoxSelecting) {
          dispatch(setBoxSelecting(false));
        } else {
          dispatch(clearSelection());
        }
        return;
      }

      // Transform shortcuts — require a selection.
      if (selectedShapeIds.length === 0) return;
      switch (key) {
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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    dispatch,
    selectedShapeIds,
    transformMode,
    isBoxSelecting,
    svgShapes.length,
  ]);

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
        frameloop="demand"
        dpr={[1, 2]}
        camera={{ position: [0, 0, 100], fov: 50 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true }}
        shadows={{ type: THREE.PCFShadowMap }}
      >
        <SceneLights />
        <ExtrudedSVG />
        <TransformTracker />
        <CanvasRefsCapture />
        <CameraController
          controlsRef={orbitControlsRef}
          cameraState={cameraState}
          orbitControlsLock={orbitControlsLock}
          isEmbedMode={isEmbedMode}
          embedRotateX={embedRotateX}
          embedRotateY={embedRotateY}
        />
        <TimelinePlayer />

        {showGrid && (
          <Grid
            position={[0, 0, -20]}
            rotation={[Math.PI / 2, 0, 0]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#6f6f6f"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#9d4b4b"
            fadeDistance={200}
            fadeStrength={1}
            infiniteGrid
            followCamera
          />
        )}

        {ground.enabled && viewMode === "normal" && (
          <ContactShadows
            position={ground.position}
            opacity={ground.metalness}
            scale={400}
            blur={ground.roughness * 10}
            far={20}
            color={ground.color}
            resolution={2048}
          />
        )}

        {bloom.enabled && viewMode === "normal" && (
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
          enablePan={isEmbedMode ? embedPan : !orbitControlsLock.pan}
          enableZoom={isEmbedMode ? embedZoom : !orbitControlsLock.zoom}
          enableRotate={isEmbedMode ? embedRotate : !orbitControlsLock.rotate}
          zoomSpeed={0.4}
        />

        {!isEmbedMode && (
          <GizmoHelper alignment="top-right" margin={[60, 60]}>
            <GizmoViewport
              axisColors={["#ff3653", "#8adb00", "#2c8fff"]}
              labelColor="#ffffff"
            />
          </GizmoHelper>
        )}
      </Canvas>
      {/* Hide UI overlays if in embed mode */}
      {!isEmbedMode && (
        <>
          <BoxSelectOverlay />
          <SelectionHint />
          <GroupManager />
          <RotationLockToolbar />
          <OrbitControlsLockToolbar />
        </>
      )}
    </div>
  );
}

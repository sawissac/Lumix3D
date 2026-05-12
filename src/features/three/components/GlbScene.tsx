"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  toggleShapeSelection,
  updateGlbObjectTransform,
  recordSnapshot,
  clearSelection,
} from "@/store/slices/sceneSlice";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { TransformControls } from "@react-three/drei";
import {
  ThreeEvent,
  createPortal,
  useThree,
} from "@react-three/fiber";
import { GlbObject, ImportedGlb, ViewMode } from "@/types";
import { shapeObjectRegistry } from "../shapeObjectRegistry";

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

type GlbMeshProps = {
  obj: GlbObject;
  glb: ImportedGlb;
  isSelected: boolean;
  viewMode: ViewMode;
  transformMode: "translate" | "rotate" | "scale" | null;
  rotationLock: { x: boolean; y: boolean; z: boolean };
  onSelect: () => void;
};

function GlbMesh({
  obj,
  glb,
  isSelected,
  viewMode,
  transformMode,
  rotationLock,
  onSelect,
}: GlbMeshProps) {
  const dispatch = useAppDispatch();
  const { scene } = useThree();
  const [groupObj, setGroupObj] = useState<THREE.Group | null>(null);
  const [loaded, setLoaded] = useState<THREE.Group | null>(null);
  const originalMaterialsRef = useRef<Map<THREE.Mesh, THREE.Material | THREE.Material[]>>(
    new Map(),
  );

  // Parse the GLB buffer once per glb.data change
  useEffect(() => {
    let cancelled = false;
    let parsedScene: THREE.Group | null = null;
    const matsCaptured = originalMaterialsRef.current;
    try {
      const loader = new GLTFLoader();
      const buffer = base64ToArrayBuffer(glb.data);
      loader.parse(
        buffer,
        "",
        (gltf) => {
          if (cancelled) return;
          parsedScene = gltf.scene;
          // Auto-scale to fit in roughly the same 30-unit range as SVG shapes
          const box = new THREE.Box3().setFromObject(parsedScene);
          if (!box.isEmpty()) {
            const size = box.getSize(new THREE.Vector3());
            const maxSize = Math.max(size.x, size.y, size.z);
            if (maxSize > 0) {
              const fitScale = 30 / maxSize;
              parsedScene.scale.multiplyScalar(fitScale);
            }
            const center = box.getCenter(new THREE.Vector3());
            parsedScene.position.sub(center.multiplyScalar(parsedScene.scale.x));
          }
          parsedScene.traverse((node) => {
            if ((node as THREE.Mesh).isMesh) {
              const mesh = node as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              matsCaptured.set(mesh, mesh.material);
            }
          });
          setLoaded(parsedScene);
        },
        () => {
          // parse error — leave unloaded
        },
      );
    } catch {
      // ignore
    }
    return () => {
      cancelled = true;
      if (parsedScene) {
        parsedScene.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            const mesh = node as THREE.Mesh;
            mesh.geometry?.dispose();
          }
        });
      }
      matsCaptured.clear();
    };
  }, [glb.data]);

  // Register with shape registry for box-select + camera fit
  useEffect(() => {
    if (!groupObj) return;
    shapeObjectRegistry.set(obj.id, groupObj);
    return () => {
      if (shapeObjectRegistry.get(obj.id) === groupObj) {
        shapeObjectRegistry.delete(obj.id);
      }
    };
  }, [groupObj, obj.id]);

  // Sync transform from store
  useEffect(() => {
    if (!groupObj) return;
    if (obj.position) groupObj.position.set(...obj.position);
    if (obj.rotation) groupObj.rotation.set(...obj.rotation);
    if (obj.scale) groupObj.scale.set(...obj.scale);
  }, [obj.position, obj.rotation, obj.scale, groupObj]);

  // Apply view mode + material overrides to embedded meshes
  useEffect(() => {
    if (!loaded) return;
    loaded.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh) return;
      const original = originalMaterialsRef.current.get(mesh);
      const applyTo = (mat: THREE.Material) => {
        const m = mat as THREE.MeshStandardMaterial;
        if (viewMode === "wireframe") {
          m.wireframe = true;
        } else {
          m.wireframe = false;
        }
        if (obj.material) {
          if (typeof obj.material.roughness === "number")
            m.roughness = obj.material.roughness;
          if (typeof obj.material.metalness === "number")
            m.metalness = obj.material.metalness;
          if (obj.material.emissive)
            m.emissive = new THREE.Color(obj.material.emissive);
          if (typeof obj.material.emissiveIntensity === "number")
            m.emissiveIntensity = obj.material.emissiveIntensity;
        }
        m.needsUpdate = true;
      };
      if (original) {
        // Reset to original first to drop stale overrides
        mesh.material = Array.isArray(original)
          ? original.map((m) => m.clone())
          : original.clone();
      }
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(applyTo);
      } else if (mesh.material) {
        applyTo(mesh.material);
      }
    });
  }, [loaded, viewMode, obj.material]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    const isEmbedMode =
      typeof window !== "undefined" && window.self !== window.top;
    if (isEmbedMode) return;
    e.stopPropagation();
    onSelect();
  };

  return (
    <>
      <group ref={setGroupObj} onClick={handleClick}>
        {loaded && <primitive object={loaded} />}
      </group>
      {isSelected &&
        transformMode &&
        groupObj &&
        createPortal(
          <TransformControls
            object={groupObj}
            mode={transformMode}
            showX={transformMode === "rotate" ? !rotationLock.x : true}
            showY={transformMode === "rotate" ? !rotationLock.y : true}
            showZ={transformMode === "rotate" ? !rotationLock.z : true}
            onMouseDown={() => {
              dispatch(recordSnapshot());
            }}
            onMouseUp={() => {
              if (!groupObj) return;
              dispatch(
                updateGlbObjectTransform({
                  id: obj.id,
                  position: [
                    groupObj.position.x,
                    groupObj.position.y,
                    groupObj.position.z,
                  ],
                  rotation: [
                    groupObj.rotation.x,
                    groupObj.rotation.y,
                    groupObj.rotation.z,
                  ],
                  scale: [
                    groupObj.scale.x,
                    groupObj.scale.y,
                    groupObj.scale.z,
                  ],
                }),
              );
            }}
          />,
          scene,
        )}
    </>
  );
}

export function GlbScene() {
  const dispatch = useAppDispatch();
  const importedGlbs = useAppSelector((s) => s.scene.importedGlbs);
  const glbObjects = useAppSelector((s) => s.scene.glbObjects);
  const selectedShapeIds = useAppSelector((s) => s.scene.selectedShapeIds);
  const transformMode = useAppSelector((s) => s.scene.transformMode);
  const rotationLock = useAppSelector((s) => s.scene.rotationLock);
  const viewMode = useAppSelector((s) => s.scene.viewMode);

  // Quick lookup by glbId
  const glbsById = useMemo(() => {
    const map = new Map<string, ImportedGlb>();
    importedGlbs.forEach((g) => map.set(g.id, g));
    return map;
  }, [importedGlbs]);

  if (glbObjects.length === 0) return null;

  return (
    <group
      onPointerMissed={(e) => {
        if (e.type === "click") {
          const nativeEvent = e as unknown as PointerEvent;
          const isAdditive = nativeEvent.ctrlKey || nativeEvent.metaKey;
          if (!isAdditive) dispatch(clearSelection());
        }
      }}
    >
      {glbObjects.map((obj) => {
        if (obj.visible === false) return null;
        const glb = glbsById.get(obj.glbId);
        if (!glb) return null;
        const isSelected = selectedShapeIds.includes(obj.id);
        return (
          <GlbMesh
            key={obj.id}
            obj={obj}
            glb={glb}
            isSelected={isSelected}
            viewMode={viewMode}
            transformMode={
              selectedShapeIds.length > 1 ? null : transformMode
            }
            rotationLock={rotationLock}
            onSelect={() => {
              const event = window.event as MouseEvent;
              const isAdditive = event?.ctrlKey || event?.metaKey;
              dispatch(
                toggleShapeSelection({ id: obj.id, additive: isAdditive }),
              );
            }}
          />
        );
      })}
    </group>
  );
}


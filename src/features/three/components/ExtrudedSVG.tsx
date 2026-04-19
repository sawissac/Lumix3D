"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  toggleShapeSelection,
  updateShapeTransform,
  setGlobalTransform,
  clearSelection,
  recordSnapshot,
} from "@/store/slices/sceneSlice";
import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { ThreeEvent, useThree, useFrame, createPortal } from "@react-three/fiber";
import { ExtrusionSettings, SvgShape, MaterialSettings, ViewMode } from "@/types";
import { TransformControls } from "@react-three/drei";
import { globalGroupRef } from "../globalGroupRef";
import { shapeObjectRegistry } from "../shapeObjectRegistry";
import { preprocessSVGForThree } from "../utils/svgPreprocess";

type LoadedTextures = {
  map: THREE.Texture | null;
  normalMap: THREE.Texture | null;
  roughnessMap: THREE.Texture | null;
  metalnessMap: THREE.Texture | null;
  displacementMap: THREE.Texture | null;
  aoMap: THREE.Texture | null;
  emissiveMap: THREE.Texture | null;
  alphaMap: THREE.Texture | null;
  lightMap: THREE.Texture | null;
  displacementScale: number;
  aoMapIntensity: number;
  normalScale: number;
};

const NULL_TEXTURES: LoadedTextures = {
  map: null, normalMap: null, roughnessMap: null, metalnessMap: null,
  displacementMap: null, aoMap: null, emissiveMap: null, alphaMap: null, lightMap: null,
  displacementScale: 0.1, aoMapIntensity: 1, normalScale: 1,
};

type ShapeMeshesProps = {
  shapeId: string;
  singleShape: THREE.Shape;
  colorHex: string;
  shapeData: SvgShape | undefined;
  globalExtrusion: ExtrusionSettings;
  globalMaterial: MaterialSettings;
  loadedTextures: LoadedTextures;
  isSelected: boolean;
  viewMode: ViewMode;
  transformMode: "translate" | "rotate" | "scale" | null;
  rotationLock: { x: boolean; y: boolean; z: boolean };
  onSelect: () => void;
  onTransformChange: (transform: {
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
  }) => void;
};

function ShapeMeshes({
  shapeId,
  singleShape,
  colorHex,
  shapeData,
  globalExtrusion,
  globalMaterial,
  loadedTextures,
  isSelected,
  viewMode,
  transformMode,
  rotationLock,
  onSelect,
  onTransformChange,
}: ShapeMeshesProps) {
  const dispatch = useAppDispatch();
  const { scene } = useThree();
  const [groupObj, setGroupObj] = useState<THREE.Group | null>(null);
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const texApplied = useRef(false);

  const shapeExtrusion = shapeData?.shapeExtrusion;
  const extrusion = useMemo(
    () =>
      shapeExtrusion
        ? { ...globalExtrusion, ...shapeExtrusion }
        : globalExtrusion,
    [globalExtrusion, shapeExtrusion],
  );

  const materialSettings = useMemo(
    () =>
      shapeData?.material
        ? { ...globalMaterial, ...shapeData.material }
        : globalMaterial,
    [globalMaterial, shapeData],
  );

  // Reset applied flag whenever textures or viewMode change so useFrame re-applies them
  useEffect(() => {
    texApplied.current = false;
  }, [loadedTextures, viewMode]);

  // Apply inside the R3F render loop — matRef is guaranteed populated here
  useFrame(() => {
    const mat = matRef.current;
    if (!mat || texApplied.current) return;
    texApplied.current = true;
    if (viewMode !== "normal") {
      // Clear all texture slots for solid / wireframe
      mat.map = null;
      mat.normalMap = null;
      mat.roughnessMap = null;
      mat.metalnessMap = null;
      mat.displacementMap = null;
      mat.displacementScale = 0;
      mat.aoMap = null;
      mat.aoMapIntensity = 0;
      mat.emissiveMap = null;
      mat.alphaMap = null;
      mat.transparent = false;
      mat.lightMap = null;
    } else {
      mat.map = loadedTextures.map;
      mat.normalMap = loadedTextures.normalMap;
      if (mat.normalMap) mat.normalScale.set(loadedTextures.normalScale, loadedTextures.normalScale);
      mat.roughnessMap = loadedTextures.roughnessMap;
      mat.metalnessMap = loadedTextures.metalnessMap;
      mat.displacementMap = loadedTextures.displacementMap;
      mat.displacementScale = loadedTextures.displacementMap ? loadedTextures.displacementScale : 0;
      mat.aoMap = loadedTextures.aoMap;
      mat.aoMapIntensity = loadedTextures.aoMap ? loadedTextures.aoMapIntensity : 0;
      mat.emissiveMap = loadedTextures.emissiveMap;
      mat.alphaMap = loadedTextures.alphaMap;
      mat.transparent = !!loadedTextures.alphaMap;
      mat.lightMap = loadedTextures.lightMap;
    }
    mat.needsUpdate = true;
  });

  const geometry = useMemo(() => {
    const geom = new THREE.ExtrudeGeometry(singleShape, extrusion);
    geom.scale(1, -1, 1); // Flip Y to match 3D coordinate system
    geom.computeVertexNormals(); // Fix lighting normals
    // aoMap and lightMap require a second UV channel
    if (geom.attributes.uv) {
      geom.setAttribute("uv2", geom.attributes.uv);
    }
    return geom;
  }, [singleShape, extrusion]);

  // Clean up geometry when it changes
  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  // Register/unregister group with the shape registry so box-select can
  // read world positions without traversing the scene graph.
  useEffect(() => {
    if (!groupObj) return;
    shapeObjectRegistry.set(shapeId, groupObj);
    return () => {
      if (shapeObjectRegistry.get(shapeId) === groupObj) {
        shapeObjectRegistry.delete(shapeId);
      }
    };
  }, [groupObj, shapeId]);

  const defaultCenter = useMemo(() => {
    const box = new THREE.Box3();
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    if (geometry.boundingBox) box.copy(geometry.boundingBox);
    const center = new THREE.Vector3();
    if (!box.isEmpty()) {
      box.getCenter(center);
    }
    return center;
  }, [geometry]);

  const color = shapeData?.fill || colorHex || "#cccccc";

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    // Disable interactions in embed mode (iframe)
    const isEmbedMode =
      typeof window !== "undefined" && window.self !== window.top;
    if (isEmbedMode) return;

    e.stopPropagation();
    const isAdditive = e.nativeEvent.ctrlKey || e.nativeEvent.metaKey;
    if (isAdditive) {
      onSelect();
    } else {
      onSelect();
    }
  };

  const didInitPositionRef = useRef(false);

  // Sync group transform with store on mount or prop change
  useEffect(() => {
    if (groupObj) {
      if (shapeData?.position) {
        groupObj.position.set(...shapeData.position);
      } else {
        groupObj.position.copy(defaultCenter);
      }

      if (shapeData?.rotation) {
        groupObj.rotation.set(...shapeData.rotation);
      }
      if (shapeData?.scale) {
        groupObj.scale.set(...shapeData.scale);
      }
    }
  }, [shapeData, groupObj, defaultCenter]);

  // Seed the store with the visual default center so multi-select math
  // doesn't see undefined position (which would collapse everything to origin).
  useEffect(() => {
    if (shapeData && !shapeData.position && !didInitPositionRef.current) {
      didInitPositionRef.current = true;
      onTransformChange({
        position: [defaultCenter.x, defaultCenter.y, defaultCenter.z],
      });
    }
  }, [shapeData, defaultCenter, onTransformChange]);

  const content = (
    <group ref={setGroupObj} onClick={handleClick}>
      <group position={[-defaultCenter.x, -defaultCenter.y, -defaultCenter.z]}>
        <mesh geometry={geometry} castShadow={viewMode === "normal"} receiveShadow={viewMode === "normal"}>
          <meshPhysicalMaterial
            ref={matRef}
            color={color}
            side={THREE.DoubleSide}
            wireframe={viewMode === "wireframe"}
            roughness={viewMode === "normal" ? materialSettings.roughness : 1}
            metalness={viewMode === "normal" ? materialSettings.metalness : 0}
            transmission={viewMode === "normal" ? materialSettings.transmission : 0}
            ior={viewMode === "normal" ? materialSettings.ior : 1.5}
            clearcoat={viewMode === "normal" ? materialSettings.clearcoat : 0}
            emissive={viewMode === "normal" ? (materialSettings.emissive || "#000000") : "#000000"}
            emissiveIntensity={viewMode === "normal" ? (materialSettings.emissiveIntensity || 0) : 0}
          />
        </mesh>
      </group>
    </group>
  );

  return (
    <>
      {content}
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
            onChange={() => {
              if (groupObj) {
                onTransformChange({
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
                  scale: [groupObj.scale.x, groupObj.scale.y, groupObj.scale.z],
                });
              }
            }}
            onMouseUp={() => {
              if (groupObj) {
                onTransformChange({
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
                  scale: [groupObj.scale.x, groupObj.scale.y, groupObj.scale.z],
                });
              }
            }}
          />,
          scene,
        )}
    </>
  );
}

export function ExtrudedSVG() {
  const dispatch = useAppDispatch();
  const svgFile = useAppSelector((state) => state.scene.svgFile);
  const svgShapes = useAppSelector((state) => state.scene.svgShapes);
  const extrusion = useAppSelector((state) => state.scene.extrusion);
  const globalMaterial = useAppSelector((state) => state.scene.globalMaterial);
  const globalTexture = useAppSelector((state) => state.scene.globalTexture);

  const [loadedTextures, setLoadedTextures] = useState<LoadedTextures>(NULL_TEXTURES);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let cancelled = false;
    const loadOne = (url: string | null | undefined): Promise<THREE.Texture | null> => {
      if (!url) return Promise.resolve(null);
      const scale = globalTexture.repeat ?? 1;
      const repeat = 1 / scale;
      return new Promise((resolve) => {
        loader.load(url, (tex) => {
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.RepeatWrapping;
          tex.repeat.set(repeat, repeat);
          tex.needsUpdate = true;
          resolve(tex);
        }, undefined, () => resolve(null));
      });
    };
    Promise.all([
      loadOne(globalTexture.map),
      loadOne(globalTexture.normalMap),
      loadOne(globalTexture.roughnessMap),
      loadOne(globalTexture.metalnessMap),
      loadOne(globalTexture.displacementMap),
      loadOne(globalTexture.aoMap),
      loadOne(globalTexture.emissiveMap),
      loadOne(globalTexture.alphaMap),
      loadOne(globalTexture.lightMap),
    ]).then(([map, normalMap, roughnessMap, metalnessMap, displacementMap, aoMap, emissiveMap, alphaMap, lightMap]) => {
      if (!cancelled) {
        setLoadedTextures({
          map, normalMap, roughnessMap, metalnessMap,
          displacementMap, aoMap, emissiveMap, alphaMap, lightMap,
          displacementScale: globalTexture.displacementScale ?? 0.1,
          aoMapIntensity: globalTexture.aoMapIntensity ?? 1,
          normalScale: globalTexture.normalScale ?? 1,
        });
      }
    });
    return () => { cancelled = true; };
  }, [
    globalTexture.map, globalTexture.normalMap, globalTexture.roughnessMap,
    globalTexture.metalnessMap, globalTexture.displacementMap, globalTexture.aoMap,
    globalTexture.emissiveMap, globalTexture.alphaMap, globalTexture.lightMap,
    globalTexture.displacementScale, globalTexture.aoMapIntensity, globalTexture.normalScale,
    globalTexture.repeat,
  ]);
  const selectedShapeId = useAppSelector(
    (state) => state.scene.selectedShapeId,
  );
  const selectedShapeIds = useAppSelector(
    (state) => state.scene.selectedShapeIds,
  );
  const transformMode = useAppSelector((state) => state.scene.transformMode);
  const globalTransform = useAppSelector(
    (state) => state.scene.globalTransform,
  );
  const rotationLock = useAppSelector((state) => state.scene.rotationLock);
  const viewMode = useAppSelector((state) => state.scene.viewMode);

  // Preprocessed SVG (strokes converted to fills so Three.js can extrude them)
  const [processedSvg, setProcessedSvg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!svgFile) {
        if (!cancelled) setProcessedSvg(null);
        return;
      }
      try {
        const { svgString } = await preprocessSVGForThree(svgFile);
        if (!cancelled) setProcessedSvg(svgString);
      } catch {
        if (!cancelled) setProcessedSvg(svgFile); // fallback to original
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [svgFile]);

  const { allShapeData, globalCenter, svgScale } = useMemo(() => {
    const src = processedSvg ?? svgFile;
    if (!src)
      return {
        allShapeData: [],
        globalCenter: new THREE.Vector3(),
        svgScale: 1,
      };
    try {
      const loader = new SVGLoader();
      const parsed = loader.parse(src);

      const allShapeData: { shape: THREE.Shape; colorHex: string }[] = [];
      const box = new THREE.Box3();

      for (const path of parsed.paths) {
        const shapes = SVGLoader.createShapes(path);
        const pathColor = path.color?.getStyle() || "#cccccc";
        for (const shape of shapes) {
          allShapeData.push({ shape, colorHex: pathColor });

          const geom = new THREE.ShapeGeometry(shape);
          geom.scale(1, -1, 1);
          geom.computeBoundingBox();
          if (geom.boundingBox) box.union(geom.boundingBox);
        }
      }

      const center = new THREE.Vector3();
      let scale = 1;
      if (!box.isEmpty()) {
        box.getCenter(center);
        const size = box.getSize(new THREE.Vector3());
        const maxSize = Math.max(size.x, size.y);
        if (maxSize > 0) {
          scale = 30 / maxSize;
        }
      }

      return { allShapeData, globalCenter: center, svgScale: scale };
    } catch {
      return {
        allShapeData: [],
        globalCenter: new THREE.Vector3(),
        svgScale: 1,
      };
    }
  }, [processedSvg, svgFile]);

  const [globalGroupObj, setGlobalGroupObj] = useState<THREE.Group | null>(
    null,
  );

  const [multiSelectGroupObj, setMultiSelectGroupObj] =
    useState<THREE.Group | null>(null);

  const multiSelectInitialStateRef = useRef<{
    groupInverseMatrix: THREE.Matrix4;
    shapeMatrices: Map<string, THREE.Matrix4>;
  } | null>(null);

  const isDraggingMultiRef = useRef(false);
  // Stays true for a short window after the multi-drag ends so that the
  // pointer-up → click event on individual shapes is suppressed.
  const wasMultiDraggingRef = useRef(false);

  // Sync global transform
  useEffect(() => {
    if (globalGroupObj) {
      if (globalTransform?.position) {
        globalGroupObj.position.set(...globalTransform.position);
      }
      if (globalTransform?.rotation) {
        globalGroupObj.rotation.set(...globalTransform.rotation);
      }
      if (globalTransform?.scale) {
        globalGroupObj.scale.set(...globalTransform.scale);
      }
    }
  }, [globalTransform, globalGroupObj]);

  useEffect(() => {
    if (
      multiSelectGroupObj &&
      selectedShapeIds.length > 1 &&
      !isDraggingMultiRef.current
    ) {
      const positions = selectedShapeIds
        .map((id) => {
          const shape = svgShapes.find((s) => s.id === id);
          return shape?.position;
        })
        .filter((p): p is [number, number, number] => p !== undefined);

      if (positions.length > 0) {
        const avgX =
          positions.reduce((sum, p) => sum + p[0], 0) / positions.length;
        const avgY =
          positions.reduce((sum, p) => sum + p[1], 0) / positions.length;
        const avgZ =
          positions.reduce((sum, p) => sum + p[2], 0) / positions.length;
        multiSelectGroupObj.position.set(avgX, avgY, avgZ);
        multiSelectGroupObj.rotation.set(0, 0, 0);
        multiSelectGroupObj.scale.set(1, 1, 1);
      }
    }
  }, [selectedShapeIds, svgShapes, multiSelectGroupObj]);

  if (!svgFile || svgShapes.length === 0 || allShapeData.length === 0)
    return null;

  const content = (
    <group
      ref={(obj) => {
        setGlobalGroupObj(obj);
        globalGroupRef.current = obj;
      }}
      onPointerMissed={(e) => {
        if (e.type === "click") {
          const nativeEvent = e as unknown as PointerEvent;
          const isAdditive = nativeEvent.ctrlKey || nativeEvent.metaKey;
          if (!isAdditive) {
            dispatch(clearSelection());
          }
        }
      }}
    >
      <group
        scale={[svgScale, svgScale, svgScale]}
        position={[-globalCenter.x * svgScale, -globalCenter.y * svgScale, 0]}
      >
        {allShapeData.map((data, i) => {
          const shapeData = svgShapes[i];
          const shapeId = shapeData?.id ?? `shape-${i}`;
          if (shapeData?.visible === false) return null;
          const isSelected = selectedShapeIds.includes(shapeId);
          return (
            <ShapeMeshes
              key={shapeId}
              shapeId={shapeId}
              singleShape={data.shape}
              colorHex={data.colorHex}
              shapeData={shapeData}
              globalExtrusion={extrusion}
              globalMaterial={globalMaterial}
              loadedTextures={loadedTextures}
              isSelected={isSelected}
              viewMode={viewMode}
              transformMode={selectedShapeIds.length > 1 ? null : transformMode}
              rotationLock={rotationLock}
              onSelect={() => {
                // Suppress click if we just finished a multi-drag to avoid
                // collapsing the multi-selection to a single object.
                if (wasMultiDraggingRef.current) return;
                const event = window.event as MouseEvent;
                const isAdditive = event?.ctrlKey || event?.metaKey;
                dispatch(
                  toggleShapeSelection({ id: shapeId, additive: isAdditive }),
                );
              }}
              onTransformChange={(transform) => {
                dispatch(updateShapeTransform({ id: shapeId, ...transform }));
              }}
            />
          );
        })}
        <group ref={setMultiSelectGroupObj} />
      </group>
    </group>
  );

  return (
    <>
      {content}
      {selectedShapeIds.length > 1 && transformMode && multiSelectGroupObj && (
        <TransformControls
          object={multiSelectGroupObj}
          mode={transformMode}
          showX={transformMode === "rotate" ? !rotationLock.x : true}
          showY={transformMode === "rotate" ? !rotationLock.y : true}
          showZ={transformMode === "rotate" ? !rotationLock.z : true}
          onMouseDown={() => {
            isDraggingMultiRef.current = true;
            dispatch(recordSnapshot());
            if (!multiSelectGroupObj) return;

            multiSelectGroupObj.updateMatrix();
            const groupInverseMatrix = multiSelectGroupObj.matrix
              .clone()
              .invert();

            const shapeMatrices = new Map<string, THREE.Matrix4>();
            selectedShapeIds.forEach((id) => {
              const shape = svgShapes.find((s) => s.id === id);
              if (shape) {
                const pos = new THREE.Vector3(...(shape.position ?? [0, 0, 0]));
                const eul = new THREE.Euler(...(shape.rotation ?? [0, 0, 0]));
                const scl = new THREE.Vector3(...(shape.scale ?? [1, 1, 1]));
                const quat = new THREE.Quaternion().setFromEuler(eul);
                shapeMatrices.set(
                  id,
                  new THREE.Matrix4().compose(pos, quat, scl),
                );
              }
            });

            multiSelectInitialStateRef.current = {
              groupInverseMatrix,
              shapeMatrices,
            };
          }}
          onObjectChange={() => {
            if (!multiSelectGroupObj || !multiSelectInitialStateRef.current)
              return;

            multiSelectGroupObj.updateMatrix();
            const initial = multiSelectInitialStateRef.current;

            const delta = new THREE.Matrix4().multiplyMatrices(
              multiSelectGroupObj.matrix,
              initial.groupInverseMatrix,
            );

            selectedShapeIds.forEach((id) => {
              const initM = initial.shapeMatrices.get(id);
              if (!initM) return;

              const newM = new THREE.Matrix4().multiplyMatrices(delta, initM);
              const pos = new THREE.Vector3();
              const quat = new THREE.Quaternion();
              const scl = new THREE.Vector3();
              newM.decompose(pos, quat, scl);
              const eul = new THREE.Euler().setFromQuaternion(quat);

              dispatch(
                updateShapeTransform({
                  id,
                  position: [pos.x, pos.y, pos.z],
                  rotation: [eul.x, eul.y, eul.z],
                  scale: [scl.x, scl.y, scl.z],
                }),
              );
            });
          }}
          onMouseUp={() => {
            isDraggingMultiRef.current = false;
            // Keep the guard alive long enough to swallow the subsequent click
            // event that fires on the underlying mesh after pointer-up.
            wasMultiDraggingRef.current = true;
            setTimeout(() => {
              wasMultiDraggingRef.current = false;
            }, 100);
          }}
        />
      )}
      {selectedShapeId === "global" && transformMode && globalGroupObj && (
        <TransformControls
          object={globalGroupObj}
          mode={transformMode}
          showX={transformMode === "rotate" ? !rotationLock.x : true}
          showY={transformMode === "rotate" ? !rotationLock.y : true}
          showZ={transformMode === "rotate" ? !rotationLock.z : true}
          onMouseDown={() => {
            dispatch(recordSnapshot());
          }}
          onChange={() => {
            if (globalGroupObj) {
              dispatch(
                setGlobalTransform({
                  position: [
                    globalGroupObj.position.x,
                    globalGroupObj.position.y,
                    globalGroupObj.position.z,
                  ],
                  rotation: [
                    globalGroupObj.rotation.x,
                    globalGroupObj.rotation.y,
                    globalGroupObj.rotation.z,
                  ],
                  scale: [
                    globalGroupObj.scale.x,
                    globalGroupObj.scale.y,
                    globalGroupObj.scale.z,
                  ],
                }),
              );
            }
          }}
          onMouseUp={() => {
            if (globalGroupObj) {
              dispatch(
                setGlobalTransform({
                  position: [
                    globalGroupObj.position.x,
                    globalGroupObj.position.y,
                    globalGroupObj.position.z,
                  ],
                  rotation: [
                    globalGroupObj.rotation.x,
                    globalGroupObj.rotation.y,
                    globalGroupObj.rotation.z,
                  ],
                  scale: [
                    globalGroupObj.scale.x,
                    globalGroupObj.scale.y,
                    globalGroupObj.scale.z,
                  ],
                }),
              );
            }
          }}
        />
      )}
    </>
  );
}

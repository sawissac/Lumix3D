"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  toggleShapeSelection,
  updateShapeTransform,
  setGlobalTransform,
  clearSelection,
} from "@/store/slices/sceneSlice";
import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { ThreeEvent, useThree, createPortal } from "@react-three/fiber";
import { ExtrusionSettings, SvgShape, MaterialSettings } from "@/types";
import { TransformControls } from "@react-three/drei";
import { globalGroupRef } from "../globalGroupRef";
import { shapeObjectRegistry } from "../shapeObjectRegistry";
import { preprocessSVGForThree } from "../utils/svgPreprocess";

type ShapeMeshesProps = {
  shapeId: string;
  singleShape: THREE.Shape;
  colorHex: string;
  shapeData: SvgShape | undefined;
  globalExtrusion: ExtrusionSettings;
  globalMaterial: MaterialSettings;
  isSelected: boolean;
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
  isSelected,
  transformMode,
  rotationLock,
  onSelect,
  onTransformChange,
}: ShapeMeshesProps) {
  const { scene } = useThree();
  const [groupObj, setGroupObj] = useState<THREE.Group | null>(null);

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

  const geometry = useMemo(() => {
    const geom = new THREE.ExtrudeGeometry(singleShape, extrusion);
    geom.scale(1, -1, 1); // Flip Y to match 3D coordinate system
    geom.computeVertexNormals(); // Fix lighting normals
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
        <mesh geometry={geometry} castShadow receiveShadow>
          <meshPhysicalMaterial
            color={color}
            side={THREE.DoubleSide}
            roughness={materialSettings.roughness}
            metalness={materialSettings.metalness}
            transmission={materialSettings.transmission}
            ior={materialSettings.ior}
            clearcoat={materialSettings.clearcoat}
            emissive={materialSettings.emissive || "#000000"}
            emissiveIntensity={materialSettings.emissiveIntensity || 0}
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

  // Preprocessed SVG (strokes converted to fills so Three.js can extrude them)
  const [processedSvg, setProcessedSvg] = useState<string | null>(null);

  useEffect(() => {
    if (!svgFile) {
      setProcessedSvg(null);
      return;
    }
    let cancelled = false;
    preprocessSVGForThree(svgFile)
      .then(({ svgString }) => {
        if (!cancelled) setProcessedSvg(svgString);
      })
      .catch(() => {
        if (!cancelled) setProcessedSvg(svgFile); // fallback to original
      });
    return () => { cancelled = true; };
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
              isSelected={isSelected}
              transformMode={selectedShapeIds.length > 1 ? null : transformMode}
              rotationLock={rotationLock}
              onSelect={() => {
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

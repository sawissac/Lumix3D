"use client";

import { useMemo, useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setSelectedShapeId,
  updateShapeTransform,
  setGlobalTransform,
} from "@/store/slices/sceneSlice";
import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { ThreeEvent, useThree, createPortal } from "@react-three/fiber";
import { ExtrusionSettings, SvgShape, MaterialSettings } from "@/types";
import { TransformControls, Edges } from "@react-three/drei";

type ShapeMeshesProps = {
  singleShape: THREE.Shape;
  colorHex: string;
  shapeData: SvgShape | undefined;
  globalExtrusion: ExtrusionSettings;
  globalMaterial: MaterialSettings;
  isSelected: boolean;
  transformMode: "translate" | "rotate" | "scale" | null;
  onSelect: () => void;
  onTransformChange: (transform: {
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
  }) => void;
};

function ShapeMeshes({
  singleShape,
  colorHex,
  shapeData,
  globalExtrusion,
  globalMaterial,
  isSelected,
  transformMode,
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
    onSelect();
  };

  // Sync group transform with store on mount or prop change
  useEffect(() => {
    if (groupObj) {
      if (shapeData?.position) {
        groupObj.position.set(...shapeData.position);
      } else {
        // Fallback to default center if not positioned yet
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
          {isSelected && <Edges linewidth={2} color="#fbbf24" threshold={15} />}
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
  const transformMode = useAppSelector((state) => state.scene.transformMode);
  const globalTransform = useAppSelector(
    (state) => state.scene.globalTransform,
  );

  const { allShapeData, globalCenter, svgScale } = useMemo(() => {
    if (!svgFile)
      return {
        allShapeData: [],
        globalCenter: new THREE.Vector3(),
        svgScale: 1,
      };
    try {
      const loader = new SVGLoader();
      const parsed = loader.parse(svgFile);

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
  }, [svgFile]);

  const [globalGroupObj, setGlobalGroupObj] = useState<THREE.Group | null>(
    null,
  );

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

  if (!svgFile || svgShapes.length === 0 || allShapeData.length === 0)
    return null;

  const content = (
    <group
      ref={setGlobalGroupObj}
      onPointerMissed={(e) => {
        if (e.type === "click") {
          dispatch(setSelectedShapeId("global"));
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
          return (
            <ShapeMeshes
              key={shapeId}
              singleShape={data.shape}
              colorHex={data.colorHex}
              shapeData={shapeData}
              globalExtrusion={extrusion}
              globalMaterial={globalMaterial}
              isSelected={selectedShapeId === shapeId}
              transformMode={transformMode}
              onSelect={() => dispatch(setSelectedShapeId(shapeId))}
              onTransformChange={(transform) => {
                dispatch(updateShapeTransform({ id: shapeId, ...transform }));
              }}
            />
          );
        })}
      </group>
    </group>
  );

  return (
    <>
      {content}
      {selectedShapeId === "global" && transformMode && globalGroupObj && (
        <TransformControls
          object={globalGroupObj}
          mode={transformMode}
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

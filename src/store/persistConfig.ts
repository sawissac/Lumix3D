import { persistReducer } from "redux-persist";
import localforage from "localforage";

const persistConfig = {
  key: "lumix3d",
  version: 1,
  storage: localforage,
  throttle: 1000,
  whitelist: [
    "svgShapes",
    "svgFile",
    "importedSvgs",
    "importedGlbs",
    "glbObjects",
    "extrusion",
    "globalMaterial",
    "globalTransform",
    "background",
    "lights",
    "currentPreset",
    "bloom",
    "ground",
    "showGrid",
    "groups",
    "is3DMode",
    "viewMode",
    "globalTexture",
    "timeline",
    "collapsedSections",
    "savedAnimations",
    "embedRotate",
    "embedZoom",
    "embedPan",
    "embedRotateX",
    "embedRotateY",
    "embedRotateZ",
    "codeType",
  ],
};

export { persistConfig, persistReducer };

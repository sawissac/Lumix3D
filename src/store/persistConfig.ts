import { persistReducer } from "redux-persist";
import localforage from "localforage";

const persistConfig = {
  key: "lumix3d",
  version: 1,
  storage: localforage,
  whitelist: [
    "svgShapes",
    "svgFile",
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
    "globalTexture",
  ],
};

export { persistConfig, persistReducer };

import { configureStore } from "@reduxjs/toolkit";
import sceneReducer from "@/store/slices/sceneSlice";

export function createEmbedStore() {
  return configureStore({
    reducer: { scene: sceneReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });
}

export type EmbedStore = ReturnType<typeof createEmbedStore>;

import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import sceneReducer from "./slices/sceneSlice";
import { persistConfig, persistReducer } from "./persistConfig";
import { historyMiddleware } from "./historyMiddleware";
import uiReducer from "./slices/uiSlice";

const persistedReducer = persistReducer(persistConfig, sceneReducer);

export const store = configureStore({
  reducer: {
    scene: persistedReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).prepend(historyMiddleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

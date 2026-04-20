import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UiState {
  showCodeModal: boolean;
  codeType: "js" | "react";
  copied: boolean;
  embedRotate: boolean;
  embedZoom: boolean;
  embedPan: boolean;
  embedRotateX: boolean;
  embedRotateY: boolean;
  embedRotateZ: boolean;
  showGroupDialog: boolean;
  groupName: string;
  isEmbedLoaded: boolean;
}

const initialState: UiState = {
  showCodeModal: false,
  codeType: "js",
  copied: false,
  embedRotate: true,
  embedZoom: false,
  embedPan: false,
  embedRotateX: true,
  embedRotateY: true,
  embedRotateZ: true,
  showGroupDialog: false,
  groupName: "",
  isEmbedLoaded: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setShowCodeModal: (state, action: PayloadAction<boolean>) => {
      state.showCodeModal = action.payload;
    },
    setCodeType: (state, action: PayloadAction<"js" | "react">) => {
      state.codeType = action.payload;
    },
    setCopied: (state, action: PayloadAction<boolean>) => {
      state.copied = action.payload;
    },
    setEmbedRotate: (state, action: PayloadAction<boolean>) => {
      state.embedRotate = action.payload;
    },
    setEmbedZoom: (state, action: PayloadAction<boolean>) => {
      state.embedZoom = action.payload;
    },
    setEmbedPan: (state, action: PayloadAction<boolean>) => {
      state.embedPan = action.payload;
    },
    setEmbedRotateX: (state, action: PayloadAction<boolean>) => {
      state.embedRotateX = action.payload;
    },
    setEmbedRotateY: (state, action: PayloadAction<boolean>) => {
      state.embedRotateY = action.payload;
    },
    setEmbedRotateZ: (state, action: PayloadAction<boolean>) => {
      state.embedRotateZ = action.payload;
    },
    setShowGroupDialog: (state, action: PayloadAction<boolean>) => {
      state.showGroupDialog = action.payload;
    },
    setGroupName: (state, action: PayloadAction<string>) => {
      state.groupName = action.payload;
    },
    setIsEmbedLoaded: (state, action: PayloadAction<boolean>) => {
      state.isEmbedLoaded = action.payload;
    },
  },
});

export const {
  setShowCodeModal,
  setCodeType,
  setCopied,
  setEmbedRotate,
  setEmbedZoom,
  setEmbedPan,
  setEmbedRotateX,
  setEmbedRotateY,
  setEmbedRotateZ,
  setShowGroupDialog,
  setGroupName,
  setIsEmbedLoaded,
} = uiSlice.actions;

export default uiSlice.reducer;

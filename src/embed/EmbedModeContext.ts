import { createContext, useContext } from "react";

export const EmbedModeContext = createContext<boolean>(false);

export function useEmbedMode(): boolean {
  return useContext(EmbedModeContext);
}

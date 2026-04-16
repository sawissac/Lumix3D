"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { suppressWarnings } from "@/lib/suppressWarnings";

suppressWarnings();

export function Providers({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}

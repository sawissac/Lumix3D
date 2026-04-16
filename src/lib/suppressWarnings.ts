export function suppressWarnings() {
  if (typeof window !== "undefined") {
    const originalWarn = console.warn;
    console.warn = (...args) => {
      const msg = args[0];
      const strMsg =
        typeof msg === "string" ? msg : msg instanceof Error ? msg.message : "";

      if (
        strMsg.includes("Clock: This module has been deprecated") ||
        strMsg.includes("THREE.THREE.Clock: This module has been deprecated") ||
        strMsg.includes("PCFSoftShadowMap has been deprecated")
      ) {
        return;
      }

      originalWarn.apply(console, args);
    };
  }
}

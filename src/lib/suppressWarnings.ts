export function suppressWarnings() {
  if (typeof window !== 'undefined') {
    const originalWarn = console.warn;
    console.warn = (...args) => {
      const msg = args[0];
      if (typeof msg === 'string') {
        if (msg.includes('THREE.Clock: This module has been deprecated') || 
            msg.includes('THREE.THREE.Clock: This module has been deprecated') ||
            msg.includes('Clock: This module has been deprecated')) {
          return;
        }
        if (msg.includes('PCFSoftShadowMap has been deprecated')) {
          return;
        }
      }
      originalWarn.apply(console, args);
    };
  }
}

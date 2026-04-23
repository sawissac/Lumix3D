# Lumix3D Optimization Checklist

Based on an analysis of your project's structure (Next.js, React Three Fiber, Redux Toolkit, SVGO, Fabric), here is a comprehensive checklist of optimizations you can apply to improve performance, rendering efficiency, and maintainability.

## 1. Three.js & React Three Fiber (R3F) Optimizations
- [x] **On-Demand Rendering (`frameloop="demand"`):** Your `<Canvas>` currently uses the default `frameloop="always"`. Since Lumix3D is an editor and the scene is largely static unless the user interacts with it, switching to `demand` will drastically reduce GPU usage and battery drain. You'll need to call `invalidate()` when state changes or controls are used.
- [x] **Device Pixel Ratio (DPR) Clamping:** Ensure your `<Canvas>` explicitly sets `dpr={[1, 2]}` to prevent excessive rendering resolution on high-DPI (Retina) displays. You can even dynamically lower DPR during heavy operations (like dragging or rotating) with `drei`'s `<PerformanceMonitor>`.
- [x] **Geometry LOD & Segments:** Extruding SVGs can generate very high polygon counts. Consider capping or dynamically adjusting `curveSegments` and `bevelSegments` in your `ExtrusionSettings` based on the complexity of the SVG path.
- [x] **Shadow Map Resolution:** The project uses `THREE.PCFShadowMap`. Allow users to toggle shadow quality or bake shadows. You can lower the `shadow-mapSize` to `[512, 512]` or `[1024, 1024]` for standard use, as high-res shadows are expensive.
- [x] **Post-Processing Toggles:** `<EffectComposer>` and `<Bloom>` are heavy. Ensure you have a "Performance Mode" toggle that completely unmounts the `<EffectComposer>` for lower-end devices, rather than just setting `intensity={0}`.

## 2. Redux & State Management Optimizations
- [ ] **Normalize State Shape:** In `sceneSlice.ts`, `svgShapes` and `lights` are stored as Arrays. When updating properties (e.g., `updateShapeColor`), you run `findIndex`. Normalize your state into objects/dictionaries (e.g., `Record<string, SvgShape>`) for `O(1)` updates.
- [x] **Memoized Selectors (Reselect):** Use Redux Toolkit's `createSelector` for derived data to prevent React components from re-rendering unnecessarily. For example, selecting specific shapes by ID or filtering visible shapes.
- [x] **Debounce Redux Dispatches:** You're correctly using `liveTransform` outside of Redux for dragging, which is great! Make sure any Redux dispatches (like saving the final transform or adjusting a slider) are debounced so you don't dispatch actions 60 times a second.
- [x] **Persist Pruning:** If using `redux-persist`, ensure you are not persisting massive base64 image strings or giant SVG path data strings if they can be cached in `IndexedDB` (e.g., via `localforage`) instead. Redux storage is synchronous and blocking.

## 3. Next.js & React Optimizations
- [x] **Lazy Loading `<Canvas3D>`:** Three.js and R3F are heavy dependencies. Use `next/dynamic` to lazy-load the canvas component (`const Canvas3D = dynamic(() => import('./Canvas3D'), { ssr: false })`). This ensures the initial HTML load is fast and Three.js isn't included in the main bundle.
- [ ] **Web Workers for Heavy Processing:** SVGO parsing and image/color clustering (K-Means) block the UI thread. Move these calculations into Web Workers so the UI remains fluid while processing large SVGs or images.
- [x] **Component Memoization:** Wrap heavy UI components (especially the Sidebar or tools that map over `svgShapes`) in `React.memo` with custom comparison functions if needed, so they don't re-render when an unrelated property in `sceneSlice` changes.

## 4. Asset & Network Optimizations
- [ ] **Texture Compression:** If you plan to allow users to upload or use textures (in `TextureSettings`), consider converting them to KTX2/Basis format on the fly or providing a compressed alternative to reduce GPU VRAM usage.
- [x] **Bundle Analysis:** Run `@next/bundle-analyzer` to see if libraries like `fabric` or `svgo` can be dynamically imported only when the user clicks the "Edit" or "Optimize" button, rather than loading them eagerly.

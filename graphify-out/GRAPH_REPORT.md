# Graph Report - Lumix3D  (2026-05-11)

## Corpus Check
- 72 files · ~35,457 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 407 nodes · 921 edges · 32 communities (20 shown, 12 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fe2b10cb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_3D Canvas & SVG Extrusion|3D Canvas & SVG Extrusion]]
- [[_COMMUNITY_UI Controls & Presets|UI Controls & Presets]]
- [[_COMMUNITY_Optimization & Architecture Docs|Optimization & Architecture Docs]]
- [[_COMMUNITY_Sidebar Control Panels|Sidebar Control Panels]]
- [[_COMMUNITY_App Shell & UndoRedo|App Shell & Undo/Redo]]
- [[_COMMUNITY_Page Composition & Layout|Page Composition & Layout]]
- [[_COMMUNITY_Selection & Timeline Math|Selection & Timeline Math]]
- [[_COMMUNITY_Type Definitions|Type Definitions]]
- [[_COMMUNITY_Transform Logging|Transform Logging]]
- [[_COMMUNITY_Demo Scenes|Demo Scenes]]
- [[_COMMUNITY_Timeline Editor|Timeline Editor]]
- [[_COMMUNITY_SVG Preprocessing|SVG Preprocessing]]
- [[_COMMUNITY_Saved Animations|Saved Animations]]
- [[_COMMUNITY_Build Tooling (pnpm)|Build Tooling (pnpm)]]
- [[_COMMUNITY_Scene State Slice|Scene State Slice]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Tailwind Config|Tailwind Config]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_SVG Editor|SVG Editor]]
- [[_COMMUNITY_Global Extrusion Rule|Global Extrusion Rule]]
- [[_COMMUNITY_Next Env Types|Next Env Types]]
- [[_COMMUNITY_Quick Scenes|Quick Scenes]]
- [[_COMMUNITY_Transform Tracker|Transform Tracker]]
- [[_COMMUNITY_Canvas Refs Capture|Canvas Refs Capture]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]

## God Nodes (most connected - your core abstractions)
1. `useAppSelector` - 56 edges
2. `useAppDispatch` - 54 edges
3. `cn()` - 39 edges
4. `React Three Fiber Optimizations` - 18 edges
5. `SvgShape` - 15 edges
6. `CollapsibleCard()` - 13 edges
7. `Feature-Based Folder Structure Optimization` - 9 edges
8. `MaterialSettings` - 8 edges
9. `ImportedSvg` - 8 edges
10. `ExtrusionSettings` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Lumix3D` --references--> `Lumix3D App Logo (SVG - extruded L-shape 3D wireframe)`  [INFERRED]
  README.md → public/product/app_logo.svg
- `3D SVG Extrusion Tool` --conceptually_related_to--> `Lumix3D App Logo (SVG - extruded L-shape 3D wireframe)`  [INFERRED]
  README.md → public/product/app_logo.svg
- `Lumix3D` --references--> `React Three Fiber Optimizations`  [INFERRED]
  README.md → docs/optimizations_checklist_1_1.md
- `Next.js` --conceptually_related_to--> `Next.js Breaking Changes Warning`  [INFERRED]
  README.md → AGENTS.md
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  src/app/layout.tsx → src/lib/utils.ts

## Hyperedges (group relationships)
- **SVG-to-3D conversion pipeline** — svguploader_handlefileupload, sceneslice_addimportedsvg, sceneslice_convertimportedsvgto3d, extrudedsvg_extrudedsvg [INFERRED 0.90]
- **Shape registry collaboration for transform/box-select/camera-fit** — extrudedsvg_shapemeshes, canvas3d_fitcameraonload, canvas3d_canvas3d, shape_object_registry_concept [INFERRED 0.85]
- **Undo/redo history snapshot flow** — canvas3d_canvas3d, sceneslice_recordsnapshot, sceneslice_undo, sceneslice_redo, sceneslice_historysnapshot [INFERRED 0.85]

## Communities (32 total, 12 thin omitted)

### Community 0 - "3D Canvas & SVG Extrusion"
Cohesion: 0.08
Nodes (44): Home(), BackgroundControls(), BoxSelectOverlay(), Rect, CameraController(), Canvas3D(), CanvasRefsCapture(), FitCameraOnLoad() (+36 more)

### Community 1 - "UI Controls & Presets"
Cohesion: 0.1
Nodes (46): buildDemoSvgShapes(), QuickScenes(), SCENE_ICONS, parseSvgShapes(), DemoScene, SIDEBAR_APP_ICON_EXTRUSION, SIDEBAR_APP_ICON_LIGHTS, SIDEBAR_APP_ICON_MATERIAL (+38 more)

### Community 2 - "Optimization & Architecture Docs"
Cohesion: 0.11
Nodes (32): CollapsibleCard(), CollapsibleCardProps, SECTION_ICONS, MODE_COLORS, VIEW_MODES, SVGInspector(), SIDEBAR_LIGHTING_PRESETS, SIDEBAR_PRESET_DESCRIPTIONS (+24 more)

### Community 3 - "Sidebar Control Panels"
Cohesion: 0.05
Nodes (45): Next.js Breaking Changes Warning, Next.js Agent Rules, Lumix3D App Logo (SVG - extruded L-shape 3D wireframe), Bundle Analysis (@next/bundle-analyzer), Component Memoization (React.memo), Debounce Redux Dispatches, Device Pixel Ratio Clamping (dpr=[1,2]), Fabric.js (+37 more)

### Community 4 - "App Shell & Undo/Redo"
Cohesion: 0.09
Nodes (21): geist, inter, metadata, RootLayout(), Providers(), MobileBlocker(), UndoRedoToolbar(), useHistoryAvailability() (+13 more)

### Community 5 - "Page Composition & Layout"
Cohesion: 0.13
Nodes (20): LoadedTextures, NULL_TEXTURES, ParsedSvgGroup, ShapeMeshes(), ShapeMeshesProps, formatTime(), PresetId, PRESETS (+12 more)

### Community 6 - "Selection & Timeline Math"
Cohesion: 0.09
Nodes (25): Canvas3D Component, FitCameraOnLoad, ExtrudedSVG Component, ShapeMeshes, ExtrusionSettings Type, ImportedSvg Type, MaterialSettings Type, SvgShape Type (+17 more)

### Community 7 - "Type Definitions"
Cohesion: 0.15
Nodes (13): applyGroupInterpolation(), _eulShape, lerp(), lerpArray(), _q1, _q2, _qBindLocal, _qFinalLocal (+5 more)

### Community 8 - "Transform Logging"
Cohesion: 0.21
Nodes (7): fmt(), fmtRow(), TransformLog(), f(), row(), globalGroupRef, liveTransform

### Community 9 - "Demo Scenes"
Cohesion: 0.26
Nodes (10): SelectionProps, SVGEditor(), toHex(), lineToFilledPathData(), makeFilledPath(), preprocessSVGForThree(), ProcessedSVG, resolvePx() (+2 more)

### Community 10 - "Timeline Editor"
Cohesion: 0.27
Nodes (7): Canvas3D, SceneTransformToolbar, SVGEditor, ParticleBackground(), Sidebar(), ResizableHandle(), ResizablePanelGroup()

### Community 11 - "SVG Preprocessing"
Cohesion: 0.31
Nodes (8): formatTime(), TimelineEditor(), Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle

### Community 12 - "Saved Animations"
Cohesion: 0.22
Nodes (8): 3D Object Selection & Transformation, code:bash (npm run dev), Deploy on Vercel, Features, Getting Started, Learn More, Lumix3D, Object Grouping

### Community 13 - "Build Tooling (pnpm)"
Cohesion: 0.33
Nodes (5): 1. Three.js & React Three Fiber (R3F) Optimizations, 2. Redux & State Management Optimizations, 3. Next.js & React Optimizations, 4. Asset & Network Optimizations, Lumix3D Optimization Checklist

### Community 14 - "Scene State Slice"
Cohesion: 0.4
Nodes (6): Keyframe Type, SavedAnimation Type, TimelineState Type, Saved animations index by selection order, not shape ID, applyAnimation reducer, saveAnimation reducer

### Community 15 - "PostCSS Config"
Cohesion: 0.67
Nodes (3): sharp (ignored built dependency), unrs-resolver (ignored built dependency), pnpm Workspace Config

### Community 16 - "Tailwind Config"
Cohesion: 0.67
Nodes (3): AppState Type, HistorySnapshot Type, sceneSlice

## Knowledge Gaps
- **118 isolated node(s):** `config`, `config`, `eslintConfig`, `nextConfig`, `geist` (+113 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAppSelector` connect `3D Canvas & SVG Extrusion` to `UI Controls & Presets`, `Optimization & Architecture Docs`, `Page Composition & Layout`, `Type Definitions`, `Transform Logging`, `Demo Scenes`, `Timeline Editor`, `SVG Preprocessing`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `useAppDispatch` connect `3D Canvas & SVG Extrusion` to `UI Controls & Presets`, `Optimization & Architecture Docs`, `App Shell & Undo/Redo`, `Page Composition & Layout`, `Type Definitions`, `Demo Scenes`, `Timeline Editor`, `SVG Preprocessing`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Why does `cn()` connect `Optimization & Architecture Docs` to `3D Canvas & SVG Extrusion`, `Timeline Editor`, `SVG Preprocessing`, `App Shell & Undo/Redo`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **What connects `config`, `config`, `eslintConfig` to the rest of the system?**
  _118 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `3D Canvas & SVG Extrusion` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `UI Controls & Presets` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Optimization & Architecture Docs` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
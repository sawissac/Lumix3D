# Graph Report - .  (2026-05-11)

## Corpus Check
- 74 files · ~34,526 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 379 nodes · 687 edges · 26 communities (16 shown, 10 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.89)
- Token cost: 80,744 input · 0 output

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
- [[_COMMUNITY_Quick Scenes|Quick Scenes]]
- [[_COMMUNITY_Transform Tracker|Transform Tracker]]
- [[_COMMUNITY_Canvas Refs Capture|Canvas Refs Capture]]
- [[_COMMUNITY_Camera Controller|Camera Controller]]

## God Nodes (most connected - your core abstractions)
1. `useAppSelector` - 47 edges
2. `useAppDispatch` - 43 edges
3. `cn()` - 39 edges
4. `React Three Fiber Optimizations` - 18 edges
5. `CollapsibleCard()` - 11 edges
6. `Feature-Based Folder Structure Optimization` - 9 edges
7. `SliderWithInput()` - 8 edges
8. `Lumix3D` - 8 edges
9. `Redux Store Architecture Constraints` - 8 edges
10. `Label` - 6 edges

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

## Communities (26 total, 10 thin omitted)

### Community 0 - "3D Canvas & SVG Extrusion"
Cohesion: 0.05
Nodes (39): ExtrudedSVG(), LoadedTextures, NULL_TEXTURES, ParsedSvgGroup, ShapeMeshesProps, SCENE_ICONS, SelectionProps, HistorySnapshot (+31 more)

### Community 1 - "UI Controls & Presets"
Cohesion: 0.11
Nodes (31): CollapsibleCard(), CollapsibleCardProps, SECTION_ICONS, MODE_COLORS, VIEW_MODES, SIDEBAR_LIGHTING_PRESETS, SIDEBAR_PRESET_DESCRIPTIONS, cn() (+23 more)

### Community 2 - "Optimization & Architecture Docs"
Cohesion: 0.05
Nodes (45): Next.js Breaking Changes Warning, Next.js Agent Rules, Lumix3D App Logo (SVG - extruded L-shape 3D wireframe), Bundle Analysis (@next/bundle-analyzer), Component Memoization (React.memo), Debounce Redux Dispatches, Device Pixel Ratio Clamping (dpr=[1,2]), Fabric.js (+37 more)

### Community 3 - "Sidebar Control Panels"
Cohesion: 0.09
Nodes (31): BackgroundControls(), EffectControls(), ExtrusionControls(), GroupManager(), PANEL_STYLE, LightingControls(), ObjectListItem, ObjectListItemProps (+23 more)

### Community 4 - "App Shell & Undo/Redo"
Cohesion: 0.09
Nodes (21): geist, inter, metadata, RootLayout(), Providers(), MobileBlocker(), UndoRedoToolbar(), useHistoryAvailability() (+13 more)

### Community 5 - "Page Composition & Layout"
Cohesion: 0.1
Nodes (20): Canvas3D, Home(), SceneTransformToolbar, SVGEditor, ParticleBackground(), Sidebar(), formatTime(), PresetId (+12 more)

### Community 6 - "Selection & Timeline Math"
Cohesion: 0.1
Nodes (19): BoxSelectOverlay(), Rect, applyGroupInterpolation(), _eulShape, lerp(), lerpArray(), _q1, _q2 (+11 more)

### Community 7 - "Type Definitions"
Cohesion: 0.09
Nodes (25): Canvas3D Component, FitCameraOnLoad, ExtrudedSVG Component, ShapeMeshes, ExtrusionSettings Type, ImportedSvg Type, MaterialSettings Type, SvgShape Type (+17 more)

### Community 8 - "Transform Logging"
Cohesion: 0.21
Nodes (7): fmt(), fmtRow(), TransformLog(), f(), row(), globalGroupRef, liveTransform

### Community 9 - "Demo Scenes"
Cohesion: 0.2
Nodes (9): DemoScene, SIDEBAR_APP_ICON_EXTRUSION, SIDEBAR_APP_ICON_LIGHTS, SIDEBAR_APP_ICON_MATERIAL, SIDEBAR_APP_ICON_ROTATION, SIDEBAR_DEMO_SCENES, SIDEBAR_PAW_EXTRUSION, SIDEBAR_PAW_LIGHTS (+1 more)

### Community 10 - "Timeline Editor"
Cohesion: 0.31
Nodes (8): formatTime(), TimelineEditor(), Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle

### Community 11 - "SVG Preprocessing"
Cohesion: 0.43
Nodes (7): lineToFilledPathData(), makeFilledPath(), preprocessSVGForThree(), ProcessedSVG, resolvePx(), resolveStyle(), strokeToFilledPathData()

### Community 12 - "Saved Animations"
Cohesion: 0.4
Nodes (6): Keyframe Type, SavedAnimation Type, TimelineState Type, Saved animations index by selection order, not shape ID, applyAnimation reducer, saveAnimation reducer

### Community 13 - "Build Tooling (pnpm)"
Cohesion: 0.67
Nodes (3): sharp (ignored built dependency), unrs-resolver (ignored built dependency), pnpm Workspace Config

### Community 14 - "Scene State Slice"
Cohesion: 0.67
Nodes (3): AppState Type, HistorySnapshot Type, sceneSlice

## Knowledge Gaps
- **130 isolated node(s):** `config`, `config`, `eslintConfig`, `nextConfig`, `geist` (+125 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAppSelector` connect `Sidebar Control Panels` to `UI Controls & Presets`, `App Shell & Undo/Redo`, `Page Composition & Layout`, `Selection & Timeline Math`, `Transform Logging`, `Timeline Editor`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `useAppDispatch` connect `Sidebar Control Panels` to `UI Controls & Presets`, `App Shell & Undo/Redo`, `Page Composition & Layout`, `Selection & Timeline Math`, `Timeline Editor`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `cn()` connect `UI Controls & Presets` to `Timeline Editor`, `Sidebar Control Panels`, `App Shell & Undo/Redo`, `Page Composition & Layout`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **What connects `config`, `config`, `eslintConfig` to the rest of the system?**
  _130 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `3D Canvas & SVG Extrusion` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `UI Controls & Presets` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Optimization & Architecture Docs` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
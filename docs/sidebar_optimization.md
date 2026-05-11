# Lumix3D Sidebar Audit

> **Persistence engine:** `redux-persist` + `localforage` via `persistConfig.ts`.
> Only keys listed in the `whitelist` survive a page reload.

---

## Whitelist (what IS persisted)

```
svgShapes · svgFile · extrusion · globalMaterial · globalTransform
background · lights · currentPreset · bloom · ground · showGrid
groups · is3DMode · globalTexture · timeline · collapsedSections · savedAnimations
```

---

## 🗂 Design Tab

### 1 — SVG Import (`SVGUploader`)
| | |
|---|---|
| **Persists?** | ❌ **NO** — `importedSvgs` is NOT in the whitelist |
| **What's lost** | All uploaded SVG entries (the file list) vanish on reload. Only their extracted shapes (`svgShapes`) survive if already converted to 3D. |

**Improvements needed:**
- Add `importedSvgs` to the persist whitelist — this is the most impactful missing entry.
- The SVG file's raw `svgText` can be large. Consider storing only the name + shape metadata and re-parsing on load, or using `localforage` chunked storage.
- There's no drag-and-drop zone — users can only click the upload button.
- No rename support for imported SVG entries.
- No reorder capability.

---

### 2 — Objects List (`ObjectsList`)
| | |
|---|---|
| **Persists?** | ✅ Shape list (`svgShapes`), groups (`groups`) survive. |
| **What's lost** | `expanded` (group collapse state) is local `useState` — lost on reload. |

**Improvements needed:**
- Group expand/collapse state (`expanded`) should be persisted (could be merged into `collapsedSections`).
- Shape names are generic ("Shape 1", "Shape 2") — no way to rename them.
- No drag-to-reorder shapes or groups.
- Selecting multiple shapes by shift-clicking the list is not supported.

---

### 3 — Shape Inspector (`ShapeInspector / ThreeDInspector`)
| | |
|---|---|
| **Persists?** | ✅ Per-shape extrusion overrides, material overrides, fill color, position/rotation/scale all persist via `svgShapes`. |
| **What's lost** | `selectedShapeId`, `selectedShapeIds`, `transformMode` reset on reload (intentionally correct). |

**Improvements needed:**
- Transform mode (`translate` / `rotate` / `scale`) could optionally be remembered.
- The "Rotation Presets" only show for the global object — could be useful for individual shapes too.
- No numeric XYZ position/rotation inputs visible in the inspector for individual shapes (only drag-to-move via gizmo).

---

### 4 — Extrusion Controls (`ExtrusionControls`)
| | |
|---|---|
| **Persists?** | ✅ Fully persisted (`extrusion` is whitelisted). |

**Improvements needed:**
- Bevel Enable toggle (`bevelEnabled`) exists in state but has **no UI toggle** in the sidebar — it's always `true`.
- Sliders work but there's no "Reset to default" button.

---

### 5 — Texture Controls (`TextureControls`)
| | |
|---|---|
| **Persists?** | ✅ `globalTexture` is whitelisted — all uploaded maps and their parameters survive. |
| **What's lost** | Nothing critical. |

**Improvements needed:**
- Textures are stored as base64 `data:` URLs in Redux state — very large. A 1 MB PNG becomes ~1.37 MB in state. This can cause `localforage` writes to be slow or hit size limits with multiple textures.
- No per-shape texture support — only global.
- No "drag & drop" upload; must use the Upload button.
- Texture Scale applies to all maps uniformly; no per-channel scale.
- No texture rotation/offset control.

---

## 🎬 Scene Tab

### 6 — Quick Scenes (`QuickScenes`)
| | |
|---|---|
| **Persists?** | ✅ Loading a demo scene updates whitelisted state, so results persist. |

**Improvements needed:**
- Only 4 hardcoded demo scenes — no way to save custom scenes to the quick-scenes panel (saved animations exist, but not saved full scenes).
- No preview thumbnail on the scene buttons (just a colored icon tile).
- Loading a quick scene completely replaces the current project without a confirmation dialog.

---

### 7 — Background & Grid (`BackgroundControls`)
| | |
|---|---|
| **Persists?** | ✅ Fully persisted (`background`, `showGrid` are whitelisted). |

**Improvements needed:**
- Image background only accepts a URL string — no file upload for local images.
- Gradient direction (angle) is not configurable for `linear-gradient`.
- Radial gradient center point is not configurable.
- No preview swatch showing the current gradient.

---

### 8 — Lighting (`LightingControls`)
| | |
|---|---|
| **Persists?** | ✅ `lights` + `currentPreset` are whitelisted — fully persists. |
| **What's lost** | The active **tab** (Presets vs Custom) resets to "Presets" on reload — `<Tabs defaultValue="presets">` is not persisted. |

**Improvements needed:**
- Active tab (Presets / Custom) resets on reload — small UX friction.
- Custom lights use generic names ("Ambient Light #1") with no rename.
- No way to **add** a new custom light — only delete existing ones. The `addLight` action exists but there's no "Add light" button in the UI.
- Spot / point light types are in the type definition but can't be added via the UI.
- Light `enabled` toggle exists in the state model but has no switch in the sidebar.

---

### 9 — Effects & Ground (`EffectControls`)
| | |
|---|---|
| **Persists?** | ✅ `bloom` and `ground` are whitelisted. Fully persists. |
| **What's lost** | `viewMode` (Normal / Solid / Wireframe) is **NOT in the whitelist** — resets to `"normal"` on reload. |

**Improvements needed:**
- **`viewMode` is missing from the persist whitelist** — users who switch to Wireframe or Solid mode will lose that on reload.
- No ambient occlusion (SSAO) or shadow quality controls.

---

## 🎵 Timeline (rendered in `features/three`, lives below Scene tab implicitly)

### 10 — Timeline Editor (`TimelineEditor`)
| | |
|---|---|
| **Persists?** | ✅ `timeline` (tracks, duration, loop, fps) is whitelisted. `savedAnimations` also whitelisted. |
| **What's lost** | `isPlaying` and `currentTime` will reload to `false` / `0` — correct behaviour. |

**Improvements needed:**
- `TimelineEditor` is not exposed inside the sidebar tabs — it's rendered elsewhere in the layout. It's not discoverable from the sidebar at all.
- No visual keyframe drag (move a keyframe by dragging on the track).
- Keyframe easing is not configurable (linear only).
- No multi-track selection or bulk keyframe operations.
- Saved animations panel (`savedAnimations`) has no UI in the sidebar — the state exists but there's no component to view/manage them from the sidebar.

---

## 🔧 Project Actions (header toolbar)

### 11 — Project Export/Import (`ProjectActions`)
| | |
|---|---|
| **Persists?** | N/A — these are actions, not state. |

**Improvements needed:**
- **No validation** of imported JSON beyond a basic `typeof === "object"` check — malformed or mismatched-version files silently corrupt state.
- Embed code options (`embedRotate`, `embedZoom`, `embedPan`, etc.) are **NOT in the persist whitelist** — they reset on every reload.
- The code modal renders inside the tiny header strip, making it visually awkward (fixed overlay helps but feels disconnected).
- No "Save as" versioning — importing overwrites without backup.

---

## 📋 Summary Table

| Feature | Panel | Persists? | Key Gap |
|---|---|---|---|
| SVG Import list | SVGUploader | ❌ **NO** | `importedSvgs` missing from whitelist |
| Group expand state | ObjectsList | ❌ **NO** | `useState` — not in Redux |
| Viewport Mode | EffectControls | ❌ **NO** | `viewMode` missing from whitelist |
| Embed code settings | ProjectActions | ❌ **NO** | `embedRotate/Zoom/Pan/…` not whitelisted |
| Active lighting tab | LightingControls | ❌ **NO** | `<Tabs defaultValue>` is component state |
| SVG Shapes | ObjectsList | ✅ | — |
| Groups | ObjectsList | ✅ | — |
| Extrusion | ExtrusionControls | ✅ | Missing bevel toggle UI |
| Global Texture | TextureControls | ✅ | Base64 size risk |
| Background + Grid | BackgroundControls | ✅ | No local image upload |
| Lights + Preset | LightingControls | ✅ | No add-light button |
| Bloom + Ground | EffectControls | ✅ | — |
| Timeline tracks | TimelineEditor | ✅ | No drag keyframes, no easing |
| Saved Animations | (no UI panel) | ✅ | State exists, no sidebar UI |
| 3D Mode flag | — | ✅ | — |
| Global Material | ShapeInspector | ✅ | — |
| Global Transform | ShapeInspector | ✅ | — |
| Collapsed sections | CollapsibleCard | ✅ | — |

---

## 🚀 Recommended Priority Fixes

1. **Add `importedSvgs` to the whitelist** — highest UX impact; uploaded SVGs disappear on reload.
2. **Add `viewMode` to the whitelist** — Wireframe/Solid mode resets silently.
3. **Add `embedRotate/Zoom/Pan/RotateX/Y/Z` to the whitelist** — embed settings forgotten.
4. **Add an "Add Light" button** to LightingControls → Custom tab.
5. **Add a `bevelEnabled` toggle** to ExtrusionControls.
6. **Add a "Saved Animations" section** to the sidebar to expose the existing state.
7. **Persist group expand state** — merge into `collapsedSections`.

# Features Checklist

## 1. Grid Toggle
- [ ] Add state for `showGrid` in Redux (Done)
- [ ] Connect `showGrid` state to `<Grid>` rendering in `Canvas3D`
- [ ] Add UI control to toggle grid in the sidebar (Global Settings / Inspector)

## 2. Global Transform (Select, Move, Rotate)
- [ ] Add state for `globalTransform` and global selection in Redux (Done)
- [ ] Add TransformControls for the entire global SVG group
- [ ] Add UI in the sidebar to switch global transform modes (Move, Rotate, Scale)

## 3. Background Features
- [ ] Support Background Types:
  - [ ] Solid Color
  - [ ] Gradient
  - [ ] Texture / Image / Photo
  - [ ] Pattern
  - [ ] 3D / Abstract
  - [ ] Transparent / Alpha
- [ ] Update `Canvas3D` background rendering logic
- [ ] Add UI in the sidebar to configure background types

## 4. Object Textures & Materials
- [ ] Add state for `globalMaterial` and per-shape `material` (Done)
- [ ] Update 3D mesh material rendering to use physical/standard materials with properties:
  - [ ] Roughness
  - [ ] Metalness
  - [ ] Transmission (Glass)
  - [ ] IOR
  - [ ] Clearcoat
- [ ] Add Presets (Plastic, Metallic, Matte, Glass, Wood, Chrome, Clay)
- [ ] Add UI controls in Inspector for Global and Per-Shape materials

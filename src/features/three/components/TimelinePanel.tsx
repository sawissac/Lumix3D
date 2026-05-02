"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setTimelinePlaying,
  setTimelineCurrentTime,
  setTimelineDuration,
  setTimelineLoop,
  addKeyframe,
  removeKeyframe,
  updateKeyframe,
  clearTimelineTracks,
  saveAnimation,
  applyAnimation,
  deleteSavedAnimation,
} from "@/store/slices/sceneSlice";
import type { Keyframe, SvgShape } from "@/types";
import {
  Play,
  Pause,
  Plus,
  Minus,
  Repeat,
  Clock,
  Film,
  Sparkles,
  ChevronDown,
  Save,
  Library,
  Trash2,
} from "lucide-react";
import { ensureBound, multiSelectAnimRef, updatePivot } from "../multiSelectAnim";

type PresetId = "circle" | "front-back" | "spin" | "pulse";

const PRESETS: { id: PresetId; label: string; desc: string }[] = [
  { id: "circle",     label: "Circle",     desc: "Orbit in XY plane" },
  { id: "front-back", label: "Front-Back", desc: "Oscillate in Z axis" },
  { id: "spin",       label: "Spin",       desc: "Full Y-axis rotation" },
  { id: "pulse",      label: "Pulse",      desc: "Scale in and out" },
];

function rotateAroundY(
  pos: [number, number, number],
  cx: number, cz: number,
  angle: number,
): [number, number, number] {
  const dx = pos[0] - cx;
  const dz = pos[2] - cz;
  return [
    cx + dx * Math.cos(angle) - dz * Math.sin(angle),
    pos[1],
    cz + dx * Math.sin(angle) + dz * Math.cos(angle),
  ];
}

function buildPresetKeyframes(
  preset: PresetId,
  shape: SvgShape,
  duration: number,
  groupCenter: [number, number, number],
): Omit<Keyframe, "id">[] {
  const pos = shape.position || [0, 0, 0] as [number, number, number];
  const [bx, by, bz] = pos;
  const [rx, ry, rz] = shape.rotation || [0, 0, 0];
  const [sx, sy, sz] = shape.scale   || [1, 1, 1];
  const [cx, cy, cz] = groupCenter;

  if (preset === "circle") {
    // group center orbits; each shape keeps its offset from center
    const ox = bx - cx, oy = by - cy;
    const r = 8;
    return Array.from({ length: 9 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return {
        time: (i / 8) * duration,
        position: [cx + r * Math.cos(a) + ox, cy + r * Math.sin(a) + oy, bz] as [number,number,number],
        rotation: [rx, ry, rz] as [number,number,number],
        scale:    [sx, sy, sz] as [number,number,number],
      };
    });
  }

  if (preset === "front-back") {
    const d = 12;
    return [
      { time: 0,            position: [bx, by, bz + 0] as [number,number,number], rotation: [rx,ry,rz] as [number,number,number], scale: [sx,sy,sz] as [number,number,number] },
      { time: duration*.25, position: [bx, by, bz + d] as [number,number,number], rotation: [rx,ry,rz] as [number,number,number], scale: [sx,sy,sz] as [number,number,number] },
      { time: duration*.75, position: [bx, by, bz - d] as [number,number,number], rotation: [rx,ry,rz] as [number,number,number], scale: [sx,sy,sz] as [number,number,number] },
      { time: duration,     position: [bx, by, bz + 0] as [number,number,number], rotation: [rx,ry,rz] as [number,number,number], scale: [sx,sy,sz] as [number,number,number] },
    ];
  }

  if (preset === "spin") {
    const steps = 16;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const angle = (i / steps) * Math.PI * 2;
      return {
        time: (i / steps) * duration,
        position: rotateAroundY(pos as [number,number,number], cx, cz, angle),
        rotation: [rx, ry, rz] as [number,number,number],
        scale:    [sx, sy, sz] as [number,number,number],
      };
    });
  }

  if (preset === "pulse") {
    const scaledPos = (f: number): [number,number,number] => [
      cx + (bx - cx) * f,
      cy + (by - cy) * f,
      cz + (bz - cz) * f,
    ];
    return [
      { time: 0,           position: scaledPos(1),   rotation: [rx,ry,rz] as [number,number,number], scale: [sx,   sy,   sz  ] as [number,number,number] },
      { time: duration*.5, position: scaledPos(1.4), rotation: [rx,ry,rz] as [number,number,number], scale: [sx*1.4,sy*1.4,sz*1.4] as [number,number,number] },
      { time: duration,    position: scaledPos(1),   rotation: [rx,ry,rz] as [number,number,number], scale: [sx,   sy,   sz  ] as [number,number,number] },
    ];
  }

  return [];
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  const ms = Math.floor((s % 1) * 100);
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
}

const RULER_STEPS = 10;

export function TimelinePanel() {
  const dispatch = useAppDispatch();
  const timeline = useAppSelector((s) => s.scene.timeline);
  const is3DMode = useAppSelector((s) => s.scene.is3DMode);
  const selectedShapeId = useAppSelector((s) => s.scene.selectedShapeId);
  const selectedShapeIds = useAppSelector((s) => s.scene.selectedShapeIds);
  const svgShapes = useAppSelector((s) => s.scene.svgShapes);
  const groups = useAppSelector((s) => s.scene.groups);
  const savedAnimations = useAppSelector((s) => s.scene.savedAnimations);
  const [showPresets, setShowPresets] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryAnchor, setLibraryAnchor] = useState<{
    top: number;
    right: number;
  } | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const presetsRef = useRef<HTMLDivElement>(null);
  const libraryBtnRef = useRef<HTMLButtonElement>(null);

  // Recompute library dropdown anchor on open and on window resize.
  useEffect(() => {
    if (!showLibrary) return;
    const update = () => {
      const btn = libraryBtnRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      setLibraryAnchor({
        top: rect.top - 4,
        right: window.innerWidth - rect.right,
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [showLibrary]);

  // Click outside to close library dropdown.
  useEffect(() => {
    if (!showLibrary) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (libraryBtnRef.current?.contains(target)) return;
      const portal = document.getElementById("library-dropdown-portal");
      if (portal?.contains(target)) return;
      setShowLibrary(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [showLibrary]);

  // Build display rows: group rows + ungrouped shape rows
  const displayRows = useMemo(() => {
    type GroupRow = { kind: "group"; group: (typeof groups)[0]; tracks: (typeof timeline.tracks) };
    type ShapeRow = { kind: "shape"; track: (typeof timeline.tracks)[0]; groupId?: string };
    type Row = GroupRow | ShapeRow;

    const rows: Row[] = [];
    const handledShapeIds = new Set<string>();

    // Group rows
    for (const group of groups) {
      const groupTracks = timeline.tracks.filter((t) => group.shapeIds.includes(t.shapeId));
      if (groupTracks.length === 0) continue;
      rows.push({ kind: "group", group, tracks: groupTracks });
      group.shapeIds.forEach((id) => handledShapeIds.add(id));
    }

    // Ungrouped shape rows
    for (const track of timeline.tracks) {
      if (!handledShapeIds.has(track.shapeId)) {
        rows.push({ kind: "shape", track });
      }
    }

    return rows;
  }, [timeline.tracks, groups]);

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      next.has(groupId) ? next.delete(groupId) : next.add(groupId);
      return next;
    });
  }, []);

  const activeIds =
    selectedShapeIds.length > 0
      ? selectedShapeIds
      : selectedShapeId
        ? [selectedShapeId]
        : [];

  const handleAddKeyframe = useCallback(() => {
    if (activeIds.length === 0) return;
    const now = Date.now();

    // For multi-selection, capture the group rotation context so that
    // playback can slerp positions around the group pivot instead of
    // chord-lerping each shape (which makes shapes cut through center
    // during a group rotation).
    let groupCtx: {
      selectionId: string;
      pivot: [number, number, number];
      quat: [number, number, number, number];
      scale: [number, number, number];
    } | null = null;

    if (activeIds.length > 1) {
      const positions = activeIds
        .map((id) => svgShapes.find((s) => s.id === id)?.position)
        .filter((p): p is [number, number, number] => !!p);
      if (positions.length > 0) {
        const pivot: [number, number, number] = [
          positions.reduce((s, p) => s + p[0], 0) / positions.length,
          positions.reduce((s, p) => s + p[1], 0) / positions.length,
          positions.reduce((s, p) => s + p[2], 0) / positions.length,
        ];
        ensureBound(activeIds, pivot);
        // Always refresh pivot to current group center so combined
        // translate + rotate gestures interpolate correctly.
        updatePivot(activeIds, pivot);
        const cur = multiSelectAnimRef.current;
        if (cur) {
          groupCtx = {
            selectionId: cur.selectionId,
            pivot: cur.pivot,
            quat: cur.quat,
            scale: cur.scale,
          };
        }
      }
    }

    activeIds.forEach((shapeId, i) => {
      const shape = svgShapes.find((s) => s.id === shapeId);
      if (!shape) return;
      dispatch(
        addKeyframe({
          shapeId,
          keyframe: {
            id: `kf-${now}-${i}`,
            time: timeline.currentTime,
            position: shape.position || [0, 0, 0],
            rotation: shape.rotation || [0, 0, 0],
            scale: shape.scale || [1, 1, 1],
            ...(groupCtx
              ? {
                  selectionId: groupCtx.selectionId,
                  pivot: groupCtx.pivot,
                  groupQuat: groupCtx.quat,
                  groupScale: groupCtx.scale,
                }
              : {}),
          },
        }),
      );
    });
  }, [activeIds, svgShapes, timeline.currentTime, dispatch]);

  const KF_TIME_TOLERANCE = 0.05;

  // Delete the keyframe at currentTime for each currently-selected shape.
  // For a single selected shape this removes only that one shape's keyframe,
  // leaving sibling tracks (e.g. other shapes in a group) untouched.
  const handleDeleteKeyframe = useCallback(() => {
    if (activeIds.length === 0) return;
    activeIds.forEach((shapeId) => {
      const track = timeline.tracks.find((t) => t.shapeId === shapeId);
      if (!track) return;
      const kf = track.keyframes.find(
        (k) => Math.abs(k.time - timeline.currentTime) < KF_TIME_TOLERANCE,
      );
      if (kf) {
        dispatch(removeKeyframe({ shapeId, keyframeId: kf.id }));
      }
    });
  }, [activeIds, timeline.tracks, timeline.currentTime, dispatch]);

  const hasKeyframeAtCurrentTime = activeIds.some((id) => {
    const track = timeline.tracks.find((t) => t.shapeId === id);
    return track?.keyframes.some(
      (k) => Math.abs(k.time - timeline.currentTime) < KF_TIME_TOLERANCE,
    );
  });

  const handleApplyPreset = useCallback((preset: PresetId) => {
    setShowPresets(false);
    if (activeIds.length === 0) return;

    const activeShapes = activeIds
      .map((id) => svgShapes.find((s) => s.id === id))
      .filter((s): s is SvgShape => !!s);

    // Compute bounding center of all selected shapes
    const positions = activeShapes.map((s) => s.position || [0, 0, 0] as [number,number,number]);
    const groupCenter: [number,number,number] = [
      positions.reduce((sum, p) => sum + p[0], 0) / positions.length,
      positions.reduce((sum, p) => sum + p[1], 0) / positions.length,
      positions.reduce((sum, p) => sum + p[2], 0) / positions.length,
    ];

    const now = Date.now();
    activeShapes.forEach((shape) => {
      buildPresetKeyframes(preset, shape, timeline.duration, groupCenter).forEach((kf, i) => {
        dispatch(addKeyframe({
          shapeId: shape.id,
          keyframe: { ...kf, id: `kf-preset-${now}-${shape.id}-${i}` },
        }));
      });
    });
  }, [activeIds, svgShapes, timeline.duration, dispatch]);

  const handleSaveAnimation = useCallback(() => {
    if (activeIds.length === 0) return;
    dispatch(saveAnimation({ name: saveName, shapeIds: activeIds }));
    setSaveName("");
    setShowSaveDialog(false);
  }, [activeIds, saveName, dispatch]);

  const handleApplySavedAnimation = useCallback(
    (animationId: string) => {
      if (activeIds.length === 0) return;
      dispatch(applyAnimation({ animationId, targetIds: activeIds }));
      setShowLibrary(false);
    },
    [activeIds, dispatch],
  );

  const handleRulerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      dispatch(setTimelineCurrentTime(ratio * timeline.duration));
    },
    [timeline.duration, dispatch],
  );

  const handleKeyframeDrag = useCallback(
    (shapeId: string, kf: Keyframe, duration: number, e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.preventDefault();

      const lane = (e.currentTarget as HTMLElement).parentElement;
      if (!lane) return;

      const onMove = (me: PointerEvent) => {
        const rect = lane.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (me.clientX - rect.left) / rect.width));
        dispatch(updateKeyframe({ shapeId, keyframe: { ...kf, time: ratio * duration } }));
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [dispatch],
  );

  if (!is3DMode) return null;

  const marks = Array.from({ length: RULER_STEPS + 1 }, (_, i) => i / RULER_STEPS);
  const playheadPct = (timeline.currentTime / timeline.duration) * 100;

  return (
    <div className="h-full border-t border-white/8 bg-black/50 backdrop-blur-sm flex flex-col min-h-0">
      {/* Controls */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5 shrink-0">
        <Film className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Timeline</span>

        <button
          onClick={() => dispatch(setTimelinePlaying(!timeline.isPlaying))}
          className="w-6 h-6 rounded bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 transition-colors"
        >
          {timeline.isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-px" />}
        </button>

        <button
          onClick={() => dispatch(setTimelineLoop(!timeline.loop))}
          className={`w-6 h-6 rounded flex items-center justify-center transition-colors border ${
            timeline.loop
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
              : "bg-white/5 border-white/10 text-white/30 hover:text-white/60"
          }`}
          title="Toggle loop"
        >
          <Repeat className="w-3 h-3" />
        </button>

        <button
          onClick={() => dispatch(setTimelineCurrentTime(0))}
          className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/40 hover:text-white/70 transition-colors"
        >
          Reset
        </button>

        <span className="text-[10px] font-mono text-white/40 tabular-nums">
          {formatTime(timeline.currentTime)}
          <span className="text-white/20"> / </span>
          {formatTime(timeline.duration)}
        </span>

        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-white/25" />
          <input
            type="number"
            min={0.1}
            max={60}
            step={0.1}
            value={timeline.duration}
            onChange={(e) => dispatch(setTimelineDuration(parseFloat(e.target.value)))}
            className="w-12 bg-white/5 border border-white/10 rounded px-1 py-0.5 text-[10px] text-white/60 focus:outline-none focus:border-indigo-500/50"
          />
          <span className="text-[10px] text-white/25">s</span>
        </div>

        <div className="flex-1" />

        {activeIds.length > 0 && (
          <button
            onClick={handleAddKeyframe}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25 transition-colors text-[10px]"
          >
            <Plus className="w-3 h-3" />
            {activeIds.length > 1 ? `Add Keyframe (${activeIds.length})` : "Add Keyframe"}
          </button>
        )}

        {activeIds.length > 0 && hasKeyframeAtCurrentTime && (
          <button
            onClick={handleDeleteKeyframe}
            title="Delete keyframe at current time for selected shape(s)"
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25 transition-colors text-[10px]"
          >
            <Minus className="w-3 h-3" />
            {activeIds.length > 1
              ? `Delete Keyframe (${activeIds.length})`
              : "Delete Keyframe"}
          </button>
        )}

        {/* Presets dropdown */}
        <div className="relative" ref={presetsRef}>
          <button
            onClick={() => setShowPresets((v) => !v)}
            disabled={activeIds.length === 0}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 transition-colors text-[10px] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-3 h-3" />
            Preset
            <ChevronDown className="w-2.5 h-2.5" />
          </button>

          {showPresets && (
            <div className="absolute bottom-full mb-1 right-0 w-44 rounded-lg border border-white/10 bg-black/90 backdrop-blur-sm shadow-xl z-30 py-1 overflow-hidden">
              <div className="px-2 py-1 text-[9px] text-white/30 uppercase tracking-wider font-semibold">
                Apply to selection
              </div>
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleApplyPreset(p.id)}
                  className="w-full flex flex-col px-3 py-1.5 hover:bg-purple-500/15 transition-colors text-left"
                >
                  <span className="text-[10px] text-white/70 font-medium">{p.label}</span>
                  <span className="text-[9px] text-white/30">{p.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Save current selection's tracks as a reusable animation */}
        <button
          onClick={() => setShowSaveDialog(true)}
          disabled={
            activeIds.length === 0 ||
            !activeIds.some((id) =>
              timeline.tracks.some(
                (t) => t.shapeId === id && t.keyframes.length > 0,
              ),
            )
          }
          title="Save current keyframes for selection as a reusable animation"
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-colors text-[10px] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Save className="w-3 h-3" />
          Save
        </button>

        {/* Library of saved animations */}
        <button
          ref={libraryBtnRef}
          onClick={() => setShowLibrary((v) => !v)}
          title="Saved animation library"
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-colors text-[10px]"
        >
          <Library className="w-3 h-3" />
          Library ({savedAnimations.length})
          <ChevronDown className="w-2.5 h-2.5" />
        </button>

        <button
          onClick={() => dispatch(clearTimelineTracks())}
          className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Library dropdown (portaled to body so parent overflow doesn't clip) */}
      {showLibrary &&
        libraryAnchor &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            id="library-dropdown-portal"
            style={{
              position: "fixed",
              top: libraryAnchor.top,
              right: libraryAnchor.right,
              transform: "translateY(-100%)",
              zIndex: 1000,
            }}
            className="w-60 rounded-lg border border-white/10 bg-black/90 backdrop-blur-sm shadow-xl py-1 overflow-hidden"
          >
            <div className="px-2 py-1 text-[9px] text-white/30 uppercase tracking-wider font-semibold">
              {savedAnimations.length === 0
                ? "No saved animations"
                : "Apply saved animation"}
            </div>
            {savedAnimations.length === 0 && (
              <div className="px-3 py-2 text-[10px] text-white/40">
                Use the green Save button to store the current selection&apos;s
                keyframes here.
              </div>
            )}
            {savedAnimations.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-1 px-2 py-1 hover:bg-amber-500/10 transition-colors group"
              >
                <button
                  onClick={() => handleApplySavedAnimation(a.id)}
                  disabled={activeIds.length === 0}
                  className="flex flex-col flex-1 text-left disabled:opacity-30 disabled:cursor-not-allowed"
                  title={
                    activeIds.length === 0
                      ? "Select shapes first to apply"
                      : `Apply to ${activeIds.length} selected shape${activeIds.length === 1 ? "" : "s"}`
                  }
                >
                  <span className="text-[10px] text-white/80 font-medium truncate">
                    {a.name}
                  </span>
                  <span className="text-[9px] text-white/30">
                    {a.tracks.length} track{a.tracks.length === 1 ? "" : "s"}
                    {" · "}
                    {a.duration.toFixed(1)}s
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(deleteSavedAnimation(a.id));
                  }}
                  title="Delete saved animation"
                  className="text-white/30 hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>,
          document.body,
        )}

      {/* Save Animation dialog */}
      {showSaveDialog && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowSaveDialog(false)}
        >
          <div
            className="rounded-xl p-4 shadow-2xl border border-white/10 w-80"
            style={{
              background: "rgba(15, 15, 25, 0.95)",
              backdropFilter: "blur(24px) saturate(200%)",
              WebkitBackdropFilter: "blur(24px) saturate(200%)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-white mb-2">
              Save Animation
            </h3>
            <p className="text-xs text-white/60 mb-3">
              Save keyframes for {activeIds.length} selected shape
              {activeIds.length === 1 ? "" : "s"} as a reusable preset.
            </p>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveAnimation();
                if (e.key === "Escape") setShowSaveDialog(false);
              }}
              placeholder="Animation name..."
              autoFocus
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white/90 hover:bg-white/6 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAnimation}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/40 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Track area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Label column */}
        <div className="w-24 shrink-0 border-r border-white/5 flex flex-col">
          <div className="h-5 border-b border-white/5 shrink-0" />
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {displayRows.map((row) => {
              if (row.kind === "group") {
                const isExpanded = expandedGroups.has(row.group.id);
                const isGroupSelected = row.group.shapeIds.some((id) => activeIds.includes(id));
                return (
                  <div key={`group-${row.group.id}`}>
                    <div
                      className={`h-8 flex items-center gap-1 px-2 border-b border-white/4 cursor-pointer select-none ${isGroupSelected ? "bg-indigo-500/10" : "hover:bg-white/3"}`}
                      onClick={() => toggleGroup(row.group.id)}
                    >
                      <ChevronDown className={`w-3 h-3 text-indigo-400/70 shrink-0 transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] text-indigo-300/80 truncate leading-tight font-medium">{row.group.name}</span>
                        <span className="text-[8px] text-white/30 leading-tight">{row.tracks.length} shapes</span>
                      </div>
                    </div>
                    {isExpanded && row.tracks.map((track) => {
                      const shapeIdx = svgShapes.findIndex((s) => s.id === track.shapeId);
                      const isSelected = activeIds.includes(track.shapeId);
                      return (
                        <div
                          key={track.shapeId}
                          className={`h-7 flex items-center px-3 border-b border-white/4 ${isSelected ? "bg-indigo-500/8" : ""}`}
                        >
                          <span className="text-[8px] text-white/40 truncate leading-tight pl-2">Shape {shapeIdx >= 0 ? shapeIdx + 1 : "?"}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              }
              // ungrouped shape
              const shapeIdx = svgShapes.findIndex((s) => s.id === row.track.shapeId);
              const isSelected = activeIds.includes(row.track.shapeId);
              return (
                <div
                  key={row.track.shapeId}
                  className={`h-8 flex items-center px-2 border-b border-white/4 ${isSelected ? "bg-indigo-500/8" : ""}`}
                >
                  <span className="text-[9px] text-white/50 truncate leading-tight">Shape {shapeIdx >= 0 ? shapeIdx + 1 : "?"}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ruler + lanes */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Ruler */}
          <div
            className="relative h-5 shrink-0 border-b border-white/5 bg-white/2 cursor-pointer select-none"
            onClick={handleRulerClick}
          >
            {marks.map((ratio) => (
              <div
                key={ratio}
                className="absolute top-0 flex flex-col items-center pointer-events-none"
                style={{ left: `${ratio * 100}%` }}
              >
                <div className="w-px h-2 bg-white/20" />
                <span className="text-[7px] text-white/25 font-mono leading-none mt-px">
                  {(ratio * timeline.duration).toFixed(1)}
                </span>
              </div>
            ))}
            <div
              className="absolute top-0 bottom-0 w-px bg-indigo-400 pointer-events-none"
              style={{ left: `${playheadPct}%` }}
            />
          </div>

          {/* Track lanes */}
          <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            {timeline.tracks.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white/20 pointer-events-none">
                {activeIds.length > 0 ? 'Click "Add Keyframe" to start' : "Select an object or group then add keyframes"}
              </div>
            )}

            {displayRows.map((row) => {
              if (row.kind === "group") {
                const isExpanded = expandedGroups.has(row.group.id);
                // Merged keyframe times across all tracks in group (deduplicated within 0.01s)
                const mergedTimes: number[] = [];
                for (const track of row.tracks) {
                  for (const kf of track.keyframes) {
                    if (!mergedTimes.some((t) => Math.abs(t - kf.time) < 0.01)) {
                      mergedTimes.push(kf.time);
                    }
                  }
                }
                mergedTimes.sort((a, b) => a - b);

                return (
                  <div key={`group-lane-${row.group.id}`}>
                    {/* Group summary lane */}
                    <div
                      className="relative h-8 border-b border-white/4 cursor-pointer select-none hover:bg-white/2 bg-indigo-500/3"
                      onClick={handleRulerClick}
                    >
                      <div className="absolute top-0 bottom-0 w-px bg-indigo-400/30 pointer-events-none" style={{ left: `${playheadPct}%` }} />
                      {mergedTimes.map((t) => {
                        const leftPct = Math.min((t / timeline.duration) * 100, 99.5);
                        const isActive = Math.abs(t - timeline.currentTime) < 0.05;
                        return (
                          <div
                            key={t}
                            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border pointer-events-none ${
                              isActive
                                ? "bg-indigo-400 border-indigo-200 shadow-[0_0_6px_rgba(99,102,241,0.8)]"
                                : "bg-indigo-500/50 border-indigo-400/50"
                            }`}
                            style={{ left: `${leftPct}%` }}
                          />
                        );
                      })}
                    </div>
                    {/* Expanded individual lanes */}
                    {isExpanded && row.tracks.map((track) => {
                      const isSelected = activeIds.includes(track.shapeId);
                      return (
                        <div
                          key={track.shapeId}
                          className={`relative h-7 border-b border-white/4 cursor-pointer select-none ${isSelected ? "bg-indigo-500/5" : "hover:bg-white/2"}`}
                          onClick={handleRulerClick}
                        >
                          <div className="absolute top-0 bottom-0 w-px bg-indigo-400/20 pointer-events-none" style={{ left: `${playheadPct}%` }} />
                          {track.keyframes.map((kf) => {
                            const leftPct = Math.min((kf.time / timeline.duration) * 100, 99.5);
                            const isActive = Math.abs(kf.time - timeline.currentTime) < 0.05;
                            return (
                              <div
                                key={kf.id}
                                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 border cursor-grab active:cursor-grabbing transition-colors z-10 ${
                                  isActive
                                    ? "bg-indigo-400 border-indigo-200 shadow-[0_0_6px_rgba(99,102,241,0.8)]"
                                    : "bg-indigo-600/70 border-indigo-400/70 hover:bg-indigo-400 hover:border-indigo-200"
                                }`}
                                style={{ left: `${leftPct}%` }}
                                title={`${kf.time.toFixed(2)}s`}
                                onPointerDown={(e) => handleKeyframeDrag(track.shapeId, kf, timeline.duration, e)}
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  dispatch(removeKeyframe({ shapeId: track.shapeId, keyframeId: kf.id }));
                                }}
                              />
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              }

              // Ungrouped shape lane
              const isSelected = activeIds.includes(row.track.shapeId);
              return (
                <div
                  key={row.track.shapeId}
                  className={`relative h-8 border-b border-white/4 cursor-pointer select-none ${isSelected ? "bg-indigo-500/5" : "hover:bg-white/2"}`}
                  onClick={handleRulerClick}
                >
                  <div className="absolute top-0 bottom-0 w-px bg-indigo-400/30 pointer-events-none" style={{ left: `${playheadPct}%` }} />
                  {row.track.keyframes.map((kf) => {
                    const leftPct = Math.min((kf.time / timeline.duration) * 100, 99.5);
                    const isActive = Math.abs(kf.time - timeline.currentTime) < 0.05;
                    return (
                      <div
                        key={kf.id}
                        className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border cursor-grab active:cursor-grabbing transition-colors z-10 ${
                          isActive
                            ? "bg-indigo-400 border-indigo-200 shadow-[0_0_6px_rgba(99,102,241,0.8)]"
                            : "bg-indigo-600/70 border-indigo-400/70 hover:bg-indigo-400 hover:border-indigo-200"
                        }`}
                        style={{ left: `${leftPct}%` }}
                        title={`${kf.time.toFixed(2)}s — drag to move, right-click to delete`}
                        onPointerDown={(e) => handleKeyframeDrag(row.track.shapeId, kf, timeline.duration, e)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          dispatch(removeKeyframe({ shapeId: row.track.shapeId, keyframeId: kf.id }));
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

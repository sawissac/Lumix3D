"use client";

import { useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setTimelinePlaying,
  setTimelineCurrentTime,
  setTimelineDuration,
  setTimelineLoop,
  addKeyframe,
  removeKeyframe,
  clearTimelineTracks,
} from "@/store/slices/sceneSlice";
import { Play, Pause, Plus, Trash2, Clock, Repeat, Film } from "lucide-react";

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  const ms = Math.floor((s % 1) * 100);
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
}

export function TimelineEditor() {
  const dispatch = useAppDispatch();
  const timeline = useAppSelector((s) => s.scene.timeline);
  const is3DMode = useAppSelector((s) => s.scene.is3DMode);
  const selectedShapeId = useAppSelector((s) => s.scene.selectedShapeId);
  const selectedShapeIds = useAppSelector((s) => s.scene.selectedShapeIds);
  const svgShapes = useAppSelector((s) => s.scene.svgShapes);

  const activeShapeId =
    selectedShapeId ||
    (selectedShapeIds.length === 1 ? selectedShapeIds[0] : null);
  const shape = svgShapes.find((s) => s.id === activeShapeId);

  const track = useMemo(
    () => timeline.tracks.find((t) => t.shapeId === activeShapeId),
    [timeline.tracks, activeShapeId],
  );

  const handleAddKeyframe = useCallback(() => {
    if (!activeShapeId || !shape) return;
    const id = `kf-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    dispatch(
      addKeyframe({
        shapeId: activeShapeId,
        keyframe: {
          id,
          time: timeline.currentTime,
          position: shape.position || [0, 0, 0],
          rotation: shape.rotation || [0, 0, 0],
          scale: shape.scale || [1, 1, 1],
        },
      }),
    );
  }, [activeShapeId, shape, timeline.currentTime, dispatch]);

  const handleRemoveKeyframe = useCallback(
    (keyframeId: string) => {
      if (!activeShapeId) return;
      dispatch(removeKeyframe({ shapeId: activeShapeId, keyframeId }));
    },
    [activeShapeId, dispatch],
  );

  const handleScrub = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(setTimelineCurrentTime(parseFloat(e.target.value)));
    },
    [dispatch],
  );

  const handleDurationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(setTimelineDuration(parseFloat(e.target.value)));
    },
    [dispatch],
  );

  if (!is3DMode) return null;

  return (
    <Card className="border-white/10 bg-white/3">
      <CardHeader className="pb-2 pt-3 px-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-3.5 h-3.5 text-indigo-400" />
            <CardTitle className="text-white/70 text-xs font-semibold uppercase tracking-wider">
              Timeline
            </CardTitle>
          </div>
          <span className="text-[10px] text-white/30 font-mono">
            {formatTime(timeline.currentTime)} / {formatTime(timeline.duration)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch(setTimelinePlaying(!timeline.isPlaying))}
            className="w-7 h-7 rounded-md bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 transition-colors"
          >
            {timeline.isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5 ml-0.5" />
            )}
          </button>

          <button
            onClick={() => dispatch(setTimelineLoop(!timeline.loop))}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors border ${
              timeline.loop
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                : "bg-white/5 border-white/10 text-white/30 hover:text-white/60"
            }`}
            title="Toggle loop"
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => dispatch(setTimelineCurrentTime(0))}
            className="text-[10px] px-2 py-1 rounded-md bg-white/5 border border-white/10 text-white/40 hover:text-white/70 transition-colors"
          >
            Reset
          </button>

          <div className="flex-1" />

          <button
            onClick={() => dispatch(clearTimelineTracks())}
            className="text-[10px] px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* Scrubber */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={timeline.duration}
              step={0.01}
              value={timeline.currentTime}
              onChange={handleScrub}
              className="flex-1 h-1.5 accent-indigo-400 appearance-none bg-white/10 rounded-full cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-white/30 font-mono">
            <span>0.00</span>
            <span>{timeline.duration.toFixed(2)}s</span>
          </div>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-white/30" />
          <span className="text-[10px] text-white/40">Duration</span>
          <input
            type="number"
            min={0.1}
            max={60}
            step={0.1}
            value={timeline.duration}
            onChange={handleDurationChange}
            className="w-14 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-white/60 focus:outline-none focus:border-indigo-500/50"
          />
          <span className="text-[10px] text-white/30">s</span>
        </div>

        {/* Keyframes for selected object */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">
              Keyframes
            </span>
            {activeShapeId && (
              <button
                onClick={handleAddKeyframe}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25 transition-colors text-[10px]"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            )}
          </div>

          {!activeShapeId && (
            <p className="text-[10px] text-white/30">
              Select a single object to add keyframes
            </p>
          )}

          {activeShapeId && (!track || track.keyframes.length === 0) && (
            <p className="text-[10px] text-white/30">
              No keyframes for this object
            </p>
          )}

          {track && track.keyframes.length > 0 && (
            <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
              {track.keyframes.map((kf) => {
                const isActive =
                  Math.abs(kf.time - timeline.currentTime) < 0.05;
                return (
                  <div
                    key={kf.id}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded border text-[10px] transition-colors ${
                      isActive
                        ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
                        : "bg-white/3 border-white/5 text-white/50"
                    }`}
                  >
                    <button
                      onClick={() => dispatch(setTimelineCurrentTime(kf.time))}
                      className="font-mono text-[10px] w-10 text-left hover:text-white/80 transition-colors"
                    >
                      {kf.time.toFixed(2)}s
                    </button>
                    <div className="flex-1 flex items-center gap-1 overflow-hidden">
                      {kf.position && (
                        <span className="text-[9px] bg-white/5 px-1 rounded truncate">
                          P
                        </span>
                      )}
                      {kf.rotation && (
                        <span className="text-[9px] bg-white/5 px-1 rounded truncate">
                          R
                        </span>
                      )}
                      {kf.scale && (
                        <span className="text-[9px] bg-white/5 px-1 rounded truncate">
                          S
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveKeyframe(kf.id)}
                      className="text-white/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mini track visualization */}
          {timeline.tracks.length > 0 && (
            <div className="pt-1">
              <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">
                All Tracks ({timeline.tracks.length})
              </div>
              <div className="space-y-1">
                {timeline.tracks.map((t) => {
                  const shapeIdx = svgShapes.findIndex(
                    (s) => s.id === t.shapeId,
                  );
                  return (
                    <div
                      key={t.shapeId}
                      className="relative h-3 bg-white/5 rounded overflow-hidden"
                    >
                      <div className="absolute inset-y-0 left-0 text-[8px] text-white/30 px-1 flex items-center z-10">
                        Shape {shapeIdx >= 0 ? shapeIdx + 1 : "?"}
                      </div>
                      {t.keyframes.map((kf) => {
                        const left = (kf.time / timeline.duration) * 100;
                        return (
                          <div
                            key={kf.id}
                            className="absolute top-0.5 bottom-0.5 w-1 rounded-sm bg-indigo-400/60"
                            style={{ left: `${Math.min(left, 99)}%` }}
                          />
                        );
                      })}
                      <div
                        className="absolute top-0 bottom-0 w-px bg-white/40"
                        style={{
                          left: `${(timeline.currentTime / timeline.duration) * 100}%`,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

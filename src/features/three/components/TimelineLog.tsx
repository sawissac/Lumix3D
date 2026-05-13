"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Circle, Square, Trash2, Copy, Check } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { shapeObjectRegistry } from "../shapeObjectRegistry";
import { CollapsibleCard } from "@/features/sidebar/components/CollapsibleCard";

// Read rotation via YXZ Euler order from the object's quaternion.
// Default XYZ order flips X and Z to ±π when Y rotates past ±π/2 (an
// equivalent decomposition of the same orientation), making pure-Y
// rotations look like all three axes are changing. YXZ keeps Y clean
// when the dominant axis is Y.
const _eulRead = new THREE.Euler(0, 0, 0, "YXZ");

function fmt(n: number): string {
  return n.toFixed(2);
}

function fmtTime(s: number): string {
  const sec = Math.floor(s);
  const ms = Math.floor((s % 1) * 1000);
  return `${sec.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
}

type RowRefs = {
  pos: HTMLSpanElement | null;
  rot: HTMLSpanElement | null;
  scl: HTMLSpanElement | null;
};

type SnapshotEntry = {
  id: string;
  label: string;
  pos: [number, number, number];
  rot: [number, number, number];
  scl: [number, number, number];
};

type Snapshot = {
  t: number;
  entries: SnapshotEntry[];
};

const SAMPLE_INTERVAL_MS = 100;
const MAX_RECORDS = 500;

export function TimelineLog() {
  const is3DMode = useAppSelector((s) => s.scene.is3DMode);
  const tracks = useAppSelector((s) => s.scene.timeline.tracks);
  const svgShapes = useAppSelector((s) => s.scene.svgShapes);
  const glbObjects = useAppSelector((s) => s.scene.glbObjects);
  const isPlaying = useAppSelector((s) => s.scene.timeline.isPlaying);
  const currentTime = useAppSelector((s) => s.scene.timeline.currentTime);

  const rows = useMemo(
    () =>
      tracks.map((track) => {
        const glb = glbObjects.find((g) => g.id === track.shapeId);
        if (glb) return { id: track.shapeId, label: glb.name };
        const idx = svgShapes.findIndex((s) => s.id === track.shapeId);
        return {
          id: track.shapeId,
          label: `Shape ${idx >= 0 ? idx + 1 : "?"}`,
        };
      }),
    [tracks, svgShapes, glbObjects],
  );

  const refsMap = useRef<Map<string, RowRefs>>(new Map());

  const [recording, setRecording] = useState(false);
  const [records, setRecords] = useState<Snapshot[]>([]);
  const [copied, setCopied] = useState(false);
  const lastSampleRef = useRef<number>(0);
  const currentTimeRef = useRef<number>(currentTime);
  const rowsRef = useRef<typeof rows>(rows);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  useEffect(() => {
    if (!is3DMode) return;
    let rafId: number;

    const tick = () => {
      refsMap.current.forEach((r, id) => {
        const obj = shapeObjectRegistry.get(id);
        if (!obj) return;
        if (r.pos)
          r.pos.textContent = `${fmt(obj.position.x)} ${fmt(obj.position.y)} ${fmt(obj.position.z)}`;
        if (r.rot) {
          _eulRead.setFromQuaternion(obj.quaternion, "YXZ");
          r.rot.textContent = `${fmt(_eulRead.x)} ${fmt(_eulRead.y)} ${fmt(_eulRead.z)}`;
        }
        if (r.scl)
          r.scl.textContent = `${fmt(obj.scale.x)} ${fmt(obj.scale.y)} ${fmt(obj.scale.z)}`;
      });

      if (recording && isPlaying) {
        const now = performance.now();
        if (now - lastSampleRef.current >= SAMPLE_INTERVAL_MS) {
          lastSampleRef.current = now;
          const entries: SnapshotEntry[] = [];
          for (const row of rowsRef.current) {
            const obj = shapeObjectRegistry.get(row.id);
            if (!obj) continue;
            _eulRead.setFromQuaternion(obj.quaternion, "YXZ");
            entries.push({
              id: row.id,
              label: row.label,
              pos: [obj.position.x, obj.position.y, obj.position.z],
              rot: [_eulRead.x, _eulRead.y, _eulRead.z],
              scl: [obj.scale.x, obj.scale.y, obj.scale.z],
            });
          }
          if (entries.length > 0) {
            setRecords((prev) => {
              const next = [...prev, { t: currentTimeRef.current, entries }];
              return next.length > MAX_RECORDS
                ? next.slice(next.length - MAX_RECORDS)
                : next;
            });
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [is3DMode, recording, isPlaying]);

  const toggleRecord = useCallback(() => {
    setRecording((prev) => {
      const next = !prev;
      if (next) lastSampleRef.current = 0;
      return next;
    });
  }, []);

  const clearRecords = useCallback(() => setRecords([]), []);

  const copyRecords = useCallback(async () => {
    if (records.length === 0) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(records, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // clipboard blocked — silent
    }
  }, [records]);

  if (!is3DMode) return null;

  const headerExtra = (
    <div className="flex items-center gap-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleRecord();
        }}
        title={recording ? "Stop recording" : "Start recording"}
        className={`h-5 px-1.5 rounded flex items-center gap-1 text-[9px] uppercase tracking-wider font-semibold transition-colors border ${
          recording
            ? "bg-red-500/20 border-red-500/40 text-red-300 animate-pulse"
            : "bg-white/5 border-white/10 text-white/50 hover:text-white/80"
        }`}
      >
        {recording ? (
          <>
            <Square className="w-2.5 h-2.5 fill-current" />
            Stop
          </>
        ) : (
          <>
            <Circle className="w-2.5 h-2.5 fill-current" />
            Rec
          </>
        )}
      </button>
      {records.length > 0 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyRecords();
            }}
            title="Copy log as JSON"
            className="h-5 w-5 rounded bg-white/5 border border-white/10 text-white/50 hover:text-white/80 flex items-center justify-center"
          >
            {copied ? (
              <Check className="w-2.5 h-2.5 text-emerald-400" />
            ) : (
              <Copy className="w-2.5 h-2.5" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearRecords();
            }}
            title="Clear log"
            className="h-5 w-5 rounded bg-white/5 border border-white/10 text-white/50 hover:text-red-300 flex items-center justify-center"
          >
            <Trash2 className="w-2.5 h-2.5" />
          </button>
        </>
      )}
    </div>
  );

  return (
    <CollapsibleCard
      id="animation-log"
      title="Animation Log"
      description={
        rows.length === 0
          ? "Add keyframes to log object properties"
          : `${rows.length} tracked · ${records.length} record${records.length === 1 ? "" : "s"}`
      }
      headerExtra={headerExtra}
      contentClassName="pt-2 space-y-3"
    >
      {rows.length > 0 && (
        <ul className="space-y-1.5 max-h-72 overflow-y-auto custom-scrollbar pr-1">
          {rows.map((row, i) => (
            <li
              key={row.id}
              className="rounded-md bg-black/20 border border-white/5 px-2 py-1.5"
            >
              <div className="text-[11px] text-white/85 font-medium truncate mb-1">
                <span className="text-indigo-300/80">[{i + 1}]</span>{" "}
                <span className="text-white/40">-</span> {row.label}
              </div>
              {(
                [
                  { label: "pos", key: "pos" as const },
                  { label: "rot", key: "rot" as const },
                  { label: "scl", key: "scl" as const },
                ]
              ).map(({ label, key }) => (
                <div
                  key={key}
                  className="flex items-center gap-2 font-mono text-[10px] leading-tight"
                >
                  <span className="text-white/30 w-6">{label}:</span>
                  <span
                    ref={(el) => {
                      const cur = refsMap.current.get(row.id) ?? {
                        pos: null,
                        rot: null,
                        scl: null,
                      };
                      cur[key] = el;
                      refsMap.current.set(row.id, cur);
                    }}
                    className="text-white/75 tabular-nums"
                  />
                </div>
              ))}
            </li>
          ))}
        </ul>
      )}

      {records.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1 px-0.5">
            <span className="text-[9px] text-white/40 uppercase tracking-wider font-semibold">
              Records ({records.length})
            </span>
            {records.length >= MAX_RECORDS && (
              <span className="text-[9px] text-amber-400/70">cap reached</span>
            )}
          </div>
          <ul className="space-y-1 max-h-80 overflow-y-auto custom-scrollbar pr-1">
            {records.map((snap, idx) => (
              <li
                key={idx}
                className="rounded-md bg-black/30 border border-white/5 px-2 py-1"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-indigo-300/70 text-[9px] font-mono">
                    #{idx + 1}
                  </span>
                  <span className="text-white/40 text-[9px] font-mono tabular-nums">
                    t={fmtTime(snap.t)}s
                  </span>
                </div>
                {snap.entries.map((e, ei) => (
                  <div
                    key={`${e.id}-${ei}`}
                    className="pl-2 border-l border-white/10 mb-0.5"
                  >
                    <div className="text-[10px] text-white/65 truncate">
                      {e.label}
                    </div>
                    <div className="font-mono text-[9px] text-white/50 tabular-nums leading-snug">
                      pos {fmt(e.pos[0])} {fmt(e.pos[1])} {fmt(e.pos[2])}
                    </div>
                    <div className="font-mono text-[9px] text-white/50 tabular-nums leading-snug">
                      rot {fmt(e.rot[0])} {fmt(e.rot[1])} {fmt(e.rot[2])}
                    </div>
                    <div className="font-mono text-[9px] text-white/50 tabular-nums leading-snug">
                      scl {fmt(e.scl[0])} {fmt(e.scl[1])} {fmt(e.scl[2])}
                    </div>
                  </div>
                ))}
              </li>
            ))}
          </ul>
        </div>
      )}
    </CollapsibleCard>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import { liveTransform } from "../liveTransform";

function fmt(n: number) {
  return n.toFixed(3);
}

function fmtRow(values: [number, number, number]) {
  return `x:${fmt(values[0])}  y:${fmt(values[1])}  z:${fmt(values[2])}`;
}

export function TransformLog() {
  const is3DMode = useAppSelector((s) => s.scene.is3DMode);

  const posRef = useRef<HTMLSpanElement>(null);
  const rotRef = useRef<HTMLSpanElement>(null);
  const sclRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!is3DMode) return;

    let rafId: number;

    function tick() {
      if (posRef.current) posRef.current.textContent = fmtRow(liveTransform.position);
      if (rotRef.current) rotRef.current.textContent = fmtRow(liveTransform.rotation);
      if (sclRef.current) sclRef.current.textContent = fmtRow(liveTransform.scale);
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [is3DMode]);

  if (!is3DMode) return null;

  return (
    <div className="absolute bottom-5 right-5 z-20 pointer-events-none select-none">
      <div className="glass rounded-lg px-3 py-2 border border-white/8 shadow-lg space-y-0.5">
        {(
          [
            { label: "pos", ref: posRef },
            { label: "rot", ref: rotRef },
            { label: "scl", ref: sclRef },
          ] as const
        ).map(({ label, ref }) => (
          <div key={label} className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-white/30 w-5">{label}</span>
            <span ref={ref} className="text-indigo-300 tabular-nums" />
          </div>
        ))}
      </div>
    </div>
  );
}

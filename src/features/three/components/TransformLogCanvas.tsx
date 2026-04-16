"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { globalGroupRef } from "../globalGroupRef";

const f = (n: number) => n.toFixed(3);
const row = (x: number, y: number, z: number) => `${f(x)},  ${f(y)},  ${f(z)}`;

export function TransformLogCanvas() {
  const posRef = useRef<HTMLSpanElement>(null);
  const rotRef = useRef<HTMLSpanElement>(null);
  const sclRef = useRef<HTMLSpanElement>(null);

  useFrame(() => {
    const o = globalGroupRef.current;
    if (!o) return;
    if (posRef.current) posRef.current.textContent = row(o.position.x, o.position.y, o.position.z);
    if (rotRef.current) rotRef.current.textContent = row(o.rotation.x, o.rotation.y, o.rotation.z);
    if (sclRef.current) sclRef.current.textContent = row(o.scale.x, o.scale.y, o.scale.z);
  });

  return (
    <Html fullscreen zIndexRange={[20, 20]}>
      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          pointerEvents: "none",
          userSelect: "none",
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          padding: "7px 12px",
          fontFamily: "monospace",
          fontSize: 11,
          lineHeight: 1.7,
          color: "white",
        }}
      >
        {(
          [
            { label: "pos", ref: posRef },
            { label: "rot", ref: rotRef },
            { label: "scl", ref: sclRef },
          ] as const
        ).map(({ label, ref }) => (
          <div key={label} style={{ display: "flex", gap: 10 }}>
            <span style={{ color: "rgba(255,255,255,0.28)", width: 22 }}>{label}</span>
            <span ref={ref} style={{ color: "#a5b4fc" }} />
          </div>
        ))}
      </div>
    </Html>
  );
}

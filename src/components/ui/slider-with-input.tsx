"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Slider } from "./slider";
import { Input } from "./input";

interface SliderWithInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  sliderClassName?: string;
  inputClassName?: string;
  decimals?: number;
}

export function SliderWithInput({
  value,
  onChange,
  min,
  max,
  step,
  sliderClassName,
  inputClassName,
  decimals,
}: SliderWithInputProps) {
  const displayDecimals = decimals !== undefined ? decimals : step < 1 ? 2 : 0;
  const [draft, setDraft] = useState<string | null>(null);

  // Keep draft in sync when value changes externally (e.g. slider drag)
  useEffect(() => {
    if (draft !== null) setDraft(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const commit = (raw: string) => {
    const n = parseFloat(raw);
    if (!isNaN(n)) onChange(Math.max(min, n));
    setDraft(null);
  };

  return (
    <div className="flex items-center gap-2">
      <Slider
        value={[Math.min(value, max)]}
        onValueChange={([v]) => { setDraft(null); onChange(v); }}
        min={min}
        max={max}
        step={step}
        className={cn("flex-1", sliderClassName)}
      />
      <Input
        type="number"
        step={step}
        min={min}
        value={draft ?? value.toFixed(displayDecimals)}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit((e.target as HTMLInputElement).value);
          if (e.key === "Escape") setDraft(null);
        }}
        className={cn(
          "w-16 h-7 text-xs text-center font-mono bg-black/30 border-white/10 focus-visible:ring-1 px-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none",
          inputClassName,
        )}
      />
    </div>
  );
}

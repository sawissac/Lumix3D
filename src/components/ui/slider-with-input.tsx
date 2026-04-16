"use client";

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
  const displayDecimals =
    decimals !== undefined ? decimals : step < 1 ? 2 : 0;

  return (
    <div className="flex items-center gap-2">
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className={cn("flex-1", sliderClassName)}
      />
      <Input
        type="number"
        value={value.toFixed(displayDecimals)}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!isNaN(v)) onChange(v);
        }}
        step={step}
        className={cn(
          "w-16 h-7 text-xs text-center font-mono bg-black/30 border-white/10 focus-visible:ring-1 px-1",
          inputClassName,
        )}
      />
    </div>
  );
}

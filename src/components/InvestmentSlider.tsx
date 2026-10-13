"use client";

import { useId } from "react";

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
  helper: string;
};

export function InvestmentSlider({ label, value, min, max, step, format, onChange, helper }: Props) {
  const id = useId();
  const helperId = `${id}-help`;
  const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        <output htmlFor={id} className="num text-sm font-semibold text-midnight">
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-describedby={helperId}
        aria-valuetext={format(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ background: `linear-gradient(to right, var(--midnight) ${percent}%, var(--border) ${percent}%)` }}
        className="esta-range mt-2 block w-full"
      />
      <div className="num mt-1 flex justify-between text-xs text-muted" aria-hidden="true">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
      <p id={helperId} className="mt-1 text-xs leading-relaxed text-muted">
        {helper}
      </p>
    </div>
  );
}

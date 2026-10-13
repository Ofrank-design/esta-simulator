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
  /** The property's own starting value. Shows a "Changed" marker and a reset when the value differs. */
  startingValue?: number;
};

export function InvestmentSlider({ label, value, min, max, step, format, onChange, helper, startingValue }: Props) {
  const id = useId();
  const helperId = `${id}-help`;
  const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;
  const changed = startingValue !== undefined && Math.abs(value - startingValue) > 1e-9;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
          {changed ? (
            <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent-strong">Changed</span>
          ) : null}
        </label>
        <output htmlFor={id} className="num text-sm font-bold text-midnight">
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
      <p id={helperId} className="mt-1 text-sm leading-relaxed text-muted">
        {helper}
      </p>
      {startingValue !== undefined ? (
        <p className="num mt-1 flex items-center gap-3 text-xs text-muted">
          <span>Starting value: {format(startingValue)}</span>
          {changed ? (
            <button
              type="button"
              onClick={() => onChange(startingValue)}
              className="font-semibold text-accent-strong underline underline-offset-2"
            >
              Reset this
            </button>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}

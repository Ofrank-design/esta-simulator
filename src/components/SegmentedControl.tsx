"use client";

import { useId } from "react";

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  legend: string;
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
  helper?: string;
};

export function SegmentedControl<T extends string>({ legend, value, options, onChange, helper }: Props<T>) {
  const name = useId();
  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink">{legend}</legend>
      <div className="mt-2 grid grid-flow-col auto-cols-fr rounded-md border border-line bg-white p-0.5">
        {options.map((o) => (
          <label key={o.value} className="relative cursor-pointer">
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={o.value === value}
              onChange={() => onChange(o.value)}
              className="peer sr-only"
            />
            <span className="block rounded px-3 py-1.5 text-center text-sm text-ink transition-colors peer-checked:bg-midnight peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-strong">
              {o.label}
            </span>
          </label>
        ))}
      </div>
      {helper ? <p className="mt-1 text-xs leading-relaxed text-muted">{helper}</p> : null}
    </fieldset>
  );
}

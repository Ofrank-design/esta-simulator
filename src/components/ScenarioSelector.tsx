"use client";

import { SCENARIO_KEYS, SCENARIO_LABELS, type ScenarioKind } from "@/lib/finance/assumptions";

type Props = {
  active: ScenarioKind | "custom";
  onSelect: (kind: ScenarioKind) => void;
  onReset: () => void;
};

export function ScenarioSelector({ active, onSelect, onReset }: Props) {
  return (
    <div>
      <p id="scenario-label" className="text-sm font-semibold text-ink">
        Start from a preset
      </p>
      <p className="mt-1 text-sm text-muted">A preset replaces the assumptions below. You can still adjust anything afterwards.</p>
      <div role="group" aria-labelledby="scenario-label" className="mt-3 flex flex-wrap gap-2">
        {SCENARIO_KEYS.map((kind) => (
          <button
            key={kind}
            type="button"
            aria-pressed={active === kind}
            onClick={() => onSelect(kind)}
            className={
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors " +
              (active === kind
                ? "border-midnight bg-midnight text-white"
                : "border-line bg-white text-ink hover:border-midnight")
            }
          >
            {SCENARIO_LABELS[kind]}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onReset}
        className="mt-3 text-sm font-semibold text-accent-strong underline decoration-accent underline-offset-4 hover:text-midnight"
      >
        Reset to property defaults
      </button>
      {active === "custom" ? (
        <p className="mt-2 text-sm text-muted">You&apos;ve changed an assumption, so none of the presets match right now.</p>
      ) : null}
    </div>
  );
}

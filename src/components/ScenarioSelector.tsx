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
      <p id="scenario-label" className="text-sm font-medium text-ink">
        Scenario preset
      </p>
      <div role="group" aria-labelledby="scenario-label" className="mt-2 flex flex-wrap gap-2">
        {SCENARIO_KEYS.map((kind) => (
          <button
            key={kind}
            type="button"
            aria-pressed={active === kind}
            onClick={() => onSelect(kind)}
            className={
              "rounded-full border px-4 py-1.5 text-sm transition-colors " +
              (active === kind
                ? "border-midnight bg-midnight text-white"
                : "border-line bg-white text-ink hover:border-midnight")
            }
          >
            {SCENARIO_LABELS[kind]}
          </button>
        ))}
        <button
          type="button"
          onClick={onReset}
          className="rounded-full px-3 py-1.5 text-sm text-muted underline decoration-accent underline-offset-4 hover:text-midnight"
        >
          Reset
        </button>
      </div>
      {active === "custom" ? (
        <p className="mt-2 text-xs text-muted">Custom: you&apos;ve changed an assumption since the last preset.</p>
      ) : null}
    </div>
  );
}

import { SCENARIO_DELTAS, SCENARIO_KEYS, SCENARIO_LABELS } from "@/lib/finance/assumptions";
import { DEFINITIONS, EXCLUSIONS, TIMING_NOTE } from "@/lib/finance/definitions";
import { MODEL_VERSION } from "@/lib/finance/projections";

const pts = (v: number) => (v === 0 ? "0" : `${v > 0 ? "+" : "\u2212"}${(Math.abs(v) * 100).toFixed(1)} points`);
const usd = (v: number) => (v === 0 ? "0" : `${v > 0 ? "+" : "\u2212"}$${Math.abs(v)}`);

const ROWS = [
  { key: "grossYield", label: "Gross rental yield", fmt: pts },
  { key: "occupancy", label: "Occupancy", fmt: pts },
  { key: "opexRatio", label: "Operating expenses (share of rent)", fmt: pts },
  { key: "appreciation", label: "Property appreciation", fmt: pts },
  { key: "inflation", label: "Inflation", fmt: pts },
  { key: "maintenance", label: "Maintenance (USD per year)", fmt: usd },
] as const;

export function AssumptionDisclosure() {
  return (
    <details className="rounded-xl border border-line bg-white p-5 text-sm">
      <summary className="cursor-pointer font-semibold text-midnight">How these numbers are calculated</summary>
      <div className="mt-4 max-w-prose space-y-5 leading-relaxed text-muted">
        <p>{TIMING_NOTE} Your ownership share is your starting investment divided by the property&apos;s value, which treats the property as one asset with no loan, no platform fees and no discount for being hard to sell.</p>

        <dl className="space-y-3">
          {DEFINITIONS.map((d) => (
            <div key={d.term}>
              <dt className="font-semibold text-ink">{d.term}</dt>
              <dd>{d.text}</dd>
            </div>
          ))}
        </dl>

        <p><strong className="font-semibold text-ink">Not included:</strong> {EXCLUSIONS}</p>
        <p className="text-xs">Model version {MODEL_VERSION}. The model is deterministic: the same inputs always give the same results, and it does not predict what the market will do.</p>

        <div>
          <h3 className="text-sm font-bold text-ink">What each preset changes</h3>
          <p className="mt-1">A preset adds these amounts to the property&apos;s own starting assumptions. Results stay within the slider ranges.</p>
          <div role="region" aria-label="Preset changes table, scrollable" tabIndex={0} className="mt-2 overflow-x-auto">
            <table className="num w-full min-w-[460px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-ink">
                  <th scope="col" className="py-2 pr-3 font-semibold">Assumption</th>
                  {SCENARIO_KEYS.map((k) => (
                    <th key={k} scope="col" className="px-3 py-2 font-semibold">{SCENARIO_LABELS[k]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.key} className="border-b border-line/60">
                    <th scope="row" className="py-2 pr-3 font-normal">{r.label}</th>
                    {SCENARIO_KEYS.map((k) => (
                      <td key={k} className="px-3 py-2">{r.fmt(SCENARIO_DELTAS[k][r.key])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </details>
  );
}

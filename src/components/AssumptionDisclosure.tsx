import { SCENARIO_DELTAS, SCENARIO_KEYS, SCENARIO_LABELS } from "@/lib/finance/assumptions";

const ROWS = [
  { key: "grossYield", label: "Gross rental yield", fmt: (v: number) => pts(v) },
  { key: "occupancy", label: "Occupancy", fmt: (v: number) => pts(v) },
  { key: "opexRatio", label: "Operating expenses (% of rent)", fmt: (v: number) => pts(v) },
  { key: "appreciation", label: "Property appreciation", fmt: (v: number) => pts(v) },
  { key: "inflation", label: "Inflation", fmt: (v: number) => pts(v) },
  { key: "maintenance", label: "Maintenance (AED per year)", fmt: (v: number) => (v === 0 ? "0" : `${v > 0 ? "+" : "\u2212"}${Math.abs(v)}`) },
] as const;

function pts(v: number): string {
  if (v === 0) return "0";
  return `${v > 0 ? "+" : "\u2212"}${(Math.abs(v) * 100).toFixed(1)} pts`;
}

export function AssumptionDisclosure() {
  return (
    <details className="rounded-lg border border-line bg-white p-5 text-sm">
      <summary className="cursor-pointer font-medium text-midnight">Model assumptions and limitations</summary>
      <div className="mt-4 space-y-4 leading-relaxed text-muted">
        <ul className="list-disc space-y-1 pl-5">
          <li>Rent in each year is earned on the property value at the start of that year.</li>
          <li>Collected rent is gross yield on value, scaled by occupancy. Operating expenses are a share of collected rent. Maintenance is an extra annual cost, either fixed or growing with inflation.</li>
          <li>Your ownership share is invested capital divided by property value. This is a simplification: no financing, platform fees or liquidity discount.</li>
          <li>You receive your share of net cash flow. A negative cash flow is shared the same way, so it reduces your distributions.</li>
          <li>Payout mode pays distributions as cash. Reinvest mode uses them to buy more of the property at the year-end value, and they are never also counted as cash.</li>
          <li>Total economic value is the holding value plus cash distributions. Total ROI assumes a sale at the end of the chosen year, after the sale costs you set.</li>
          <li>Inflation-adjusted values divide by (1 + inflation) for each year.</li>
          <li>Not modelled: taxes, financing, platform fees, market swings, capital calls, or the time it takes to sell.</li>
        </ul>

        <div>
          <h3 className="text-sm text-ink">What each preset changes</h3>
          <p className="mt-1 text-xs">Each preset adds these amounts to the property&apos;s own assumptions. Results are kept within the slider ranges.</p>
          <div role="region" aria-label="Preset changes table, scrollable" tabIndex={0} className="mt-2 overflow-x-auto">
            <table className="num w-full min-w-[420px] text-left text-xs">
              <thead>
                <tr className="border-b border-line text-ink">
                  <th scope="col" className="py-2 pr-3 font-medium">Assumption</th>
                  {SCENARIO_KEYS.map((k) => (
                    <th key={k} scope="col" className="px-3 py-2 font-medium">{SCENARIO_LABELS[k]}</th>
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

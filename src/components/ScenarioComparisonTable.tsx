import type { ScenarioOutcome } from "@/lib/finance/assumptions";
import { formatAed, formatPercent, formatSignedPercent } from "@/lib/format";

type Row = { label: string; cell: (o: ScenarioOutcome) => string };

const ASSUMPTIONS: Row[] = [
  { label: "Gross rental yield", cell: (o) => formatPercent(o.assumptions.grossYield, 1) },
  { label: "Occupancy", cell: (o) => formatPercent(o.assumptions.occupancy, 0) },
  { label: "Operating expenses (% of rent)", cell: (o) => formatPercent(o.assumptions.opexRatio, 0) },
  { label: "Property appreciation", cell: (o) => formatPercent(o.assumptions.appreciation, 1) },
  { label: "Inflation", cell: (o) => formatPercent(o.assumptions.inflation, 1) },
  { label: "Maintenance per year", cell: (o) => formatAed(o.assumptions.maintenance) },
];

const RESULTS = (reinvest: boolean): Row[] => [
  { label: "Year 1 distribution", cell: (o) => formatAed(o.result.summary.firstYear.distributionEarned) },
  { label: "Year 1 cash-on-cash", cell: (o) => formatPercent(o.result.summary.firstYear.cashOnCashReturn, 2) },
  { label: "Holding value, year 10", cell: (o) => formatAed(o.result.summary.final.holdingValue) },
  reinvest
    ? { label: "Distributions reinvested", cell: (o) => formatAed(o.result.summary.final.cumulativeReinvested) }
    : { label: "Cash distributions", cell: (o) => formatAed(o.result.summary.final.cumulativeCashDistributions) },
  { label: "Capital appreciation", cell: (o) => formatAed(o.result.summary.final.capitalAppreciation) },
  { label: "Total economic value", cell: (o) => formatAed(o.result.summary.final.totalEconomicValue) },
  { label: "Total ROI after sale costs", cell: (o) => formatSignedPercent(o.result.summary.final.totalRoi) },
  { label: "Value in today's money", cell: (o) => formatAed(o.result.summary.final.realTotalEconomicValue) },
];

function Section({ title, rows, outcomes }: { title: string; rows: Row[]; outcomes: ScenarioOutcome[] }) {
  return (
    <tbody>
      <tr>
        <th scope="colgroup" colSpan={outcomes.length + 1} className="bg-surface px-3 py-2 text-left text-xs font-medium text-muted">
          {title}
        </th>
      </tr>
      {rows.map((r) => (
        <tr key={r.label} className="border-t border-line/70">
          <th scope="row" className="px-3 py-2 text-left font-normal text-ink">{r.label}</th>
          {outcomes.map((o) => (
            <td key={o.kind} className="px-3 py-2 text-right">{r.cell(o)}</td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export function ScenarioComparisonTable({ outcomes, reinvest }: { outcomes: ScenarioOutcome[]; reinvest: boolean }) {
  return (
    <div role="region" aria-label="Scenario comparison table, scrollable" tabIndex={0} className="overflow-x-auto rounded-lg border border-line bg-white">
      <table className="num w-full min-w-[560px] text-sm">
        <caption className="sr-only">Conservative, base and optimistic scenarios side by side</caption>
        <thead>
          <tr className="text-ink">
            <th scope="col" className="px-3 py-3 text-left font-medium">Scenario</th>
            {outcomes.map((o) => (
              <th key={o.kind} scope="col" className="px-3 py-3 text-right font-heading font-bold">{o.label}</th>
            ))}
          </tr>
        </thead>
        <Section title="Assumptions behind each scenario" rows={ASSUMPTIONS} outcomes={outcomes} />
        <Section title="Modelled results after 10 years" rows={RESULTS(reinvest)} outcomes={outcomes} />
      </table>
    </div>
  );
}

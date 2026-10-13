import type { ScenarioOutcome } from "@/lib/finance/assumptions";
import { formatPercent, formatSignedPercent, formatUsd } from "@/lib/format";

type Row = { label: string; cell: (o: ScenarioOutcome) => string };

const ASSUMPTIONS: Row[] = [
  { label: "Gross rental yield", cell: (o) => formatPercent(o.assumptions.grossYield, 1) },
  { label: "Occupancy", cell: (o) => formatPercent(o.assumptions.occupancy, 0) },
  { label: "Operating expenses (share of rent)", cell: (o) => formatPercent(o.assumptions.opexRatio, 0) },
  { label: "Property appreciation", cell: (o) => formatPercent(o.assumptions.appreciation, 1) },
  { label: "Inflation", cell: (o) => formatPercent(o.assumptions.inflation, 1) },
  { label: "Maintenance per year", cell: (o) => formatUsd(o.assumptions.maintenance) },
];

const RESULTS = (reinvest: boolean, years: number): Row[] => [
  reinvest
    ? { label: "Year 1 distribution generated (reinvested)", cell: (o) => formatUsd(o.result.summary.firstYear.distributionEarned) }
    : { label: "Year 1 cash distribution", cell: (o) => formatUsd(o.result.summary.firstYear.cashDistribution) },
  { label: "Year 1 capital call", cell: (o) => formatUsd(o.result.summary.firstYear.capitalCall) },
  ...(reinvest ? [] : [{ label: "Year 1 cash-on-cash yield", cell: (o: ScenarioOutcome) => formatPercent(o.result.summary.firstYear.cashOnCashReturn, 2) }]),
  { label: "Ending ownership share", cell: (o) => formatPercent(o.result.summary.endingOwnership, 4) },
  { label: `Value of your share, year ${years}`, cell: (o) => formatUsd(o.result.summary.final.holdingValue) },
  reinvest
    ? { label: "Distributions reinvested", cell: (o) => formatUsd(o.result.summary.final.cumulativeReinvested) }
    : { label: "Cash distributions received", cell: (o) => formatUsd(o.result.summary.final.cumulativeCashDistributions) },
  ...(reinvest ? [{ label: "Paid as cash at 100% ownership", cell: (o: ScenarioOutcome) => formatUsd(o.result.summary.final.cumulativeCashDistributions) }] : []),
  { label: "Capital calls (extra money contributed)", cell: (o) => formatUsd(o.result.summary.final.cumulativeCapitalCalls) },
  { label: "Property appreciation", cell: (o) => formatUsd(o.result.summary.final.capitalAppreciation) },
  { label: "Total value before sale costs", cell: (o) => formatUsd(o.result.summary.final.totalEconomicValue) },
  { label: "Profit if sold", cell: (o) => formatUsd(o.result.summary.final.totalProfit) },
  { label: "ROI if sold", cell: (o) => formatSignedPercent(o.result.summary.final.totalRoi) },
  { label: "Total value in today's money", cell: (o) => formatUsd(o.result.summary.final.realTotalEconomicValue) },
];

function Section({ title, rows, outcomes }: { title: string; rows: Row[]; outcomes: ScenarioOutcome[] }) {
  return (
    <tbody>
      <tr>
        <th scope="colgroup" colSpan={outcomes.length + 1} className="bg-surface px-3 py-2 text-left text-xs font-semibold text-muted">
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
  const years = outcomes[0].result.inputs.years;
  return (
    <div role="region" aria-label="Scenario comparison table, scrollable" tabIndex={0} className="overflow-x-auto rounded-xl border border-line bg-white">
      <table className="num w-full min-w-[600px] text-sm">
        <caption className="sr-only">Conservative, base and optimistic scenarios side by side, in US dollars</caption>
        <thead>
          <tr className="text-ink">
            <th scope="col" className="px-3 py-3 text-left font-semibold">Scenario</th>
            {outcomes.map((o) => (
              <th key={o.kind} scope="col" className="px-3 py-3 text-right font-heading font-bold">{o.label}</th>
            ))}
          </tr>
        </thead>
        <Section title="Assumptions behind each scenario" rows={ASSUMPTIONS} outcomes={outcomes} />
        <Section title={`Modelled results after ${years} years`} rows={RESULTS(reinvest, years)} outcomes={outcomes} />
      </table>
    </div>
  );
}

import type { Property } from "@/types/property";
import { ASSET_TYPE_LABELS } from "@/types/property";
import { defaultAssumptions, type Assumptions } from "@/lib/finance/assumptions";
import type { ProjectionResult } from "@/lib/finance/types";
import { MODEL_VERSION } from "@/lib/finance/projections";
import { DEFINITIONS, EXCLUSIONS, ILLUSTRATIVE_NOTE, TIMING_NOTE } from "@/lib/finance/definitions";
import { formatPercent, formatSignedPercent, formatUsd } from "@/lib/format";
import { ReportActions, GeneratedAt } from "./ReportActions";

type Props = { property: Property; assumptions: Assumptions; result: ProjectionResult; backHref: string; notices: string[] };

export function ReportView({ property: p, assumptions: a, result, backHref, notices }: Props) {
  const d = defaultAssumptions(p);
  const { summary, rows, inputs } = result;
  const f = summary.final;
  const reinvest = a.distributionMode === "reinvest";
  const years = inputs.years;

  const assumptionRows: [string, string, string][] = [
    ["Starting investment", formatUsd(a.investment), formatUsd(d.investment)],
    ["Gross rental yield", formatPercent(a.grossYield, 1), formatPercent(d.grossYield, 1)],
    ["Occupancy", formatPercent(a.occupancy, 0), formatPercent(d.occupancy, 0)],
    ["Operating expenses (share of rent)", formatPercent(a.opexRatio, 0), formatPercent(d.opexRatio, 0)],
    ["Maintenance per year", `${formatUsd(a.maintenance)}, ${a.maintenanceMode === "fixed" ? "stays the same" : "rises with inflation"}`, formatUsd(d.maintenance)],
    ["Property appreciation", formatPercent(a.appreciation, 1), formatPercent(d.appreciation, 1)],
    ["Inflation", formatPercent(a.inflation, 1), formatPercent(d.inflation, 1)],
    ["Sale costs", formatPercent(a.saleCostRate, 1), formatPercent(d.saleCostRate, 1)],
    ["Your share of the income", reinvest ? "Reinvested (cash only above 100% ownership)" : "Paid to you as cash", "Paid to you as cash"],
  ];

  const results: [string, string][] = [
    ["Initial ownership share", formatPercent(summary.initialOwnership, 4)],
    ...(reinvest ? [["Ending ownership share", formatPercent(summary.endingOwnership, 4)] as [string, string]] : []),
    ["Property income after costs, year 1 (whole property)", formatUsd(summary.firstYear.netCashFlow)],
    reinvest
      ? ["Distribution generated, year 1 (reinvested)", formatUsd(summary.firstYear.distributionEarned)]
      : ["Cash distribution, year 1", formatUsd(summary.firstYear.cashDistribution)],
    ["Value of your share", formatUsd(f.holdingValue)],
    ["Property appreciation", formatUsd(f.capitalAppreciation)],
    reinvest
      ? ["Distributions reinvested", formatUsd(f.cumulativeReinvested)]
      : ["Cash distributions received", formatUsd(f.cumulativeCashDistributions)],
    ...(reinvest && f.cumulativeCashDistributions > 0 ? [["Paid as cash at 100% ownership", formatUsd(f.cumulativeCashDistributions)] as [string, string]] : []),
    ["Capital calls (extra money contributed)", formatUsd(f.cumulativeCapitalCalls)],
    ["Total contributed", formatUsd(f.totalContributedCapital)],
    ["Total value before sale costs", formatUsd(f.totalEconomicValue)],
    ["Sale costs if sold", formatUsd(f.saleCosts)],
    ["Profit if sold", formatUsd(f.totalProfit)],
    ["ROI if sold", formatSignedPercent(f.totalRoi)],
    ["Total value in today's money", formatUsd(f.realTotalEconomicValue)],
  ];

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 print:max-w-none print:px-0 print:py-0 md:px-8">
      <ReportActions property={p} assumptions={a} backHref={backHref} />

      <header className="mt-6 print:mt-0">
        <p className="text-sm font-semibold text-accent-strong">ESTA Simulator scenario report</p>
        <h1 className="mt-1">{p.name}</h1>
        <p className="mt-1 text-muted">
          {p.city}, {p.country} · {ASSET_TYPE_LABELS[p.assetType]} · Illustrative property, not a real listing
        </p>
        <p className="mt-1 text-sm text-muted">
          Generated <GeneratedAt /> · Model version {MODEL_VERSION} · {years} year projection · Amounts in US dollars
        </p>
      </header>

      <p className="mt-5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 print:border-black print:bg-white print:text-black">
        {ILLUSTRATIVE_NOTE}
      </p>

      {notices.length > 0 ? (
        <div className="mt-4 text-sm text-muted">
          <p className="font-semibold text-ink">Adjusted from the link</p>
          <ul className="list-disc pl-5">{notices.map((n) => <li key={n}>{n}</li>)}</ul>
        </div>
      ) : null}

      <section className="mt-8 break-inside-avoid" aria-labelledby="r-assumptions">
        <h2 id="r-assumptions" className="text-h3">Assumptions used</h2>
        <p className="mt-1 text-sm text-muted">
          Property value {formatUsd(p.propertyValueUsd)} (illustrative). Property defaults are shown for comparison.
        </p>
        <table className="num mt-3 w-full text-sm">
          <thead><tr className="border-b border-line text-left text-xs text-muted"><th className="py-2 pr-3 font-semibold">Assumption</th><th className="py-2 pr-3 font-semibold">This scenario</th><th className="py-2 font-semibold">Property default</th></tr></thead>
          <tbody>
            {assumptionRows.map(([k, v, def]) => (
              <tr key={k} className="border-b border-line/60"><th scope="row" className="py-2 pr-3 text-left font-normal">{k}</th><td className="py-2 pr-3 font-semibold">{v}</td><td className="py-2 text-muted">{def}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8 break-inside-avoid" aria-labelledby="r-results">
        <h2 id="r-results" className="text-h3">Results after {years} years</h2>
        <p className="mt-1 text-sm text-muted">Profit and ROI assume a sale at the end of year {years}, after sale costs.</p>
        <table className="num mt-3 w-full text-sm">
          <tbody>
            {results.map(([k, v]) => (
              <tr key={k} className="border-b border-line/60"><th scope="row" className="py-2 pr-3 text-left font-normal">{k}</th><td className="py-2 text-right font-semibold">{v}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8" aria-labelledby="r-annual">
        <h2 id="r-annual" className="text-h3">Year by year</h2>
        <div role="region" aria-label="Year by year table, scrollable" tabIndex={0} className="mt-3 overflow-x-auto print:overflow-visible">
          <table className="num w-full text-right text-xs">
            <thead>
              <tr className="border-b border-line text-muted">
                {["Year", "Property value", "Property income", reinvest ? "Reinvested" : "Cash paid", "Capital call", "Ownership", "Value of share", "Profit if sold", "ROI if sold"].map((h, i) => (
                  <th key={h} scope="col" className={`px-2 py-2 font-semibold ${i === 0 ? "text-left" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.year} className="border-b border-line/60 break-inside-avoid">
                  <th scope="row" className="px-2 py-1.5 text-left font-semibold">{r.year}</th>
                  <td className="px-2 py-1.5">{formatUsd(r.propertyValue)}</td>
                  <td className="px-2 py-1.5">{formatUsd(r.netCashFlow)}</td>
                  <td className="px-2 py-1.5">{formatUsd(reinvest ? r.reinvestedDistribution : r.cashDistribution)}</td>
                  <td className="px-2 py-1.5">{formatUsd(r.capitalCall)}</td>
                  <td className="px-2 py-1.5">{formatPercent(r.ownershipShare, 3)}</td>
                  <td className="px-2 py-1.5">{formatUsd(r.holdingValue)}</td>
                  <td className="px-2 py-1.5">{formatUsd(r.totalProfit)}</td>
                  <td className="px-2 py-1.5">{formatSignedPercent(r.totalRoi)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="r-defs">
        <h2 id="r-defs" className="text-h3">How these numbers are defined</h2>
        <p className="mt-2 text-sm text-muted">{TIMING_NOTE}</p>
        <dl className="mt-3 space-y-2 text-sm">
          {DEFINITIONS.map((x) => (
            <div key={x.term} className="break-inside-avoid"><dt className="font-semibold text-ink">{x.term}</dt><dd className="text-muted">{x.text}</dd></div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-muted"><strong className="font-semibold text-ink">Not included:</strong> {EXCLUSIONS}</p>
        <p className="mt-4 text-xs text-muted">This report is an educational illustration, not investment, legal or tax advice. It uses the exact assumptions listed above, not the property defaults.</p>
      </section>
    </article>
  );
}

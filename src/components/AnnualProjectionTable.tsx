import type { ProjectionRow } from "@/lib/finance/types";
import { buildTableRows, type TableRow } from "@/lib/finance/presentation";
import { formatPercent, formatSignedPercent, formatUsd } from "@/lib/format";

type Col = { header: string; cell: (r: TableRow) => string };

export function AnnualProjectionTable({ rows, reinvest }: { rows: readonly ProjectionRow[]; reinvest: boolean }) {
  const data = buildTableRows(rows);
  const anyCalls = data.some((r) => r.capitalCall > 0);
  const anyExcess = data.some((r) => r.excessCashDistribution > 0);

  const columns: Col[] = [
    { header: "Property value", cell: (r) => formatUsd(r.propertyValue) },
    { header: "Property income after costs", cell: (r) => formatUsd(r.netCashFlow) },
    ...(reinvest
      ? [
          { header: "Distribution generated", cell: (r: TableRow) => formatUsd(r.distributionEarned) },
          { header: "Reinvested", cell: (r: TableRow) => formatUsd(r.reinvestedDistribution) },
          { header: "Paid as cash at 100% ownership", cell: (r: TableRow) => formatUsd(r.excessCashDistribution) },
        ]
      : [
          { header: "Cash distribution", cell: (r: TableRow) => formatUsd(r.cashDistribution) },
          { header: "Cash distributions to date", cell: (r: TableRow) => formatUsd(r.cumulativeCashDistributions) },
        ]),
    ...(anyCalls ? [{ header: "Capital call", cell: (r: TableRow) => formatUsd(r.capitalCall) }] : []),
    { header: "Ownership share", cell: (r) => formatPercent(r.ownershipShare, 4) },
    { header: "Value of your share", cell: (r) => formatUsd(r.holdingValue) },
    { header: "Property appreciation", cell: (r) => formatUsd(r.capitalAppreciation) },
    { header: "Total value before sale costs", cell: (r) => formatUsd(r.totalEconomicValue) },
    { header: "Profit if sold", cell: (r) => formatUsd(r.totalProfit) },
    { header: "ROI if sold", cell: (r) => formatSignedPercent(r.totalRoi) },
    { header: "Total value in today's money", cell: (r) => formatUsd(r.realTotalEconomicValue) },
  ];

  return (
    <div>
      <div role="region" aria-label="Annual projection table, scrollable" tabIndex={0} className="overflow-x-auto rounded-md border border-line">
        <table className="num w-full min-w-[1100px] text-right text-sm">
          <caption className="sr-only">Annual projection in US dollars, year 0 to year {data[data.length - 1].year}</caption>
          <thead className="bg-surface text-xs text-muted">
            <tr>
              <th scope="col" className="sticky left-0 bg-surface px-3 py-2 text-left font-semibold">Year</th>
              {columns.map((c) => (
                <th key={c.header} scope="col" className="px-3 py-2 font-semibold">{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.year} className="border-t border-line/70">
                <th scope="row" className="sticky left-0 bg-white px-3 py-2 text-left font-semibold">{r.year}</th>
                {columns.map((c) => (
                  <td key={c.header} className="px-3 py-2">{c.cell(r)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm text-muted">
        All amounts are in US dollars. Profit and ROI assume a sale at the end of that year.
        {anyCalls ? " A capital call is extra money you contribute when the property's income doesn't cover its costs." : ""}
        {reinvest && anyExcess ? " Once you own 100%, income can't be reinvested, so it is paid as cash." : ""}
      </p>
    </div>
  );
}

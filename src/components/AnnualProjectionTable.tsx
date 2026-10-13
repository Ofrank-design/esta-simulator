import type { ProjectionRow } from "@/lib/finance/types";
import { buildTableRows } from "@/lib/finance/presentation";
import { formatAed, formatSignedPercent } from "@/lib/format";

export function AnnualProjectionTable({ rows, reinvest }: { rows: readonly ProjectionRow[]; reinvest: boolean }) {
  const data = buildTableRows(rows);
  const columns: { header: string; cell: (r: (typeof data)[number]) => string }[] = [
    { header: "Property value", cell: (r) => formatAed(r.propertyValue) },
    { header: "Net cash flow (property)", cell: (r) => formatAed(r.netCashFlow) },
    { header: "Your distribution", cell: (r) => formatAed(r.distributionEarned) },
    reinvest
      ? { header: "Reinvested to date", cell: (r) => formatAed(r.cumulativeReinvested) }
      : { header: "Cash distributions to date", cell: (r) => formatAed(r.cumulativeCashDistributions) },
    { header: "Holding value", cell: (r) => formatAed(r.holdingValue) },
    { header: "Capital appreciation", cell: (r) => formatAed(r.capitalAppreciation) },
    { header: "Total economic value", cell: (r) => formatAed(r.totalEconomicValue) },
    { header: "Total ROI", cell: (r) => formatSignedPercent(r.totalRoi) },
    { header: "Value in today's money", cell: (r) => formatAed(r.realTotalEconomicValue) },
  ];

  return (
    <div role="region" aria-label="Annual projection table, scrollable" tabIndex={0} className="overflow-x-auto rounded-md border border-line">
      <table className="num w-full min-w-[960px] text-right text-sm">
        <caption className="sr-only">Annual projection, year 0 to year {data[data.length - 1].year}</caption>
        <thead className="bg-surface text-xs text-muted">
          <tr>
            <th scope="col" className="sticky left-0 bg-surface px-3 py-2 text-left font-medium">Year</th>
            {columns.map((c) => (
              <th key={c.header} scope="col" className="px-3 py-2 font-medium">{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.year} className="border-t border-line/70">
              <th scope="row" className="sticky left-0 bg-white px-3 py-2 text-left font-medium">{r.year}</th>
              {columns.map((c) => (
                <td key={c.header} className="px-3 py-2">{c.cell(r)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

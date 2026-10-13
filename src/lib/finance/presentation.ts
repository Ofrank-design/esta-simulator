import { formatAed, formatSignedPercent } from "@/lib/format";
import type { ProjectionRow } from "./types";
import type { DistributionMode } from "./validation";

/** Both the chart and the table are built from the same projection rows, so they cannot disagree. */
export interface ChartPoint {
  year: number;
  capitalAppreciation: number;
  cumulativeCashDistributions: number;
  cumulativeReinvested: number;
  totalProfit: number;
  /** Fraction, e.g. 0.25 = 25%. Plotted on its own percentage axis. */
  totalRoi: number;
}

export interface TableRow {
  year: number;
  propertyValue: number;
  netCashFlow: number;
  distributionEarned: number;
  cumulativeCashDistributions: number;
  holdingValue: number;
  capitalAppreciation: number;
  cumulativeReinvested: number;
  totalEconomicValue: number;
  totalProfit: number;
  totalRoi: number;
  realTotalEconomicValue: number;
}

export function buildChartData(rows: readonly ProjectionRow[]): ChartPoint[] {
  return rows.map((r) => ({
    year: r.year,
    capitalAppreciation: r.capitalAppreciation,
    cumulativeCashDistributions: r.cumulativeCashDistributions,
    cumulativeReinvested: r.cumulativeReinvested,
    totalProfit: r.totalProfit,
    totalRoi: r.totalRoi,
  }));
}

export function buildTableRows(rows: readonly ProjectionRow[]): TableRow[] {
  return rows.map((r) => ({
    year: r.year,
    propertyValue: r.propertyValue,
    netCashFlow: r.netCashFlow,
    distributionEarned: r.distributionEarned,
    cumulativeCashDistributions: r.cumulativeCashDistributions,
    holdingValue: r.holdingValue,
    capitalAppreciation: r.capitalAppreciation,
    cumulativeReinvested: r.cumulativeReinvested,
    totalEconomicValue: r.totalEconomicValue,
    totalProfit: r.totalProfit,
    totalRoi: r.totalRoi,
    realTotalEconomicValue: r.realTotalEconomicValue,
  }));
}

/** Plain-language summary for screen readers and the chart caption. */
export function describeProjection(rows: readonly ProjectionRow[], mode: DistributionMode): string {
  const last = rows[rows.length - 1];
  const dist =
    mode === "payout"
      ? `cumulative cash distributions of ${formatAed(last.cumulativeCashDistributions)}`
      : `reinvested distributions of ${formatAed(last.cumulativeReinvested)}`;
  return (
    `Hypothetical projection from year 0 to year ${last.year}. By year ${last.year}: capital appreciation ` +
    `${formatAed(last.capitalAppreciation)}, ${dist}, total profit ${formatAed(last.totalProfit)}, ` +
    `and total ROI after sale costs ${formatSignedPercent(last.totalRoi)}.`
  );
}

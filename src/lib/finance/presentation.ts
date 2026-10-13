import { formatSignedPercent, formatUsd } from "@/lib/format";
import type { ProjectionRow } from "./types";
import type { DistributionMode } from "./validation";

/** Both the chart and the table are built from the same projection rows, so they cannot disagree. */
export interface ChartPoint {
  year: number;
  capitalAppreciation: number;
  cumulativeCashDistributions: number;
  cumulativeReinvested: number;
  cumulativeCapitalCalls: number;
  /** Profit if sold at the end of this year, after sale costs and all money contributed. */
  totalProfit: number;
  /** Fraction, e.g. 0.25 = 25%. Plotted on its own percentage axis. */
  totalRoi: number;
}

export interface TableRow {
  year: number;
  propertyValue: number;
  netCashFlow: number;
  distributionEarned: number;
  cashDistribution: number;
  reinvestedDistribution: number;
  excessCashDistribution: number;
  capitalCall: number;
  cumulativeCashDistributions: number;
  cumulativeReinvested: number;
  ownershipShare: number;
  holdingValue: number;
  capitalAppreciation: number;
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
    cumulativeCapitalCalls: r.cumulativeCapitalCalls,
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
    cashDistribution: r.cashDistribution,
    reinvestedDistribution: r.reinvestedDistribution,
    excessCashDistribution: r.excessCashDistribution,
    capitalCall: r.capitalCall,
    cumulativeCashDistributions: r.cumulativeCashDistributions,
    cumulativeReinvested: r.cumulativeReinvested,
    ownershipShare: r.ownershipShare,
    holdingValue: r.holdingValue,
    capitalAppreciation: r.capitalAppreciation,
    totalEconomicValue: r.totalEconomicValue,
    totalProfit: r.totalProfit,
    totalRoi: r.totalRoi,
    realTotalEconomicValue: r.realTotalEconomicValue,
  }));
}

/** Plain-language summary for screen readers and chart captions. */
export function describeProjection(rows: readonly ProjectionRow[], mode: DistributionMode): string {
  const last = rows[rows.length - 1];
  const income =
    mode === "payout"
      ? `${formatUsd(last.cumulativeCashDistributions)} paid to you in cash`
      : `${formatUsd(last.cumulativeReinvested)} of income reinvested`;
  const calls =
    last.cumulativeCapitalCalls > 0 ? `, ${formatUsd(last.cumulativeCapitalCalls)} of extra money contributed` : "";
  return (
    `Hypothetical projection from year 0 to year ${last.year}. By year ${last.year}: capital appreciation ` +
    `${formatUsd(last.capitalAppreciation)}, ${income}${calls}, profit if sold ${formatUsd(last.totalProfit)}, ` +
    `and ROI if sold ${formatSignedPercent(last.totalRoi)}.`
  );
}

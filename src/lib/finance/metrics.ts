import type { ProjectionRow, ProjectionSummary } from "./types";
import { toRealValue } from "./inflation";

/** Division that returns 0 instead of NaN/Infinity when the denominator is 0. */
export function safeDivide(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

export function summarize(
  rows: readonly ProjectionRow[],
  investment: number,
  inflation: number,
): ProjectionSummary {
  const years = rows.slice(1);
  const final = rows[rows.length - 1];
  return {
    firstYear: rows[1],
    final,
    averageCashOnCash: safeDivide(
      years.reduce((sum, r) => sum + r.cashOnCashReturn, 0),
      years.length,
    ),
    realInvestedCapital: toRealValue(investment, inflation, final.year),
  };
}

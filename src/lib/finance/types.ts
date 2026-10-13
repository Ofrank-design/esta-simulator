import type { ProjectionInputs } from "./validation";

/** One year of the projection. Year 0 is the purchase date; year t is the t-th year held. */
export interface ProjectionRow {
  year: number;
  /** Property value at the END of the year: V0 * (1+g)^t */
  propertyValue: number;
  grossPotentialRent: number;
  collectedRent: number;
  operatingExpenses: number;
  maintenance: number;
  /** Property-level net operating cash flow (before the investor's share). */
  netCashFlow: number;
  /** Investor's ownership share at the END of the year. */
  ownershipShare: number;
  /** Investor's share of net cash flow, earned this year (negative = share of a shortfall). */
  distributionEarned: number;
  /** Portion of distributionEarned paid out as cash (payout mode). */
  cashDistribution: number;
  /** Portion of distributionEarned used to buy more units (reinvest mode). */
  reinvestedDistribution: number;
  cumulativeDistributionsEarned: number;
  cumulativeCashDistributions: number;
  cumulativeReinvested: number;
  /** Ownership share x property value. */
  holdingValue: number;
  /** Initial investment + reinvested distributions. */
  costBasis: number;
  /** holdingValue - costBasis. Unrealized until sale. */
  capitalAppreciation: number;
  /** holdingValue + cumulative cash distributions (before sale costs). */
  totalEconomicValue: number;
  /** totalEconomicValue - initial investment. */
  totalProfit: number;
  /** distributionEarned / initial investment. 0 for year 0. */
  cashOnCashReturn: number;
  /** totalEconomicValue deflated to today's purchasing power. */
  realTotalEconomicValue: number;
  /** ROI if the holding were sold at the end of this year, after sale costs. */
  totalRoi: number;
}

export interface ProjectionSummary {
  firstYear: ProjectionRow;
  final: ProjectionRow;
  /** Mean of annual cash-on-cash returns across years 1..N. */
  averageCashOnCash: number;
  /** Initial investment expressed in today's purchasing power after N years of inflation. */
  realInvestedCapital: number;
}

export interface ProjectionResult {
  inputs: ProjectionInputs;
  ownershipShare: number;
  rows: readonly ProjectionRow[];
  summary: ProjectionSummary;
}

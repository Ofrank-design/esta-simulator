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
  /** Whole-property net operating cash flow. Can be negative. */
  netCashFlow: number;
  /** Investor's ownership share at the END of the year. Always within 0..1. */
  ownershipShare: number;

  /** Investor's share of POSITIVE property cash flow this year (never negative). */
  distributionEarned: number;
  /** Part of distributionEarned paid out as cash. In reinvest mode this is only the excess at the ownership cap. */
  cashDistribution: number;
  /** Part of distributionEarned used to buy more of the property. */
  reinvestedDistribution: number;
  /** Cash paid out only because ownership hit 100% (reinvest mode). Included in cashDistribution. */
  excessCashDistribution: number;
  /** Investor's share of NEGATIVE property cash flow, treated as new money they contribute. */
  capitalCall: number;

  cumulativeDistributionsEarned: number;
  cumulativeCashDistributions: number;
  cumulativeReinvested: number;
  cumulativeCapitalCalls: number;
  /** Initial investment + cumulative capital calls (new external money only). */
  totalContributedCapital: number;

  /** Ownership share x property value. */
  holdingValue: number;
  /** Initial investment + reinvested distributions (what bought the units). Capital calls buy no units. */
  costBasis: number;
  /** holdingValue - costBasis. Unrealized until sale. */
  capitalAppreciation: number;
  /** holdingValue + cumulative cash distributions (before sale costs and before contributions). */
  totalEconomicValue: number;
  /** Sale costs if the holding were sold at the end of this year. 0 in year 0. */
  saleCosts: number;
  /** holdingValue - saleCosts */
  netSaleProceeds: number;
  /** netSaleProceeds + cumulative cash distributions - total contributed capital. */
  totalProfit: number;
  /** totalProfit / totalContributedCapital. 0 in year 0. */
  totalRoi: number;

  /** cashDistribution / contributed capital at the start of the year. */
  cashOnCashReturn: number;
  /** distributionEarned / contributed capital at the start of the year (cash or reinvested). */
  distributionYield: number;
  /**
   * Net cash yield: (distribution earned - capital call) / contributed capital at the start of the year.
   * What the property's income, after empty periods, running costs and maintenance, is worth as a
   * yearly return on the money put in. Compare it with the GROSS rental yield input.
   */
  netCashYield: number;
  /** totalEconomicValue deflated to today's purchasing power. */
  realTotalEconomicValue: number;
}

export interface ProjectionSummary {
  firstYear: ProjectionRow;
  final: ProjectionRow;
  initialOwnership: number;
  endingOwnership: number;
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

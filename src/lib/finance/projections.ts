/**
 * Deterministic ESTA projection engine. Pure: no UI, no randomness, no I/O.
 *
 * MODEL (all assumptions are explicit inputs):
 *  - Year t (1..N) is the t-th year held. Rent for year t is earned on the property value at the
 *    START of that year, V_(t-1) = V0 (1+g)^(t-1). Property value at the END of year t is V0 (1+g)^t.
 *  - Gross potential rent   = V_(t-1) * y
 *  - Collected rent         = gross potential rent * occupancy
 *  - Operating expenses     = collected rent * e
 *  - Maintenance (property) = m0 (fixed) or m0 (1+inflation)^(t-1) (inflation-adjusted)
 *  - Net cash flow C_t      = collected rent - operating expenses - maintenance
 *  - Ownership share s      = investment / property value. This is a stated proportional
 *    approximation: unlevered, units priced at property value, no platform fees, no liquidity discount.
 *  - Investor distribution  D_t = (share held during year t) * C_t. A negative C_t is shared pro rata
 *    (the investor funds a shortfall); it is not floored at zero.
 *  - Payout mode: D_t is paid as cash. Reinvest mode: D_t buys units at the end-of-year value, so it is
 *    never also counted as cash.
 *  - Holding value          = share * end-of-year property value
 *  - Total economic value   = holding value + cumulative cash distributions
 *  - Total ROI              = (holding value * (1 - saleCostRate) + cumulative cash - investment) / investment,
 *                             i.e. a hypothetical sale at the end of that year.
 *  - Real value             = nominal / (1 + inflation)^t
 *
 * ROUNDING: no intermediate rounding. Values are IEEE-754 doubles; round only when formatting.
 * Divisions by zero (e.g. zero investment) return 0 rather than NaN.
 *
 * NOT MODELLED: taxes, financing, platform fees, vacancy beyond the occupancy rate, capital calls,
 * liquidity constraints, market volatility.
 */
import { growthFactor, toRealValue } from "./inflation";
import { safeDivide, summarize } from "./metrics";
import type { ProjectionResult, ProjectionRow } from "./types";
import { validateInputs, type ProjectionInputs } from "./validation";

export class InvalidInputError extends Error {
  readonly errors: string[];
  constructor(errors: string[]) {
    super(`Invalid projection inputs: ${errors.join("; ")}`);
    this.name = "InvalidInputError";
    this.errors = errors;
  }
}

export function projectInvestment(raw: ProjectionInputs): ProjectionResult {
  const validated = validateInputs(raw);
  if (!validated.ok) throw new InvalidInputError(validated.errors);
  const inputs = validated.data;

  const {
    years,
    propertyValue: v0,
    investment,
    grossYield,
    occupancy,
    opexRatio,
    maintenance: m0,
    maintenanceMode,
    inflation,
    appreciation,
    saleCostRate,
    distributionMode,
  } = inputs;

  const initialShare = safeDivide(investment, v0);
  let share = initialShare;
  let cumEarned = 0;
  let cumCash = 0;
  let cumReinvested = 0;

  const rows: ProjectionRow[] = [
    {
      year: 0,
      propertyValue: v0,
      grossPotentialRent: 0,
      collectedRent: 0,
      operatingExpenses: 0,
      maintenance: 0,
      netCashFlow: 0,
      ownershipShare: initialShare,
      distributionEarned: 0,
      cashDistribution: 0,
      reinvestedDistribution: 0,
      cumulativeDistributionsEarned: 0,
      cumulativeCashDistributions: 0,
      cumulativeReinvested: 0,
      holdingValue: investment,
      costBasis: investment,
      capitalAppreciation: 0,
      totalEconomicValue: investment,
      totalProfit: 0,
      cashOnCashReturn: 0,
      realTotalEconomicValue: investment,
      totalRoi: safeDivide(investment * (1 - saleCostRate) - investment, investment),
    },
  ];

  for (let t = 1; t <= years; t++) {
    const valueStart = v0 * growthFactor(appreciation, t - 1);
    const valueEnd = v0 * growthFactor(appreciation, t);

    const grossPotentialRent = valueStart * grossYield;
    const collectedRent = grossPotentialRent * occupancy;
    const operatingExpenses = collectedRent * opexRatio;
    const maintenance =
      maintenanceMode === "fixed" ? m0 : m0 * growthFactor(inflation, t - 1);
    const netCashFlow = collectedRent - operatingExpenses - maintenance;

    const distributionEarned = share * netCashFlow;
    const cashDistribution = distributionMode === "payout" ? distributionEarned : 0;
    const reinvestedDistribution = distributionMode === "reinvest" ? distributionEarned : 0;

    if (distributionMode === "reinvest") share += safeDivide(distributionEarned, valueEnd);

    cumEarned += distributionEarned;
    cumCash += cashDistribution;
    cumReinvested += reinvestedDistribution;

    const holdingValue = share * valueEnd;
    const costBasis = investment + cumReinvested;
    const totalEconomicValue = holdingValue + cumCash;

    rows.push({
      year: t,
      propertyValue: valueEnd,
      grossPotentialRent,
      collectedRent,
      operatingExpenses,
      maintenance,
      netCashFlow,
      ownershipShare: share,
      distributionEarned,
      cashDistribution,
      reinvestedDistribution,
      cumulativeDistributionsEarned: cumEarned,
      cumulativeCashDistributions: cumCash,
      cumulativeReinvested: cumReinvested,
      holdingValue,
      costBasis,
      capitalAppreciation: holdingValue - costBasis,
      totalEconomicValue,
      totalProfit: totalEconomicValue - investment,
      cashOnCashReturn: safeDivide(distributionEarned, investment),
      realTotalEconomicValue: toRealValue(totalEconomicValue, inflation, t),
      totalRoi: safeDivide(holdingValue * (1 - saleCostRate) + cumCash - investment, investment),
    });
  }

  return {
    inputs,
    ownershipShare: initialShare,
    rows,
    summary: summarize(rows, investment, inflation),
  };
}

export type SafeProjection =
  | { ok: true; result: ProjectionResult }
  | { ok: false; errors: string[] };

/** For UI use: never throws. */
export function safeProjectInvestment(raw: ProjectionInputs): SafeProjection {
  try {
    return { ok: true, result: projectInvestment(raw) };
  } catch (e) {
    if (e instanceof InvalidInputError) return { ok: false, errors: e.errors };
    throw e;
  }
}

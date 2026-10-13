/**
 * Deterministic ESTA projection engine. Pure: no UI, no randomness, no I/O.
 * MODEL_VERSION changes whenever a formula or definition changes.
 *
 * MODEL (all assumptions are explicit inputs):
 *  - Year t (1..N) is the t-th year held. Rent for year t is earned on the property value at the
 *    START of that year, V_(t-1) = V0 (1+g)^(t-1). Property value at the END of year t is V0 (1+g)^t.
 *  - Gross potential rent   = V_(t-1) * y
 *  - Collected rent         = gross potential rent * occupancy
 *  - Operating expenses     = collected rent * e
 *  - Maintenance (property) = m0 (fixed) or m0 (1+inflation)^(t-1) (inflation-adjusted)
 *  - Net cash flow C_t      = collected rent - operating expenses - maintenance (whole property)
 *  - Ownership share s      = investment / property value. A proportional approximation of one whole
 *    property: unlevered, units priced at property value, no platform fees, no liquidity discount.
 *    s always stays within 0..1.
 *
 *  POSITIVE cash flow:  distribution D_t = (share held during year t) * C_t.
 *    - Payout mode:   D_t is paid as cash.
 *    - Reinvest mode: D_t buys units at the end-of-year value, but only up to 100% ownership. Any
 *      excess is paid as cash (excessCashDistribution) so nothing is lost or counted twice.
 *  NEGATIVE cash flow:  the investor's share (share * |C_t|) is a CAPITAL CALL: new money they
 *    contribute. It is not a negative dividend, buys no units, and never dilutes ownership. Cash
 *    and reinvested distributions are 0 in that year.
 *
 *  - Contributed capital    = initial investment + cumulative capital calls (external money only;
 *                             reinvested distributions are NOT new money)
 *  - Holding value          = share * end-of-year property value
 *  - Cost basis             = initial investment + cumulative reinvested distributions
 *  - Capital appreciation   = holding value - cost basis
 *  - Total economic value   = holding value + cumulative cash distributions
 *  - Sale costs             = holding value * saleCostRate, for a hypothetical sale at the END of that year
 *  - Total profit           = holding value - sale costs + cumulative cash distributions - contributed capital
 *  - Total ROI              = total profit / contributed capital. Year 0 is 0: no holding period has
 *                             elapsed, so no exit is modelled there.
 *  - Cash-on-cash           = cash actually paid in the year / contributed capital at the start of the year
 *  - Distribution yield     = distribution generated (cash or reinvested) / same denominator
 *  - Real value             = nominal / (1 + inflation)^t
 *
 * IDENTITY (tested): profit = appreciation + cumulative distributions earned
 *                             - cumulative capital calls - sale costs.
 *
 * ROUNDING: no intermediate rounding. Values are IEEE-754 doubles; round only when formatting.
 * Divisions by zero return 0 rather than NaN.
 *
 * NOT MODELLED: taxes, financing, platform fees, vacancy beyond the occupancy rate, liquidity
 * constraints, market volatility.
 */
import { growthFactor, toRealValue } from "./inflation";
import { safeDivide, summarize } from "./metrics";
import type { ProjectionResult, ProjectionRow } from "./types";
import { validateInputs, type ProjectionInputs } from "./validation";

export const MODEL_VERSION = "1.1.0";

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
    years, propertyValue: v0, investment, grossYield, occupancy, opexRatio,
    maintenance: m0, maintenanceMode, inflation, appreciation, saleCostRate, distributionMode,
  } = inputs;

  const initialShare = Math.min(1, safeDivide(investment, v0));
  let share = initialShare;
  let cumEarned = 0;
  let cumCash = 0;
  let cumReinvested = 0;
  let cumCalls = 0;

  const rows: ProjectionRow[] = [
    {
      year: 0, propertyValue: v0,
      grossPotentialRent: 0, collectedRent: 0, operatingExpenses: 0, maintenance: 0, netCashFlow: 0,
      ownershipShare: initialShare,
      distributionEarned: 0, cashDistribution: 0, reinvestedDistribution: 0, excessCashDistribution: 0, capitalCall: 0,
      cumulativeDistributionsEarned: 0, cumulativeCashDistributions: 0, cumulativeReinvested: 0,
      cumulativeCapitalCalls: 0, totalContributedCapital: investment,
      holdingValue: investment, costBasis: investment, capitalAppreciation: 0,
      totalEconomicValue: investment, saleCosts: 0, netSaleProceeds: investment,
      totalProfit: 0, totalRoi: 0,
      cashOnCashReturn: 0, distributionYield: 0, realTotalEconomicValue: investment,
    },
  ];

  for (let t = 1; t <= years; t++) {
    const valueStart = v0 * growthFactor(appreciation, t - 1);
    const valueEnd = v0 * growthFactor(appreciation, t);

    const grossPotentialRent = valueStart * grossYield;
    const collectedRent = grossPotentialRent * occupancy;
    const operatingExpenses = collectedRent * opexRatio;
    const maintenance = maintenanceMode === "fixed" ? m0 : m0 * growthFactor(inflation, t - 1);
    const netCashFlow = collectedRent - operatingExpenses - maintenance;

    const contributedAtStart = investment + cumCalls;
    const investorCashFlow = share * netCashFlow;
    const capitalCall = investorCashFlow < 0 ? -investorCashFlow : 0;
    const distributionEarned = investorCashFlow > 0 ? investorCashFlow : 0;

    let cashDistribution = 0;
    let reinvestedDistribution = 0;
    let excessCashDistribution = 0;
    if (distributionMode === "payout") {
      cashDistribution = distributionEarned;
    } else {
      // Units available before reaching 100%, expressed in money at the end-of-year price.
      const room = Math.max(0, 1 - share) * valueEnd;
      reinvestedDistribution = Math.min(distributionEarned, room);
      excessCashDistribution = distributionEarned - reinvestedDistribution;
      cashDistribution = excessCashDistribution;
      share = Math.min(1, share + safeDivide(reinvestedDistribution, valueEnd));
    }

    cumEarned += distributionEarned;
    cumCash += cashDistribution;
    cumReinvested += reinvestedDistribution;
    cumCalls += capitalCall;

    const totalContributedCapital = investment + cumCalls;
    const holdingValue = share * valueEnd;
    const costBasis = investment + cumReinvested;
    const totalEconomicValue = holdingValue + cumCash;
    const saleCosts = holdingValue * saleCostRate;
    const netSaleProceeds = holdingValue - saleCosts;
    const totalProfit = netSaleProceeds + cumCash - totalContributedCapital;

    rows.push({
      year: t, propertyValue: valueEnd,
      grossPotentialRent, collectedRent, operatingExpenses, maintenance, netCashFlow,
      ownershipShare: share,
      distributionEarned, cashDistribution, reinvestedDistribution, excessCashDistribution, capitalCall,
      cumulativeDistributionsEarned: cumEarned, cumulativeCashDistributions: cumCash,
      cumulativeReinvested: cumReinvested, cumulativeCapitalCalls: cumCalls, totalContributedCapital,
      holdingValue, costBasis, capitalAppreciation: holdingValue - costBasis,
      totalEconomicValue, saleCosts, netSaleProceeds, totalProfit,
      totalRoi: safeDivide(totalProfit, totalContributedCapital),
      cashOnCashReturn: safeDivide(cashDistribution, contributedAtStart),
      distributionYield: safeDivide(distributionEarned, contributedAtStart),
      realTotalEconomicValue: toRealValue(totalEconomicValue, inflation, t),
    });
  }

  return { inputs, ownershipShare: initialShare, rows, summary: summarize(rows, investment, inflation) };
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

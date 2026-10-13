/** Slider bounds. Rates are decimals. The engine's validation is deliberately wider than these. */
export const BOUNDS = {
  inflation: { min: 0, max: 0.1, step: 0.001 },
  occupancy: { min: 0, max: 1, step: 0.01 },
  maintenance: { min: 0, max: 3_000, step: 25 },
  grossYield: { min: 0, max: 0.12, step: 0.001 },
  appreciation: { min: -0.05, max: 0.1, step: 0.001 },
  opexRatio: { min: 0, max: 0.6, step: 0.01 },
  saleCostRate: { min: 0, max: 0.06, step: 0.005 },
} as const;

export const INVESTMENT_STEP = 100;
export const INVESTMENT_MAX = 25_000;
export const DEFAULT_INVESTMENT = 2_500;
export const DEFAULT_SALE_COST_RATE = 0.02;

export function investmentBounds(propertyValue: number, minInvestment: number) {
  return {
    min: minInvestment,
    max: Math.min(INVESTMENT_MAX, propertyValue),
    step: INVESTMENT_STEP,
  };
}

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Removes floating-point drift from slider values (0.06500000000000001 -> 0.065). */
export function cleanNumber(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

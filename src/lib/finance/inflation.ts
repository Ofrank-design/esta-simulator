/** (1 + rate)^years */
export function growthFactor(rate: number, years: number): number {
  return Math.pow(1 + rate, years);
}

/** Converts a nominal future amount into today's purchasing power. */
export function toRealValue(nominal: number, inflation: number, years: number): number {
  return nominal / growthFactor(inflation, years);
}

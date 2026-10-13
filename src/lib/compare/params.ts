import { PROPERTIES, getPropertyById } from "@/lib/data/properties";
import { clamp, investmentBounds } from "@/lib/finance/bounds";
import { defaultAssumptions } from "@/lib/finance/assumptions";
import { DISTRIBUTION_MODES, type DistributionMode } from "@/lib/finance/validation";

export interface CompareParams {
  propertyId: string;
  investment: number;
  distributionMode: DistributionMode;
}

/** URL values are untrusted: anything invalid falls back to a safe default, numbers are clamped. */
export function parseCompareParams(get: (key: string) => string | null): CompareParams {
  const property = getPropertyById(get("property") ?? "") ?? PROPERTIES[0];
  const bounds = investmentBounds(property.propertyValueAed, property.minInvestmentAed);
  const fallback = defaultAssumptions(property).investment;

  const raw = get("investment");
  const parsed = raw !== null && raw.trim() !== "" ? Number(raw) : Number.NaN;
  const investment = Number.isFinite(parsed) ? clamp(Math.round(parsed), bounds.min, bounds.max) : fallback;

  const mode = get("distributions");
  const distributionMode = DISTRIBUTION_MODES.find((m) => m === mode) ?? "payout";

  return { propertyId: property.id, investment, distributionMode };
}

export function buildCompareHref(p: CompareParams): string {
  const q = new URLSearchParams({
    property: p.propertyId,
    investment: String(p.investment),
    distributions: p.distributionMode,
  });
  return `/compare?${q.toString()}`;
}

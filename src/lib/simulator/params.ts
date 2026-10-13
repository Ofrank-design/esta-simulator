import type { Property } from "@/types/property";
import { BOUNDS, clamp, cleanNumber, investmentBounds } from "@/lib/finance/bounds";
import {
  SCENARIO_KEYS,
  applyScenario,
  defaultAssumptions,
  type Assumptions,
  type ScenarioKind,
} from "@/lib/finance/assumptions";
import { DISTRIBUTION_MODES, MAINTENANCE_MODES } from "@/lib/finance/validation";
import { parseFinite, type ParamGetter } from "@/lib/url";

/**
 * URL format (all optional; anything missing or invalid falls back to the property's default):
 *   investment      AED                  e.g. 25000
 *   inflation, occupancy, yield, appreciation, opex, saleCost    percent points, e.g. occupancy=84
 *   maintenance     AED per year         e.g. 1700
 *   maintenanceMode "inflation" | "fixed"
 *   distributions   "payout" | "reinvest"
 * Only values that differ from the property's defaults are written, so the default URL stays clean.
 */
type PercentKey = "inflation" | "occupancy" | "grossYield" | "appreciation" | "opexRatio" | "saleCostRate";
const PERCENT_PARAMS: { param: string; key: PercentKey }[] = [
  { param: "inflation", key: "inflation" },
  { param: "occupancy", key: "occupancy" },
  { param: "yield", key: "grossYield" },
  { param: "appreciation", key: "appreciation" },
  { param: "opex", key: "opexRatio" },
  { param: "saleCost", key: "saleCostRate" },
];

const MAINT_URL = { fixed: "fixed", "inflation-adjusted": "inflation" } as const;

/** Untrusted input in, valid assumptions out. Never throws. */
export function parseAssumptions(get: ParamGetter, property: Property): Assumptions {
  const out = defaultAssumptions(property);

  const inv = investmentBounds(property.propertyValueAed, property.minInvestmentAed);
  const investment = parseFinite(get("investment"));
  if (investment !== null) out.investment = clamp(Math.round(investment), inv.min, inv.max);

  for (const { param, key } of PERCENT_PARAMS) {
    const pts = parseFinite(get(param));
    if (pts !== null) out[key] = cleanNumber(clamp(pts / 100, BOUNDS[key].min, BOUNDS[key].max));
  }

  const maintenance = parseFinite(get("maintenance"));
  if (maintenance !== null) out.maintenance = clamp(Math.round(maintenance), BOUNDS.maintenance.min, BOUNDS.maintenance.max);

  const mm = get("maintenanceMode");
  const mode = MAINTENANCE_MODES.find((m) => MAINT_URL[m] === mm);
  if (mode) out.maintenanceMode = mode;

  const dist = get("distributions");
  const dMode = DISTRIBUTION_MODES.find((m) => m === dist);
  if (dMode) out.distributionMode = dMode;

  return out;
}

const close = (a: number, b: number) => Math.abs(a - b) < 1e-9;

export function sameAssumptions(a: Assumptions, b: Assumptions): boolean {
  return (
    close(a.investment, b.investment) &&
    close(a.inflation, b.inflation) &&
    close(a.occupancy, b.occupancy) &&
    close(a.maintenance, b.maintenance) &&
    close(a.grossYield, b.grossYield) &&
    close(a.appreciation, b.appreciation) &&
    close(a.opexRatio, b.opexRatio) &&
    close(a.saleCostRate, b.saleCostRate) &&
    a.maintenanceMode === b.maintenanceMode &&
    a.distributionMode === b.distributionMode
  );
}

/** Query string containing only what differs from the property's defaults ("" when nothing does). */
export function encodeAssumptions(a: Assumptions, property: Property): string {
  const d = defaultAssumptions(property);
  const q = new URLSearchParams();
  if (!close(a.investment, d.investment)) q.set("investment", String(Math.round(a.investment)));
  for (const { param, key } of PERCENT_PARAMS) {
    if (!close(a[key], d[key])) q.set(param, String(cleanNumber(a[key] * 100)));
  }
  if (!close(a.maintenance, d.maintenance)) q.set("maintenance", String(Math.round(a.maintenance)));
  if (a.maintenanceMode !== d.maintenanceMode) q.set("maintenanceMode", MAINT_URL[a.maintenanceMode]);
  if (a.distributionMode !== d.distributionMode) q.set("distributions", a.distributionMode);
  return q.toString();
}

/** Which preset the current values exactly match, if any. Lets a shared link show the right preset. */
export function matchScenario(property: Property, a: Assumptions): ScenarioKind | "custom" {
  for (const kind of SCENARIO_KEYS) {
    if (sameAssumptions(a, applyScenario(property, a, kind))) return kind;
  }
  return "custom";
}

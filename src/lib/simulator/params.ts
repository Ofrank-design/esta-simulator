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
import { formatUsd } from "@/lib/format";
import { parseFinite, type ParamGetter } from "@/lib/url";

/**
 * URL format (all optional; anything missing or invalid falls back to the property's default):
 *   investment      USD                  e.g. 2500
 *   inflation, occupancy, yield, appreciation, opex, saleCost    percent points, e.g. occupancy=84
 *   maintenance     USD per year         e.g. 475
 *   maintenanceMode "inflation" | "fixed"
 *   distributions   "payout" | "reinvest"
 *   v               "2" whenever a money amount (investment, maintenance) is present.
 * Only values that differ from the property's defaults are written, so the default URL stays clean.
 *
 * VERSIONING: before v2 the money amounts were in AED. A link with money amounts but no v=2 is a
 * legacy link: its money amounts are ignored (never silently read as dollars) and the user is told.
 * Rates are unitless, so they are still applied.
 */
export const URL_VERSION = "2";

type PercentKey = "inflation" | "occupancy" | "grossYield" | "appreciation" | "opexRatio" | "saleCostRate";
const PERCENT_PARAMS: { param: string; key: PercentKey; label: string }[] = [
  { param: "inflation", key: "inflation", label: "Inflation" },
  { param: "occupancy", key: "occupancy", label: "Occupancy" },
  { param: "yield", key: "grossYield", label: "Gross yield" },
  { param: "appreciation", key: "appreciation", label: "Appreciation" },
  { param: "opex", key: "opexRatio", label: "Operating expenses" },
  { param: "saleCost", key: "saleCostRate", label: "Sale costs" },
];

const MAINT_URL = { fixed: "fixed", "inflation-adjusted": "inflation" } as const;

export interface ParsedAssumptions {
  assumptions: Assumptions;
  /** Plain-language notes about anything in the link that was changed, ignored or clamped. */
  notices: string[];
}

const present = (v: string | null | undefined): v is string => v !== null && v !== undefined && v.trim() !== "";
const pct = (fraction: number) => `${cleanNumber(fraction * 100)}%`;

/** Untrusted input in, valid assumptions out. Never throws. */
export function parseAssumptionsDetailed(get: ParamGetter, property: Property): ParsedAssumptions {
  const out = defaultAssumptions(property);
  const defaults = defaultAssumptions(property);
  const notices: string[] = [];
  const isCurrentVersion = get("v") === URL_VERSION;
  let legacyMoney = false;

  // money: investment
  const rawInvestment = get("investment");
  if (present(rawInvestment)) {
    if (!isCurrentVersion) legacyMoney = true;
    else {
      const n = parseFinite(rawInvestment);
      const inv = investmentBounds(property.propertyValueUsd, property.minInvestmentUsd);
      if (n === null) notices.push(`The starting investment in this link couldn't be read, so we used ${formatUsd(defaults.investment)}.`);
      else {
        const value = clamp(Math.round(n), inv.min, inv.max);
        out.investment = value;
        if (value !== n) notices.push(`The starting investment in this link (${formatUsd(n)}) is outside what this property allows, so we set it to ${formatUsd(value)}.`);
      }
    }
  }

  // money: maintenance
  const rawMaint = get("maintenance");
  if (present(rawMaint)) {
    if (!isCurrentVersion) legacyMoney = true;
    else {
      const n = parseFinite(rawMaint);
      if (n === null) notices.push(`The maintenance amount in this link couldn't be read, so we used ${formatUsd(defaults.maintenance)}.`);
      else {
        const value = clamp(Math.round(n), BOUNDS.maintenance.min, BOUNDS.maintenance.max);
        out.maintenance = value;
        if (value !== n) notices.push(`The maintenance amount in this link (${formatUsd(n)}) is outside the allowed range, so we set it to ${formatUsd(value)}.`);
      }
    }
  }

  if (legacyMoney) {
    notices.push("This link was made when amounts were shown in AED, so its investment and maintenance amounts weren't applied. Percentages in the link were kept.");
  }

  // rates, in percent points
  for (const { param, key, label } of PERCENT_PARAMS) {
    const raw = get(param);
    if (!present(raw)) continue;
    const pts = parseFinite(raw);
    if (pts === null) {
      notices.push(`${label} in this link couldn't be read, so we used the starting value of ${pct(defaults[key])}.`);
      continue;
    }
    const value = cleanNumber(clamp(pts / 100, BOUNDS[key].min, BOUNDS[key].max));
    out[key] = value;
    if (Math.abs(value - pts / 100) > 1e-9) notices.push(`${label} in this link (${cleanNumber(pts)}%) is outside the allowed range, so we set it to ${pct(value)}.`);
  }

  const mm = get("maintenanceMode");
  if (present(mm)) {
    const mode = MAINTENANCE_MODES.find((m) => MAINT_URL[m] === mm);
    if (mode) out.maintenanceMode = mode;
    else notices.push("The maintenance setting in this link wasn't recognised, so we used the starting setting.");
  }

  const dist = get("distributions");
  if (present(dist)) {
    const dMode = DISTRIBUTION_MODES.find((m) => m === dist);
    if (dMode) out.distributionMode = dMode;
    else notices.push("The distribution setting in this link wasn't recognised, so we used the starting setting.");
  }

  return { assumptions: out, notices };
}

export function parseAssumptions(get: ParamGetter, property: Property): Assumptions {
  return parseAssumptionsDetailed(get, property).assumptions;
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
  let money = false;
  if (!close(a.investment, d.investment)) { q.set("investment", String(Math.round(a.investment))); money = true; }
  for (const { param, key } of PERCENT_PARAMS) {
    if (!close(a[key], d[key])) q.set(param, String(cleanNumber(a[key] * 100)));
  }
  if (!close(a.maintenance, d.maintenance)) { q.set("maintenance", String(Math.round(a.maintenance))); money = true; }
  if (a.maintenanceMode !== d.maintenanceMode) q.set("maintenanceMode", MAINT_URL[a.maintenanceMode]);
  if (a.distributionMode !== d.distributionMode) q.set("distributions", a.distributionMode);
  if (money) {
    const withVersion = new URLSearchParams({ v: URL_VERSION });
    q.forEach((value, key) => withVersion.set(key, value));
    return withVersion.toString();
  }
  return q.toString();
}

/** Which preset the current values exactly match, if any. Lets a shared link show the right preset. */
export function matchScenario(property: Property, a: Assumptions): ScenarioKind | "custom" {
  for (const kind of SCENARIO_KEYS) {
    if (sameAssumptions(a, applyScenario(property, a, kind))) return kind;
  }
  return "custom";
}

/** Assumptions that differ from the property's starting values, by field. */
export function changedFields(property: Property, a: Assumptions): Set<keyof Assumptions> {
  const d = defaultAssumptions(property);
  const out = new Set<keyof Assumptions>();
  (Object.keys(a) as (keyof Assumptions)[]).forEach((k) => {
    const x = a[k], y = d[k];
    if (typeof x === "number" && typeof y === "number" ? !close(x, y) : x !== y) out.add(k);
  });
  return out;
}

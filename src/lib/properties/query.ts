import { ASSET_TYPES, type AssetType, type Property } from "@/types/property";
import type { ParamGetter } from "@/lib/url";

export type TypeFilter = AssetType | "all";
export type SortKey = "default" | "value-desc" | "value-asc" | "yield-desc" | "yield-asc";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "default", label: "Featured" },
  { value: "value-desc", label: "Value: high to low" },
  { value: "value-asc", label: "Value: low to high" },
  { value: "yield-desc", label: "Yield: high to low" },
  { value: "yield-asc", label: "Yield: low to high" },
];

/** Pure and non-mutating. Ties keep dataset order (stable sort). */
export function filterAndSort(
  properties: readonly Property[],
  type: TypeFilter,
  sort: SortKey,
): Property[] {
  const filtered = type === "all" ? [...properties] : properties.filter((p) => p.assetType === type);
  switch (sort) {
    case "value-desc":
      return filtered.sort((a, b) => b.propertyValueUsd - a.propertyValueUsd);
    case "value-asc":
      return filtered.sort((a, b) => a.propertyValueUsd - b.propertyValueUsd);
    case "yield-desc":
      return filtered.sort((a, b) => b.grossYield - a.grossYield);
    case "yield-asc":
      return filtered.sort((a, b) => a.grossYield - b.grossYield);
    default:
      return filtered;
  }
}

/** URL: ?type=commercial&sort=yield-desc. Invalid values fall back to the defaults. */
export function parseListParams(get: ParamGetter): { type: TypeFilter; sort: SortKey } {
  const t = get("type");
  const s = get("sort");
  return {
    type: ASSET_TYPES.find((a) => a === t) ?? "all",
    sort: SORT_OPTIONS.find((o) => o.value === s)?.value ?? "default",
  };
}

export function encodeListParams(type: TypeFilter, sort: SortKey): string {
  const q = new URLSearchParams();
  if (type !== "all") q.set("type", type);
  if (sort !== "default") q.set("sort", sort);
  return q.toString();
}

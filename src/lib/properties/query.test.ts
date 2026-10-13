import { describe, expect, it } from "vitest";
import { PROPERTIES } from "@/lib/data/properties";
import { filterAndSort } from "./query";

describe("filterAndSort", () => {
  it("returns all properties for 'all' in dataset order by default", () => {
    expect(filterAndSort(PROPERTIES, "all", "default").map((p) => p.id)).toEqual(
      PROPERTIES.map((p) => p.id),
    );
  });

  it("filters by asset type", () => {
    const result = filterAndSort(PROPERTIES, "commercial", "default");
    expect(result.length).toBe(2);
    expect(result.every((p) => p.assetType === "commercial")).toBe(true);
  });

  it("sorts by value descending and ascending", () => {
    const desc = filterAndSort(PROPERTIES, "all", "value-desc").map((p) => p.propertyValueAed);
    expect(desc).toEqual([5_600_000, 4_500_000, 3_900_000, 3_200_000, 2_400_000, 1_800_000]);
    const asc = filterAndSort(PROPERTIES, "all", "value-asc").map((p) => p.propertyValueAed);
    expect(asc).toEqual([...desc].reverse());
  });

  it("sorts by yield descending and ascending", () => {
    const desc = filterAndSort(PROPERTIES, "all", "yield-desc").map((p) => p.grossYield);
    expect(desc).toEqual([0.074, 0.072, 0.07, 0.069, 0.065, 0.058]);
    const asc = filterAndSort(PROPERTIES, "all", "yield-asc").map((p) => p.grossYield);
    expect(asc).toEqual([...desc].reverse());
  });

  it("combines filter and sort", () => {
    const ids = filterAndSort(PROPERTIES, "multifamily", "yield-desc").map((p) => p.id);
    expect(ids).toEqual(["jvc-residences", "al-barsha-apartments"]);
  });

  it("does not mutate the source array", () => {
    const before = PROPERTIES.map((p) => p.id);
    filterAndSort(PROPERTIES, "all", "value-desc");
    expect(PROPERTIES.map((p) => p.id)).toEqual(before);
  });
});

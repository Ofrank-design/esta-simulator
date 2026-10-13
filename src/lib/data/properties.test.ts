import { describe, expect, it } from "vitest";
import { PROPERTIES, getPropertyById } from "./properties";
import { propertySchema, ASSET_TYPES } from "@/types/property";

describe("mock property dataset", () => {
  it("has unique ids", () => {
    expect(new Set(PROPERTIES.map((p) => p.id)).size).toBe(PROPERTIES.length);
  });

  it("covers every asset type", () => {
    for (const type of ASSET_TYPES) {
      expect(PROPERTIES.some((p) => p.assetType === type)).toBe(true);
    }
  });

  it("marks every record as mock and passes schema validation", () => {
    for (const p of PROPERTIES) {
      expect(p.isMock).toBe(true);
      expect(propertySchema.safeParse(p).success).toBe(true);
    }
  });

  it("keeps minimum investment below property value", () => {
    for (const p of PROPERTIES) expect(p.minInvestmentUsd).toBeLessThan(p.propertyValueUsd);
  });

  it("rejects an invalid record", () => {
    expect(propertySchema.safeParse({ ...PROPERTIES[0], occupancy: 1.5 }).success).toBe(false);
    expect(propertySchema.safeParse({ ...PROPERTIES[0], isMock: false }).success).toBe(false);
  });

  it("uses USD-scale numbers that fit the slider bounds", () => {
    for (const p of PROPERTIES) {
      expect(p.propertyValueUsd).toBeGreaterThanOrEqual(100_000);
      expect(p.propertyValueUsd).toBeLessThanOrEqual(5_000_000);
      expect(p.minInvestmentUsd % 100).toBe(0);
      expect(p.minInvestmentUsd).toBeLessThanOrEqual(25_000);
      expect(p.annualMaintenanceUsd % 25).toBe(0);
      expect(p.annualMaintenanceUsd).toBeLessThanOrEqual(3_000);
    }
  });

  it("looks up by id", () => {
    expect(getPropertyById("marina-residence")?.name).toBe("Marina Residence");
    expect(getPropertyById("nope")).toBeUndefined();
  });
});

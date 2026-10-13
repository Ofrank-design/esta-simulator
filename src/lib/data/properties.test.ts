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
    for (const p of PROPERTIES) expect(p.minInvestmentAed).toBeLessThan(p.propertyValueAed);
  });

  it("rejects an invalid record", () => {
    expect(propertySchema.safeParse({ ...PROPERTIES[0], occupancy: 1.5 }).success).toBe(false);
    expect(propertySchema.safeParse({ ...PROPERTIES[0], isMock: false }).success).toBe(false);
  });

  it("looks up by id", () => {
    expect(getPropertyById("marina-residence")?.name).toBe("Marina Residence");
    expect(getPropertyById("nope")).toBeUndefined();
  });
});

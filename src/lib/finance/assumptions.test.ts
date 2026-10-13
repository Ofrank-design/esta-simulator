import { describe, expect, it } from "vitest";
import { PROPERTIES } from "@/lib/data/properties";
import { BOUNDS } from "./bounds";
import { applyScenario, defaultAssumptions, SCENARIO_DELTAS, toProjectionInputs } from "./assumptions";
import { projectInvestment } from "./projections";

describe("scenario presets", () => {
  const marina = PROPERTIES[0];

  it("base case equals the property's own defaults", () => {
    const d = defaultAssumptions(marina);
    expect(applyScenario(marina, d, "base")).toEqual(d);
  });

  it("applies the stated additive deltas", () => {
    const d = defaultAssumptions(marina);
    const c = applyScenario(marina, d, "conservative");
    expect(c.occupancy).toBeCloseTo(0.84, 10);
    expect(c.grossYield).toBeCloseTo(0.055, 10);
    expect(c.appreciation).toBeCloseTo(0.01, 10);
    expect(c.inflation).toBeCloseTo(0.035, 10);
    expect(c.maintenance).toBe(1_700);
    expect(SCENARIO_DELTAS.conservative.occupancy).toBe(-0.08);
  });

  it("keeps every preset within slider bounds and projectable for every property", () => {
    for (const p of PROPERTIES) {
      for (const kind of ["conservative", "base", "optimistic"] as const) {
        const a = applyScenario(p, defaultAssumptions(p), kind);
        for (const k of ["grossYield", "occupancy", "opexRatio", "appreciation", "inflation", "maintenance"] as const) {
          expect(a[k]).toBeGreaterThanOrEqual(BOUNDS[k].min);
          expect(a[k]).toBeLessThanOrEqual(BOUNDS[k].max);
        }
        expect(() => projectInvestment(toProjectionInputs(p, a))).not.toThrow();
      }
    }
  });

  it("orders outcomes: conservative < base < optimistic total economic value", () => {
    const d = defaultAssumptions(marina);
    const tev = (k: "conservative" | "base" | "optimistic") =>
      projectInvestment(toProjectionInputs(marina, applyScenario(marina, d, k))).summary.final.totalEconomicValue;
    expect(tev("conservative")).toBeLessThan(tev("base"));
    expect(tev("base")).toBeLessThan(tev("optimistic"));
  });
});

import { compareScenarios } from "./assumptions";

describe("compareScenarios", () => {
  it("returns the three presets in order, each with its own assumptions and result", () => {
    const p = PROPERTIES[1];
    const out = compareScenarios(p, { ...defaultAssumptions(p), investment: 20_000 });
    expect(out.map((o) => o.kind)).toEqual(["conservative", "base", "optimistic"]);
    expect(out.every((o) => o.assumptions.investment === 20_000)).toBe(true);
    expect(out[0].result.summary.final.totalEconomicValue).toBeLessThan(out[2].result.summary.final.totalEconomicValue);
    expect(out[1].assumptions).toEqual({ ...defaultAssumptions(p), investment: 20_000 });
  });
});

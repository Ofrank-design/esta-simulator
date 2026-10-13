import { describe, expect, it } from "vitest";
import { PROPERTIES } from "@/lib/data/properties";
import { compareScenarios, defaultAssumptions, type Assumptions } from "@/lib/finance/assumptions";
import { buildCompareHref, parseCompareParams } from "./params";

const from = (query: string) => { const q = new URLSearchParams(query); return parseCompareParams((k) => q.get(k)); };
const marina = PROPERTIES[0];

/** Every adjustable assumption moved away from its default, as a user might in the simulator. */
const customised: Assumptions = {
  ...defaultAssumptions(marina),
  investment: 7_500, occupancy: 0.78, inflation: 0.035, maintenance: 450, maintenanceMode: "fixed",
  grossYield: 0.058, opexRatio: 0.31, appreciation: 0.012, saleCostRate: 0.03, distributionMode: "reinvest",
};

describe("compare URL parameters", () => {
  it("uses safe defaults for an empty query", () => {
    const r = from("");
    expect(r.propertyId).toBe("marina-residence");
    expect(r.assumptions).toEqual(defaultAssumptions(marina));
    expect(r.notices).toEqual([]);
  });
  it("falls back for an unknown property and says so", () => {
    const r = from("property=nope");
    expect(r.propertyId).toBe("marina-residence");
    expect(r.notices[0]).toMatch(/couldn't find a property called "nope"/);
  });
  it("carries a fully customised scenario from the simulator through the compare link (regression)", () => {
    const href = buildCompareHref(marina, customised);
    const r = from(href.split("?")[1]);
    expect(r.propertyId).toBe("marina-residence");
    expect(r.assumptions).toEqual(customised);
    expect(r.notices).toEqual([]);
  });
  it("uses the customised assumptions as the base case and shifts them for the others", () => {
    const outcomes = compareScenarios(marina, customised);
    expect(outcomes[1].assumptions).toEqual(customised);
    expect(outcomes[0].assumptions.occupancy).toBeCloseTo(0.70, 10);
    expect(outcomes[2].assumptions.occupancy).toBeCloseTo(0.82, 10);
    expect(outcomes[0].assumptions.investment).toBe(7_500);
    expect(outcomes[0].assumptions.maintenanceMode).toBe("fixed");
    expect(outcomes[2].result.inputs.distributionMode).toBe("reinvest");
  });
  it("clamps and validates through the shared parser", () => {
    const r = from("property=creek-harbour-offices&v=2&investment=1&occupancy=500");
    expect(r.assumptions.investment).toBe(PROPERTIES[3].minInvestmentUsd);
    expect(r.assumptions.occupancy).toBe(1);
    expect(r.notices.length).toBe(2);
  });
  it("does not trust legacy money amounts in old compare links", () => {
    const r = from("property=marina-residence&investment=20000&distributions=reinvest");
    expect(r.assumptions.investment).toBe(defaultAssumptions(marina).investment);
    expect(r.assumptions.distributionMode).toBe("reinvest");
    expect(r.notices[0]).toMatch(/AED/);
  });
  it("round-trips every property at its defaults", () => {
    for (const p of PROPERTIES) {
      const r = from(buildCompareHref(p, defaultAssumptions(p)).split("?")[1]);
      expect(r.propertyId).toBe(p.id);
      expect(r.assumptions).toEqual(defaultAssumptions(p));
    }
  });
});

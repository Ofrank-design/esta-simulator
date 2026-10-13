import { describe, expect, it } from "vitest";
import { PROPERTIES } from "@/lib/data/properties";
import { applyScenario, defaultAssumptions } from "@/lib/finance/assumptions";
import { changedFields, encodeAssumptions, matchScenario, parseAssumptions, parseAssumptionsDetailed } from "./params";
import { recordGetter } from "@/lib/url";
import { encodeListParams, parseListParams } from "@/lib/properties/query";

const marina = PROPERTIES[0];
const get = (query: string) => { const q = new URLSearchParams(query); return (k: string) => q.get(k); };
const from = (query: string, p = marina) => parseAssumptions(get(query), p);
const detail = (query: string, p = marina) => parseAssumptionsDetailed(get(query), p);

describe("simulator URL parameters", () => {
  it("returns the property's defaults, with no notices, for an empty query", () => {
    expect(detail("")).toEqual({ assumptions: defaultAssumptions(marina), notices: [] });
  });

  it("reads valid values (percent points for rates, USD for money with v=2)", () => {
    const { assumptions: a, notices } = detail("v=2&investment=5000&occupancy=84&yield=5.5&inflation=3.5&maintenance=475&opex=30&appreciation=1&saleCost=3&maintenanceMode=fixed&distributions=reinvest");
    expect(a).toMatchObject({
      investment: 5_000, occupancy: 0.84, grossYield: 0.055, inflation: 0.035,
      maintenance: 475, opexRatio: 0.3, appreciation: 0.01, saleCostRate: 0.03,
      maintenanceMode: "fixed", distributionMode: "reinvest",
    });
    expect(notices).toEqual([]);
  });

  it("clamps out-of-range numbers and explains what it did", () => {
    const { assumptions: a, notices } = detail("v=2&investment=99999999&occupancy=150&yield=-5&inflation=500&maintenance=-20&opex=1000");
    expect(a.investment).toBe(25_000);
    expect(a.occupancy).toBe(1);
    expect(a.grossYield).toBe(0);
    expect(a.inflation).toBe(0.1);
    expect(a.maintenance).toBe(0);
    expect(a.opexRatio).toBe(0.6);
    expect(notices).toHaveLength(6);
    expect(notices.join(" ")).toMatch(/Occupancy in this link \(150%\) is outside the allowed range, so we set it to 100%/);
  });

  it("raises investment to the property's minimum", () => {
    expect(from("v=2&investment=1", PROPERTIES[3]).investment).toBe(PROPERTIES[3].minInvestmentUsd);
  });

  it("ignores garbage per field and tells the user", () => {
    const d = defaultAssumptions(marina);
    const { assumptions, notices } = detail("v=2&occupancy=abc&inflation=Infinity&opex=NaN&maintenanceMode=bogus&distributions=%3Cscript%3E&investment=1e999");
    expect(assumptions).toEqual(d);
    expect(notices.length).toBe(6);
  });

  it("treats blank values as not provided, without a notice", () => {
    expect(detail("yield=&occupancy=%20")).toEqual({ assumptions: defaultAssumptions(marina), notices: [] });
  });

  it("uses the first value when a key repeats", () => {
    expect(parseAssumptions(recordGetter({ occupancy: ["70", "99"] }), marina).occupancy).toBe(0.7);
  });
});

describe("legacy (AED era) links", () => {
  it("never reads old money amounts as dollars", () => {
    const { assumptions, notices } = detail("investment=25000&maintenance=1700&occupancy=84");
    const d = defaultAssumptions(marina);
    expect(assumptions.investment).toBe(d.investment);
    expect(assumptions.maintenance).toBe(d.maintenance);
    expect(assumptions.occupancy).toBe(0.84); // rates are unitless and are kept
    expect(notices).toHaveLength(1);
    expect(notices[0]).toMatch(/AED/);
  });
  it("does not warn about links with only rates (they were never currency dependent)", () => {
    expect(detail("occupancy=84&yield=5.5").notices).toEqual([]);
  });
});

describe("writing URLs", () => {
  it("writes nothing at the defaults, and only what differs otherwise", () => {
    const d = defaultAssumptions(marina);
    expect(encodeAssumptions(d, marina)).toBe("");
    expect(encodeAssumptions({ ...d, occupancy: 0.82 }, marina)).toBe("occupancy=82");
  });
  it("adds the version marker whenever a money amount is written", () => {
    const d = defaultAssumptions(marina);
    expect(encodeAssumptions({ ...d, investment: 5_000 }, marina)).toBe("v=2&investment=5000");
    expect(encodeAssumptions({ ...d, maintenance: 475, occupancy: 0.8 }, marina)).toContain("v=2");
  });
  it("round-trips arbitrary valid state", () => {
    const a = { ...defaultAssumptions(marina), investment: 7_500, occupancy: 0.77, grossYield: 0.0615, inflation: 0.041,
      maintenance: 450, maintenanceMode: "fixed" as const, distributionMode: "reinvest" as const, saleCostRate: 0.035 };
    expect(from(encodeAssumptions(a, marina))).toEqual(a);
  });
  it("round-trips for every property and preset", () => {
    for (const p of PROPERTIES) {
      for (const kind of ["conservative", "base", "optimistic"] as const) {
        const a = applyScenario(p, defaultAssumptions(p), kind);
        expect(from(encodeAssumptions(a, p), p)).toEqual(a);
      }
    }
  });
});

describe("presets and change tracking", () => {
  it("detects presets from values", () => {
    const d = defaultAssumptions(marina);
    expect(matchScenario(marina, d)).toBe("base");
    expect(matchScenario(marina, applyScenario(marina, d, "conservative"))).toBe("conservative");
    expect(matchScenario(marina, applyScenario(marina, d, "optimistic"))).toBe("optimistic");
    expect(matchScenario(marina, { ...d, occupancy: 0.5 })).toBe("custom");
  });
  it("lists which assumptions differ from the property's starting values", () => {
    const d = defaultAssumptions(marina);
    expect(changedFields(marina, d).size).toBe(0);
    expect([...changedFields(marina, { ...d, occupancy: 0.5, distributionMode: "reinvest" })].sort()).toEqual(["distributionMode", "occupancy"]);
  });
});

describe("property list URL parameters", () => {
  const list = (q: string) => { const s = new URLSearchParams(q); return parseListParams((k) => s.get(k)); };
  it("parses type and sort with safe fallbacks", () => {
    expect(list("")).toEqual({ type: "all", sort: "default" });
    expect(list("type=commercial&sort=yield-desc")).toEqual({ type: "commercial", sort: "yield-desc" });
    expect(list("type=hotel&sort=random")).toEqual({ type: "all", sort: "default" });
  });
  it("omits defaults when encoding", () => {
    expect(encodeListParams("all", "default")).toBe("");
    expect(encodeListParams("commercial", "value-desc")).toBe("type=commercial&sort=value-desc");
  });
});

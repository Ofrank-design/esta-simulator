import { describe, expect, it } from "vitest";
import { PROPERTIES } from "@/lib/data/properties";
import { applyScenario, defaultAssumptions } from "@/lib/finance/assumptions";
import { encodeAssumptions, matchScenario, parseAssumptions } from "./params";
import { recordGetter } from "@/lib/url";
import { encodeListParams, parseListParams } from "@/lib/properties/query";

const marina = PROPERTIES[0];
const from = (query: string, p = marina) => {
  const q = new URLSearchParams(query);
  return parseAssumptions((k) => q.get(k), p);
};

describe("simulator URL parameters", () => {
  it("returns the property's defaults for an empty query", () => {
    expect(from("")).toEqual(defaultAssumptions(marina));
  });

  it("reads valid values (percent points for rates)", () => {
    const a = from("investment=25000&occupancy=84&yield=5.5&inflation=3.5&maintenance=1700&opex=30&appreciation=1&saleCost=3&maintenanceMode=fixed&distributions=reinvest");
    expect(a).toMatchObject({
      investment: 25_000, occupancy: 0.84, grossYield: 0.055, inflation: 0.035,
      maintenance: 1_700, opexRatio: 0.3, appreciation: 0.01, saleCostRate: 0.03,
      maintenanceMode: "fixed", distributionMode: "reinvest",
    });
  });

  it("clamps out-of-range numbers to slider bounds", () => {
    const a = from("investment=99999999&occupancy=150&yield=-5&inflation=500&maintenance=-20&opex=1000");
    expect(a.investment).toBe(100_000);
    expect(a.occupancy).toBe(1);
    expect(a.grossYield).toBe(0);
    expect(a.inflation).toBe(0.1);
    expect(a.maintenance).toBe(0);
    expect(a.opexRatio).toBe(0.6);
  });

  it("raises investment to the property's minimum", () => {
    expect(from("investment=1", PROPERTIES[3]).investment).toBe(PROPERTIES[3].minInvestmentAed);
  });

  it("ignores garbage and falls back per field", () => {
    const d = defaultAssumptions(marina);
    const a = from("occupancy=abc&yield=&inflation=Infinity&opex=NaN&maintenanceMode=bogus&distributions=%3Cscript%3E&investment=1e999");
    expect(a).toEqual(d);
  });

  it("uses the first value when a key repeats", () => {
    const get = recordGetter({ occupancy: ["70", "99"] });
    expect(parseAssumptions(get, marina).occupancy).toBe(0.7);
  });

  it("writes only values that differ from the defaults, and nothing at the defaults", () => {
    const d = defaultAssumptions(marina);
    expect(encodeAssumptions(d, marina)).toBe("");
    expect(encodeAssumptions({ ...d, occupancy: 0.82 }, marina)).toBe("occupancy=82");
  });

  it("round-trips arbitrary valid state", () => {
    const a = { ...defaultAssumptions(marina), investment: 32_500, occupancy: 0.77, grossYield: 0.0615, inflation: 0.041,
      maintenance: 2_300, maintenanceMode: "fixed" as const, distributionMode: "reinvest" as const, saleCostRate: 0.035 };
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

  it("detects presets from values so a shared link highlights the right one", () => {
    const d = defaultAssumptions(marina);
    expect(matchScenario(marina, d)).toBe("base");
    expect(matchScenario(marina, applyScenario(marina, d, "conservative"))).toBe("conservative");
    expect(matchScenario(marina, applyScenario(marina, d, "optimistic"))).toBe("optimistic");
    expect(matchScenario(marina, { ...d, occupancy: 0.5 })).toBe("custom");
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

import { describe, expect, it } from "vitest";
import { buildCompareHref, parseCompareParams } from "./params";

const from = (query: string) => {
  const q = new URLSearchParams(query);
  return parseCompareParams((k) => q.get(k));
};

describe("compare URL parameters", () => {
  it("uses safe defaults for an empty query", () => {
    expect(from("")).toEqual({ propertyId: "marina-residence", investment: 10_000, distributionMode: "payout" });
  });
  it("falls back for an unknown property or mode", () => {
    const r = from("property=nope&distributions=bogus");
    expect(r.propertyId).toBe("marina-residence");
    expect(r.distributionMode).toBe("payout");
  });
  it("clamps out-of-range investment and rejects non-numbers", () => {
    expect(from("property=marina-residence&investment=99999999").investment).toBe(100_000);
    expect(from("property=marina-residence&investment=5").investment).toBe(1_000);
    expect(from("property=marina-residence&investment=abc").investment).toBe(10_000);
    expect(from("property=marina-residence&investment=Infinity").investment).toBe(10_000);
  });
  it("round-trips through a link", () => {
    const params = { propertyId: "creek-harbour-offices", investment: 20_000, distributionMode: "reinvest" as const };
    const href = buildCompareHref(params);
    expect(from(href.split("?")[1])).toEqual(params);
  });
});

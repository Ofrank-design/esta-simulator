import { describe, expect, it } from "vitest";
import { PROPERTIES } from "@/lib/data/properties";
import { defaultAssumptions, type Assumptions } from "@/lib/finance/assumptions";
import { MODEL_VERSION } from "@/lib/finance/projections";
import { buildScenarioCsv, csvField, scenarioFileName } from "./csv";

const p = PROPERTIES[0];
const at = new Date("2026-10-13T09:00:00Z");
const parse = (csv: string) => csv.trim().split("\r\n").filter((l) => !l.startsWith("#") && l.trim() !== "");
const custom: Assumptions = { ...defaultAssumptions(p), investment: 5_000, occupancy: 0.5, distributionMode: "reinvest", saleCostRate: 0.03 };

describe("CSV export", () => {
  it("carries the disclaimer, data status, model version, methodology link and timestamp", () => {
    const csv = buildScenarioCsv(p, custom, at, "https://esta.example");
    expect(csv).toContain("# Illustrative data");
    expect(csv).toContain("not live listings");
    expect(csv).toContain(`Model version: ${MODEL_VERSION}`);
    expect(csv).toContain("Methodology: https://esta.example/methodology");
    expect(csv).toContain("Data status: Sample (invented). Source: ESTA illustrative dataset");
    expect(csv).toContain("Generated: 2026-10-13T09:00:00.000Z");
    expect(csv).toContain("Currency: US dollars (USD)");
  });
  it("lists the exact assumptions of the scenario, with property defaults for comparison", () => {
    const csv = buildScenarioCsv(p, custom, at);
    expect(csv).toContain("Starting investment (USD): 5000.00 (property default 2500.00)");
    expect(csv).toContain("Occupancy (%): 50.00 (property default 92.00)");
    expect(csv).toContain("Sale costs (%): 3.00");
    expect(csv).toContain("Distributions: Reinvested");
  });
  it("has a header, then years 0 to 10, with matching column counts", () => {
    const rows = parse(buildScenarioCsv(p, custom, at));
    const cols = rows[0].split(",").length;
    expect(rows).toHaveLength(12);
    expect(rows.every((r) => r.split(",").length === cols)).toBe(true);
    expect(rows[1].startsWith("0,")).toBe(true);
    expect(rows[11].startsWith("10,")).toBe(true);
  });
  it("uses USD in every money column header", () => {
    const header = parse(buildScenarioCsv(p, custom, at))[0];
    expect(header).toContain("Property value (USD)");
    expect(header).toContain("Profit if sold (USD)");
    expect(header).not.toMatch(/AED/);
  });
  it("matches the engine for the final year (the exact assumptions, not defaults)", () => {
    const rows = parse(buildScenarioCsv(p, custom, at));
    const header = rows[0].split(",");
    const last = rows[11].split(",");
    const col = (name: string) => Number(last[header.indexOf(name)]);
    expect(col("Capital call (USD)")).toBe(0);
    expect(col("Ownership share at year end (%)")).toBeGreaterThan((5_000 / p.propertyValueUsd) * 100);
    expect(col("Cumulative cash distributions (USD)")).toBe(0); // reinvest, nowhere near 100%
  });
  it("includes net cash yield below the gross yield", () => {
    const header = parse(buildScenarioCsv(p, defaultAssumptions(p), at))[0].split(",");
    const y1 = parse(buildScenarioCsv(p, defaultAssumptions(p), at))[2].split(",");
    const net = Number(y1[header.indexOf("Net cash yield (%)")]);
    expect(net).toBeGreaterThan(0);
    expect(net).toBeLessThan(p.grossYield * 100);
  });
  it("escapes commas and quotes and neutralises spreadsheet formulas", () => {
    expect(csvField('a,b')).toBe('"a,b"');
    expect(csvField('say "hi"')).toBe('"say ""hi"""');
    expect(csvField("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(csvField("-2+3")).toBe("'-2+3");
    expect(csvField(-12.5)).toBe("-12.5"); // real negative numbers stay numbers
  });
  it("names the file after the property", () => {
    expect(scenarioFileName(p, "csv")).toBe("esta-marina-residence-scenario.csv");
  });
});

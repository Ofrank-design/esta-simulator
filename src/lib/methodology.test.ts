import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { PROPERTIES } from "@/lib/data/properties";
import { BOUNDS } from "@/lib/finance/bounds";
import { SCENARIO_DELTAS } from "@/lib/finance/assumptions";
import { DEFINITIONS, EXCLUSIONS, EXCLUSIONS_DETAIL } from "@/lib/finance/definitions";
import { MODEL_VERSION, projectInvestment } from "@/lib/finance/projections";
import { defaultAssumptions, toProjectionInputs } from "@/lib/finance/assumptions";
import { MODEL_CHANGELOG, buildMethodologyMarkdown, methodologySections, workedExample } from "./methodology";

const root = path.resolve(import.meta.dirname, "../..");
const text = () => JSON.stringify(methodologySections());

describe("methodology", () => {
  it("MODEL_METHODOLOGY.md is in sync with the source (run `npm run docs:methodology` if this fails)", () => {
    const file = fs.readFileSync(path.join(root, "MODEL_METHODOLOGY.md"), "utf8");
    expect(file).toBe(buildMethodologyMarkdown());
  });

  it("covers every topic the roadmap requires", () => {
    const ids = methodologySections().map((s) => s.id);
    for (const id of ["ownership", "property-income", "timing", "your-share-of-income", "capital-calls", "value-and-appreciation", "sale-costs-and-roi", "yields", "inflation", "assumptions-and-ranges", "not-modelled", "sample-data", "version-history", "terms", "worked-example", "presets"]) {
      expect(ids).toContain(id);
    }
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses the shared definitions word for word", () => {
    const md = buildMethodologyMarkdown();
    for (const d of DEFINITIONS) {
      expect(md).toContain(d.term);
      expect(md).toContain(d.text);
    }
  });

  it("defines the metrics by name: total value, cash-on-cash, appreciation, nominal ROI, inflation adjusted", () => {
    const terms = DEFINITIONS.map((d) => d.term);
    for (const t of ["Total value before sale costs", "Cash-on-cash yield", "Property appreciation", "ROI if sold", "Inflation adjusted value", "Net cash yield", "Gross rental yield", "Capital calls"]) {
      expect(terms).toContain(t);
    }
    expect(DEFINITIONS.find((d) => d.term === "ROI if sold")?.text).toMatch(/nominal/);
  });

  it("states that the model is deterministic and doesn't predict the market", () => {
    expect(text()).toMatch(/deterministic/);
    expect(text()).toMatch(/doesn't predict/);
  });

  it("lists every excluded cost and risk, including those in the short footer sentence", () => {
    expect(EXCLUSIONS_DETAIL.length).toBeGreaterThanOrEqual(10);
    const names = EXCLUSIONS_DETAIL.map((e) => e.name.toLowerCase()).join(" ");
    for (const w of ["taxes", "loans", "fees", "vacanc", "liquidity", "market", "inflation", "currency", "legal", "concentration"]) {
      expect(names).toContain(w);
    }
    for (const word of ["Taxes", "financing", "fees", "vacancies", "market"]) expect(EXCLUSIONS).toContain(word);
  });

  it("prints the allowed ranges from the real bounds", () => {
    const md = buildMethodologyMarkdown();
    expect(md).toContain(`${(BOUNDS.occupancy.max * 100).toFixed(0)}%`);
    expect(md).toContain("$3,000");
    expect(md).toContain("Engine accepts");
    expect(md).toContain("1 to 30 years");
  });

  it("prints the real preset changes", () => {
    const md = buildMethodologyMarkdown();
    expect(md).toContain(`−${Math.abs(SCENARIO_DELTAS.conservative.occupancy * 100).toFixed(1)} points`);
    expect(md).toContain("+$150");
  });

  it("worked example matches what the engine computes", () => {
    const p = PROPERTIES[0];
    const result = projectInvestment(toProjectionInputs(p, defaultAssumptions(p)));
    const lines = workedExample().lines.join("\n");
    expect(lines).toContain((result.rows[1].netCashFlow).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","));
    expect(lines).toContain((result.rows[10].totalProfit).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  });

  it("lists every sample property with its data status", () => {
    const md = buildMethodologyMarkdown();
    for (const p of PROPERTIES) expect(md).toContain(p.name);
    expect(md).toContain("Sample (invented)");
  });

  it("documents the current model version and explains every change", () => {
    expect(MODEL_CHANGELOG[0].version).toBe(MODEL_VERSION);
    expect(buildMethodologyMarkdown()).toContain(`Model version ${MODEL_VERSION}`);
    for (const c of MODEL_CHANGELOG) expect(c.changes.length).toBeGreaterThan(0);
  });
});

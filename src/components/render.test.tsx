import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { PROPERTIES } from "@/lib/data/properties";
import { compareScenarios, defaultAssumptions, toProjectionInputs } from "@/lib/finance/assumptions";
import { projectInvestment } from "@/lib/finance/projections";
import { ScenarioComparisonTable } from "./ScenarioComparisonTable";
import { ScenarioOverlayChart } from "./ScenarioOverlayChart";
import { ProjectionChart } from "./ProjectionChart";
import { AnnualProjectionTable } from "./AnnualProjectionTable";

const p = PROPERTIES[3]; // Creek Harbour Offices
const current = { ...defaultAssumptions(p), investment: 20_000 };

describe("component smoke renders", () => {
  it("renders the scenario comparison table with assumptions and results", () => {
    const html = renderToString(<ScenarioComparisonTable outcomes={compareScenarios(p, current)} reinvest={false} />);
    for (const text of ["Conservative", "Base case", "Optimistic", "Assumptions behind each scenario", "ROI if sold", "Capital calls"]) {
      expect(html).toContain(text);
    }
  });

  it("renders the overlay chart with an accessible summary", () => {
    const html = renderToString(<ScenarioOverlayChart outcomes={compareScenarios(p, current)} />);
    expect(html).toContain("Profit if sold after 10 years");
  });

  it("renders the projection chart and table from the same rows", () => {
    const { rows } = projectInvestment(toProjectionInputs(p, current));
    const chart = renderToString(<ProjectionChart rows={rows} mode="payout" />);
    expect(chart).toContain("ROI if sold at the end of each year (%)");
    expect(chart).toContain("Hypothetical projection from year 0 to year 10");
    const table = renderToString(<AnnualProjectionTable rows={rows} reinvest={false} />);
    expect((table.match(/<tr/g) ?? []).length).toBe(12); // header + years 0..10
  });
});

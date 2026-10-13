import { describe, expect, it } from "vitest";
import { PROPERTIES } from "@/lib/data/properties";
import { defaultAssumptions, toProjectionInputs } from "./assumptions";
import { projectInvestment } from "./projections";
import { buildChartData, buildTableRows, describeProjection } from "./presentation";

describe("chart and table consistency", () => {
  for (const mode of ["payout", "reinvest"] as const) {
    it(`chart data matches the annual table in ${mode} mode for every property`, () => {
      for (const p of PROPERTIES) {
        const a = { ...defaultAssumptions(p), distributionMode: mode };
        const { rows } = projectInvestment(toProjectionInputs(p, a));
        const chart = buildChartData(rows);
        const table = buildTableRows(rows);
        expect(chart).toHaveLength(11);
        expect(table).toHaveLength(11);
        chart.forEach((c, i) => {
          const t = table[i];
          expect(c.year).toBe(t.year);
          expect(c.capitalAppreciation).toBe(t.capitalAppreciation);
          expect(c.cumulativeCashDistributions).toBe(t.cumulativeCashDistributions);
          expect(c.cumulativeReinvested).toBe(t.cumulativeReinvested);
          expect(c.cumulativeCapitalCalls).toBe(rows[i].cumulativeCapitalCalls);
          expect(t.capitalCall).toBe(rows[i].capitalCall);
          expect(t.ownershipShare).toBe(rows[i].ownershipShare);
          expect(c.totalProfit).toBe(t.totalProfit);
          expect(c.totalRoi).toBe(t.totalRoi);
          expect(c.totalProfit).toBe(rows[i].totalProfit);
        });
      }
    });
  }

  it("describes the projection in words", () => {
    const p = PROPERTIES[0];
    const { rows } = projectInvestment(toProjectionInputs(p, defaultAssumptions(p)));
    const text = describeProjection(rows, "payout");
    expect(text).toContain("year 10");
    expect(text).toContain("paid to you in cash");
    expect(text).toMatch(/\$/);
    expect(text).not.toContain("AED");
  });
});

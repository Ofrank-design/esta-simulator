import { describe, expect, it } from "vitest";
import { InvalidInputError, projectInvestment } from "./projections";
import { validateInputs, type ProjectionInputs } from "./validation";

/** Clean baseline: 1M property, 10k invested (1% share), 10% yield, full occupancy, no costs, no growth. */
const base: ProjectionInputs = {
  years: 10,
  propertyValue: 1_000_000,
  investment: 10_000,
  grossYield: 0.1,
  occupancy: 1,
  opexRatio: 0,
  maintenance: 0,
  maintenanceMode: "fixed",
  inflation: 0,
  appreciation: 0,
  saleCostRate: 0,
  distributionMode: "payout",
};
const run = (o: Partial<ProjectionInputs> = {}) => projectInvestment({ ...base, ...o });

describe("projection basics", () => {
  it("produces years 0 through 10", () => {
    const { rows } = run();
    expect(rows).toHaveLength(11);
    expect(rows[0].year).toBe(0);
    expect(rows[10].year).toBe(10);
  });

  it("matches the brief's first-year cash flow for the default Marina Residence scenario", () => {
    const { rows } = run({
      propertyValue: 1_800_000, grossYield: 0.065, occupancy: 0.92, opexRatio: 0.25,
      maintenance: 1_200, maintenanceMode: "inflation-adjusted", inflation: 0.025,
      appreciation: 0.03, saleCostRate: 0.02,
    });
    expect(rows[1].netCashFlow).toBeCloseTo(79_530, 4);
  });
});

describe("appreciation", () => {
  it("compounds property value over ten years", () => {
    const { rows } = run({ propertyValue: 1_800_000, appreciation: 0.03 });
    expect(rows[10].propertyValue).toBeCloseTo(2_419_049.48, 1);
  });
  it("holds value flat at zero appreciation", () => {
    const { rows } = run();
    expect(rows.every((r) => r.propertyValue === 1_000_000)).toBe(true);
    expect(rows[10].capitalAppreciation).toBe(0);
  });
  it("handles negative appreciation", () => {
    const { rows } = run({ appreciation: -0.05 });
    expect(rows[1].propertyValue).toBeCloseTo(950_000, 6);
    expect(rows[10].propertyValue).toBeCloseTo(598_736.94, 1);
    expect(rows[10].capitalAppreciation).toBeLessThan(0);
  });
});

describe("occupancy", () => {
  it("scales collected rent at 0%, 50% and 100%", () => {
    expect(run({ occupancy: 0 }).rows[1].collectedRent).toBe(0);
    expect(run({ occupancy: 0.5 }).rows[1].collectedRent).toBeCloseTo(50_000, 6);
    expect(run({ occupancy: 1 }).rows[1].collectedRent).toBeCloseTo(100_000, 6);
  });
  it("passes a shortfall to the investor at 0% occupancy", () => {
    const { rows } = run({ occupancy: 0, maintenance: 1_000 });
    expect(rows[1].netCashFlow).toBe(-1_000);
    expect(rows[1].distributionEarned).toBeCloseTo(-10, 8);
  });
});

describe("costs", () => {
  it("deducts operating expenses from collected rent", () => {
    const { rows } = run({ opexRatio: 0.25 });
    expect(rows[1].operatingExpenses).toBeCloseTo(25_000, 6);
    expect(rows[1].netCashFlow).toBeCloseTo(75_000, 6);
  });
  it("grows maintenance with inflation when inflation-adjusted", () => {
    const { rows } = run({ maintenance: 1_000, maintenanceMode: "inflation-adjusted", inflation: 0.05 });
    expect(rows[1].maintenance).toBeCloseTo(1_000, 8);
    expect(rows[3].maintenance).toBeCloseTo(1_102.5, 8);
  });
  it("keeps maintenance flat when fixed", () => {
    const { rows } = run({ maintenance: 1_000, maintenanceMode: "fixed", inflation: 0.05 });
    expect(rows.slice(1).every((r) => r.maintenance === 1_000)).toBe(true);
  });
});

describe("ownership and returns", () => {
  it("derives ownership share as investment / property value", () => {
    const r = run({ propertyValue: 2_000_000, investment: 25_000 });
    expect(r.ownershipShare).toBeCloseTo(0.0125, 10);
    expect(r.rows[10].ownershipShare).toBeCloseTo(0.0125, 10);
  });
  it("computes cash-on-cash from the investor's distribution", () => {
    const { rows } = run({ opexRatio: 0.25 });
    expect(rows[1].distributionEarned).toBeCloseTo(750, 8);
    expect(rows[1].cashOnCashReturn).toBeCloseTo(0.075, 10);
  });
  it("defines total ROI as profit on invested capital, after sale costs", () => {
    const { rows } = run();
    expect(rows[10].cumulativeCashDistributions).toBeCloseTo(10_000, 6);
    expect(rows[10].totalEconomicValue).toBeCloseTo(20_000, 6);
    expect(rows[10].totalRoi).toBeCloseTo(1, 10);
    expect(run({ saleCostRate: 0.02 }).rows[10].totalRoi).toBeCloseTo(0.98, 10);
  });
});

describe("inflation adjustment", () => {
  it("expresses invested capital in today's purchasing power", () => {
    expect(run({ inflation: 0.025 }).summary.realInvestedCapital).toBeCloseTo(7_811.98, 1);
  });
  it("leaves real value equal to nominal at zero inflation", () => {
    const { rows } = run();
    expect(rows[10].realTotalEconomicValue).toBe(rows[10].totalEconomicValue);
  });
});

describe("payout versus reinvestment", () => {
  it("compounds reinvested distributions without paying them as cash", () => {
    const { rows } = run({ distributionMode: "reinvest" });
    expect(rows[10].cumulativeCashDistributions).toBe(0);
    expect(rows[10].holdingValue).toBeCloseTo(25_937.42, 1);
    expect(rows[10].totalEconomicValue).toBeCloseTo(25_937.42, 1);
  });
  it("never counts a distribution twice (profit = appreciation + distributions earned)", () => {
    for (const distributionMode of ["payout", "reinvest"] as const) {
      const { rows } = run({ distributionMode, appreciation: 0.03, opexRatio: 0.2, maintenance: 500 });
      for (const r of rows) {
        expect(r.totalProfit).toBeCloseTo(r.capitalAppreciation + r.cumulativeDistributionsEarned, 6);
      }
    }
  });
});

describe("stability and validation", () => {
  it("returns finite values for zero investment", () => {
    const { rows, ownershipShare } = run({ investment: 0 });
    expect(ownershipShare).toBe(0);
    for (const r of rows) for (const v of Object.values(r)) expect(Number.isFinite(v)).toBe(true);
    expect(rows[10].totalRoi).toBe(0);
    expect(rows[10].cashOnCashReturn).toBe(0);
  });
  it("stays finite with zero yield, occupancy, maintenance, inflation", () => {
    const { rows } = run({ grossYield: 0, occupancy: 0 });
    for (const r of rows) for (const v of Object.values(r)) expect(Number.isFinite(v)).toBe(true);
  });
  it("rejects invalid inputs", () => {
    expect(validateInputs({ ...base, occupancy: 1.2 }).ok).toBe(false);
    expect(validateInputs({ ...base, propertyValue: 0 }).ok).toBe(false);
    expect(validateInputs({ ...base, occupancy: Number.NaN }).ok).toBe(false);
    expect(validateInputs({ ...base, investment: 2_000_000 }).ok).toBe(false);
    expect(validateInputs({ ...base, appreciation: -0.5 }).ok).toBe(false);
    expect(() => run({ occupancy: -1 })).toThrow(InvalidInputError);
  });
});

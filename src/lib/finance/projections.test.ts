import { describe, expect, it } from "vitest";
import { InvalidInputError, MODEL_VERSION, projectInvestment } from "./projections";
import { validateInputs, type ProjectionInputs } from "./validation";
import type { ProjectionRow } from "./types";

/** Clean baseline: 1M property, 10k invested (1% share), 10% yield, full occupancy, no costs, no growth. */
const base: ProjectionInputs = {
  years: 10, propertyValue: 1_000_000, investment: 10_000, grossYield: 0.1, occupancy: 1,
  opexRatio: 0, maintenance: 0, maintenanceMode: "fixed", inflation: 0, appreciation: 0,
  saleCostRate: 0, distributionMode: "payout",
};
const run = (o: Partial<ProjectionInputs> = {}) => projectInvestment({ ...base, ...o });
const allFinite = (rows: readonly ProjectionRow[]) =>
  rows.every((r) => Object.values(r).every((v) => Number.isFinite(v)));

describe("projection basics", () => {
  it("produces years 0 through N and a model version", () => {
    const { rows } = run();
    expect(rows).toHaveLength(11);
    expect(rows[0].year).toBe(0);
    expect(rows[10].year).toBe(10);
    expect(MODEL_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("matches the brief's first-year cash flow for the default Marina scenario shape", () => {
    const { rows } = run({
      propertyValue: 1_800_000, grossYield: 0.065, occupancy: 0.92, opexRatio: 0.25,
      maintenance: 1_200, maintenanceMode: "inflation-adjusted", inflation: 0.025,
      appreciation: 0.03, saleCostRate: 0.02,
    });
    expect(rows[1].netCashFlow).toBeCloseTo(79_530, 4);
  });

  it("is deterministic for identical inputs", () => {
    expect(run({ appreciation: 0.03, opexRatio: 0.2 })).toEqual(run({ appreciation: 0.03, opexRatio: 0.2 }));
  });
});

describe("appreciation", () => {
  it("compounds property value over ten years", () => {
    expect(run({ propertyValue: 1_800_000, appreciation: 0.03 }).rows[10].propertyValue).toBeCloseTo(2_419_049.48, 1);
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

describe("occupancy and costs", () => {
  it("scales collected rent at 0%, 50% and 100%", () => {
    expect(run({ occupancy: 0 }).rows[1].collectedRent).toBe(0);
    expect(run({ occupancy: 0.5 }).rows[1].collectedRent).toBeCloseTo(50_000, 6);
    expect(run({ occupancy: 1 }).rows[1].collectedRent).toBeCloseTo(100_000, 6);
  });
  it("deducts operating expenses from collected rent", () => {
    const { rows } = run({ opexRatio: 0.25 });
    expect(rows[1].operatingExpenses).toBeCloseTo(25_000, 6);
    expect(rows[1].netCashFlow).toBeCloseTo(75_000, 6);
  });
  it("grows maintenance with inflation when inflation-adjusted, and keeps it flat when fixed", () => {
    const adj = run({ maintenance: 1_000, maintenanceMode: "inflation-adjusted", inflation: 0.05 }).rows;
    expect(adj[1].maintenance).toBeCloseTo(1_000, 8);
    expect(adj[3].maintenance).toBeCloseTo(1_102.5, 8);
    const fixed = run({ maintenance: 1_000, maintenanceMode: "fixed", inflation: 0.05 }).rows;
    expect(fixed.slice(1).every((r) => r.maintenance === 1_000)).toBe(true);
  });
});

describe("ownership share", () => {
  it("is investment / property value and stays constant in payout mode", () => {
    const r = run({ propertyValue: 2_000_000, investment: 25_000 });
    expect(r.ownershipShare).toBeCloseTo(0.0125, 10);
    expect(r.rows.every((row) => row.ownershipShare === r.rows[0].ownershipShare)).toBe(true);
    expect(r.summary.initialOwnership).toBe(r.summary.endingOwnership);
  });
  it("reports ending ownership from the engine's final row", () => {
    const r = run({ distributionMode: "reinvest" });
    expect(r.summary.endingOwnership).toBe(r.rows[10].ownershipShare);
    expect(r.summary.endingOwnership).toBeGreaterThan(r.summary.initialOwnership);
  });
});

describe("positive cash flow: payout and reinvest", () => {
  it("pays distributions as cash in payout mode", () => {
    const { rows } = run({ opexRatio: 0.25 });
    expect(rows[1].distributionEarned).toBeCloseTo(750, 8);
    expect(rows[1].cashDistribution).toBeCloseTo(750, 8);
    expect(rows[1].reinvestedDistribution).toBe(0);
    expect(rows[1].cashOnCashReturn).toBeCloseTo(0.075, 10);
  });
  it("reinvests instead of paying cash, and compounds", () => {
    const { rows } = run({ distributionMode: "reinvest" });
    expect(rows[1].cashDistribution).toBe(0);
    expect(rows[1].cashOnCashReturn).toBe(0);
    expect(rows[1].distributionYield).toBeCloseTo(0.1, 10);
    expect(rows[10].cumulativeCashDistributions).toBe(0);
    expect(rows[10].holdingValue).toBeCloseTo(25_937.42, 1);
    expect(rows[10].totalEconomicValue).toBeCloseTo(25_937.42, 1);
  });
});

describe("negative cash flow becomes a capital call", () => {
  const loss = { occupancy: 0, maintenance: 1_000 }; // property loses 1,000/yr; investor share is 1%

  it("records the investor's share as a capital call, not a negative payout", () => {
    const { rows } = run(loss);
    expect(rows[1].netCashFlow).toBe(-1_000);
    expect(rows[1].capitalCall).toBeCloseTo(10, 10);
    expect(rows[1].distributionEarned).toBe(0);
    expect(rows[1].cashDistribution).toBe(0);
    expect(rows.every((r) => r.cashDistribution >= 0 && r.distributionEarned >= 0)).toBe(true);
  });
  it("never reduces ownership units in reinvest mode", () => {
    const { rows, ownershipShare } = run({ ...loss, distributionMode: "reinvest" });
    expect(rows.every((r) => r.ownershipShare === ownershipShare)).toBe(true);
    expect(rows.every((r) => r.reinvestedDistribution === 0)).toBe(true);
  });
  it("adds each capital call to contributed capital exactly once", () => {
    const { rows } = run(loss);
    let running = 0;
    for (const r of rows.slice(1)) {
      running += r.capitalCall;
      expect(r.cumulativeCapitalCalls).toBeCloseTo(running, 10);
      expect(r.totalContributedCapital).toBeCloseTo(10_000 + running, 10);
    }
    expect(rows[10].totalContributedCapital).toBeCloseTo(10_100, 8);
  });
  it("reconciles profit and ROI to the documented formula", () => {
    const { rows } = run(loss);
    const last = rows[10];
    // holding 10,000 (no growth), no cash paid, contributed 10,100
    expect(last.totalProfit).toBeCloseTo(-100, 8);
    expect(last.totalRoi).toBeCloseTo(-100 / 10_100, 10);
  });
  it("starts calling capital only when cash flow turns negative, and uses the larger denominator after", () => {
    // 100k rent, maintenance 90k growing 10%/yr: positive in years 1-2, negative from year 3
    const { rows } = run({ maintenance: 90_000, maintenanceMode: "inflation-adjusted", inflation: 0.1 });
    expect(rows[2].capitalCall).toBe(0);
    expect(rows[2].distributionYield).toBeCloseTo(10 / 10_000, 10);
    expect(rows[3].capitalCall).toBeCloseTo(89, 6);
    expect(rows[4].totalContributedCapital).toBeCloseTo(10_000 + 89 + 197.9, 4);
    expect(rows[4].cashOnCashReturn).toBe(0);
  });
  it("keeps capital appreciation separate from contributed capital", () => {
    const { rows } = run({ ...loss, appreciation: 0.03 });
    expect(rows[10].capitalAppreciation).toBeCloseTo(rows[10].holdingValue - 10_000, 8);
  });
});

describe("ownership cap", () => {
  const stress = { years: 30, propertyValue: 1_000_000, investment: 500_000, grossYield: 0.2, occupancy: 1, distributionMode: "reinvest" as const };

  it("stops reinvesting at 100% and pays the excess as cash, counted once", () => {
    const { rows } = run(stress);
    expect(rows[3].ownershipShare).toBeCloseTo(0.864, 10);
    expect(rows[4].ownershipShare).toBe(1);
    expect(rows[4].reinvestedDistribution).toBeCloseTo(136_000, 6);
    expect(rows[4].excessCashDistribution).toBeCloseTo(36_800, 6);
    expect(rows[4].cashDistribution).toBeCloseTo(36_800, 6);
    for (const r of rows.slice(5)) {
      expect(r.reinvestedDistribution).toBe(0);
      expect(r.excessCashDistribution).toBeCloseTo(r.distributionEarned, 6);
      expect(r.holdingValue).toBeCloseTo(1_000_000, 6);
    }
    const last = rows[30];
    expect(last.cumulativeDistributionsEarned).toBeCloseTo(last.cumulativeCashDistributions + last.cumulativeReinvested, 4);
  });
  it("never exceeds 100% or goes below 0 across a long, high-yield, low-growth stress case", () => {
    const { rows } = run({ ...stress, appreciation: 0, saleCostRate: 0.02 });
    expect(rows.every((r) => r.ownershipShare <= 1 && r.ownershipShare >= 0)).toBe(true);
    expect(allFinite(rows)).toBe(true);
  });
  it("starts at the cap when the whole property is bought", () => {
    const { rows } = run({ investment: 1_000_000, distributionMode: "reinvest" });
    expect(rows.every((r) => r.ownershipShare === 1 && r.reinvestedDistribution === 0)).toBe(true);
    expect(rows[1].cashDistribution).toBeCloseTo(100_000, 6);
  });
});

describe("profit, ROI and year zero", () => {
  it("sets year 0 ROI and profit to zero (no holding period has elapsed)", () => {
    const r = run({ saleCostRate: 0.05 });
    expect(r.rows[0].totalRoi).toBe(0);
    expect(r.rows[0].totalProfit).toBe(0);
    expect(r.rows[0].saleCosts).toBe(0);
  });
  it("applies sale costs to every hypothetical exit from year 1", () => {
    const { rows } = run({ saleCostRate: 0.02 });
    expect(rows[1].saleCosts).toBeCloseTo(200, 8);
    expect(rows[10].saleCosts).toBeCloseTo(200, 8);
    expect(rows[10].netSaleProceeds).toBeCloseTo(9_800, 8);
  });
  it("defines total ROI as profit on contributed capital, after sale costs", () => {
    expect(run().rows[10].totalProfit).toBeCloseTo(10_000, 6);
    expect(run().rows[10].totalRoi).toBeCloseTo(1, 10);
    expect(run({ saleCostRate: 0.02 }).rows[10].totalRoi).toBeCloseTo(0.98, 10);
  });
  it("reconciles: profit = appreciation + distributions earned - capital calls - sale costs", () => {
    const cases: Partial<ProjectionInputs>[] = [
      {}, { saleCostRate: 0.03, appreciation: 0.04, opexRatio: 0.3 },
      { distributionMode: "reinvest", saleCostRate: 0.02, appreciation: -0.02 },
      { occupancy: 0.1, maintenance: 20_000, maintenanceMode: "inflation-adjusted", inflation: 0.05, saleCostRate: 0.02 },
      { occupancy: 0.1, maintenance: 20_000, distributionMode: "reinvest", appreciation: 0.03 },
      { investment: 900_000, distributionMode: "reinvest", grossYield: 0.15, years: 30, saleCostRate: 0.02 },
    ];
    for (const c of cases) {
      for (const r of run(c).rows) {
        expect(r.totalProfit).toBeCloseTo(
          r.capitalAppreciation + r.cumulativeDistributionsEarned - r.cumulativeCapitalCalls - r.saleCosts, 5);
      }
    }
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

describe("bounds, stability and validation", () => {
  it("returns finite values for zero investment, with no capital calls and zero ROI", () => {
    const { rows, ownershipShare } = run({ investment: 0, occupancy: 0, maintenance: 500 });
    expect(ownershipShare).toBe(0);
    expect(allFinite(rows)).toBe(true);
    expect(rows[10].totalRoi).toBe(0);
    expect(rows[10].capitalCall).toBe(0);
  });
  it("handles the smallest realistic investment", () => {
    const { rows } = run({ investment: 1, propertyValue: 5_000_000 });
    expect(allFinite(rows)).toBe(true);
    expect(rows[10].ownershipShare).toBeGreaterThan(0);
  });
  it("stays finite, in range and reconciled across the whole input envelope", () => {
    let checked = 0;
    for (const investment of [0, 1_000, 1_000_000])
      for (const grossYield of [0, 0.2])
        for (const occupancy of [0, 1])
          for (const opexRatio of [0, 1])
            for (const maintenance of [0, 250_000])
              for (const appreciation of [-0.1, 0.2])
                for (const inflation of [0, 0.2])
                  for (const saleCostRate of [0, 0.2])
                    for (const distributionMode of ["payout", "reinvest"] as const)
                      for (const years of [1, 30]) {
                        const { rows } = run({ investment, grossYield, occupancy, opexRatio, maintenance, appreciation, inflation, saleCostRate, distributionMode, years, maintenanceMode: "inflation-adjusted" });
                        expect(allFinite(rows)).toBe(true);
                        for (const r of rows) {
                          expect(r.ownershipShare).toBeGreaterThanOrEqual(0);
                          expect(r.ownershipShare).toBeLessThanOrEqual(1);
                          expect(r.cashDistribution).toBeGreaterThanOrEqual(0);
                          expect(r.capitalCall).toBeGreaterThanOrEqual(0);
                          expect(r.distributionEarned).toBeGreaterThanOrEqual(0);
                          expect(r.totalProfit).toBeCloseTo(
                            r.capitalAppreciation + r.cumulativeDistributionsEarned - r.cumulativeCapitalCalls - r.saleCosts,
                            3);
                        }
                        checked++;
                      }
    expect(checked).toBe(3 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2 * 2);
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

describe("net cash yield versus gross yield", () => {
  it("equals property income after costs divided by property value, and sits below gross yield", () => {
    const { rows } = run({ grossYield: 0.065, occupancy: 0.92, opexRatio: 0.25, maintenance: 1_200, propertyValue: 1_800_000 });
    expect(rows[1].netCashYield).toBeCloseTo(rows[1].netCashFlow / 1_800_000, 12);
    expect(rows[1].netCashYield).toBeLessThan(0.065);
    expect(rows[1].netCashYield).toBeCloseTo(0.044183, 5);
  });
  it("equals gross yield only when there are no empty periods and no costs", () => {
    expect(run().rows[1].netCashYield).toBeCloseTo(0.1, 12);
  });
  it("is negative when the property doesn't cover its costs, and is the same in payout and reinvest mode", () => {
    const loss = run({ occupancy: 0, maintenance: 1_000 }).rows[1];
    expect(loss.netCashYield).toBeLessThan(0);
    expect(run({ distributionMode: "reinvest" }).rows[1].netCashYield).toBe(run().rows[1].netCashYield);
  });
});

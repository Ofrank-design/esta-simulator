import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { PROPERTIES } from "@/lib/data/properties";
import { defaultAssumptions, toProjectionInputs } from "@/lib/finance/assumptions";
import { projectInvestment } from "@/lib/finance/projections";
import { buildCompareHref } from "@/lib/compare/params";
import { encodeAssumptions } from "@/lib/simulator/params";
import { formatPercent, formatUsd } from "@/lib/format";

/** The session kit quotes model outputs and links. These checks fail if the model changes and the kit doesn't. */
const read = (f: string) => fs.readFileSync(path.resolve(import.meta.dirname, "../../../docs/validation", f), "utf8");
const p = PROPERTIES[0];
const d = defaultAssumptions(p);
const run = (a: typeof d) => projectInvestment(toProjectionInputs(p, a));

describe("validation kit stays in step with the model", () => {
  const links = read("scenario-links.md");
  const comp = read("03-comprehension-check.md");

  it("quotes the right year 1 numbers", () => {
    const base = run(d).rows[1];
    const o75 = run({ ...d, occupancy: 0.75 }).rows[1];
    const o70 = run({ ...d, occupancy: 0.7 }).rows[1];
    expect(links).toContain(formatUsd(base.netCashFlow));
    expect(links).toContain(formatPercent(base.netCashYield, 2));
    expect(links).toContain(formatUsd(o75.netCashFlow));
    expect(links).toContain(formatPercent(o75.netCashYield, 2));
    expect(links).toContain(`down ${((1 - o75.netCashFlow / base.netCashFlow) * 100).toFixed(1)}%`);
    expect(links).toContain(formatUsd(o70.netCashFlow));
    expect(comp).toContain(`${formatUsd(base.netCashFlow)} to ${formatUsd(o70.netCashFlow)}`);
    expect(comp).toContain(`down ${Math.round((1 - o70.netCashFlow / base.netCashFlow) * 100)}%`);
    expect(comp).toContain(formatPercent(base.netCashYield, 2));
  });

  it("quotes the right reinvestment ownership numbers", () => {
    const re = run({ ...d, distributionMode: "reinvest" }).summary;
    expect(links).toContain(formatPercent(re.initialOwnership, 4));
    expect(links).toContain(formatPercent(re.endingOwnership, 4));
  });

  it("uses links that the app would actually produce", () => {
    const five = { ...d, investment: 5_000 };
    expect(links).toContain(`/simulator/marina-residence?${encodeAssumptions(five, p)}`);
    expect(links).toContain(`/simulator/marina-residence?${encodeAssumptions({ ...five, occupancy: 0.75 }, p)}`);
    expect(links).toContain(buildCompareHref(p, { ...five, occupancy: 0.75 }));
    expect(links).toContain(`/simulator/marina-residence?${encodeAssumptions({ ...five, distributionMode: "reinvest" }, p)}`);
  });

  it("asks about every concept the roadmap names", () => {
    for (const col of ["comp_occupancy", "comp_opex", "comp_gross_vs_net", "comp_appreciation", "comp_inflation", "comp_reinvest"]) expect(comp).toContain(col);
  });
});

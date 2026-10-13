import { describe, expect, it } from "vitest";
import { formatPercent, formatPlainNumber, formatSignedPercent, formatUsd, formatUsdCompact } from "./format";

describe("USD formatting", () => {
  it("formats whole dollars with a dollar sign and thousands separators", () => {
    expect(formatUsd(490_000)).toBe("$490,000");
    expect(formatUsd(1_525_000)).toBe("$1,525,000");
    expect(formatUsd(7_811.98)).toBe("$7,812");
  });
  it("handles zero, small and very large values", () => {
    expect(formatUsd(0)).toBe("$0");
    expect(formatUsd(1)).toBe("$1");
    expect(formatUsd(987_654_321)).toBe("$987,654,321");
  });
  it("shows negatives with a real minus sign and never shows -$0", () => {
    expect(formatUsd(-1_200)).toBe("\u2212$1,200");
    expect(formatUsd(-0.2)).toBe("$0");
    expect(formatUsd(-0)).toBe("$0");
    expect(formatUsd(-0.5)).toBe("\u2212$1");
  });
  it("rounds half away from zero to whole dollars", () => {
    expect(formatUsd(2.5)).toBe("$3");
    expect(formatUsd(2.49)).toBe("$2");
    expect(formatUsd(-2.5)).toBe("\u2212$3");
  });
  it("never leaks AED or other currency labels", () => {
    for (const v of [0, 1, 12_345, -9_999, 4_500_000]) {
      expect(formatUsd(v)).not.toMatch(/AED|د\.إ/);
      expect(formatUsd(v)).toMatch(/\$/);
    }
  });
  it("falls back to a dash for non-finite values", () => {
    expect(formatUsd(Number.NaN)).toBe("\u2014");
    expect(formatUsdCompact(Number.POSITIVE_INFINITY)).toBe("\u2014");
  });
  it("formats compact amounts", () => {
    expect(formatUsdCompact(490_000)).toBe("$490k");
    expect(formatUsdCompact(1_525_000)).toBe("$1.5M");
    expect(formatUsdCompact(2_000_000)).toBe("$2M");
    expect(formatUsdCompact(300)).toBe("$300");
    expect(formatUsdCompact(-250_000)).toBe("\u2212$250k");
  });
  it("keeps percentages separate from currency", () => {
    expect(formatPercent(0.065)).toBe("6.5%");
    expect(formatPercent(0.065)).not.toContain("$");
    expect(formatSignedPercent(0.824)).toBe("+82.4%");
    expect(formatSignedPercent(-0.1)).toBe("\u22120.1%".replace("0.1", "10.0"));
    expect(formatSignedPercent(0)).toBe("0.0%");
  });
  it("writes plain numbers for CSV files", () => {
    expect(formatPlainNumber(1234.5678)).toBe("1234.57");
    expect(formatPlainNumber(-0.001)).toBe("0.00");
    expect(formatPlainNumber(Number.NaN)).toBe("");
  });
});

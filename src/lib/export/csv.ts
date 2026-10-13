import type { Property } from "@/types/property";
import { ASSET_TYPE_LABELS } from "@/types/property";
import { defaultAssumptions, type Assumptions } from "@/lib/finance/assumptions";
import { MODEL_VERSION, projectInvestment } from "@/lib/finance/projections";
import { toProjectionInputs } from "@/lib/finance/assumptions";
import { EXCLUSIONS, ILLUSTRATIVE_NOTE } from "@/lib/finance/definitions";
import { formatPlainNumber } from "@/lib/format";

/** Quotes a field when needed and neutralises spreadsheet formulas (=, +, -, @). */
export function csvField(value: string | number): string {
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s) && typeof value === "string") s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function scenarioFileName(property: Property, ext: string): string {
  return `esta-${property.id}-scenario.${ext}`;
}

const HEADERS = [
  "Year", "Property value (USD)", "Gross potential rent (USD)", "Rent collected (USD)", "Operating expenses (USD)",
  "Maintenance (USD)", "Property income after costs (USD)", "Distribution generated for you (USD)",
  "Cash distribution paid to you (USD)", "Reinvested distribution (USD)", "Paid as cash at 100% ownership (USD)",
  "Capital call (USD)", "Ownership share at year end (%)", "Value of your share (USD)", "Property appreciation (USD)",
  "Cumulative cash distributions (USD)", "Cumulative reinvested (USD)", "Cumulative capital calls (USD)",
  "Total contributed (USD)", "Total value before sale costs (USD)", "Sale costs if sold (USD)",
  "Profit if sold (USD)", "ROI if sold (%)", "Total value in today's money (USD)",
];

/** Everything in the file comes from the same projection rows the screen shows. Money is rounded to cents. */
export function buildScenarioCsv(property: Property, a: Assumptions, generatedAt: Date): string {
  const result = projectInvestment(toProjectionInputs(property, a));
  const d = defaultAssumptions(property);
  const n = (v: number) => formatPlainNumber(v, 2);
  const pct = (v: number, digits = 4) => formatPlainNumber(v * 100, digits);
  const meta: [string, string][] = [
    ["ESTA Simulator scenario export", ""],
    ["Illustrative data", ILLUSTRATIVE_NOTE],
    ["Not modelled", EXCLUSIONS],
    ["Currency", "US dollars (USD). Percent columns are percentages."],
    ["Model version", MODEL_VERSION],
    ["Generated", generatedAt.toISOString()],
    ["Property", `${property.name}, ${property.city} (${ASSET_TYPE_LABELS[property.assetType]}, mock data)`],
    ["Property value (USD)", n(property.propertyValueUsd)],
    ["Horizon (years)", String(result.inputs.years)],
    ["Starting investment (USD)", `${n(a.investment)} (property default ${n(d.investment)})`],
    ["Inflation (%)", `${pct(a.inflation, 2)} (property default ${pct(d.inflation, 2)})`],
    ["Occupancy (%)", `${pct(a.occupancy, 2)} (property default ${pct(d.occupancy, 2)})`],
    ["Maintenance per year (USD)", `${n(a.maintenance)} (property default ${n(d.maintenance)})`],
    ["Maintenance over time", a.maintenanceMode === "fixed" ? "Fixed" : "Rises with inflation"],
    ["Gross yield (%)", `${pct(a.grossYield, 2)} (property default ${pct(d.grossYield, 2)})`],
    ["Property appreciation (%)", `${pct(a.appreciation, 2)} (property default ${pct(d.appreciation, 2)})`],
    ["Operating expenses (% of rent)", `${pct(a.opexRatio, 2)} (property default ${pct(d.opexRatio, 2)})`],
    ["Sale costs (%)", pct(a.saleCostRate, 2)],
    ["Distributions", a.distributionMode === "payout" ? "Paid out as cash" : "Reinvested"],
  ];
  const lines = meta.map(([k, v]) => `# ${csvField(v ? `${k}: ${v}` : k)}`);
  lines.push("", HEADERS.map(csvField).join(","));
  for (const r of result.rows) {
    lines.push(
      [
        r.year, n(r.propertyValue), n(r.grossPotentialRent), n(r.collectedRent), n(r.operatingExpenses),
        n(r.maintenance), n(r.netCashFlow), n(r.distributionEarned), n(r.cashDistribution),
        n(r.reinvestedDistribution), n(r.excessCashDistribution), n(r.capitalCall), pct(r.ownershipShare),
        n(r.holdingValue), n(r.capitalAppreciation), n(r.cumulativeCashDistributions), n(r.cumulativeReinvested),
        n(r.cumulativeCapitalCalls), n(r.totalContributedCapital), n(r.totalEconomicValue), n(r.saleCosts),
        n(r.totalProfit), pct(r.totalRoi, 2), n(r.realTotalEconomicValue),
      ].map(csvField).join(","),
    );
  }
  return lines.join("\r\n") + "\r\n";
}

/** Client only. */
export function downloadTextFile(filename: string, text: string, mime = "text/csv;charset=utf-8"): void {
  const blob = new Blob(["\uFEFF" + text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

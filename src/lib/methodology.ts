/**
 * The single source for the methodology page (/methodology) and MODEL_METHODOLOGY.md.
 * Wording comes from definitions.ts, numbers come from bounds.ts, validation.ts, assumptions.ts and the
 * dataset, and the worked example is computed by the real engine. Nothing is typed in twice.
 * After editing, run `npm run docs:methodology` to regenerate MODEL_METHODOLOGY.md (a test checks it).
 */
import { BOUNDS, DEFAULT_INVESTMENT, INVESTMENT_MAX, INVESTMENT_STEP } from "@/lib/finance/bounds";
import { ENGINE_LIMITS } from "@/lib/finance/validation";
import { SCENARIO_DELTAS, SCENARIO_KEYS, SCENARIO_LABELS, defaultAssumptions, toProjectionInputs } from "@/lib/finance/assumptions";
import { DEFINITIONS, EXCLUSIONS_DETAIL, ILLUSTRATIVE_NOTE, TIMING_NOTE } from "@/lib/finance/definitions";
import { MODEL_VERSION, projectInvestment } from "@/lib/finance/projections";
import { PROPERTIES } from "@/lib/data/properties";
import { STALE_AFTER_DAYS, STATUS_LABELS } from "@/lib/data/provenance";
import { formatPercent, formatSignedPercent, formatUsd } from "@/lib/format";

export type Block =
  | { t: "p"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "formula"; lines: string[] }
  | { t: "dl"; items: { term: string; text: string }[] }
  | { t: "table"; caption: string; head: string[]; rows: string[][] };

export interface MethodSection {
  id: string;
  title: string;
  blocks: Block[];
}

export const MODEL_CHANGELOG: { version: string; date: string; changes: string[] }[] = [
  {
    version: "1.2.0",
    date: "2026-10-13",
    changes: [
      "Added net cash yield, so the yield you choose (gross) is never confused with what is left after costs.",
      "Added this methodology, and made the page, the report and the CSV use the same definitions.",
    ],
  },
  {
    version: "1.1.0",
    date: "2026-10-13",
    changes: [
      "Negative property income is now a capital call (extra money you contribute). Before, it was treated as a negative reinvestment, which quietly reduced ownership.",
      "Ownership is capped at 100%. Before, reinvestment could push it past 100%. Income that can't be reinvested is now paid as cash.",
      "ROI now divides by total contributed (starting investment plus capital calls) and profit subtracts capital calls. Before, it divided by the starting investment only.",
      "Year 0 ROI is 0%. Before, it showed the cost of an immediate sale, which looked like a loss on day one.",
      "Reinvest mode no longer calls a reinvested amount 'cash'. Cash-on-cash counts only cash actually paid.",
      "All amounts are in US dollars. The sample values were converted once from AED at the fixed 3.6725 peg.",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-10-12",
    changes: ["First version of the model, with amounts in AED."],
  },
];

const usd2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money2 = (v: number) => usd2.format(v);
const pctStr = (fraction: number, digits = 1) => formatPercent(fraction, digits);
const range = (min: number, max: number, digits = 0) => `${pctStr(min, digits)} to ${pctStr(max, digits)}`;
const step = (fraction: number) => `${(fraction * 100).toFixed(fraction * 100 < 1 ? 1 : 0).replace(/\.0$/, "")} point${fraction * 100 === 1 ? "" : "s"}`;

/** A real calculation, done by the real engine, so the example can't drift from the model. */
export function workedExample(): { title: string; lines: string[] } {
  const property = PROPERTIES[0];
  const a = defaultAssumptions(property);
  const result = projectInvestment(toProjectionInputs(property, a));
  const y1 = result.rows[1];
  const y10 = result.rows[result.rows.length - 1];
  const years = result.inputs.years;
  const share = result.ownershipShare;
  return {
    title: `${property.name}, using its starting assumptions and a ${formatUsd(a.investment)} investment, paid out as cash`,
    lines: [
      `Property value today                 ${money2(property.propertyValueUsd)}`,
      `Initial ownership share              ${money2(a.investment)} ÷ ${money2(property.propertyValueUsd)} = ${pctStr(share, 4)}`,
      "",
      `Year 1 gross rent                    ${money2(property.propertyValueUsd)} × ${pctStr(a.grossYield)} = ${money2(y1.grossPotentialRent)}`,
      `Rent collected                       ${money2(y1.grossPotentialRent)} × ${pctStr(a.occupancy, 0)} occupancy = ${money2(y1.collectedRent)}`,
      `Operating expenses                   ${money2(y1.collectedRent)} × ${pctStr(a.opexRatio, 0)} = ${money2(y1.operatingExpenses)}`,
      `Maintenance                          ${money2(y1.maintenance)}`,
      `Property income after costs          ${money2(y1.collectedRent)} − ${money2(y1.operatingExpenses)} − ${money2(y1.maintenance)} = ${money2(y1.netCashFlow)}`,
      "",
      `Your year 1 cash distribution        ${pctStr(share, 4)} × ${money2(y1.netCashFlow)} = ${money2(y1.cashDistribution)}`,
      `Net cash yield, year 1               ${money2(y1.cashDistribution)} ÷ ${money2(a.investment)} = ${pctStr(y1.netCashYield, 2)} (the gross yield input was ${pctStr(a.grossYield)})`,
      "",
      `Property value, end of year 1        ${money2(property.propertyValueUsd)} × (1 + ${pctStr(a.appreciation)}) = ${money2(y1.propertyValue)}`,
      `Value of your share, end of year 1   ${pctStr(share, 4)} × ${money2(y1.propertyValue)} = ${money2(y1.holdingValue)}`,
      "",
      `After ${years} years`,
      `Value of your share                  ${money2(y10.holdingValue)}`,
      `Cash distributions received          ${money2(y10.cumulativeCashDistributions)}`,
      `${`Sale costs at ${pctStr(a.saleCostRate)}`.padEnd(37)}${money2(y10.saleCosts)}`,
      `Profit if sold                       ${money2(y10.netSaleProceeds)} + ${money2(y10.cumulativeCashDistributions)} − ${money2(y10.totalContributedCapital)} = ${money2(y10.totalProfit)}`,
      `ROI if sold                          ${money2(y10.totalProfit)} ÷ ${money2(y10.totalContributedCapital)} = ${formatSignedPercent(y10.totalRoi)}`,
      `Value in today's money               ${money2(y10.realTotalEconomicValue)} (total value before sale costs, adjusted for ${pctStr(a.inflation)} inflation)`,
    ],
  };
}

export function methodologySections(): MethodSection[] {
  const example = workedExample();
  const d = SCENARIO_DELTAS;
  const pts = (v: number) => (v === 0 ? "0" : `${v > 0 ? "+" : "−"}${(Math.abs(v) * 100).toFixed(1)} points`);
  const usd = (v: number) => (v === 0 ? "0" : `${v > 0 ? "+" : "−"}$${Math.abs(v)}`);

  return [
    {
      id: "what-this-is",
      title: "What ESTA is and isn't",
      blocks: [
        { t: "p", text: "ESTA is a learning tool. It shows how a property investment could behave over time under assumptions that you choose. It doesn't predict what will happen, and the properties it uses are invented samples." },
        { t: "p", text: "The model is deterministic. The same assumptions always give the same results, there is no randomness, and nothing is pulled from a market. Every number on the site follows the rules on this page." },
        { t: "p", text: ILLUSTRATIVE_NOTE },
        { t: "p", text: "Amounts are in US dollars and rates are shown as percentages. \"Today's money\" means a dollar amount adjusted for inflation." },
      ],
    },
    {
      id: "timing",
      title: "When things happen in a year",
      blocks: [
        { t: "p", text: TIMING_NOTE },
        { t: "formula", lines: [
          "Value at the start of year t = starting value × (1 + appreciation)^(t − 1)",
          "Value at the end of year t   = starting value × (1 + appreciation)^t",
          "Rent for year t              = value at the start of year t × gross yield × occupancy",
        ] },
        { t: "ul", items: [
          "Year 0 is the day of purchase. No rent has been earned yet and no sale is modelled.",
          "Reinvested income buys ownership at the value at the end of the year.",
          "Where a sale is shown, it happens at the end of that year.",
        ] },
      ],
    },
    {
      id: "ownership",
      title: "Your ownership share",
      blocks: [
        { t: "formula", lines: ["Initial ownership share = starting investment ÷ property value"] },
        { t: "p", text: "This treats the property as one asset that can be split into equal slices at its full value, with no loan, no fees and no discount for being hard to sell. Real products rarely work this neatly." },
        { t: "ul", items: [
          "Ownership share stays between 0% and 100%.",
          "Ending ownership share is what you hold after the last year. It only changes when income is reinvested.",
        ] },
      ],
    },
    {
      id: "property-income",
      title: "The property's income",
      blocks: [
        { t: "formula", lines: [
          "Gross rent                  = property value at the start of the year × gross yield",
          "Rent collected              = gross rent × occupancy",
          "Operating expenses          = rent collected × operating expense share",
          "Maintenance                 = a fixed yearly amount, or that amount × (1 + inflation)^(t − 1) if it rises with inflation",
          "Property income after costs = rent collected − operating expenses − maintenance",
        ] },
        { t: "p", text: "This is for the whole property, before your share. It can be negative when costs are higher than the rent collected." },
      ],
    },
    {
      id: "your-share-of-income",
      title: "Your share of the income: paid out or reinvested",
      blocks: [
        { t: "formula", lines: ["Your distribution = ownership share you held during the year × property income after costs (when that is positive)"] },
        { t: "ul", items: [
          "Paid to you: the distribution arrives as cash and your ownership share doesn't change.",
          "Reinvested: the distribution buys more of the property at the value at the end of the year, so your ownership share grows.",
          "Ownership can't pass 100%. Once you own the whole property, anything that can't be reinvested is paid as cash. The annual table shows it as \"Paid as cash at 100% ownership\".",
          "Income is counted once. It is either paid as cash or reinvested, never both.",
        ] },
      ],
    },
    {
      id: "capital-calls",
      title: "When the property loses money: capital calls",
      blocks: [
        { t: "p", text: "If the property's income is negative, someone has to cover the shortfall. ESTA treats your share of it as a capital call: extra money you put in." },
        { t: "formula", lines: ["Capital call = ownership share you held during the year × the shortfall"] },
        { t: "ul", items: [
          "It is not a negative payout.",
          "It doesn't buy ownership and it never reduces the ownership you already have.",
          "It is added to total contributed once.",
          "In that year, cash distributions and reinvested distributions are zero.",
        ] },
      ],
    },
    {
      id: "value-and-appreciation",
      title: "The value of your share and appreciation",
      blocks: [
        { t: "formula", lines: [
          "Value of your share    = ownership share × property value at the end of the year",
          "Cost basis             = starting investment + reinvested distributions",
          "Property appreciation  = value of your share − cost basis",
        ] },
        { t: "p", text: "Capital calls aren't part of the cost basis because they don't buy ownership, so they never inflate or hide appreciation. Appreciation is not profit until the property is sold." },
      ],
    },
    {
      id: "sale-costs-and-roi",
      title: "Sale costs, profit and ROI",
      blocks: [
        { t: "formula", lines: [
          "Sale costs                  = value of your share × sale cost rate",
          "Sale proceeds               = value of your share − sale costs",
          "Total contributed           = starting investment + capital calls",
          "Profit if sold              = sale proceeds + cash distributions received − total contributed",
          "ROI if sold                 = profit if sold ÷ total contributed",
          "Total value before sale costs = value of your share + cash distributions received",
        ] },
        { t: "p", text: "Profit and ROI are shown as if you sold at the end of each year. Sale costs apply to every one of those hypothetical sales from year 1. Year 0 shows 0% because no time has passed." },
        { t: "p", text: "Total value before sale costs ignores sale costs and any capital calls, so use it to see size, not profit. Profit reconciles exactly: profit if sold = property appreciation + distributions earned − capital calls − sale costs. The tests check this for every row." },
      ],
    },
    {
      id: "yields",
      title: "Gross yield, net cash yield and cash-on-cash",
      blocks: [
        { t: "formula", lines: [
          "Net cash yield     = (distribution − capital call) ÷ total contributed at the start of the year",
          "Cash-on-cash yield = cash paid in the year ÷ total contributed at the start of the year",
        ] },
        { t: "p", text: "Gross rental yield is the input you choose. Net cash yield is what is left after empty periods, operating expenses and maintenance. It is lower than the gross yield unless occupancy is 100% and there are no costs." },
        { t: "p", text: "In reinvest mode cash-on-cash is zero, because nothing is paid as cash. Net cash yield still shows what the income is worth." },
      ],
    },
    {
      id: "inflation",
      title: "Inflation, and nominal versus today's money",
      blocks: [
        { t: "formula", lines: ["Value in today's money = value ÷ (1 + inflation)^t"] },
        { t: "p", text: "Nominal means the plain dollar amount, not adjusted for inflation. Profit, ROI and total value before sale costs are nominal. \"Total value in today's money\" is the inflation adjusted figure. Inflation also raises maintenance when you choose \"rises with inflation\"." },
      ],
    },
    {
      id: "terms",
      title: "Terms used on the site",
      blocks: [{ t: "dl", items: DEFINITIONS }],
    },
    {
      id: "worked-example",
      title: "A worked example",
      blocks: [
        { t: "p", text: `${example.title}. Amounts are shown to the cent so every line adds up.` },
        { t: "formula", lines: example.lines },
      ],
    },
    {
      id: "assumptions-and-ranges",
      title: "Assumptions and allowed ranges",
      blocks: [
        { t: "p", text: "Each assumption has a range on the sliders. The engine itself accepts a slightly wider range, which is what a shared link is checked against. A value outside the range is moved to the nearest allowed value and you are told." },
        {
          t: "table",
          caption: "Assumptions, slider ranges and engine limits",
          head: ["Assumption", "Slider range", "Slider step", "Engine accepts"],
          rows: [
            ["Starting investment", `The property's minimum to ${formatUsd(INVESTMENT_MAX)} (or the property value if lower)`, formatUsd(INVESTMENT_STEP), "$0 up to the property value"],
            ["Inflation", range(BOUNDS.inflation.min, BOUNDS.inflation.max), step(BOUNDS.inflation.step), range(ENGINE_LIMITS.inflation.min, ENGINE_LIMITS.inflation.max)],
            ["Occupancy", range(BOUNDS.occupancy.min, BOUNDS.occupancy.max), step(BOUNDS.occupancy.step), range(ENGINE_LIMITS.occupancy.min, ENGINE_LIMITS.occupancy.max)],
            ["Maintenance per year", `${formatUsd(BOUNDS.maintenance.min)} to ${formatUsd(BOUNDS.maintenance.max)}`, formatUsd(BOUNDS.maintenance.step), "$0 or more"],
            ["Gross rental yield", range(BOUNDS.grossYield.min, BOUNDS.grossYield.max), step(BOUNDS.grossYield.step), range(ENGINE_LIMITS.grossYield.min, ENGINE_LIMITS.grossYield.max)],
            ["Property appreciation", range(BOUNDS.appreciation.min, BOUNDS.appreciation.max), step(BOUNDS.appreciation.step), range(ENGINE_LIMITS.appreciation.min, ENGINE_LIMITS.appreciation.max)],
            ["Operating expenses (share of rent)", range(BOUNDS.opexRatio.min, BOUNDS.opexRatio.max), step(BOUNDS.opexRatio.step), range(ENGINE_LIMITS.opexRatio.min, ENGINE_LIMITS.opexRatio.max)],
            ["Sale costs", range(BOUNDS.saleCostRate.min, BOUNDS.saleCostRate.max, 1), step(BOUNDS.saleCostRate.step), range(ENGINE_LIMITS.saleCostRate.min, ENGINE_LIMITS.saleCostRate.max)],
            ["Projection length", "10 years", "Fixed", `${ENGINE_LIMITS.years.min} to ${ENGINE_LIMITS.years.max} years`],
          ],
        },
        { t: "p", text: `The default starting investment is ${formatUsd(DEFAULT_INVESTMENT)}, raised to the property's minimum if that is higher. Default sale costs are 2%. Maintenance rises with inflation and income is paid out as cash unless you choose otherwise.` },
      ],
    },
    {
      id: "presets",
      title: "What the presets change",
      blocks: [
        { t: "p", text: "Conservative and optimistic don't use hidden multipliers. Each adds the amounts below to your assumptions, then keeps the result inside the slider ranges. On the simulator, presets start from the property's own starting assumptions. On the compare page, they start from your current assumptions, and the base case is exactly what you set." },
        {
          t: "table",
          caption: "Changes each preset makes",
          head: ["Assumption", ...SCENARIO_KEYS.map((k) => SCENARIO_LABELS[k])],
          rows: [
            ["Gross rental yield", ...SCENARIO_KEYS.map((k) => pts(d[k].grossYield))],
            ["Occupancy", ...SCENARIO_KEYS.map((k) => pts(d[k].occupancy))],
            ["Operating expenses", ...SCENARIO_KEYS.map((k) => pts(d[k].opexRatio))],
            ["Property appreciation", ...SCENARIO_KEYS.map((k) => pts(d[k].appreciation))],
            ["Inflation", ...SCENARIO_KEYS.map((k) => pts(d[k].inflation))],
            ["Maintenance per year", ...SCENARIO_KEYS.map((k) => usd(d[k].maintenance))],
          ],
        },
      ],
    },
    {
      id: "not-modelled",
      title: "What isn't modelled",
      blocks: [
        { t: "p", text: "These costs and risks are left out. Real outcomes can be much better or much worse than the figures on this site." },
        { t: "ul", items: EXCLUSIONS_DETAIL.map((e) => `${e.name}: ${e.text}`) },
      ],
    },
    {
      id: "sample-data",
      title: "About the sample data",
      blocks: [
        { t: "p", text: "The six properties are invented. Their prices, yields and costs are assumptions, not market data, and none of them is a real listing or can be bought. Every record carries a data status, a source, a last verified date, and a mark on each input saying whether it is a sourced fact or an assumption." },
        {
          t: "table",
          caption: "Sample properties and their data status",
          head: ["Property", "Type", "Property value", "Data status", "Source", "Last verified"],
          rows: PROPERTIES.map((p) => [
            p.name,
            p.assetType.charAt(0).toUpperCase() + p.assetType.slice(1),
            formatUsd(p.propertyValueUsd),
            STATUS_LABELS[p.dataStatus],
            p.source.name,
            p.lastVerifiedAt ?? "Never",
          ]),
        },
        { t: "ul", items: [
          "A record can only be called verified if it has a source link, a verification date, at least one sourced field, and an approver on every change.",
          `A verified record that hasn't been re-checked within ${STALE_AFTER_DAYS} days is shown as out of date.`,
          "The original sample values were in AED. They were converted to US dollars once, at the fixed rate of 3.6725 AED to the dollar, then rounded. Percentages weren't changed, and there is no live exchange rate anywhere in the app.",
        ] },
      ],
    },
    {
      id: "version-history",
      title: "Model version and changes",
      blocks: [
        { t: "p", text: `Current model version: ${MODEL_VERSION}. The version changes whenever a formula or a definition changes, and every change is listed here with the reason.` },
        {
          t: "table",
          caption: "Model version history",
          head: ["Version", "Date", "What changed"],
          rows: MODEL_CHANGELOG.map((c) => [c.version, c.date, c.changes.join(" ")]),
        },
      ],
    },
  ];
}

function mdEscapeCell(s: string): string {
  return s.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

/** The text of MODEL_METHODOLOGY.md. */
export function buildMethodologyMarkdown(): string {
  const sections = methodologySections();
  const out: string[] = [
    "# ESTA Simulator: how the numbers are calculated",
    "",
    `Model version ${MODEL_VERSION}.`,
    "",
    "<!-- Generated from src/lib/methodology.ts. Edit that file, then run `npm run docs:methodology`. -->",
    "",
    "## Contents",
    "",
    ...sections.map((s, i) => `${i + 1}. [${s.title}](#${s.id})`),
    "",
  ];
  for (const s of sections) {
    out.push(`<a id="${s.id}"></a>`, "", `## ${s.title}`, "");
    for (const b of s.blocks) {
      if (b.t === "p") out.push(b.text, "");
      else if (b.t === "ul") out.push(...b.items.map((i) => `- ${i}`), "");
      else if (b.t === "formula") out.push("```text", ...b.lines, "```", "");
      else if (b.t === "dl") out.push(...b.items.map((i) => `- **${i.term}.** ${i.text}`), "");
      else {
        out.push(`*${b.caption}*`, "", `| ${b.head.map(mdEscapeCell).join(" | ")} |`, `| ${b.head.map(() => "---").join(" | ")} |`);
        out.push(...b.rows.map((r) => `| ${r.map(mdEscapeCell).join(" | ")} |`), "");
      }
    }
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

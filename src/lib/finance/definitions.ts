/**
 * The single source of wording for how ESTA calculates things. The on-page notes, the printed
 * report and the CSV all draw on this, so the definitions can't drift apart.
 */
export const TIMING_NOTE =
  "Rent in each year is earned on the property's value at the start of that year. The value changes at the end of the year.";

export const DEFINITIONS: { term: string; text: string }[] = [
  { term: "Ownership share", text: "Your starting investment divided by the property's value. Ending ownership is the share you hold after any reinvestment, and it can never go above 100%." },
  { term: "Property income after costs", text: "Rent collected (gross yield on the property's value, times occupancy), minus operating expenses and maintenance. This is for the whole property, before your share." },
  { term: "Distributions", text: "Your share of the property's income whenever that income is positive." },
  { term: "Cash distributions", text: "Distributions paid out to you as cash. In reinvest mode, cash is paid only for what is left over once you own 100%." },
  { term: "Reinvested distributions", text: "Distributions used to buy more of the property at the year end value. They are not new money from you." },
  { term: "Capital calls", text: "When the property's income doesn't cover its costs, your share of the shortfall counts as extra money you put in. It doesn't buy ownership, doesn't reduce what you own, and is never shown as a negative payout." },
  { term: "Total contributed", text: "Your starting investment plus any capital calls. This is the money that came from you." },
  { term: "Property appreciation", text: "The value of your share minus what bought it (starting investment plus reinvested distributions). It is not profit until the property is sold." },
  { term: "Total value before sale costs", text: "The value of your share plus every cash distribution you have received." },
  { term: "Profit if sold", text: "Sale proceeds after sale costs, plus cash distributions received, minus everything you contributed." },
  { term: "ROI if sold", text: "Profit if sold, divided by total contributed. It is a nominal figure, so it is not adjusted for inflation. Year 0 shows 0% because no time has passed, so no sale is modelled there." },
  { term: "Gross rental yield", text: "Yearly rent as a share of the property's value, before empty periods, running costs and maintenance. It is an input you choose, so it is always higher than what reaches your pocket." },
  { term: "Net cash yield", text: "What the property's income is worth as a yearly return on the money you put in, after empty periods, operating expenses and maintenance. It is the gross rental yield you would see once the costs are paid, and it can be negative." },
  { term: "Cash-on-cash yield", text: "Cash distributions in a year divided by the money you had contributed at the start of that year. It counts only cash actually paid." },
  { term: "Inflation adjusted value", text: "Total value before sale costs, divided by (1 + inflation) for each year, so it reads in today's money." },
];

export const EXCLUSIONS =
  "Taxes, loans or financing, platform or management fees, uneven vacancies and tenant turnover, changes in market conditions, how long a sale takes, and whether a buyer would pay the modelled price.";

export const ILLUSTRATIVE_NOTE =
  "All properties and numbers in ESTA are illustrative. They are not live listings, verified prices or market quotes, and none of them can be bought here. Results are hypothetical, come from a simple fixed model, and are not a forecast, a recommendation, or investment, legal or tax advice. Figures are in US dollars.";

/** The full list behind the short EXCLUSIONS sentence, with why each one matters. */
export const EXCLUSIONS_DETAIL: { name: string; text: string }[] = [
  { name: "Taxes", text: "Income tax on rent, property or transfer taxes, and tax on gains when you sell. Real taxes can take a large share of the returns shown." },
  { name: "Loans and financing", text: "ESTA assumes the property is paid for in full. A mortgage would add interest and repayments, and can magnify both gains and losses." },
  { name: "Platform, management and purchase fees", text: "Anything a platform, manager, agent or lawyer would charge to buy, hold or sell a share. Only the operating expenses and sale costs you set are included." },
  { name: "Uneven vacancies and tenant problems", text: "Occupancy is spread evenly across the year. Real properties have long gaps, late rent, evictions and turnover costs." },
  { name: "Large repairs", text: "Maintenance is a steady yearly amount. A new roof, lift or major refit can cost far more in a single year." },
  { name: "Liquidity and sale timing", text: "The profit and ROI figures assume you can sell at the end of any year at the modelled value. A real sale can take months, may need a discount, and may not be possible at all." },
  { name: "Market and valuation risk", text: "Appreciation is a steady yearly rate you choose. Real prices rise and fall unevenly, and a valuation is an opinion until a buyer pays it." },
  { name: "Inflation that varies", text: "Inflation is one constant rate. Real inflation changes from year to year." },
  { name: "Currency changes", text: "Figures are in US dollars. A property priced or earning in another currency adds exchange rate risk." },
  { name: "Legal and ownership structure", text: "ESTA doesn't model what you would legally own, your rights, investor protections, or what happens if a manager or platform fails." },
  { name: "Concentration", text: "One property is modelled alone. Putting money into a single asset carries more risk than spreading it." },
];

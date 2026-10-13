# ESTA Simulator: how the numbers are calculated

Model version 1.2.0.

<!-- Generated from src/lib/methodology.ts. Edit that file, then run `npm run docs:methodology`. -->

## Contents

1. [What ESTA is and isn't](#what-this-is)
2. [When things happen in a year](#timing)
3. [Your ownership share](#ownership)
4. [The property's income](#property-income)
5. [Your share of the income: paid out or reinvested](#your-share-of-income)
6. [When the property loses money: capital calls](#capital-calls)
7. [The value of your share and appreciation](#value-and-appreciation)
8. [Sale costs, profit and ROI](#sale-costs-and-roi)
9. [Gross yield, net cash yield and cash-on-cash](#yields)
10. [Inflation, and nominal versus today's money](#inflation)
11. [Terms used on the site](#terms)
12. [A worked example](#worked-example)
13. [Assumptions and allowed ranges](#assumptions-and-ranges)
14. [What the presets change](#presets)
15. [What isn't modelled](#not-modelled)
16. [About the sample data](#sample-data)
17. [Model version and changes](#version-history)

<a id="what-this-is"></a>

## What ESTA is and isn't

ESTA is a learning tool. It shows how a property investment could behave over time under assumptions that you choose. It doesn't predict what will happen, and the properties it uses are invented samples.

The model is deterministic. The same assumptions always give the same results, there is no randomness, and nothing is pulled from a market. Every number on the site follows the rules on this page.

All properties and numbers in ESTA are illustrative. They are not live listings, verified prices or market quotes, and none of them can be bought here. Results are hypothetical, come from a simple fixed model, and are not a forecast, a recommendation, or investment, legal or tax advice. Figures are in US dollars.

Amounts are in US dollars and rates are shown as percentages. "Today's money" means a dollar amount adjusted for inflation.

<a id="timing"></a>

## When things happen in a year

Rent in each year is earned on the property's value at the start of that year. The value changes at the end of the year.

```text
Value at the start of year t = starting value × (1 + appreciation)^(t − 1)
Value at the end of year t   = starting value × (1 + appreciation)^t
Rent for year t              = value at the start of year t × gross yield × occupancy
```

- Year 0 is the day of purchase. No rent has been earned yet and no sale is modelled.
- Reinvested income buys ownership at the value at the end of the year.
- Where a sale is shown, it happens at the end of that year.

<a id="ownership"></a>

## Your ownership share

```text
Initial ownership share = starting investment ÷ property value
```

This treats the property as one asset that can be split into equal slices at its full value, with no loan, no fees and no discount for being hard to sell. Real products rarely work this neatly.

- Ownership share stays between 0% and 100%.
- Ending ownership share is what you hold after the last year. It only changes when income is reinvested.

<a id="property-income"></a>

## The property's income

```text
Gross rent                  = property value at the start of the year × gross yield
Rent collected              = gross rent × occupancy
Operating expenses          = rent collected × operating expense share
Maintenance                 = a fixed yearly amount, or that amount × (1 + inflation)^(t − 1) if it rises with inflation
Property income after costs = rent collected − operating expenses − maintenance
```

This is for the whole property, before your share. It can be negative when costs are higher than the rent collected.

<a id="your-share-of-income"></a>

## Your share of the income: paid out or reinvested

```text
Your distribution = ownership share you held during the year × property income after costs (when that is positive)
```

- Paid to you: the distribution arrives as cash and your ownership share doesn't change.
- Reinvested: the distribution buys more of the property at the value at the end of the year, so your ownership share grows.
- Ownership can't pass 100%. Once you own the whole property, anything that can't be reinvested is paid as cash. The annual table shows it as "Paid as cash at 100% ownership".
- Income is counted once. It is either paid as cash or reinvested, never both.

<a id="capital-calls"></a>

## When the property loses money: capital calls

If the property's income is negative, someone has to cover the shortfall. ESTA treats your share of it as a capital call: extra money you put in.

```text
Capital call = ownership share you held during the year × the shortfall
```

- It is not a negative payout.
- It doesn't buy ownership and it never reduces the ownership you already have.
- It is added to total contributed once.
- In that year, cash distributions and reinvested distributions are zero.

<a id="value-and-appreciation"></a>

## The value of your share and appreciation

```text
Value of your share    = ownership share × property value at the end of the year
Cost basis             = starting investment + reinvested distributions
Property appreciation  = value of your share − cost basis
```

Capital calls aren't part of the cost basis because they don't buy ownership, so they never inflate or hide appreciation. Appreciation is not profit until the property is sold.

<a id="sale-costs-and-roi"></a>

## Sale costs, profit and ROI

```text
Sale costs                  = value of your share × sale cost rate
Sale proceeds               = value of your share − sale costs
Total contributed           = starting investment + capital calls
Profit if sold              = sale proceeds + cash distributions received − total contributed
ROI if sold                 = profit if sold ÷ total contributed
Total value before sale costs = value of your share + cash distributions received
```

Profit and ROI are shown as if you sold at the end of each year. Sale costs apply to every one of those hypothetical sales from year 1. Year 0 shows 0% because no time has passed.

Total value before sale costs ignores sale costs and any capital calls, so use it to see size, not profit. Profit reconciles exactly: profit if sold = property appreciation + distributions earned − capital calls − sale costs. The tests check this for every row.

<a id="yields"></a>

## Gross yield, net cash yield and cash-on-cash

```text
Net cash yield     = (distribution − capital call) ÷ total contributed at the start of the year
Cash-on-cash yield = cash paid in the year ÷ total contributed at the start of the year
```

Gross rental yield is the input you choose. Net cash yield is what is left after empty periods, operating expenses and maintenance. It is lower than the gross yield unless occupancy is 100% and there are no costs.

In reinvest mode cash-on-cash is zero, because nothing is paid as cash. Net cash yield still shows what the income is worth.

<a id="inflation"></a>

## Inflation, and nominal versus today's money

```text
Value in today's money = value ÷ (1 + inflation)^t
```

Nominal means the plain dollar amount, not adjusted for inflation. Profit, ROI and total value before sale costs are nominal. "Total value in today's money" is the inflation adjusted figure. Inflation also raises maintenance when you choose "rises with inflation".

<a id="terms"></a>

## Terms used on the site

- **Ownership share.** Your starting investment divided by the property's value. Ending ownership is the share you hold after any reinvestment, and it can never go above 100%.
- **Property income after costs.** Rent collected (gross yield on the property's value, times occupancy), minus operating expenses and maintenance. This is for the whole property, before your share.
- **Distributions.** Your share of the property's income whenever that income is positive.
- **Cash distributions.** Distributions paid out to you as cash. In reinvest mode, cash is paid only for what is left over once you own 100%.
- **Reinvested distributions.** Distributions used to buy more of the property at the year end value. They are not new money from you.
- **Capital calls.** When the property's income doesn't cover its costs, your share of the shortfall counts as extra money you put in. It doesn't buy ownership, doesn't reduce what you own, and is never shown as a negative payout.
- **Total contributed.** Your starting investment plus any capital calls. This is the money that came from you.
- **Property appreciation.** The value of your share minus what bought it (starting investment plus reinvested distributions). It is not profit until the property is sold.
- **Total value before sale costs.** The value of your share plus every cash distribution you have received.
- **Profit if sold.** Sale proceeds after sale costs, plus cash distributions received, minus everything you contributed.
- **ROI if sold.** Profit if sold, divided by total contributed. It is a nominal figure, so it is not adjusted for inflation. Year 0 shows 0% because no time has passed, so no sale is modelled there.
- **Gross rental yield.** Yearly rent as a share of the property's value, before empty periods, running costs and maintenance. It is an input you choose, so it is always higher than what reaches your pocket.
- **Net cash yield.** What the property's income is worth as a yearly return on the money you put in, after empty periods, operating expenses and maintenance. It is the gross rental yield you would see once the costs are paid, and it can be negative.
- **Cash-on-cash yield.** Cash distributions in a year divided by the money you had contributed at the start of that year. It counts only cash actually paid.
- **Inflation adjusted value.** Total value before sale costs, divided by (1 + inflation) for each year, so it reads in today's money.

<a id="worked-example"></a>

## A worked example

Marina Residence, using its starting assumptions and a $2,500 investment, paid out as cash. Amounts are shown to the cent so every line adds up.

```text
Property value today                 $490,000.00
Initial ownership share              $2,500.00 ÷ $490,000.00 = 0.5102%

Year 1 gross rent                    $490,000.00 × 6.5% = $31,850.00
Rent collected                       $31,850.00 × 92% occupancy = $29,302.00
Operating expenses                   $29,302.00 × 25% = $7,325.50
Maintenance                          $325.00
Property income after costs          $29,302.00 − $7,325.50 − $325.00 = $21,651.50

Your year 1 cash distribution        0.5102% × $21,651.50 = $110.47
Net cash yield, year 1               $110.47 ÷ $2,500.00 = 4.42%
                                     (the gross yield input was 6.5%)

Property value, end of year 1        $490,000.00 × (1 + 3.0%) = $504,700.00
Value of your share, end of year 1   0.5102% × $504,700.00 = $2,575.00

After 10 years
Value of your share                  $3,359.79
Cash distributions received          $1,266.81
Sale costs at 2.0%                   $67.20
Profit if sold                       $3,292.60 + $1,266.81 − $2,500.00 = $2,059.41
ROI if sold                          $2,059.41 ÷ $2,500.00 = +82.4%
Value in today's money               $3,614.29
                                     (total value before sale costs, adjusted for 2.5% inflation)
```

<a id="assumptions-and-ranges"></a>

## Assumptions and allowed ranges

Each assumption has a range on the sliders. The engine itself accepts a slightly wider range, which is what a shared link is checked against. A value outside the range is moved to the nearest allowed value and you are told.

*Assumptions, slider ranges and engine limits*

| Assumption | Slider range | Slider step | Engine accepts |
| --- | --- | --- | --- |
| Starting investment | The property's minimum to $25,000 (or the property value if lower) | $100 | $0 up to the property value |
| Inflation | 0% to 10% | 0.1 points | 0% to 20% |
| Occupancy | 0% to 100% | 1 point | 0% to 100% |
| Maintenance per year | $0 to $3,000 | $25 | $0 or more |
| Gross rental yield | 0% to 12% | 0.1 points | 0% to 20% |
| Property appreciation | -5% to 10% | 0.1 points | -10% to 20% |
| Operating expenses (share of rent) | 0% to 60% | 1 point | 0% to 100% |
| Sale costs | 0.0% to 6.0% | 0.5 points | 0% to 20% |
| Projection length | 10 years | Fixed | 1 to 30 years |

The default starting investment is $2,500, raised to the property's minimum if that is higher. Default sale costs are 2%. Maintenance rises with inflation and income is paid out as cash unless you choose otherwise.

<a id="presets"></a>

## What the presets change

Conservative and optimistic don't use hidden multipliers. Each adds the amounts below to your assumptions, then keeps the result inside the slider ranges. On the simulator, presets start from the property's own starting assumptions. On the compare page, they start from your current assumptions, and the base case is exactly what you set.

*Changes each preset makes*

| Assumption | Conservative | Base case | Optimistic |
| --- | --- | --- | --- |
| Gross rental yield | −1.0 points | 0 | +0.5 points |
| Occupancy | −8.0 points | 0 | +4.0 points |
| Operating expenses | +5.0 points | 0 | −3.0 points |
| Property appreciation | −2.0 points | 0 | +1.5 points |
| Inflation | +1.0 points | 0 | −0.5 points |
| Maintenance per year | +$150 | 0 | −$75 |

<a id="not-modelled"></a>

## What isn't modelled

These costs and risks are left out. Real outcomes can be much better or much worse than the figures on this site.

- Taxes: Income tax on rent, property or transfer taxes, and tax on gains when you sell. Real taxes can take a large share of the returns shown.
- Loans and financing: ESTA assumes the property is paid for in full. A mortgage would add interest and repayments, and can magnify both gains and losses.
- Platform, management and purchase fees: Anything a platform, manager, agent or lawyer would charge to buy, hold or sell a share. Only the operating expenses and sale costs you set are included.
- Uneven vacancies and tenant problems: Occupancy is spread evenly across the year. Real properties have long gaps, late rent, evictions and turnover costs.
- Large repairs: Maintenance is a steady yearly amount. A new roof, lift or major refit can cost far more in a single year.
- Liquidity and sale timing: The profit and ROI figures assume you can sell at the end of any year at the modelled value. A real sale can take months, may need a discount, and may not be possible at all.
- Market and valuation risk: Appreciation is a steady yearly rate you choose. Real prices rise and fall unevenly, and a valuation is an opinion until a buyer pays it.
- Inflation that varies: Inflation is one constant rate. Real inflation changes from year to year.
- Currency changes: Figures are in US dollars. A property priced or earning in another currency adds exchange rate risk.
- Legal and ownership structure: ESTA doesn't model what you would legally own, your rights, investor protections, or what happens if a manager or platform fails.
- Concentration: One property is modelled alone. Putting money into a single asset carries more risk than spreading it.

<a id="sample-data"></a>

## About the sample data

The six properties are invented. Their prices, yields and costs are assumptions, not market data, and none of them is a real listing or can be bought. Every record carries a data status, a source, a last verified date, and a mark on each input saying whether it is a sourced fact or an assumption.

*Sample properties and their data status*

| Property | Type | Property value | Data status | Source | Last verified |
| --- | --- | --- | --- | --- | --- |
| Marina Residence | Residential | $490,000 | Sample (invented) | ESTA illustrative dataset | Never |
| Business District Tower | Commercial | $870,000 | Sample (invented) | ESTA illustrative dataset | Never |
| Palm Garden Villas | Residential | $650,000 | Sample (invented) | ESTA illustrative dataset | Never |
| Creek Harbour Offices | Commercial | $1,225,000 | Sample (invented) | ESTA illustrative dataset | Never |
| Al Barsha Apartments | Multifamily | $1,525,000 | Sample (invented) | ESTA illustrative dataset | Never |
| Village Circle Residences | Multifamily | $1,060,000 | Sample (invented) | ESTA illustrative dataset | Never |

- A record can only be called verified if it has a source link, a verification date, at least one sourced field, and an approver on every change.
- A verified record that hasn't been re-checked within 180 days is shown as out of date.
- The original sample values were in AED. They were converted to US dollars once, at the fixed rate of 3.6725 AED to the dollar, then rounded. Percentages weren't changed, and there is no live exchange rate anywhere in the app.

<a id="version-history"></a>

## Model version and changes

Current model version: 1.2.0. The version changes whenever a formula or a definition changes, and every change is listed here with the reason.

*Model version history*

| Version | Date | What changed |
| --- | --- | --- |
| 1.2.0 | 2026-10-13 | Added net cash yield, so the yield you choose (gross) is never confused with what is left after costs. Added this methodology, and made the page, the report and the CSV use the same definitions. |
| 1.1.0 | 2026-10-13 | Negative property income is now a capital call (extra money you contribute). Before, it was treated as a negative reinvestment, which quietly reduced ownership. Ownership is capped at 100%. Before, reinvestment could push it past 100%. Income that can't be reinvested is now paid as cash. ROI now divides by total contributed (starting investment plus capital calls) and profit subtracts capital calls. Before, it divided by the starting investment only. Year 0 ROI is 0%. Before, it showed the cost of an immediate sale, which looked like a loss on day one. Reinvest mode no longer calls a reinvested amount 'cash'. Cash-on-cash counts only cash actually paid. All amounts are in US dollars. The sample values were converted once from AED at the fixed 3.6725 peg. |
| 1.0.0 | 2026-10-12 | First version of the model, with amounts in AED. |

# ESTA — Real Estate Intelligence

An educational fractional-property investment simulator. All properties, assumptions and results are
illustrative and hypothetical. Nothing here is investment, legal or tax advice.

## Run
```
npm install
npm run dev        # http://localhost:3000
npm test           # unit + render tests
npm run typecheck
npm run lint
npm run build
```

## Structure
- `src/lib/finance/` pure, deterministic engine (see the model notes at the top of `projections.ts`)
- `src/lib/data/properties.ts` typed, validated mock properties (all flagged `isMock`)
- `src/lib/compare/params.ts` validated URL parameters for `/compare`
- `src/proxy.ts` returns a real 404 for unknown `/simulator/<id>`
- `public/images/properties/` add WebP photos named as in the dataset (`imageSrc`); a placeholder is used until then

## Shareable URLs
- Simulator: `/simulator/<id>?investment=25000&occupancy=84&yield=5.5&inflation=3.5&appreciation=1&opex=30&saleCost=2&maintenance=1700&maintenanceMode=fixed|inflation&distributions=payout|reinvest`
  (rates are percent points; only values that differ from the property's defaults are written; invalid or out-of-range values fall back or clamp)
- Home: `/?type=residential|commercial|multifamily&sort=value-desc|value-asc|yield-desc|yield-asc`
- Compare: `/compare?property=<id>&investment=<AED>&distributions=payout|reinvest`
- Parsing lives in `src/lib/simulator/params.ts`, `src/lib/properties/query.ts`, `src/lib/compare/params.ts` (all unit-tested).


## Model and conventions (v1.1.0)
- **Currency:** US dollars everywhere. The original mock values were AED and were converted once at the AED/USD peg of 3.6725 (see the comment in `src/lib/data/properties.ts`). Money amounts in shared links carry `v=2`; older links with money amounts are treated as legacy and their amounts are ignored with a notice.
- **Negative cash flow** is a capital call (extra money the investor contributes). It never creates a negative payout and never reduces ownership.
- **Ownership is capped at 100%.** In reinvest mode, income that can't buy more ownership is paid as cash and shown separately.
- **ROI** is profit if sold (after sale costs, cash received and everything contributed) divided by total contributed. Year 0 is 0%.
- **Compare** uses the user's full current assumptions as the base case and shifts them for conservative and optimistic.
- **Exports:** `/simulator/<id>/report?...` is a printable report; the CSV is built from the same projection rows.
- **Typography:** Plus Jakarta Sans (headings) and Inter (body), both bundled through `@fontsource-variable/*` so no runtime font requests.
- Definitions live in `src/lib/finance/definitions.ts`; the on-page notes, the report and the CSV all use them.

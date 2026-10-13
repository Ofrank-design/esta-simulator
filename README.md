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


## Methodology
How every number is calculated, the definitions, allowed ranges and everything the model leaves out are documented once, in `src/lib/methodology.ts`. That one source produces both the `/methodology` page and `MODEL_METHODOLOGY.md`, and the on-page notes, the printable report and the CSV use the same definitions (`src/lib/finance/definitions.ts`).

- Read it: `MODEL_METHODOLOGY.md`, or `/methodology` when the app is running.
- After changing a formula, a definition or a range: bump `MODEL_VERSION` in `src/lib/finance/projections.ts`, add a line to `MODEL_CHANGELOG` in `src/lib/methodology.ts`, then run `npm run docs:methodology`. A test fails if `MODEL_METHODOLOGY.md` is out of date.
- Currency is US dollars. The sample values were converted once from AED at the fixed 3.6725 peg (see the comment in `src/lib/data/properties.ts`).

## Sample data rules
Every property carries a data status, a source, a last verified date, and a sourced or assumption mark on each input (`src/types/property.ts`). The launch dataset is all `mock`, and a test enforces that. A record can only be `verified` with a source link, a verification date, at least one sourced field and an approver on every change.

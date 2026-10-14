# Operating ESTA

## Keeping property data honest
All six properties are invented and marked `mock`. If you ever add real or verified data, these rules apply.

**Monthly review (15 minutes)**
1. Open `src/lib/data/properties.ts`. For every record check `dataStatus`, `lastVerifiedAt` and `dataUpdatedAt`.
2. A `verified` record not re-checked within 180 days shows to visitors as out of date automatically (with a warning banner on its simulator). Re-verify it, or withdraw it.
3. Record each change in `revisions` with a date, a note, and who approved it. A verified record is rejected by the schema without an approver.
4. Run `npm test`. The data tests will fail if a record claims to be verified without a source, or if mock and verified markers disagree.

**Withdrawing a property**
Set `dataStatus: "withdrawn"` and `isMock: false`, keep the record, and add a revision explaining why. A withdrawn property disappears from the home page, compare, the sitemap and its simulator address (which then returns a 404), but stays in the file as an audit trail. Don't delete records that people may have linked to without saying why.

**Changing assumptions on a sample property**
Changing a yield, cost or price changes every saved link's results. Add a `revisions` entry, and if the change is large, mention it in the methodology version history.

## Changing the model
1. Change the formula and its tests together. Never change a label to hide a formula that is wrong.
2. Bump `MODEL_VERSION` (`src/lib/finance/projections.ts`) and add a `MODEL_CHANGELOG` entry saying what changed and why (`src/lib/methodology.ts`).
3. Run `npm run docs:methodology` and commit `MODEL_METHODOLOGY.md`.
4. CI must be green before merging.

## When something is reported
Visitors reach you through the feedback link (if you set `NEXT_PUBLIC_FEEDBACK_URL`). For a wrong number: reproduce it from the link they sent (scenario links hold every assumption), add a failing test, fix, bump the model version if the formula changed, and say so in the version history. For a down site: check the host's status, then roll back to the last good deployment.

## What ESTA doesn't collect
No accounts, no cookies, no analytics, no requests to other sites. If that ever changes, update `/privacy` before deploying.

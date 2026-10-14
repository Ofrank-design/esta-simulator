# Releasing ESTA

ESTA is a client side Next.js app. It needs no database, no API keys and no backend. Don't add any to deploy it.

## 1. One time set up
1. Push the repository to GitHub. CI (`.github/workflows/ci.yml`) starts running on every push and pull request. In the repository settings, make the **Typecheck, lint, test, build** and **Browser smoke tests** checks required before merging.
2. Import the repository into Vercel (or another Next.js host). The defaults work: framework Next.js, build command `npm run build`, Node 22.
3. Set these environment variables in the host (all optional, all public):
   | Variable | What it does |
   | --- | --- |
   | `NEXT_PUBLIC_SITE_URL` | Your real address, for canonical links, the social preview and the sitemap, for example `https://esta.example.com`. On Vercel the production address is picked up automatically, so only set this for a custom domain. |
   | `NEXT_PUBLIC_FEEDBACK_URL` | A `mailto:` link or an `https://` form. When set, the footer shows a feedback link. When blank, no link is shown. |
4. Add your domain in the host's settings and wait for HTTPS to be issued.

## 2. Each release
1. Merge to the main branch only when CI is green.
2. Let the host deploy that exact commit. Don't deploy from a local folder.
3. Run the **Check a deployed site** workflow (Actions tab, "Run workflow") with the live address and the full commit hash. It runs the browser tests against the real site and fails if the site wasn't built from that commit. Or locally:
   ```bash
   E2E_BASE_URL=https://your-site EXPECT_COMMIT=<full commit hash> npm run test:e2e
   ```
4. Open the site on a real phone and a real laptop. Work through the table below.
5. Anything wrong: redeploy the previous commit from the host's dashboard (instant rollback on Vercel), then fix forward.

You can tell which commit is live: the footer shows the first seven characters, and every page carries the full hash in `<meta name="build-commit">`.

## 3. Launch checklist (roadmap 5.3)
"Verified" means a repeatable automated check exists in CI or the deployed site check. "Yours" means it needs a person or a real deployment.

| Item | Status |
| --- | --- |
| Every visible action works | Verified: the smoke suite exercises sliders, presets, reset, copy link, report, CSV, compare, filters, learn more links |
| All properties labelled illustrative | Verified: a data test requires every record to be `mock`, and the pages say so |
| Methodology page is live | Verified: `/methodology` is tested, and a test keeps `MODEL_METHODOLOGY.md` in sync |
| Key formula tests pass | Verified in CI (`npm test`) |
| Build and typecheck pass in CI | Verified once the repository is on GitHub: the workflow is in place |
| Mobile and keyboard checks | Verified at 360, 390, 820 and 1280 wide, plus focus visibility and the skip link. Yours: a real phone |
| No broken internal links or missing images | Verified for the main routes and every image on them. Yours: a link checker on the live site if you add pages |
| Helpful unknown property page | Verified: real 404 with a way back |
| Share a scenario and get the same assumptions | Verified: reload, copy link and compare round trips |
| Export without losing assumptions | Verified: CSV and report are checked against the URL's assumptions |
| Plain English disclaimer | Verified: footer on every page, report and CSV |
| Deploy to a public URL, verify on the live site | **Yours.** Needs your hosting account. Use the workflow above |
| Real device, real network | **Yours** |

## 4. After launch
- Re-run the deployed site check after every deployment.
- Follow `docs/OPERATIONS.md` for the monthly data review.
- If you add analytics or any tracking, update `/privacy` first and add a consent step if your region requires one. The privacy page is accurate only while the site sets no cookies and loads nothing from other sites (a test checks both).

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import { PROPERTY_IDS, expectNoBrokenImages, expectNoSideScroll, watch } from "./helpers";

test.describe("home page", () => {
  test("loads with its hero, six sample properties, fonts and images", async ({ page }) => {
    const w = watch(page);
    const res = await page.goto("/");
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(/ESTA Simulator/);
    await expect(page.locator("h1")).toContainText("Try a property investment");
    await expect(page.locator("article")).toHaveCount(6);
    await page.waitForLoadState("networkidle");
    await expectNoBrokenImages(page);
    const fonts = await page.evaluate(async () => {
      await document.fonts.ready;
      return [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replace(/"/g, ""));
    });
    expect(fonts.join(" ")).toMatch(/Inter/);
    expect(fonts.join(" ")).toMatch(/Plus Jakarta Sans/);
    expect(w.problems).toEqual([]);
  });

  test("makes no requests to other sites and sets no cookies", async ({ page, context }) => {
    const w = watch(page);
    for (const path of ["/", "/simulator/marina-residence", "/compare", "/methodology", "/privacy"]) await page.goto(path, { waitUntil: "networkidle" });
    expect(w.foreign).toEqual([]);
    expect(await context.cookies()).toEqual([]);
  });

  test("filters and sorting work and are shareable", async ({ page }) => {
    await page.goto("/?type=commercial&sort=yield-desc");
    await expect(page.locator("article")).toHaveCount(2);
    await expect(page.locator("article h2").first()).toContainText("Creek Harbour");
    await page.getByRole("button", { name: "All", exact: true }).click();
    await expect(page.locator("article")).toHaveCount(6);
  });
});

test.describe("simulator", () => {
  for (const id of PROPERTY_IDS) {
    test(`/simulator/${id} loads and calculates`, async ({ page }) => {
      const w = watch(page);
      const res = await page.goto(`/simulator/${id}`, { waitUntil: "networkidle" });
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).not.toBeEmpty();
      await expect(page.getByRole("slider")).toHaveCount(8);
      await expect(page.locator(".recharts-line-curve").first()).toBeVisible();
      await expect(page.getByText("Profit if sold").first()).toBeVisible();
      await expectNoBrokenImages(page);
      expect(w.problems).toEqual([]);
    });
  }

  test("a changed assumption is written to the link and restored on reload", async ({ page }) => {
    await page.goto("/simulator/marina-residence", { waitUntil: "networkidle" });
    const occupancy = page.getByRole("slider", { name: /^Occupancy/ });
    await occupancy.focus();
    for (let i = 0; i < 10; i++) await page.keyboard.press("ArrowLeft");
    await expect(page).toHaveURL(/occupancy=82/);
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.getByRole("slider", { name: /^Occupancy/ })).toHaveValue("0.82");
  });

  test("a shared link with bad values is corrected and explained", async ({ page }) => {
    await page.goto("/simulator/marina-residence?occupancy=150&yield=abc&v=2&investment=99999999", { waitUntil: "networkidle" });
    await expect(page.getByText("We adjusted a few things from this link")).toBeVisible();
    await expect(page.getByRole("slider", { name: /^Occupancy/ })).toHaveValue("1");
  });

  test("copy scenario link puts the exact assumptions on the clipboard", async ({ page, context, baseURL }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: baseURL! });
    await page.goto("/simulator/marina-residence?v=2&investment=5000&occupancy=75", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Copy scenario link" }).click();
    await expect(page.getByText("Link copied")).toBeVisible();
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toContain("occupancy=75");
    expect(clip).toContain("investment=5000");
  });

  test("reset returns to the property's defaults and clears the link", async ({ page }) => {
    await page.goto("/simulator/marina-residence?occupancy=60", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Reset to property defaults" }).click();
    await expect(page).not.toHaveURL(/occupancy/);
    await expect(page.getByRole("slider", { name: /^Occupancy/ })).toHaveValue("0.92");
  });

  test("the table view and chart view both work", async ({ page }) => {
    await page.goto("/simulator/marina-residence", { waitUntil: "networkidle" });
    await page.getByText("Table", { exact: true }).click();
    await expect(page.locator("[aria-label='Annual projection table, scrollable'] tbody tr")).toHaveCount(11);
  });
});

test.describe("compare", () => {
  test("keeps every assumption from the simulator", async ({ page }) => {
    await page.goto("/simulator/marina-residence?v=2&investment=5000&occupancy=75&yield=5.5&distributions=reinvest", { waitUntil: "networkidle" });
    await page.getByRole("link", { name: /^Compare cautious/ }).click();
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page).toHaveURL(/occupancy=75/);
    await expect(page).toHaveURL(/yield=5\.5/);
    const occ = page.locator("tr", { has: page.locator("th", { hasText: /^Occupancy$/ }) }).first();
    await expect(occ).toContainText("67%");
    await expect(occ).toContainText("75%");
    await expect(occ).toContainText("79%");
    await expect(page.getByText("(changed)").first()).toBeVisible();
  });
});

test.describe("not found", () => {
  test("an unknown property returns a real 404 with a helpful page", async ({ page }) => {
    const res = await page.goto("/simulator/not-a-property");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /couldn't find that/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "See the sample properties" })).toBeVisible();
  });
  test("an unknown page returns 404", async ({ page }) => {
    expect((await page.goto("/nope"))?.status()).toBe(404);
  });
});

test.describe("documents and exports", () => {
  test("methodology explains the model and its limits", async ({ page }) => {
    await page.goto("/methodology", { waitUntil: "networkidle" });
    await expect(page.locator("h1")).toContainText("How the numbers are calculated");
    for (const s of ["A worked example", "What isn't modelled", "About the sample data", "Model version and changes"]) await expect(page.getByRole("heading", { name: s })).toBeVisible();
  });

  test("learn more links open the right section", async ({ page }) => {
    await page.goto("/simulator/marina-residence", { waitUntil: "networkidle" });
    await page.locator("a", { hasText: /^Learn more$/ }).first().click();
    await expect(page).toHaveURL(/\/methodology#ownership/);
  });

  test("the report and the CSV carry the assumptions, the disclaimer and the methodology", async ({ page, context }) => {
    await page.goto("/simulator/marina-residence?v=2&investment=5000&occupancy=70&distributions=reinvest", { waitUntil: "networkidle" });
    const popup = context.waitForEvent("page");
    await page.getByRole("link", { name: "Open printable report" }).click();
    const report = await popup;
    await report.waitForLoadState("networkidle");
    await expect(report.locator("time").first()).toHaveAttribute("datetime", /^\d{4}-\d{2}-\d{2}T/);
    await expect(report.locator("body")).toContainText("70%");
    await expect(report.locator("body")).toContainText("Reinvested");
    await expect(report.locator("body")).toContainText("not a real listing");
    await expect(report.locator("body")).toContainText("/methodology");
    await report.emulateMedia({ media: "print" });
    await expect(report.locator("header").first()).toBeHidden();
    const download = report.waitForEvent("download");
    await report.emulateMedia({ media: "screen" });
    await report.getByRole("button", { name: "Download CSV" }).click();
    const csv = fs.readFileSync(await (await download).path()!, "utf8");
    expect(csv).toContain("# Illustrative data");
    expect(csv).toContain("Model version:");
    expect(csv).toContain("/methodology");
    expect(csv).toContain("Occupancy (%): 70.00");
  });

  test("privacy page says what's true", async ({ page, context }) => {
    await page.goto("/privacy", { waitUntil: "networkidle" });
    await expect(page.locator("h1")).toHaveText("Privacy");
    await expect(page.getByText("no accounts or logins", { exact: false })).toBeVisible();
    expect(await context.cookies()).toEqual([]);
  });
});

test.describe("launch readiness", () => {
  test("pages have titles, descriptions, a canonical link and a social preview", async ({ page, request }) => {
    for (const path of ["/", "/compare", "/methodology", "/privacy", "/simulator/marina-residence"]) {
      await page.goto(path);
      expect((await page.title()).length).toBeGreaterThan(10);
      expect(await page.locator('meta[name="description"]').getAttribute("content")).toMatch(/.{40,}/);
      expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toMatch(/^https?:\/\//);
      expect(await page.locator('meta[property="og:image"]').getAttribute("content")).toMatch(/og-image\.jpg$/);
      expect(await page.locator('meta[name="twitter:card"]').getAttribute("content")).toBe("summary_large_image");
    }
    const og = await page.locator('meta[property="og:image"]').getAttribute("content");
    const ogRes = await request.get(new URL(og!).pathname);
    expect(ogRes.status()).toBe(200);
    expect(ogRes.headers()["content-type"]).toContain("image/jpeg");
  });

  test("favicon, app icons, robots and sitemap are served", async ({ request }) => {
    for (const p of ["/favicon.ico", "/icon.png", "/apple-icon.png"]) expect((await request.get(p)).status(), p).toBe(200);
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Sitemap:");
    expect(robots).toContain("/simulator/*/report");
    const map = await (await request.get("/sitemap.xml")).text();
    for (const id of PROPERTY_IDS) expect(map).toContain(`/simulator/${id}`);
    expect(map).toContain("/methodology");
    expect(map).not.toContain("/report");
  });

  test("the page says which commit it was built from", async ({ page }) => {
    await page.goto("/");
    const commit = await page.locator('meta[name="build-commit"]').getAttribute("content");
    expect(commit).toMatch(/^[0-9a-f]{40}$|^unknown$/);
    if (process.env.EXPECT_COMMIT) expect(commit).toBe(process.env.EXPECT_COMMIT);
  });

  test("sends basic security headers", async ({ request }) => {
    const h = (await request.get("/")).headers();
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["x-frame-options"]).toBe("SAMEORIGIN");
    expect(h["permissions-policy"]).toContain("camera=()");
  });
});

test.describe("layout on real screen sizes", () => {
  const sizes = [
    { name: "phone 360", width: 360, height: 740 },
    { name: "phone 390", width: 390, height: 844 },
    { name: "tablet 820", width: 820, height: 1180 },
    { name: "laptop 1280", width: 1280, height: 800 },
  ];
  const paths = ["/", "/simulator/marina-residence", "/simulator/palm-garden-villas?v=2&distributions=reinvest", "/compare", "/methodology", "/simulator/marina-residence/report"];
  for (const s of sizes) {
    test(`no sideways scrolling at ${s.name}, including the chart and the table`, async ({ page }) => {
      await page.setViewportSize({ width: s.width, height: s.height });
      for (const path of paths) {
        await page.goto(path, { waitUntil: "networkidle" });
        await expectNoSideScroll(page);
      }
      await page.goto("/simulator/marina-residence", { waitUntil: "networkidle" });
      await page.getByText("Table", { exact: true }).click();
      await expectNoSideScroll(page);
    });
  }
});

test.describe("accessibility", () => {
  const pages = ["/", "/simulator/marina-residence", "/simulator/marina-residence?occupancy=0", "/compare", "/methodology", "/privacy", "/simulator/marina-residence/report", "/simulator/not-a-property"];
  for (const path of pages) {
    test(`no WCAG 2.2 AA violations on ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
    });
  }

  test("the skip link is the first stop and moves focus to the content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("keyboard focus is visible on the controls that matter", async ({ page }) => {
    await page.goto("/simulator/marina-residence", { waitUntil: "networkidle" });
    const seen = new Set<string>();
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        const e = document.activeElement as HTMLElement | null;
        if (!e || e === document.body) return null;
        const s = getComputedStyle(e);
        const visible = (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== "none";
        return { kind: e.tagName.toLowerCase() + ":" + (e.getAttribute("type") || e.getAttribute("role") || ""), visible };
      });
      if (info) {
        expect(info.visible, `focus not visible on ${info.kind}`).toBe(true);
        seen.add(info.kind);
      }
    }
    expect([...seen].some((k) => k.startsWith("input:range"))).toBe(true);
  });
});

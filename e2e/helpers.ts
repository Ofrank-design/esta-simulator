import { expect, test, type Page } from "@playwright/test";

/** Collects anything that would embarrass us in front of a visitor. */
export function watch(page: Page) {
  const problems: string[] = [];
  const foreign: string[] = [];
  const origin = new URL(test.info().project.use.baseURL ?? "http://127.0.0.1").origin;
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") problems.push(`console: ${m.text()}`);
  });
  page.on("response", (r) => {
    if (r.status() >= 400 && r.request().resourceType() !== "document") problems.push(`HTTP ${r.status()} ${r.url()}`);
  });
  page.on("request", (r) => {
    const u = r.url();
    if (!u.startsWith("data:") && !u.startsWith("blob:") && new URL(u).origin !== origin) foreign.push(u);
  });
  return { problems, foreign, origin };
}

export async function expectNoBrokenImages(page: Page) {
  const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src));
  expect(broken).toEqual([]);
}

export async function expectNoSideScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

export const PROPERTY_IDS = [
  "marina-residence",
  "business-district-tower",
  "palm-garden-villas",
  "creek-harbour-offices",
  "al-barsha-apartments",
  "jvc-residences",
] as const;

import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";
import robots from "./robots";
import { PROPERTIES } from "@/lib/data/properties";

describe("sitemap and robots", () => {
  it("lists the main pages and every sample property, and never a report", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls.some((u) => u.endsWith("/methodology"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/privacy"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/compare"))).toBe(true);
    for (const p of PROPERTIES) expect(urls.some((u) => u.endsWith(`/simulator/${p.id}`))).toBe(true);
    expect(urls.some((u) => u.includes("/report"))).toBe(false);
  });
  it("keeps reports out of search results and points to the sitemap", () => {
    const r = robots();
    expect(JSON.stringify(r.rules)).toContain("/simulator/*/report");
    expect(r.sitemap).toMatch(/\/sitemap\.xml$/);
  });
});

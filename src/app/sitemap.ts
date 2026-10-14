import type { MetadataRoute } from "next";
import { PROPERTIES } from "@/lib/data/properties";
import { SITE_URL } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/compare", "/methodology", "/privacy"].map((p) => ({ url: `${SITE_URL}${p}` }));
  const simulators = PROPERTIES.map((p) => ({ url: `${SITE_URL}/simulator/${p.id}` }));
  return [...pages, ...simulators];
}

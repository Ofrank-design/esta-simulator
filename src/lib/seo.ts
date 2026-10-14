import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site-config";

export const OG_IMAGE = { url: "/images/branding/og-image.jpg", width: 1200, height: 630, alt: SITE_NAME };

/**
 * A page that sets its own openGraph replaces the whole parent object in Next, so it would lose the
 * preview image. Every page builds its openGraph here so the image, site name and type always travel with it.
 */
export function openGraphFor(title: string, description: string): NonNullable<Metadata["openGraph"]> {
  return { type: "website", siteName: SITE_NAME, locale: "en_US", title, description, images: [OG_IMAGE] };
}

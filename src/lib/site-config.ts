/**
 * Optional public settings. Nothing here is a secret: NEXT_PUBLIC_ values are visible in the browser.
 *
 * NEXT_PUBLIC_FEEDBACK_URL  where people send feedback or business enquiries. Either a mailto: link
 *                           (mailto:you@example.com) or an https:// page such as a form. Unset means
 *                           no feedback link is shown, so there is never a link that goes nowhere.
 */
export function feedbackHref(raw: string | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;
  if (/^mailto:[^\s@?]+@[^\s@?]+\.[^\s@?]+(\?\S*)?$/i.test(value)) {
    return value.includes("?") ? value : `${value}?subject=${encodeURIComponent("ESTA Simulator feedback")}`;
  }
  if (/^https:\/\/[^\s]+$/i.test(value)) return value;
  return null;
}

export const FEEDBACK_HREF = feedbackHref(process.env.NEXT_PUBLIC_FEEDBACK_URL);

/**
 * The public address of the site, used for canonical links, the social preview and the sitemap.
 * Set NEXT_PUBLIC_SITE_URL to your own domain. On Vercel the production URL is picked up automatically.
 */
export function siteUrl(env: Record<string, string | undefined> = process.env): string {
  const explicit = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit && /^https?:\/\/[^\s]+$/i.test(explicit)) return explicit.replace(/\/+$/, "");
  const vercel = env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
  return "http://localhost:3000";
}

export const SITE_URL = siteUrl();
export const BUILD_COMMIT = process.env.NEXT_PUBLIC_BUILD_COMMIT ?? "unknown";
export const SITE_NAME = "ESTA Simulator";

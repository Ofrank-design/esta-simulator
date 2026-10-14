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

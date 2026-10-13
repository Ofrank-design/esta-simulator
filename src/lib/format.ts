/** One place for every display format. Currency is US dollars (USD) everywhere. */

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const MINUS = "\u2212";

/** Whole dollars, e.g. "$490,000" or "\u2212$1,200". Rounds half away from zero (Intl default). */
export function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return "\u2014";
  const text = usd.format(value);
  if (/^-?\$0$/.test(text)) return "$0"; // never show "-$0"
  return text.replace("-", MINUS);
}

/** Compact dollars for tight spaces, e.g. "$490k", "$1.5M". */
export function formatUsdCompact(value: number): string {
  if (!Number.isFinite(value)) return "\u2014";
  const abs = Math.abs(value);
  const sign = value < 0 && Math.round(value) !== 0 ? MINUS : "";
  if (abs >= 1_000_000) return `${sign}$${trim(abs / 1_000_000)}M`;
  if (abs >= 1_000) return `${sign}$${trim(abs / 1_000)}k`;
  return value < 0 && sign === "" ? "$0" : `${sign}$${Math.round(abs)}`;
}

function trim(n: number): string {
  return n.toFixed(1).replace(/\.0$/, "");
}

/** A plain number with fixed decimals and no symbol, for CSV files. */
export function formatPlainNumber(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "";
  const fixed = value.toFixed(digits);
  return Number(fixed) === 0 ? (0).toFixed(digits) : fixed;
}

export function formatPercent(fraction: number, digits = 1): string {
  return `${(fraction * 100).toFixed(digits)}%`;
}

export function formatSignedPercent(fraction: number, digits = 1): string {
  const text = `${(Math.abs(fraction) * 100).toFixed(digits)}%`;
  if (Number(text.replace("%", "")) === 0) return text;
  return fraction > 0 ? `+${text}` : `${MINUS}${text}`;
}

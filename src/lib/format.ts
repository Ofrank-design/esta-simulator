const aed = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED",
  maximumFractionDigits: 0,
});

export function formatAed(value: number): string {
  return aed.format(value).replace(/\u00a0/g, " ");
}

/** Compact AED, e.g. "AED 1.8M" */
export function formatAedCompact(value: number): string {
  if (value >= 1_000_000) return `AED ${trim(value / 1_000_000)}M`;
  if (value >= 1_000) return `AED ${trim(value / 1_000)}k`;
  return `AED ${value}`;
}

function trim(n: number): string {
  return n.toFixed(1).replace(/\.0$/, "");
}

export function formatPercent(fraction: number, digits = 1): string {
  return `${(fraction * 100).toFixed(digits)}%`;
}

export function formatSignedPercent(fraction: number, digits = 1): string {
  const text = `${(Math.abs(fraction) * 100).toFixed(digits)}%`;
  if (fraction > 0) return `+${text}`;
  if (fraction < 0) return `\u2212${text}`;
  return text;
}

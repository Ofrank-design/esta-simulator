export type SearchParamsRecord = Record<string, string | string[] | undefined>;
export type ParamGetter = (key: string) => string | null | undefined;

/** Adapts Next's `searchParams` object. Repeated keys use the first value. */
export function recordGetter(sp: SearchParamsRecord): ParamGetter {
  return (key) => {
    const v = sp[key];
    return Array.isArray(v) ? v[0] : v;
  };
}

/** Client only. Updates the address bar without a navigation or re-render (Next syncs its router state). */
export function replaceQuery(query: string): void {
  const { pathname, hash } = window.location;
  window.history.replaceState(null, "", `${pathname}${query ? `?${query}` : ""}${hash}`);
}

/** Strict number parsing: blank, NaN and Infinity are rejected. */
export function parseFinite(raw: string | null | undefined): number | null {
  if (raw === null || raw === undefined || raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

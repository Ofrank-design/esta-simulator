import type { Property, ProvenanceField } from "@/types/property";
import { PROVENANCE_FIELDS } from "@/types/property";

/** A verified record not re-checked within this many days is treated as stale. */
export const STALE_AFTER_DAYS = 180;

export function daysSince(isoDate: string, now: Date): number {
  const then = Date.parse(`${isoDate}T00:00:00Z`);
  return Math.floor((now.getTime() - then) / 86_400_000);
}

/**
 * The status users should see: a verified record turns stale automatically once it ages out.
 * `now` is always passed in, never read here, so pages decide when the clock is read (once, at request time).
 */
export function effectiveStatus(p: Property, now: Date): Property["dataStatus"] {
  if (p.dataStatus === "verified" && p.lastVerifiedAt && daysSince(p.lastVerifiedAt, now) > STALE_AFTER_DAYS) return "stale";
  return p.dataStatus;
}

export const STATUS_LABELS: Record<Property["dataStatus"], string> = {
  mock: "Sample (invented)",
  draft: "Draft",
  verified: "Verified",
  stale: "Out of date",
  withdrawn: "Withdrawn",
};

export function sourcedFields(p: Property): ProvenanceField[] {
  return PROVENANCE_FIELDS.filter((f) => p.provenance[f] === "sourced");
}

/** Short plain-language description of where a record's numbers come from. */
export function describeProvenance(p: Property, now: Date): { status: string; source: string; verified: string; inputs: string } {
  const status = effectiveStatus(p, now);
  const sourced = sourcedFields(p).length;
  return {
    status: STATUS_LABELS[status],
    source: p.source.name,
    verified: p.lastVerifiedAt ? `${p.lastVerifiedAt}` : "Never. These numbers are invented.",
    inputs:
      sourced === 0
        ? "Every input is an assumption, not a verified fact."
        : `${sourced} of ${PROVENANCE_FIELDS.length} inputs are sourced facts. The rest are assumptions.`,
  };
}

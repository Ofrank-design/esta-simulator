import { describe, expect, it } from "vitest";
import { PROPERTIES } from "@/lib/data/properties";
import { propertySchema, PROVENANCE_FIELDS } from "@/types/property";
import { STALE_AFTER_DAYS, daysSince, describeProvenance, effectiveStatus } from "./provenance";

const base = PROPERTIES[0];
const verified = {
  ...base,
  isMock: false,
  dataStatus: "verified" as const,
  source: { id: "mgr-1", name: "Example Property Manager", url: "https://example.com/listing/1" },
  lastVerifiedAt: "2026-09-01",
  provenance: { ...base.provenance, propertyValueUsd: "sourced" as const },
  revisions: [{ date: "2026-09-01", note: "Initial verification", approvedBy: "A. Reviewer" }],
};

describe("launch dataset policy", () => {
  it("contains only mock records, so nothing can be read as live or verified", () => {
    for (const p of PROPERTIES) {
      expect(p.dataStatus).toBe("mock");
      expect(p.isMock).toBe(true);
      expect(p.lastVerifiedAt).toBeNull();
      expect(p.source.url).toBeUndefined();
      expect(PROVENANCE_FIELDS.every((f) => p.provenance[f] === "assumption")).toBe(true);
      expect(p.currency).toBe("USD");
    }
  });
  it("records how the USD values came about", () => {
    for (const p of PROPERTIES) expect(p.revisions[0].note).toMatch(/AED to USD.*3\.6725/);
  });
});

describe("property data rules", () => {
  it("accepts a properly verified record", () => {
    expect(propertySchema.safeParse(verified).success).toBe(true);
  });
  it("rejects a verified record with no source link, no date, no sourced field or no approver", () => {
    expect(propertySchema.safeParse({ ...verified, source: { id: "x", name: "y" } }).success).toBe(false);
    expect(propertySchema.safeParse({ ...verified, lastVerifiedAt: null }).success).toBe(false);
    expect(propertySchema.safeParse({ ...verified, provenance: base.provenance }).success).toBe(false);
    expect(propertySchema.safeParse({ ...verified, revisions: [{ date: "2026-09-01", note: "x" }] }).success).toBe(false);
  });
  it("rejects a mock record that claims to be verified, sourced or linked", () => {
    expect(propertySchema.safeParse({ ...base, lastVerifiedAt: "2026-10-01" }).success).toBe(false);
    expect(propertySchema.safeParse({ ...base, provenance: { ...base.provenance, grossYield: "sourced" } }).success).toBe(false);
    expect(propertySchema.safeParse({ ...base, source: { ...base.source, url: "https://example.com" } }).success).toBe(false);
  });
  it("rejects isMock that disagrees with the status", () => {
    expect(propertySchema.safeParse({ ...base, isMock: false }).success).toBe(false);
    expect(propertySchema.safeParse({ ...verified, isMock: true }).success).toBe(false);
  });
  it("requires every projection input to be marked sourced or assumption", () => {
    const partial = Object.fromEntries(Object.entries(base.provenance).filter(([k]) => k !== "grossYield"));
    expect(propertySchema.safeParse({ ...base, provenance: partial }).success).toBe(false);
  });
  it("requires ISO dates", () => {
    expect(propertySchema.safeParse({ ...base, dataUpdatedAt: "13/10/2026" }).success).toBe(false);
  });
});

describe("staleness and descriptions", () => {
  it("counts days between ISO dates", () => {
    expect(daysSince("2026-10-01", new Date("2026-10-13T12:00:00Z"))).toBe(12);
  });
  it("turns a verified record stale once it ages out, and leaves fresh and mock records alone", () => {
    const fresh = new Date("2026-10-13T00:00:00Z");
    const old = new Date(Date.parse("2026-09-01T00:00:00Z") + (STALE_AFTER_DAYS + 1) * 86_400_000);
    expect(effectiveStatus(verified, fresh)).toBe("verified");
    expect(effectiveStatus(verified, old)).toBe("stale");
    expect(effectiveStatus(base, old)).toBe("mock");
  });
  it("describes where a mock record's numbers come from, in plain words", () => {
    const d = describeProvenance(base);
    expect(d.status).toBe("Sample (invented)");
    expect(d.verified).toMatch(/Never/);
    expect(d.inputs).toMatch(/Every input is an assumption/);
  });
  it("counts sourced inputs when a record has some", () => {
    expect(describeProvenance(verified, new Date("2026-10-13T00:00:00Z")).inputs).toBe("1 of 7 inputs are sourced facts. The rest are assumptions.");
  });
});

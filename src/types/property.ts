import { z } from "zod";

export const ASSET_TYPES = ["residential", "commercial", "multifamily"] as const;
export type AssetType = (typeof ASSET_TYPES)[number];

/** Where a record stands. Only "mock" is allowed in the launch dataset. */
export const DATA_STATUSES = ["mock", "draft", "verified", "stale", "withdrawn"] as const;
export type DataStatus = (typeof DATA_STATUSES)[number];

/** Fields that drive the projection. Each must say whether it is a sourced fact or an assumption. */
export const PROVENANCE_FIELDS = [
  "propertyValueUsd",
  "minInvestmentUsd",
  "grossYield",
  "occupancy",
  "opexRatio",
  "annualMaintenanceUsd",
  "appreciation",
] as const;
export type ProvenanceField = (typeof PROVENANCE_FIELDS)[number];

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a YYYY-MM-DD date");

const sourceSchema = z.object({
  /** Stable identifier of the source or dataset. */
  id: z.string().min(1),
  /** Who maintains it: a manager, data provider or "ESTA illustrative dataset". */
  name: z.string().min(1),
  /** Evidence reference, where permitted. Required for verified records. */
  url: z.string().url().optional(),
});

const revisionSchema = z.object({
  date: isoDate,
  note: z.string().min(1),
  /** Required for any change that affects projections once a record is no longer mock. */
  approvedBy: z.string().min(1).optional(),
});

/**
 * All rates are decimals (0.065 = 6.5%). All money is whole US dollars (USD).
 *
 * DATA RULES (enforced below, not just documented):
 *  - mock:      isMock is true, every projection field is an "assumption", never verified.
 *  - verified:  needs a source URL, a last verified date and at least one "sourced" field.
 *  - anything that isn't mock must have isMock false. A record can't be both.
 */
export const propertySchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: z.string().min(1),
    city: z.string().min(1),
    country: z.string().min(1),
    assetType: z.enum(ASSET_TYPES),
    imageSrc: z.string().startsWith("/images/properties/"),
    imageAlt: z.string().min(1),
    propertyValueUsd: z.number().int().positive(),
    minInvestmentUsd: z.number().int().positive(),
    grossYield: z.number().min(0).max(0.2),
    occupancy: z.number().min(0).max(1),
    annualMaintenanceUsd: z.number().int().min(0),
    opexRatio: z.number().min(0).max(1),
    appreciation: z.number().min(-0.1).max(0.2),
    description: z.string().min(1),
    isMock: z.boolean(),

    currency: z.literal("USD"),
    dataStatus: z.enum(DATA_STATUSES),
    source: sourceSchema,
    /** Date the numbers were last checked against the source. null means never. */
    lastVerifiedAt: isoDate.nullable(),
    /** Date the record was last changed. */
    dataUpdatedAt: isoDate,
    provenance: z.record(z.enum(PROVENANCE_FIELDS), z.enum(["sourced", "assumption"])),
    revisions: z.array(revisionSchema),
  })
  .superRefine((p, ctx) => {
    const issue = (message: string, path: string[] = []) => ctx.addIssue({ code: "custom", message, path });

    for (const f of PROVENANCE_FIELDS) {
      if (!p.provenance[f]) issue(`provenance.${f} must be "sourced" or "assumption"`, ["provenance"]);
    }
    if (p.isMock !== (p.dataStatus === "mock")) issue("isMock must be true exactly when dataStatus is mock", ["isMock"]);

    const anySourced = PROVENANCE_FIELDS.some((f) => p.provenance[f] === "sourced");
    if (p.dataStatus === "mock") {
      if (anySourced) issue("Mock records can't claim sourced fields", ["provenance"]);
      if (p.lastVerifiedAt !== null) issue("Mock records are never verified", ["lastVerifiedAt"]);
      if (p.source.url) issue("Mock records must not point at a source URL", ["source"]);
    }
    if (p.dataStatus === "verified") {
      if (!p.source.url) issue("Verified records need a source URL", ["source"]);
      if (!p.lastVerifiedAt) issue("Verified records need a last verified date", ["lastVerifiedAt"]);
      if (!anySourced) issue("Verified records need at least one sourced field", ["provenance"]);
      for (const r of p.revisions) if (!r.approvedBy) issue("Verified records need an approver on every revision", ["revisions"]);
    }
  });

export type Property = z.infer<typeof propertySchema>;

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  residential: "Residential",
  commercial: "Commercial",
  multifamily: "Multifamily",
};

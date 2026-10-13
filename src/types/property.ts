import { z } from "zod";

export const ASSET_TYPES = ["residential", "commercial", "multifamily"] as const;
export type AssetType = (typeof ASSET_TYPES)[number];

/**
 * All rates are decimals (0.065 = 6.5%). All money is whole US dollars (USD).
 * Every record is synthetic: `isMock` must be literally true.
 */
export const propertySchema = z.object({
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
  isMock: z.literal(true),
});

export type Property = z.infer<typeof propertySchema>;

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  residential: "Residential",
  commercial: "Commercial",
  multifamily: "Multifamily",
};

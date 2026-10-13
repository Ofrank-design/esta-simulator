import { z } from "zod";

export const MAINTENANCE_MODES = ["fixed", "inflation-adjusted"] as const;
export const DISTRIBUTION_MODES = ["payout", "reinvest"] as const;

/** Rates are decimals (0.065 = 6.5%). Money is USD. Zod rejects NaN and Infinity. */
export const projectionInputsSchema = z
  .object({
    years: z.number().int().min(1).max(30),
    propertyValue: z.number().positive(),
    investment: z.number().min(0),
    grossYield: z.number().min(0).max(0.2),
    occupancy: z.number().min(0).max(1),
    opexRatio: z.number().min(0).max(1),
    maintenance: z.number().min(0),
    maintenanceMode: z.enum(MAINTENANCE_MODES),
    inflation: z.number().min(0).max(0.2),
    appreciation: z.number().min(-0.1).max(0.2),
    saleCostRate: z.number().min(0).max(0.2),
    distributionMode: z.enum(DISTRIBUTION_MODES),
  })
  .refine((d) => d.investment <= d.propertyValue, {
    message: "Investment cannot exceed the property value",
    path: ["investment"],
  });

export type ProjectionInputs = z.infer<typeof projectionInputsSchema>;
export type MaintenanceMode = (typeof MAINTENANCE_MODES)[number];
export type DistributionMode = (typeof DISTRIBUTION_MODES)[number];

export type ValidationResult =
  | { ok: true; data: ProjectionInputs }
  | { ok: false; errors: string[] };

export function validateInputs(raw: unknown): ValidationResult {
  const parsed = projectionInputsSchema.safeParse(raw);
  if (parsed.success) return { ok: true, data: parsed.data };
  return {
    ok: false,
    errors: parsed.error.issues.map((i) => `${i.path.join(".") || "input"}: ${i.message}`),
  };
}

import { z } from "zod";

export const MAINTENANCE_MODES = ["fixed", "inflation-adjusted"] as const;
export const DISTRIBUTION_MODES = ["payout", "reinvest"] as const;

/**
 * What the engine accepts. The sliders use narrower ranges (see bounds.ts). The methodology page
 * reads these same numbers, so the documentation can't drift from the code.
 */
export const ENGINE_LIMITS = {
  years: { min: 1, max: 30 },
  grossYield: { min: 0, max: 0.2 },
  occupancy: { min: 0, max: 1 },
  opexRatio: { min: 0, max: 1 },
  inflation: { min: 0, max: 0.2 },
  appreciation: { min: -0.1, max: 0.2 },
  saleCostRate: { min: 0, max: 0.2 },
} as const;

/** Rates are decimals (0.065 = 6.5%). Money is USD. Zod rejects NaN and Infinity. */
export const projectionInputsSchema = z
  .object({
    years: z.number().int().min(ENGINE_LIMITS.years.min).max(ENGINE_LIMITS.years.max),
    propertyValue: z.number().positive(),
    investment: z.number().min(0),
    grossYield: z.number().min(ENGINE_LIMITS.grossYield.min).max(ENGINE_LIMITS.grossYield.max),
    occupancy: z.number().min(ENGINE_LIMITS.occupancy.min).max(ENGINE_LIMITS.occupancy.max),
    opexRatio: z.number().min(ENGINE_LIMITS.opexRatio.min).max(ENGINE_LIMITS.opexRatio.max),
    maintenance: z.number().min(0),
    maintenanceMode: z.enum(MAINTENANCE_MODES),
    inflation: z.number().min(ENGINE_LIMITS.inflation.min).max(ENGINE_LIMITS.inflation.max),
    appreciation: z.number().min(ENGINE_LIMITS.appreciation.min).max(ENGINE_LIMITS.appreciation.max),
    saleCostRate: z.number().min(ENGINE_LIMITS.saleCostRate.min).max(ENGINE_LIMITS.saleCostRate.max),
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

import type { Property } from "@/types/property";
import { DEFAULT_INFLATION } from "@/lib/data/properties";
import { projectInvestment } from "./projections";
import type { ProjectionResult } from "./types";
import {
  BOUNDS,
  DEFAULT_INVESTMENT,
  DEFAULT_SALE_COST_RATE,
  clamp,
  cleanNumber,
  investmentBounds,
} from "./bounds";
import type { DistributionMode, MaintenanceMode, ProjectionInputs } from "./validation";

/** Everything the user can change in the simulator. */
export interface Assumptions {
  investment: number;
  inflation: number;
  occupancy: number;
  maintenance: number;
  grossYield: number;
  appreciation: number;
  opexRatio: number;
  saleCostRate: number;
  maintenanceMode: MaintenanceMode;
  distributionMode: DistributionMode;
}

export function defaultAssumptions(property: Property): Assumptions {
  const inv = investmentBounds(property.propertyValueAed, property.minInvestmentAed);
  return {
    investment: clamp(DEFAULT_INVESTMENT, inv.min, inv.max),
    inflation: DEFAULT_INFLATION,
    occupancy: property.occupancy,
    maintenance: property.annualMaintenanceAed,
    grossYield: property.grossYield,
    appreciation: property.appreciation,
    opexRatio: property.opexRatio,
    saleCostRate: DEFAULT_SALE_COST_RATE,
    maintenanceMode: "inflation-adjusted",
    distributionMode: "payout",
  };
}

export function toProjectionInputs(property: Property, a: Assumptions, years = 10): ProjectionInputs {
  return {
    years,
    propertyValue: property.propertyValueAed,
    investment: a.investment,
    grossYield: a.grossYield,
    occupancy: a.occupancy,
    opexRatio: a.opexRatio,
    maintenance: a.maintenance,
    maintenanceMode: a.maintenanceMode,
    inflation: a.inflation,
    appreciation: a.appreciation,
    saleCostRate: a.saleCostRate,
    distributionMode: a.distributionMode,
  };
}

export type ScenarioKind = "conservative" | "base" | "optimistic";

type ScenarioKey = "grossYield" | "occupancy" | "opexRatio" | "appreciation" | "inflation" | "maintenance";

/**
 * Explicit, additive changes to each assumption (rates in decimal points, maintenance in AED).
 * Shown to the user as-is. Results are clamped to slider bounds. No hidden multipliers.
 */
export const SCENARIO_DELTAS: Record<ScenarioKind, Record<ScenarioKey, number>> = {
  conservative: { grossYield: -0.01, occupancy: -0.08, opexRatio: 0.05, appreciation: -0.02, inflation: 0.01, maintenance: 500 },
  base: { grossYield: 0, occupancy: 0, opexRatio: 0, appreciation: 0, inflation: 0, maintenance: 0 },
  optimistic: { grossYield: 0.005, occupancy: 0.04, opexRatio: -0.03, appreciation: 0.015, inflation: -0.005, maintenance: -300 },
};

export const SCENARIO_LABELS: Record<ScenarioKind, string> = {
  conservative: "Conservative",
  base: "Base case",
  optimistic: "Optimistic",
};

export const SCENARIO_KEYS = ["conservative", "base", "optimistic"] as const satisfies readonly ScenarioKind[];

/** Applies a scenario to the property's own defaults. Keeps the user's investment and mode choices. */
export function applyScenario(property: Property, current: Assumptions, kind: ScenarioKind): Assumptions {
  const base = defaultAssumptions(property);
  const d = SCENARIO_DELTAS[kind];
  const set = (key: ScenarioKey) =>
    cleanNumber(clamp(base[key] + d[key], BOUNDS[key].min, BOUNDS[key].max));
  return {
    ...base,
    grossYield: set("grossYield"),
    occupancy: set("occupancy"),
    opexRatio: set("opexRatio"),
    appreciation: set("appreciation"),
    inflation: set("inflation"),
    maintenance: set("maintenance"),
    investment: current.investment,
    saleCostRate: current.saleCostRate,
    maintenanceMode: current.maintenanceMode,
    distributionMode: current.distributionMode,
  };
}

export interface ScenarioOutcome {
  kind: ScenarioKind;
  label: string;
  assumptions: Assumptions;
  result: ProjectionResult;
}

/** Runs all three presets for a property, keeping the user's investment, sale costs and modes. */
export function compareScenarios(property: Property, current: Assumptions): ScenarioOutcome[] {
  return SCENARIO_KEYS.map((kind) => {
    const assumptions = applyScenario(property, current, kind);
    return {
      kind,
      label: SCENARIO_LABELS[kind],
      assumptions,
      result: projectInvestment(toProjectionInputs(property, assumptions)),
    };
  });
}

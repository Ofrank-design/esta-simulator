import { propertySchema, type Property } from "@/types/property";

/**
 * Illustrative mock properties. None of these are verified, listed,
 * tokenized, or available for purchase. Values are not market data.
 *
 * CURRENCY: all money is US dollars (USD). The original mock values were in AED; they were
 * converted once on 2026-10-13 at the fixed AED/USD peg of 3.6725 and rounded to tidy numbers
 * (values to $5k, minimums to $100, maintenance to $25). Percentages were not changed.
 * There is no live exchange rate anywhere in the app.
 */
const RAW_PROPERTIES: Property[] = [
  {
    id: "marina-residence",
    name: "Marina Residence",
    city: "Dubai",
    country: "UAE",
    assetType: "residential",
    imageSrc: "/images/properties/marina-residence.webp",
    imageAlt: "Illustrative view of waterfront residential towers in Dubai Marina",
    propertyValueUsd: 490_000,
    minInvestmentUsd: 300,
    grossYield: 0.065,
    occupancy: 0.92,
    annualMaintenanceUsd: 325,
    opexRatio: 0.25,
    appreciation: 0.03,
    description: "A mock waterfront apartment building used to illustrate a residential scenario.",
    isMock: true,
  },
  {
    id: "business-district-tower",
    name: "Business District Tower",
    city: "Dubai",
    country: "UAE",
    assetType: "commercial",
    imageSrc: "/images/properties/business-district-tower.webp",
    imageAlt: "Illustrative glass commercial office tower",
    propertyValueUsd: 870_000,
    minInvestmentUsd: 700,
    grossYield: 0.07,
    occupancy: 0.9,
    annualMaintenanceUsd: 825,
    opexRatio: 0.28,
    appreciation: 0.035,
    description: "A mock office tower used to illustrate a commercial scenario.",
    isMock: true,
  },
  {
    id: "palm-garden-villas",
    name: "Palm Garden Villas",
    city: "Dubai",
    country: "UAE",
    assetType: "residential",
    imageSrc: "/images/properties/palm-garden-villas.webp",
    imageAlt: "Illustrative waterfront villa community with private pools",
    propertyValueUsd: 650_000,
    minInvestmentUsd: 400,
    grossYield: 0.058,
    occupancy: 0.94,
    annualMaintenanceUsd: 550,
    opexRatio: 0.22,
    appreciation: 0.03,
    description: "A mock villa community with lower yield and steadier occupancy assumptions.",
    isMock: true,
  },
  {
    id: "creek-harbour-offices",
    name: "Creek Harbour Offices",
    city: "Dubai",
    country: "UAE",
    assetType: "commercial",
    imageSrc: "/images/properties/creek-harbour-offices.webp",
    imageAlt: "Illustrative aerial view of an office tower beside a canal",
    propertyValueUsd: 1_225_000,
    minInvestmentUsd: 1_400,
    grossYield: 0.074,
    occupancy: 0.87,
    annualMaintenanceUsd: 1_225,
    opexRatio: 0.3,
    appreciation: 0.035,
    description: "A mock office building with higher yield and higher vacancy risk assumptions.",
    isMock: true,
  },
  {
    id: "al-barsha-apartments",
    name: "Al Barsha Apartments",
    city: "Dubai",
    country: "UAE",
    assetType: "multifamily",
    imageSrc: "/images/properties/multifamily-1.webp",
    imageAlt: "Illustrative multifamily apartment courtyard with pool",
    propertyValueUsd: 1_525_000,
    minInvestmentUsd: 500,
    grossYield: 0.069,
    occupancy: 0.93,
    annualMaintenanceUsd: 1_500,
    opexRatio: 0.26,
    appreciation: 0.028,
    description: "A mock multi-unit apartment block used to illustrate a multifamily scenario.",
    isMock: true,
  },
  {
    id: "jvc-residences",
    name: "Village Circle Residences",
    city: "Dubai",
    country: "UAE",
    assetType: "multifamily",
    imageSrc: "/images/properties/multifamily-2.webp",
    imageAlt: "Illustrative residential courtyard with lounge seating",
    propertyValueUsd: 1_060_000,
    minInvestmentUsd: 300,
    grossYield: 0.072,
    occupancy: 0.91,
    annualMaintenanceUsd: 1_025,
    opexRatio: 0.27,
    appreciation: 0.032,
    description: "A mock residential complex with a higher yield and moderate occupancy assumption.",
    isMock: true,
  },
];

/** Validated at module load: an invalid record fails fast. */
export const PROPERTIES: readonly Property[] = RAW_PROPERTIES.map((p) => propertySchema.parse(p));

export function getPropertyById(id: string): Property | undefined {
  return PROPERTIES.find((p) => p.id === id);
}

export const FALLBACK_IMAGE = "/images/placeholders/property-fallback.svg";
export const DEFAULT_INFLATION = 0.025;

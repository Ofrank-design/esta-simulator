import { PROPERTIES, getPropertyById } from "@/lib/data/properties";
import type { Property } from "@/types/property";
import type { Assumptions } from "@/lib/finance/assumptions";
import { encodeAssumptions, parseAssumptionsDetailed } from "@/lib/simulator/params";
import type { ParamGetter } from "@/lib/url";

export interface CompareParams {
  propertyId: string;
  /** The user's full, validated assumption set. Conservative and optimistic shift it; base IS it. */
  assumptions: Assumptions;
  notices: string[];
}

/** Compare links use the same format as simulator links, plus ?property=. Untrusted input, never throws. */
export function parseCompareParams(get: ParamGetter): CompareParams {
  const requested = get("property");
  const found = getPropertyById(requested ?? "");
  const property = found ?? PROPERTIES[0];
  const { assumptions, notices } = parseAssumptionsDetailed(get, property);
  if (requested && requested.trim() !== "" && !found) {
    notices.unshift(`We couldn't find a property called "${requested.slice(0, 40)}", so we're showing ${property.name}.`);
  }
  return { propertyId: property.id, assumptions, notices };
}

export function buildCompareHref(property: Property, assumptions: Assumptions): string {
  const q = encodeAssumptions(assumptions, property);
  return `/compare?property=${property.id}${q ? `&${q}` : ""}`;
}

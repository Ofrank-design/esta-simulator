"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PROPERTIES, getPropertyById } from "@/lib/data/properties";
import { ASSET_TYPE_LABELS } from "@/types/property";
import { formatAed } from "@/lib/format";
import { investmentBounds } from "@/lib/finance/bounds";
import { compareScenarios, defaultAssumptions } from "@/lib/finance/assumptions";
import { buildCompareHref, parseCompareParams, type CompareParams } from "@/lib/compare/params";
import { InvestmentSlider } from "./InvestmentSlider";
import { SegmentedControl } from "./SegmentedControl";
import { ScenarioComparisonTable } from "./ScenarioComparisonTable";
import { ScenarioOverlayChart } from "./ScenarioOverlayChart";

/** The URL is the single source of truth, so every comparison is shareable. */
export function CompareWorkspace() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const params = parseCompareParams((k) => search.get(k));
  const property = getPropertyById(params.propertyId) ?? PROPERTIES[0];
  const bounds = investmentBounds(property.propertyValueAed, property.minInvestmentAed);

  const outcomes = useMemo(
    () =>
      compareScenarios(property, {
        ...defaultAssumptions(property),
        investment: params.investment,
        distributionMode: params.distributionMode,
      }),
    [property, params.investment, params.distributionMode],
  );

  const go = (next: Partial<CompareParams>) => {
    const href = buildCompareHref({ ...params, ...next });
    router.replace(`${pathname}?${href.split("?")[1]}`, { scroll: false });
  };

  const changeProperty = (id: string) => {
    const p = getPropertyById(id);
    if (!p) return;
    // parseCompareParams clamps the investment to the new property's bounds
    go({ propertyId: id });
  };

  return (
    <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <section aria-labelledby="compare-controls" className="space-y-6 self-start rounded-lg border border-line bg-white p-5">
        <h2 id="compare-controls" className="text-xl">Compare</h2>
        <div>
          <label htmlFor="compare-property" className="text-sm font-medium text-ink">Property</label>
          <select
            id="compare-property"
            value={property.id}
            onChange={(e) => changeProperty(e.target.value)}
            className="mt-2 w-full rounded-md border border-line bg-white px-3 py-2 text-sm"
          >
            {PROPERTIES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({ASSET_TYPE_LABELS[p.assetType]})
              </option>
            ))}
          </select>
          <p className="num mt-1 text-xs text-muted">Illustrative value {formatAed(property.propertyValueAed)}. Mock data.</p>
        </div>
        <InvestmentSlider
          label="Initial token investment"
          value={params.investment}
          {...bounds}
          format={formatAed}
          onChange={(v) => go({ investment: v })}
          helper="Applied to all three scenarios."
        />
        <SegmentedControl
          legend="Distributions"
          value={params.distributionMode}
          onChange={(v) => go({ distributionMode: v })}
          options={[
            { value: "payout", label: "Paid out as cash" },
            { value: "reinvest", label: "Reinvested" },
          ]}
        />
        <p className="text-xs leading-relaxed text-muted">
          Each scenario starts from this property&apos;s own assumptions and adds the stated changes. To fine-tune one, open the simulator.
        </p>
      </section>

      <div className="space-y-6">
        <ScenarioComparisonTable outcomes={outcomes} reinvest={params.distributionMode === "reinvest"} />
        <section className="rounded-lg border border-line bg-white p-5">
          <ScenarioOverlayChart outcomes={outcomes} />
        </section>
      </div>
    </div>
  );
}

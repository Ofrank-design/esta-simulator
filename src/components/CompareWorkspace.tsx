"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PROPERTIES, getPropertyById } from "@/lib/data/properties";
import { ASSET_TYPE_LABELS } from "@/types/property";
import { formatPercent, formatUsd } from "@/lib/format";
import { clamp, investmentBounds } from "@/lib/finance/bounds";
import { compareScenarios, defaultAssumptions, type Assumptions } from "@/lib/finance/assumptions";
import { buildCompareHref, parseCompareParams } from "@/lib/compare/params";
import { changedFields, encodeAssumptions } from "@/lib/simulator/params";
import { InvestmentSlider } from "./InvestmentSlider";
import { SegmentedControl } from "./SegmentedControl";
import { ScenarioComparisonTable } from "./ScenarioComparisonTable";
import { ScenarioOverlayChart } from "./ScenarioOverlayChart";
import { NoticeBanner } from "./NoticeBanner";

/** The URL is the single source of truth, so every comparison is shareable. */
export function CompareWorkspace() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const params = parseCompareParams((k) => search.get(k));
  const property = getPropertyById(params.propertyId) ?? PROPERTIES[0];
  const current = params.assumptions;
  const defaults = defaultAssumptions(property);
  const bounds = investmentBounds(property.propertyValueUsd, property.minInvestmentUsd);
  const changed = changedFields(property, current);
  const [dismissed, setDismissed] = useState<string>("");
  const noticeKey = params.notices.join("|");

  const outcomes = compareScenarios(property, current);

  const go = (nextProperty: typeof property, next: Assumptions) => {
    const href = buildCompareHref(nextProperty, next);
    router.replace(`${pathname}?${href.split("?")[1]}`, { scroll: false });
  };

  const changeProperty = (id: string) => {
    const p = getPropertyById(id);
    if (!p) return;
    const b = investmentBounds(p.propertyValueUsd, p.minInvestmentUsd);
    // Property-specific values restart from the new property's defaults; the user's own choices carry over.
    go(p, {
      ...defaultAssumptions(p),
      investment: clamp(current.investment, b.min, b.max),
      saleCostRate: current.saleCostRate,
      maintenanceMode: current.maintenanceMode,
      distributionMode: current.distributionMode,
    });
  };

  const simulatorQuery = encodeAssumptions(current, property);
  const simulatorHref = `/simulator/${property.id}${simulatorQuery ? `?${simulatorQuery}` : ""}`;

  const summary: { label: string; value: string; changed: boolean }[] = [
    { label: "Starting investment", value: formatUsd(current.investment), changed: changed.has("investment") },
    { label: "Gross yield", value: formatPercent(current.grossYield, 1), changed: changed.has("grossYield") },
    { label: "Occupancy", value: formatPercent(current.occupancy, 0), changed: changed.has("occupancy") },
    { label: "Operating expenses", value: formatPercent(current.opexRatio, 0), changed: changed.has("opexRatio") },
    { label: "Maintenance", value: `${formatUsd(current.maintenance)} a year`, changed: changed.has("maintenance") || changed.has("maintenanceMode") },
    { label: "Appreciation", value: formatPercent(current.appreciation, 1), changed: changed.has("appreciation") },
    { label: "Inflation", value: formatPercent(current.inflation, 1), changed: changed.has("inflation") },
    { label: "Sale costs", value: formatPercent(current.saleCostRate, 1), changed: changed.has("saleCostRate") },
  ];

  return (
    <div className="mt-8 space-y-6">
      {params.notices.length > 0 && dismissed !== noticeKey ? (
        <NoticeBanner notices={params.notices} onDismiss={() => setDismissed(noticeKey)} />
      ) : null}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <section aria-labelledby="compare-controls" className="space-y-6 self-start rounded-xl border border-line bg-white p-5">
          <h2 id="compare-controls" className="text-h3">What you&apos;re comparing</h2>
          <div>
            <label htmlFor="compare-property" className="text-sm font-semibold text-ink">Property</label>
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
            <p className="num mt-1 text-sm text-muted">Illustrative value {formatUsd(property.propertyValueUsd)}. Invented numbers, not a real listing.</p>
          </div>
          <InvestmentSlider
            label="Starting investment"
            value={current.investment}
            {...bounds}
            format={formatUsd}
            onChange={(v) => go(property, { ...current, investment: v })}
            helper="Used for all three scenarios."
            learnMore="ownership"
            startingValue={defaults.investment}
          />
          <SegmentedControl
            legend="Your share of the income"
            value={current.distributionMode}
            onChange={(v) => go(property, { ...current, distributionMode: v })}
            options={[
              { value: "payout", label: "Paid to you" },
              { value: "reinvest", label: "Reinvested" },
            ]}
          />

          <div className="border-t border-line pt-5">
            <h3 className="text-base font-bold">Your current assumptions</h3>
            <p className="mt-1 text-sm text-muted">
              The base case uses exactly these. Conservative and optimistic nudge them by the amounts shown in the table.{" "}
              <Link href="/methodology#presets" className="font-semibold text-accent-strong underline decoration-accent underline-offset-2 hover:text-midnight">
                What the presets change
              </Link>
            </p>
            <dl className="num mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {summary.map((s) => (
                <div key={s.label}>
                  <dt className="text-xs text-muted">
                    {s.label}
                    {s.changed ? <span className="ml-1 font-semibold text-accent-strong">(changed)</span> : null}
                  </dt>
                  <dd className="font-semibold text-ink">{s.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex flex-col gap-2 text-sm font-semibold">
              <Link href={simulatorHref} className="text-accent-strong underline decoration-accent underline-offset-4 hover:text-midnight">
                Adjust these in the simulator
              </Link>
              {changed.size > 0 ? (
                <Link href={`/compare?property=${property.id}`} className="text-accent-strong underline decoration-accent underline-offset-4 hover:text-midnight">
                  Start over with this property&apos;s defaults
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <ScenarioComparisonTable outcomes={outcomes} reinvest={current.distributionMode === "reinvest"} />
          <section className="rounded-xl border border-line bg-white p-5">
            <ScenarioOverlayChart outcomes={outcomes} />
          </section>
        </div>
      </div>
    </div>
  );
}

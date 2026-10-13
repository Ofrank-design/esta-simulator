"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Property } from "@/types/property";
import { formatAed, formatPercent, formatSignedPercent } from "@/lib/format";
import { BOUNDS, cleanNumber, investmentBounds } from "@/lib/finance/bounds";
import {
  applyScenario,
  defaultAssumptions,
  toProjectionInputs,
  type Assumptions,
  type ScenarioKind,
} from "@/lib/finance/assumptions";
import { safeProjectInvestment } from "@/lib/finance/projections";
import { InvestmentSlider } from "./InvestmentSlider";
import { SegmentedControl } from "./SegmentedControl";
import { ScenarioSelector } from "./ScenarioSelector";
import { PropertySummary } from "./PropertySummary";
import { FinancialMetricCard } from "./FinancialMetricCard";
import { AssumptionDisclosure } from "./AssumptionDisclosure";
import { ProjectionPanel } from "./ProjectionPanel";
import Link from "next/link";
import { buildCompareHref } from "@/lib/compare/params";
import { encodeAssumptions, matchScenario } from "@/lib/simulator/params";
import { replaceQuery } from "@/lib/url";
import { ErrorState } from "./ErrorState";

const pct1 = (v: number) => formatPercent(v, 1);
const pct0 = (v: number) => formatPercent(v, 0);

export function SimulatorWorkspace({
  property,
  initialAssumptions,
}: {
  property: Property;
  /** Already validated on the server from the URL (see parseAssumptions). */
  initialAssumptions: Assumptions;
}) {
  const defaults = useMemo(() => defaultAssumptions(property), [property]);
  const [a, setA] = useState<Assumptions>(initialAssumptions);
  // The active preset is derived from the values, so a shared link highlights the right one.
  const scenario = useMemo(() => matchScenario(property, a), [property, a]);

  // Keep the address bar in sync (debounced: browsers rate-limit history.replaceState).
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const timer = setTimeout(() => replaceQuery(encodeAssumptions(a, property)), 250);
    return () => clearTimeout(timer);
  }, [a, property]);

  const inv = investmentBounds(property.propertyValueAed, property.minInvestmentAed);

  const update = (patch: Partial<Assumptions>) => setA((prev) => ({ ...prev, ...patch }));
  const num = (key: keyof Assumptions) => (v: number) => update({ [key]: cleanNumber(v) });

  const projection = useMemo(
    () => safeProjectInvestment(toProjectionInputs(property, a)),
    [property, a],
  );

  const choosePreset = (kind: ScenarioKind) => setA((prev) => applyScenario(property, prev, kind));
  const reset = () => setA(defaults);

  const ownershipShare = projection.ok ? projection.result.ownershipShare : 0;
  const reinvest = a.distributionMode === "reinvest";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 pb-28 md:px-8 lg:pb-12">
      <h1 className="text-3xl md:text-[40px]">{property.name}</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Adjust the assumptions and see how a hypothetical investment could behave over 10 years. Results update as you move a slider.
      </p>

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* Left: property and controls */}
        <div className="space-y-6">
          <PropertySummary property={property} ownershipShare={ownershipShare} />

          <section aria-labelledby="controls-heading" className="space-y-6 rounded-lg border border-line bg-white p-5">
            <h2 id="controls-heading" className="text-xl">Assumptions</h2>
            <ScenarioSelector active={scenario} onSelect={choosePreset} onReset={reset} />

            <InvestmentSlider
              label="Initial token investment"
              value={a.investment}
              {...inv}
              format={formatAed}
              onChange={num("investment")}
              helper="The amount you put in. It buys a share of the property, not the whole property."
            />
            <InvestmentSlider
              label="Expected annual inflation"
              value={a.inflation}
              {...BOUNDS.inflation}
              format={pct1}
              onChange={num("inflation")}
              helper="Reduces what your money buys in future. It also raises maintenance costs when maintenance is inflation-adjusted."
            />
            <InvestmentSlider
              label="Average occupancy"
              value={a.occupancy}
              {...BOUNDS.occupancy}
              format={pct0}
              onChange={num("occupancy")}
              helper="Scales rental income in this simplified model. Real vacancies and costs don't scale this neatly."
            />
            <InvestmentSlider
              label="Annual maintenance fees"
              value={a.maintenance}
              {...BOUNDS.maintenance}
              format={formatAed}
              onChange={num("maintenance")}
              helper="Annual property-level cost, on top of operating expenses."
            />
            <SegmentedControl
              legend="Maintenance over time"
              value={a.maintenanceMode}
              onChange={(v) => update({ maintenanceMode: v })}
              options={[
                { value: "inflation-adjusted", label: "Rises with inflation" },
                { value: "fixed", label: "Fixed" },
              ]}
            />

            <div className="border-t border-line pt-6">
              <h3 className="text-base">Additional assumptions</h3>
              <p className="mt-1 text-xs text-muted">
                Four sliders aren&apos;t enough to model returns, so these are shown rather than hidden.
              </p>
              <div className="mt-5 space-y-6">
                <InvestmentSlider
                  label="Annual gross rental yield"
                  value={a.grossYield}
                  {...BOUNDS.grossYield}
                  format={pct1}
                  onChange={num("grossYield")}
                  helper="Yearly rent as a share of property value, before occupancy and costs."
                />
                <InvestmentSlider
                  label="Annual property appreciation"
                  value={a.appreciation}
                  {...BOUNDS.appreciation}
                  format={pct1}
                  onChange={num("appreciation")}
                  helper="Yearly change in property value. It can be negative. It is not profit until the asset is sold."
                />
                <InvestmentSlider
                  label="Operating expenses (% of collected rent)"
                  value={a.opexRatio}
                  {...BOUNDS.opexRatio}
                  format={pct0}
                  onChange={num("opexRatio")}
                  helper="Management, insurance and similar running costs."
                />
                <InvestmentSlider
                  label="Sale costs at exit"
                  value={a.saleCostRate}
                  {...BOUNDS.saleCostRate}
                  format={pct1}
                  onChange={num("saleCostRate")}
                  helper="Taken off the holding value when calculating total ROI."
                />
                <SegmentedControl
                  legend="Distributions"
                  value={a.distributionMode}
                  onChange={(v) => update({ distributionMode: v })}
                  options={[
                    { value: "payout", label: "Paid out as cash" },
                    { value: "reinvest", label: "Reinvested" },
                  ]}
                  helper="Reinvested distributions buy more of the property. They are not also counted as cash."
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right: results */}
        <div className="space-y-6">
          {!projection.ok ? (
            <ErrorState title="These assumptions can't be modelled" errors={projection.errors} />
          ) : (
            <Results result={projection.result} reinvest={reinvest} />
          )}
          <Link
            href={buildCompareHref({ propertyId: property.id, investment: a.investment, distributionMode: a.distributionMode })}
            className="block rounded-lg border border-line bg-white px-5 py-4 text-sm font-medium text-midnight hover:border-midnight"
          >
            Compare conservative, base and optimistic scenarios for this property
          </Link>
          <AssumptionDisclosure />
        </div>
      </div>

      {projection.ok ? (
        <div
          aria-hidden="true"
          className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-white/95 px-4 py-3 backdrop-blur lg:hidden"
        >
          <div className="num mx-auto flex max-w-7xl items-center justify-between text-sm">
            <span>
              <span className="block text-xs text-muted">Total economic value</span>
              <span className="font-semibold text-midnight">{formatAed(projection.result.summary.final.totalEconomicValue)}</span>
            </span>
            <span className="text-right">
              <span className="block text-xs text-muted">Total ROI</span>
              <span className={`font-semibold ${projection.result.summary.final.totalRoi < 0 ? "text-risk" : "text-growth"}`}>
                {formatSignedPercent(projection.result.summary.final.totalRoi)}
              </span>
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Results({
  result,
  reinvest,
}: {
  result: Extract<ReturnType<typeof safeProjectInvestment>, { ok: true }>["result"];
  reinvest: boolean;
}) {
  const { summary, inputs } = result;
  const first = summary.firstYear;
  const final = summary.final;
  const years = final.year;

  return (
    <>
      <section aria-labelledby="year1-heading">
        <h2 id="year1-heading" className="text-xl">Year 1</h2>
        <dl className="mt-3 grid gap-4 sm:grid-cols-2">
          <FinancialMetricCard
            label="Net operating cash flow (whole property)"
            value={formatAed(first.netCashFlow)}
            detail="Collected rent minus operating expenses and maintenance, before your share."
            tone={first.netCashFlow < 0 ? "negative" : "neutral"}
          />
          <FinancialMetricCard
            label="Your distribution"
            value={formatAed(first.distributionEarned)}
            detail={`${formatPercent(first.cashOnCashReturn, 2)} cash-on-cash on ${formatAed(inputs.investment)} invested.`}
            tone={first.distributionEarned < 0 ? "negative" : "positive"}
          />
        </dl>
      </section>

      <ProjectionPanel rows={result.rows} mode={inputs.distributionMode} />

      <section aria-labelledby="year10-heading">
        <h2 id="year10-heading" className="text-xl">After {years} years</h2>
        <p className="mt-1 text-sm text-muted">Assumes a sale at the end of year {years}. All figures are hypothetical.</p>
        <dl className="mt-3 grid gap-4 sm:grid-cols-2">
          <FinancialMetricCard
            label="Value of your holding"
            value={formatAed(final.holdingValue)}
            detail={`Cost basis ${formatAed(final.costBasis)}${reinvest ? ", including reinvested distributions" : ""}.`}
          />
          <FinancialMetricCard
            label="Capital appreciation"
            value={formatAed(final.capitalAppreciation)}
            detail="Unrealized until the asset is sold."
            tone={final.capitalAppreciation < 0 ? "negative" : "positive"}
          />
          <FinancialMetricCard
            label={reinvest ? "Distributions reinvested" : "Cumulative cash distributions"}
            value={formatAed(reinvest ? final.cumulativeReinvested : final.cumulativeCashDistributions)}
            detail={reinvest ? "Added to your holding, not paid as cash." : "Paid to you over the holding period."}
            tone={(reinvest ? final.cumulativeReinvested : final.cumulativeCashDistributions) < 0 ? "negative" : "neutral"}
          />
          <FinancialMetricCard
            label="Total economic value"
            value={formatAed(final.totalEconomicValue)}
            detail="Holding value plus cash distributions, before sale costs."
          />
          <FinancialMetricCard
            label="Total ROI after sale costs"
            value={formatSignedPercent(final.totalRoi)}
            detail={`Profit on ${formatAed(inputs.investment)} invested, if sold at year ${years}.`}
            tone={final.totalRoi < 0 ? "negative" : "positive"}
          />
          <FinancialMetricCard
            label="Total economic value, inflation-adjusted"
            value={formatAed(final.realTotalEconomicValue)}
            detail="In today's purchasing power."
          />
        </dl>
      </section>

      <section aria-labelledby="real-heading" className="rounded-lg border border-line bg-white p-5">
        <h2 id="real-heading" className="text-xl">Your invested capital and inflation</h2>
        <p className="num mt-2 text-sm leading-relaxed text-muted">
          {formatAed(inputs.investment)} invested today would be worth{" "}
          <strong className="text-ink">{formatAed(summary.realInvestedCapital)}</strong> in today&apos;s purchasing power after{" "}
          {years} years at {formatPercent(inputs.inflation, 1)} inflation, if it earned nothing.
        </p>
      </section>
    </>
  );
}

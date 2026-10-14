"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Property } from "@/types/property";
import { formatPercent, formatSignedPercent, formatUsd } from "@/lib/format";
import { BOUNDS, cleanNumber, investmentBounds } from "@/lib/finance/bounds";
import {
  applyScenario,
  defaultAssumptions,
  toProjectionInputs,
  type Assumptions,
  type ScenarioKind,
} from "@/lib/finance/assumptions";
import { safeProjectInvestment, type SafeProjection } from "@/lib/finance/projections";
import { buildCompareHref } from "@/lib/compare/params";
import { encodeAssumptions, matchScenario } from "@/lib/simulator/params";
import { replaceQuery } from "@/lib/url";
import { InvestmentSlider } from "./InvestmentSlider";
import { SegmentedControl } from "./SegmentedControl";
import { ScenarioSelector } from "./ScenarioSelector";
import { PropertySummary } from "./PropertySummary";
import { FinancialMetricCard } from "./FinancialMetricCard";
import { AssumptionDisclosure } from "./AssumptionDisclosure";
import { ProjectionPanel } from "./ProjectionPanel";
import { ScenarioActions } from "./ScenarioActions";
import { NoticeBanner } from "./NoticeBanner";
import { ErrorState } from "./ErrorState";
import { IncludedPanel } from "./IncludedPanel";

const pct1 = (v: number) => formatPercent(v, 1);
const pct0 = (v: number) => formatPercent(v, 0);

export function SimulatorWorkspace({
  property,
  initialAssumptions,
  initialNotices = [],
  asOf,
}: {
  property: Property;
  /** Already validated on the server from the URL (see parseAssumptionsDetailed). */
  initialAssumptions: Assumptions;
  initialNotices?: string[];
  /** Today, as YYYY-MM-DD, read once on the server. */
  asOf: string;
}) {
  const defaults = useMemo(() => defaultAssumptions(property), [property]);
  const [a, setA] = useState<Assumptions>(initialAssumptions);
  const [notices, setNotices] = useState<string[]>(initialNotices);
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

  const inv = investmentBounds(property.propertyValueUsd, property.minInvestmentUsd);
  const update = (patch: Partial<Assumptions>) => setA((prev) => ({ ...prev, ...patch }));
  const num = (key: keyof Assumptions) => (v: number) => update({ [key]: cleanNumber(v) });

  const projection = useMemo(() => safeProjectInvestment(toProjectionInputs(property, a)), [property, a]);

  const choosePreset = (kind: ScenarioKind) => setA((prev) => applyScenario(property, prev, kind));
  const reset = () => {
    setA(defaults);
    setNotices([]);
  };

  const ok = projection.ok ? projection.result : null;
  const reinvest = a.distributionMode === "reinvest";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 pb-28 md:px-8 lg:pb-12">
      <h1>{property.name}</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Change the assumptions and the {ok?.inputs.years ?? 10} year projection updates as you go. These are hypothetical results from a simple model, not a forecast.
      </p>

      {notices.length > 0 ? (
        <div className="mt-6">
          <NoticeBanner notices={notices} onDismiss={() => setNotices([])} />
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* Left: property and controls */}
        <div className="space-y-6">
          <PropertySummary
            property={property}
            initialShare={ok?.summary.initialOwnership ?? 0}
            endingShare={reinvest && ok ? ok.summary.endingOwnership : undefined}
            horizonYears={ok?.inputs.years ?? 10}
            asOf={asOf}
          />

          <section aria-labelledby="controls-heading" className="space-y-6 rounded-xl border border-line bg-white p-5">
            <h2 id="controls-heading" className="text-h3">Assumptions</h2>
            <ScenarioSelector active={scenario} onSelect={choosePreset} onReset={reset} />

            <InvestmentSlider
              label="Starting investment"
              value={a.investment}
              learnMore="ownership"
              {...inv}
              format={formatUsd}
              onChange={num("investment")}
              helper="How much you put in. This buys a share of the property, not the whole thing."
              startingValue={defaults.investment}
            />
            <InvestmentSlider
              label="Inflation"
              value={a.inflation}
              learnMore="inflation"
              {...BOUNDS.inflation}
              format={pct1}
              onChange={num("inflation")}
              helper="How fast prices rise each year. It shrinks what your money can buy later, and it raises maintenance costs if you let maintenance rise with inflation."
              startingValue={defaults.inflation}
            />
            <InvestmentSlider
              label="Occupancy"
              value={a.occupancy}
              learnMore="property-income"
              {...BOUNDS.occupancy}
              format={pct0}
              onChange={num("occupancy")}
              helper="The share of the year the property is rented. At 90%, about five weeks a year sit empty. Real vacancies come in lumps, but this model spreads them evenly."
              startingValue={defaults.occupancy}
            />
            <InvestmentSlider
              label="Maintenance"
              value={a.maintenance}
              learnMore="property-income"
              {...BOUNDS.maintenance}
              format={formatUsd}
              onChange={num("maintenance")}
              helper="Yearly upkeep for the whole property, such as repairs and building fees. It comes on top of operating expenses."
              startingValue={defaults.maintenance}
            />
            <SegmentedControl
              legend="How maintenance changes over time"
              learnMore="property-income"
              value={a.maintenanceMode}
              onChange={(v) => update({ maintenanceMode: v })}
              options={[
                { value: "inflation-adjusted", label: "Rises with inflation" },
                { value: "fixed", label: "Stays the same" },
              ]}
            />

            <div className="border-t border-line pt-6">
              <h3 className="text-base font-bold">More assumptions</h3>
              <p className="mt-1 text-sm text-muted">
                These also drive the results, so they are shown here instead of being left hidden.
              </p>
              <div className="mt-5 space-y-6">
                <InvestmentSlider
                  label="Gross rental yield"
                  value={a.grossYield}
              learnMore="yields"
                  {...BOUNDS.grossYield}
                  format={pct1}
                  onChange={num("grossYield")}
                  helper="Yearly rent as a share of the property's value, before empty periods and costs."
                  startingValue={defaults.grossYield}
                />
                <InvestmentSlider
                  label="Property appreciation"
                  value={a.appreciation}
              learnMore="value-and-appreciation"
                  {...BOUNDS.appreciation}
                  format={pct1}
                  onChange={num("appreciation")}
                  helper="How much the property's value changes each year. It can be negative, and it only becomes profit if you sell."
                  startingValue={defaults.appreciation}
                />
                <InvestmentSlider
                  label="Operating expenses"
                  value={a.opexRatio}
              learnMore="property-income"
                  {...BOUNDS.opexRatio}
                  format={pct0}
                  onChange={num("opexRatio")}
                  helper="Running costs such as management and insurance, as a share of the rent actually collected."
                  startingValue={defaults.opexRatio}
                />
                <InvestmentSlider
                  label="Sale costs"
                  value={a.saleCostRate}
              learnMore="sale-costs-and-roi"
                  {...BOUNDS.saleCostRate}
                  format={pct1}
                  onChange={num("saleCostRate")}
                  helper="Fees paid when selling. They are taken off the value of your share in the profit and ROI figures."
                  startingValue={defaults.saleCostRate}
                />
                <SegmentedControl
                  legend="Your share of the income"
                  value={a.distributionMode}
                  onChange={(v) => update({ distributionMode: v })}
                  options={[
                    { value: "payout", label: "Paid to you" },
                    { value: "reinvest", label: "Reinvested" },
                  ]}
                  helper="Paid to you: income arrives as cash. Reinvested: income buys more of the property, up to 100% ownership. Anything beyond that is paid as cash."
                  learnMore="your-share-of-income"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right: results */}
        <div className="space-y-6">
          {!projection.ok ? (
            <ErrorState title="We couldn't run this projection" errors={projection.errors}>
              <button type="button" onClick={reset} className="mt-3 text-sm font-semibold text-accent-strong underline underline-offset-4">
                Reset to property defaults
              </button>
            </ErrorState>
          ) : (
            <Results result={projection.result} reinvest={reinvest} />
          )}
          <ScenarioActions property={property} assumptions={a} />
          <Link
            href={buildCompareHref(property, a)}
            className="block rounded-xl border border-line bg-white px-5 py-4 text-sm font-semibold text-midnight transition-colors hover:border-midnight"
          >
            Compare cautious, base and optimistic versions of these assumptions
          </Link>
          <AssumptionDisclosure />
        </div>
      </div>

      {ok ? (
        <div aria-hidden="true" className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-white/95 px-4 py-3 backdrop-blur print:hidden lg:hidden">
          <div className="num mx-auto flex max-w-7xl items-center justify-between text-sm">
            <span>
              <span className="block text-xs text-muted">Profit if sold</span>
              <span className="font-bold text-midnight">{formatUsd(ok.summary.final.totalProfit)}</span>
            </span>
            <span className="text-right">
              <span className="block text-xs text-muted">ROI if sold</span>
              <span className={`font-bold ${ok.summary.final.totalRoi < 0 ? "text-risk" : "text-growth"}`}>
                {formatSignedPercent(ok.summary.final.totalRoi)}
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
  result: Extract<SafeProjection, { ok: true }>["result"];
  reinvest: boolean;
}) {
  const { summary, inputs } = result;
  const first = summary.firstYear;
  const final = summary.final;
  const years = final.year;
  const contributed = final.totalContributedCapital;

  return (
    <>
      <section aria-labelledby="year1-heading">
        <h2 id="year1-heading" className="text-h3">Year 1</h2>
        <dl className="mt-3 grid gap-4 sm:grid-cols-2">
          <FinancialMetricCard
            label="Property income after costs"
            value={formatUsd(first.netCashFlow)}
            detail="Rent collected, minus running costs and maintenance. This is for the whole property, before your share."
            tone={first.netCashFlow < 0 ? "negative" : "neutral"}
          />
          <FinancialMetricCard
            label="Net cash yield"
            value={formatPercent(first.netCashYield, 2)}
            detail={`The gross rental yield is ${formatPercent(inputs.grossYield, 1)}. After empty periods, running costs and maintenance, the income is worth ${formatPercent(first.netCashYield, 2)} a year on the money you put in.`}
            tone={first.netCashYield < 0 ? "negative" : "neutral"}
          />
          {first.capitalCall > 0 ? (
            <FinancialMetricCard
              label="Capital call (extra money you contribute)"
              value={formatUsd(first.capitalCall)}
              detail="The property's income didn't cover its costs, so your share of the shortfall counts as new money from you. It isn't shown as a negative payout."
              tone="negative"
            />
          ) : reinvest ? (
            <FinancialMetricCard
              label="Distribution generated for you"
              value={formatUsd(first.distributionEarned)}
              detail={
                first.excessCashDistribution > 0
                  ? `${formatUsd(first.reinvestedDistribution)} reinvested and ${formatUsd(first.excessCashDistribution)} paid as cash because you reached 100% ownership.`
                  : `All of it is reinvested into more of the property. Nothing is paid to you as cash.`
              }
              tone="positive"
            />
          ) : (
            <FinancialMetricCard
              label="Cash distribution paid to you"
              value={formatUsd(first.cashDistribution)}
              detail={`A cash-on-cash yield of ${formatPercent(first.cashOnCashReturn, 2)} on the ${formatUsd(inputs.investment)} you put in.`}
              tone="positive"
            />
          )}
        </dl>
      </section>

      <ProjectionPanel rows={result.rows} mode={inputs.distributionMode} />

      <section aria-labelledby="final-heading">
        <h2 id="final-heading" className="text-h3">After {years} years</h2>
        <p className="mt-1 text-sm text-muted">Profit and ROI assume a sale at the end of year {years}. Everything here is hypothetical.</p>
        <dl className="mt-3 grid gap-4 sm:grid-cols-2">
          <FinancialMetricCard
            label="Value of your share"
            value={formatUsd(final.holdingValue)}
            detail={`What your share would be worth. It cost ${formatUsd(final.costBasis)}${reinvest ? ", including reinvested distributions" : ""}.`}
          />
          <FinancialMetricCard
            label="Property appreciation"
            value={formatUsd(final.capitalAppreciation)}
            detail="The change in value of your share. It isn't profit until you sell."
            tone={final.capitalAppreciation < 0 ? "negative" : "positive"}
          />
          {reinvest ? (
            <>
              <FinancialMetricCard
                label="Distributions reinvested"
                value={formatUsd(final.cumulativeReinvested)}
                detail={`Added to your share, ending at ${formatPercent(final.ownershipShare, 4)} ownership. Not paid to you as cash.`}
              />
              {final.cumulativeCashDistributions > 0 ? (
                <FinancialMetricCard
                  label="Cash paid at 100% ownership"
                  value={formatUsd(final.cumulativeCashDistributions)}
                  detail="Income that couldn't be reinvested because you already own the whole property."
                />
              ) : null}
            </>
          ) : (
            <FinancialMetricCard
              label="Cash distributions received"
              value={formatUsd(final.cumulativeCashDistributions)}
              detail="Paid to you over the holding period."
            />
          )}
          {final.cumulativeCapitalCalls > 0 ? (
            <FinancialMetricCard
              label="Capital calls (extra money contributed)"
              value={formatUsd(final.cumulativeCapitalCalls)}
              detail={`Added to your ${formatUsd(inputs.investment)} to make ${formatUsd(contributed)} contributed in total.`}
              tone="negative"
            />
          ) : null}
          <FinancialMetricCard
            label="Total value before sale costs"
            value={formatUsd(final.totalEconomicValue)}
            detail="Nominal: the value of your share plus all the cash you have received, in future dollars, before sale costs."
          />
          <FinancialMetricCard
            label="Profit if sold"
            value={formatUsd(final.totalProfit)}
            detail="Sale proceeds after sale costs, plus cash received, minus everything you contributed."
            tone={final.totalProfit < 0 ? "negative" : "positive"}
          />
          <FinancialMetricCard
            label="ROI if sold"
            value={formatSignedPercent(final.totalRoi)}
            detail={`Nominal, not adjusted for inflation. Profit divided by the ${formatUsd(contributed)} you contributed.`}
            tone={final.totalRoi < 0 ? "negative" : "positive"}
          />
          <FinancialMetricCard
            label="Total value in today's money"
            value={formatUsd(final.realTotalEconomicValue)}
            detail="Total value before sale costs, adjusted for inflation, so it reads in today's money."
          />
        </dl>
      </section>

      <IncludedPanel inputs={inputs} />

      <section aria-labelledby="real-heading" className="rounded-xl border border-line bg-white p-5">
        <h2 id="real-heading" className="text-h3">What inflation does to your starting investment</h2>
        <p className="num mt-2 max-w-prose text-sm leading-relaxed text-muted">
          {formatUsd(inputs.investment)} today would only buy about{" "}
          <strong className="text-ink">{formatUsd(summary.realInvestedCapital)}</strong> worth of goods after {years} years at{" "}
          {formatPercent(inputs.inflation, 1)} inflation, even if the money earned nothing.
        </p>
      </section>
    </>
  );
}

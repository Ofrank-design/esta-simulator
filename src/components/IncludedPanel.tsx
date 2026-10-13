import Link from "next/link";
import type { ProjectionInputs } from "@/lib/finance/validation";
import { formatPercent, formatUsd } from "@/lib/format";

/** Says plainly what the results above do and don't include, using the numbers currently set. */
export function IncludedPanel({ inputs }: { inputs: ProjectionInputs }) {
  const included = [
    `Rent after empty periods (${formatPercent(inputs.occupancy, 0)} occupancy).`,
    `Operating expenses (${formatPercent(inputs.opexRatio, 0)} of the rent collected).`,
    `Maintenance (${formatUsd(inputs.maintenance)} a year, ${inputs.maintenanceMode === "fixed" ? "staying the same" : "rising with inflation"}).`,
    `Sale costs (${formatPercent(inputs.saleCostRate, 1)} of what your share sells for), in the profit and ROI figures only.`,
    "Capital calls, if the property's income doesn't cover its costs. They count toward what you contributed.",
  ];
  const excluded = [
    "Taxes.",
    "Loans or financing.",
    "Platform, management and purchase fees.",
    "Uneven vacancies, large repairs and how long a sale takes.",
    "Market swings and changes in inflation.",
  ];
  return (
    <section aria-labelledby="included-heading" className="rounded-xl border border-line bg-white p-5">
      <h2 id="included-heading" className="text-h3">What these figures include</h2>
      <div className="mt-3 grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="text-sm font-bold text-ink">Included</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted">
            {included.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold text-ink">Not included</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted">
            {excluded.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted">
        Results are nominal unless a figure says &ldquo;today&apos;s money&rdquo;. They are hypothetical, not a forecast.{" "}
        <Link href="/methodology" className="font-semibold text-accent-strong underline decoration-accent underline-offset-2 hover:text-midnight">
          Read the full methodology
        </Link>
      </p>
    </section>
  );
}

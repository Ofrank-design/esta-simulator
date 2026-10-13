import type { Property } from "@/types/property";
import { ASSET_TYPE_LABELS } from "@/types/property";
import { formatPercent, formatUsd } from "@/lib/format";
import Link from "next/link";
import { describeProvenance } from "@/lib/data/provenance";
import { PropertyImage } from "./PropertyImage";

type Props = {
  property: Property;
  initialShare: number;
  /** Shown only when reinvesting, when it can differ from the initial share. */
  endingShare?: number;
  horizonYears: number;
};

export function PropertySummary({ property: p, initialShare, endingShare, horizonYears }: Props) {
  return (
    <section aria-labelledby="property-summary-heading" className="overflow-hidden rounded-xl border border-line bg-white">
      <div className="relative aspect-[16/9] bg-surface">
        <PropertyImage src={p.imageSrc} alt={p.imageAlt} priority sizes="(min-width: 1024px) 420px, 100vw" className="object-cover" />
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-muted">Illustrative property</span>
      </div>
      <div className="p-5">
        <h2 id="property-summary-heading" className="text-h3">
          {p.name}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {p.city}, {p.country} · {ASSET_TYPE_LABELS[p.assetType]}
        </p>

        <dl className="num mt-4 grid grid-cols-2 gap-4 border-t border-line pt-4 text-sm">
          <div>
            <dt className="text-xs text-muted">Property value (illustrative)</dt>
            <dd className="font-bold">{formatUsd(p.propertyValueUsd)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Initial ownership share</dt>
            <dd className="font-bold">{formatPercent(initialShare, 4)}</dd>
          </div>
          {endingShare !== undefined ? (
            <div className="col-span-2">
              <dt className="text-xs text-muted">Ending ownership share (after {horizonYears} years)</dt>
              <dd className="font-bold">{formatPercent(endingShare, 4)}</dd>
            </div>
          ) : null}
        </dl>

        <h3 className="mt-5 text-sm font-bold text-ink">Starting assumptions for this property</h3>
        <dl className="num mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <Row label="Gross yield" value={formatPercent(p.grossYield)} />
          <Row label="Occupancy" value={formatPercent(p.occupancy, 0)} />
          <Row label="Operating expenses" value={`${formatPercent(p.opexRatio, 0)} of rent`} />
          <Row label="Maintenance" value={`${formatUsd(p.annualMaintenanceUsd)} a year`} />
          <Row label="Appreciation" value={`${formatPercent(p.appreciation)} a year`} />
        </dl>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          These numbers are invented to show how the model behaves. They are not verified market statistics. Your starting investment buys a share of the property, not the whole property.
        </p>
        <ProvenanceDetails property={p} />
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-semibold text-ink">{value}</dd>
    </div>
  );
}

function ProvenanceDetails({ property: p }: { property: Property }) {
  const info = describeProvenance(p);
  return (
    <details className="mt-4 rounded-lg border border-line bg-surface px-4 py-3 text-sm">
      <summary className="cursor-pointer font-semibold text-midnight">About this property&apos;s data</summary>
      <dl className="mt-3 space-y-2">
        <div><dt className="text-xs text-muted">Data status</dt><dd className="font-semibold text-ink">{info.status}</dd></div>
        <div><dt className="text-xs text-muted">Source</dt><dd className="font-semibold text-ink">{info.source}</dd></div>
        <div><dt className="text-xs text-muted">Last verified</dt><dd className="font-semibold text-ink">{info.verified}</dd></div>
        <div><dt className="text-xs text-muted">Inputs</dt><dd className="font-semibold text-ink">{info.inputs}</dd></div>
        <div><dt className="text-xs text-muted">Currency</dt><dd className="font-semibold text-ink">{p.currency}</dd></div>
        <div><dt className="text-xs text-muted">Record last changed</dt><dd className="font-semibold text-ink">{p.dataUpdatedAt}</dd></div>
      </dl>
      <p className="mt-3 text-muted">
        <Link href="/methodology#sample-data" className="font-semibold text-accent-strong underline decoration-accent underline-offset-2 hover:text-midnight">
          How sample data is labelled
        </Link>
      </p>
    </details>
  );
}

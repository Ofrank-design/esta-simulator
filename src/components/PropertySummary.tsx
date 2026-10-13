import type { Property } from "@/types/property";
import { ASSET_TYPE_LABELS } from "@/types/property";
import { formatAed, formatPercent } from "@/lib/format";
import { PropertyImage } from "./PropertyImage";

export function PropertySummary({ property: p, ownershipShare }: { property: Property; ownershipShare: number }) {
  return (
    <section aria-labelledby="property-summary-heading" className="overflow-hidden rounded-lg border border-line bg-white">
      <div className="relative aspect-[16/9] bg-surface">
        <PropertyImage src={p.imageSrc} alt={p.imageAlt} priority sizes="(min-width: 1024px) 420px, 100vw" className="object-cover" />
        <span className="absolute right-3 top-3 rounded bg-white/90 px-2 py-1 text-xs text-muted">Mock data</span>
      </div>
      <div className="p-5">
        <h2 id="property-summary-heading" className="text-xl">
          {p.name}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {p.city}, {p.country} · {ASSET_TYPE_LABELS[p.assetType]}
        </p>
        <dl className="num mt-4 grid grid-cols-2 gap-4 border-t border-line pt-4 text-sm">
          <div>
            <dt className="text-xs text-muted">Illustrative property value</dt>
            <dd className="font-semibold">{formatAed(p.propertyValueAed)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Your modelled ownership share</dt>
            <dd className="font-semibold">{formatPercent(ownershipShare, 4)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          Invested capital is the amount you put in. It is not the property value. Your share is modelled as
          invested capital divided by property value.
        </p>
      </div>
    </section>
  );
}

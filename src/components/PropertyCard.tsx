import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { Property } from "@/types/property";
import { ASSET_TYPE_LABELS } from "@/types/property";
import { formatAed, formatAedCompact, formatPercent } from "@/lib/format";
import { PropertyImage } from "./PropertyImage";

export function PropertyCard({ property: p, priority = false }: { property: Property; priority?: boolean }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white shadow-sm transition-shadow duration-200 focus-within:ring-2 focus-within:ring-[#059669] hover:shadow-lg">
      <div className="relative aspect-[16/10] overflow-hidden bg-surface">
        <PropertyImage
          src={p.imageSrc}
          alt={p.imageAlt}
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-midnight">
          {ASSET_TYPE_LABELS[p.assetType]}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs text-muted">Mock data</span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-lg font-bold">
          <Link href={`/simulator/${p.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {p.name}
          </Link>
        </h2>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted">
          <MapPin aria-hidden className="size-3.5 text-accent-strong" />
          {p.city}, {p.country}
        </p>

        <dl className="num mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4">
          <div>
            <dd className="text-base font-bold text-growth">{formatPercent(p.grossYield)}</dd>
            <dt className="text-[11px] leading-tight text-muted">Gross yield</dt>
          </div>
          <div>
            <dd className="text-base font-bold text-ink">{formatPercent(p.appreciation)}</dd>
            <dt className="text-[11px] leading-tight text-muted">Assumed growth</dt>
          </div>
          <div>
            <dd className="text-base font-bold text-ink">{formatAedCompact(p.propertyValueAed)}</dd>
            <dt className="text-[11px] leading-tight text-muted">Property value</dt>
          </div>
        </dl>
        <p className="num mt-3 text-xs text-muted">Minimum investment {formatAed(p.minInvestmentAed)}</p>

        <p className="mt-4 flex items-center justify-center gap-2 rounded-md bg-midnight px-4 py-2.5 text-sm font-semibold text-white transition-colors group-hover:bg-[#12335f]">
          Open simulator <ArrowRight aria-hidden className="size-4" />
        </p>
      </div>
    </article>
  );
}

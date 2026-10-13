"use client";

import { useMemo, useState } from "react";
import type { Property } from "@/types/property";
import { encodeListParams, filterAndSort, type SortKey, type TypeFilter } from "@/lib/properties/query";
import { replaceQuery } from "@/lib/url";
import { PropertyCard } from "./PropertyCard";
import { PropertyFilters } from "./PropertyFilters";
import { EmptyState } from "./EmptyState";

export function PropertyGrid({
  properties,
  initialType = "all",
  initialSort = "default",
}: {
  properties: readonly Property[];
  initialType?: TypeFilter;
  initialSort?: SortKey;
}) {
  const [type, setTypeState] = useState<TypeFilter>(initialType);
  const [sort, setSortState] = useState<SortKey>(initialSort);

  const setType = (next: TypeFilter) => {
    setTypeState(next);
    replaceQuery(encodeListParams(next, sort));
  };
  const setSort = (next: SortKey) => {
    setSortState(next);
    replaceQuery(encodeListParams(type, next));
  };

  const visible = useMemo(() => filterAndSort(properties, type, sort), [properties, type, sort]);

  return (
    <section aria-labelledby="properties-heading">
      <h3 id="properties-heading" className="sr-only">
        Illustrative properties
      </h3>
      <PropertyFilters type={type} sort={sort} onTypeChange={setType} onSortChange={setSort} />

      <p role="status" aria-live="polite" className="num mt-6 text-sm text-muted">
        {visible.length} {visible.length === 1 ? "property" : "properties"} shown
      </p>

      {visible.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No properties match that filter">
            <p className="mb-3">Try a different property type, or clear the filter.</p>
            <button type="button" onClick={() => setType("all")} className="font-medium text-midnight underline decoration-accent underline-offset-4">
              Show all properties
            </button>
          </EmptyState>
        </div>
      ) : (
        <ul className="mt-4 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((p, i) => (
            <li key={p.id}>
              <PropertyCard property={p} priority={i < 3} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

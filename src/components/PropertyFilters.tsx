"use client";

import { ASSET_TYPES, ASSET_TYPE_LABELS } from "@/types/property";
import { SORT_OPTIONS, type SortKey, type TypeFilter } from "@/lib/properties/query";

type Props = {
  type: TypeFilter;
  sort: SortKey;
  onTypeChange: (type: TypeFilter) => void;
  onSortChange: (sort: SortKey) => void;
};

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  ...ASSET_TYPES.map((t) => ({ value: t as TypeFilter, label: ASSET_TYPE_LABELS[t] })),
];

export function PropertyFilters({ type, sort, onTypeChange, onSortChange }: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <fieldset>
        <legend className="mb-2 text-sm text-muted">Property type</legend>
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((o) => {
            const active = o.value === type;
            return (
              <button
                key={o.value}
                type="button"
                aria-pressed={active}
                onClick={() => onTypeChange(o.value)}
                className={
                  "rounded-full border px-4 py-1.5 text-sm transition-colors " +
                  (active
                    ? "border-midnight bg-midnight text-white"
                    : "border-line bg-white text-ink hover:border-midnight")
                }
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="property-sort" className="mb-2 block text-sm text-muted">
          Sort by
        </label>
        <select
          id="property-sort"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
          className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink sm:w-52"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

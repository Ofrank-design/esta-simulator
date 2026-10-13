"use client";

import { useState } from "react";
import type { ProjectionRow } from "@/lib/finance/types";
import type { DistributionMode } from "@/lib/finance/validation";
import { ProjectionChart } from "./ProjectionChart";
import { AnnualProjectionTable } from "./AnnualProjectionTable";
import { SegmentedControl } from "./SegmentedControl";

export function ProjectionPanel({ rows, mode }: { rows: readonly ProjectionRow[]; mode: DistributionMode }) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const years = rows[rows.length - 1].year;
  return (
    <section aria-labelledby="projection-heading" className="rounded-xl border border-line bg-white p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="projection-heading" className="text-h3">Your {years} year projection</h2>
        <div className="w-56">
          <SegmentedControl
            legend="View"
            value={view}
            onChange={setView}
            options={[
              { value: "chart", label: "Chart" },
              { value: "table", label: "Table" },
            ]}
          />
        </div>
      </div>
      <div className="mt-5">
        {view === "chart" ? <ProjectionChart rows={rows} mode={mode} /> : <AnnualProjectionTable rows={rows} reinvest={mode === "reinvest"} />}
      </div>
      <p className="mt-4 text-sm text-muted">These are hypothetical results. Year 0 is the day of purchase, before any rent has been earned.</p>
    </section>
  );
}

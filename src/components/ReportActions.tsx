"use client";

import { useState } from "react";
import Link from "next/link";
import type { Property } from "@/types/property";
import type { Assumptions } from "@/lib/finance/assumptions";
import { buildScenarioCsv, downloadTextFile, scenarioFileName } from "@/lib/export/csv";

const btn = "rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-midnight transition-colors hover:border-midnight";

export function ReportActions({ property, assumptions, backHref }: { property: Property; assumptions: Assumptions; backHref: string }) {
  const [message, setMessage] = useState("");
  return (
    <div className="print:hidden">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => window.print()} className={btn}>Print or save as PDF</button>
        <button
          type="button"
          onClick={() => {
            try {
              downloadTextFile(scenarioFileName(property, "csv"), buildScenarioCsv(property, assumptions, new Date()));
              setMessage("CSV downloaded.");
            } catch {
              setMessage("We couldn't create the CSV. Try again.");
            }
          }}
          className={btn}
        >
          Download CSV
        </button>
        <Link href={backHref} className="text-sm font-semibold text-accent-strong underline decoration-accent underline-offset-4 hover:text-midnight">
          Back to the simulator
        </Link>
      </div>
      <p aria-live="polite" className="mt-2 text-sm text-muted">{message}</p>
    </div>
  );
}

/** The time is read on the reader's device, so it shows their local time. */
export function GeneratedAt() {
  const [now] = useState(() => new Date());
  return (
    <time dateTime={now.toISOString()} suppressHydrationWarning>
      {now.toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}
    </time>
  );
}

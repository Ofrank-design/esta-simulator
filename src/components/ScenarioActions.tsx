"use client";

import { useState } from "react";
import type { Property } from "@/types/property";
import type { Assumptions } from "@/lib/finance/assumptions";
import { buildScenarioCsv, downloadTextFile, scenarioFileName } from "@/lib/export/csv";
import { encodeAssumptions } from "@/lib/simulator/params";
import { currentScenarioUrl } from "@/lib/url";

type Status = { kind: "idle" } | { kind: "ok"; text: string } | { kind: "error"; text: string; url?: string };

const btn =
  "rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-midnight transition-colors hover:border-midnight";

export function reportHref(property: Property, a: Assumptions): string {
  const q = encodeAssumptions(a, property);
  return `/simulator/${property.id}/report${q ? `?${q}` : ""}`;
}

export function ScenarioActions({ property, assumptions }: { property: Property; assumptions: Assumptions }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const copyLink = async () => {
    const url = currentScenarioUrl(encodeAssumptions(assumptions, property));
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(url);
      setStatus({ kind: "ok", text: "Link copied. Anyone who opens it sees these exact assumptions." });
    } catch {
      setStatus({ kind: "error", text: "We couldn't copy the link automatically. Copy it from the box below instead.", url });
    }
  };

  const downloadCsv = () => {
    try {
      downloadTextFile(scenarioFileName(property, "csv"), buildScenarioCsv(property, assumptions, new Date()));
      setStatus({ kind: "ok", text: "CSV downloaded. It uses the assumptions shown on this page." });
    } catch {
      setStatus({ kind: "error", text: "We couldn't create the CSV. Try again, or reset the assumptions." });
    }
  };

  return (
    <section aria-labelledby="actions-heading" className="rounded-xl border border-line bg-white p-5">
      <h2 id="actions-heading" className="text-h3">Keep this scenario</h2>
      <p className="mt-1 max-w-prose text-sm text-muted">
        Copy a link to these exact assumptions, or take the numbers with you. Every export is marked as illustrative.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={copyLink} className={btn}>Copy scenario link</button>
        <a href={reportHref(property, assumptions)} target="_blank" rel="noopener" className={btn}>
          Open printable report
        </a>
        <button type="button" onClick={downloadCsv} className={btn}>Download CSV</button>
      </div>
      <div aria-live="polite" className="mt-3 text-sm">
        {status.kind === "ok" ? <p className="font-medium text-growth">{status.text}</p> : null}
        {status.kind === "error" ? (
          <div>
            <p className="font-medium text-risk">{status.text}</p>
            {status.url ? (
              <input
                readOnly
                value={status.url}
                aria-label="Scenario link"
                onFocus={(e) => e.currentTarget.select()}
                className="mt-2 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm"
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

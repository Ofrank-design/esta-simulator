"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ScenarioOutcome } from "@/lib/finance/assumptions";
import { formatUsd, formatSignedPercent } from "@/lib/format";

const STYLE = {
  conservative: { stroke: "#B91C1C", dash: "6 3" },
  base: { stroke: "#0B2545", dash: undefined },
  optimistic: { stroke: "#047857", dash: "2 3" },
} as const;

const compact = (v: number) => {
  const abs = Math.abs(v);
  const sign = v < 0 ? "\u2212" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}k`;
  return `${sign}$${abs}`;
};

export function ScenarioOverlayChart({ outcomes }: { outcomes: ScenarioOutcome[] }) {
  const data = outcomes[0].result.rows.map((row, i) => {
    const point: Record<string, number> = { year: row.year };
    for (const o of outcomes) point[o.kind] = o.result.rows[i].totalProfit;
    return point;
  });
  const summary =
    `Profit if sold after ${outcomes[0].result.inputs.years} years: ` +
    outcomes
      .map((o) => `${o.label} ${formatUsd(o.result.summary.final.totalProfit)} (${formatSignedPercent(o.result.summary.final.totalRoi)} ROI)`)
      .join("; ") +
    ".";

  return (
    <figure aria-label="Profit if sold, by scenario, in US dollars">
      <figcaption className="text-sm font-medium text-ink">Profit if sold, by scenario (USD)</figcaption>
      <p className="sr-only">{summary}</p>
      <div className="mt-3 h-72 md:h-80">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 640, height: 320 }}>
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 18, left: 4 }}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} label={{ value: "Year", position: "insideBottom", offset: -10, fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={compact} width={56} label={{ value: "USD", angle: -90, position: "insideLeft", fontSize: 12 }} />
            <Tooltip formatter={(v) => formatUsd(Number(v))} labelFormatter={(y) => `Year ${y}`} contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13 }} />
            <Legend verticalAlign="top" height={56} wrapperStyle={{ fontSize: 12 }} />
            {outcomes.map((o) => (
              <Line key={o.kind} type="monotone" dataKey={o.kind} name={o.label} stroke={STYLE[o.kind].stroke} strokeDasharray={STYLE[o.kind].dash} strokeWidth={2.5} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

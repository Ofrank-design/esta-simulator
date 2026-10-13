"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ProjectionRow } from "@/lib/finance/types";
import type { DistributionMode } from "@/lib/finance/validation";
import { buildChartData, describeProjection } from "@/lib/finance/presentation";
import { formatPercent, formatUsd } from "@/lib/format";

const COLORS = { midnight: "#0B2545", green: "#047857", blue: "#2563EB", red: "#B91C1C" } as const;

const compactUsd = (v: number) => {
  const abs = Math.abs(v);
  const sign = v < 0 ? "\u2212" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}k`;
  return `${sign}$${abs}`;
};

const tooltipStyle = { border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13 } as const;

export function ProjectionChart({ rows, mode }: { rows: readonly ProjectionRow[]; mode: DistributionMode }) {
  const data = buildChartData(rows);
  const summary = describeProjection(rows, mode);
  const payout = mode === "payout";
  const hasCalls = rows[rows.length - 1].cumulativeCapitalCalls > 0;

  return (
    <div className="space-y-8">
      <figure aria-label="Projection chart in US dollars">
        <figcaption className="text-sm font-semibold text-ink">Appreciation, distributions and profit (USD)</figcaption>
        <p className="sr-only">{summary}</p>
        <div className="mt-3 h-72 md:h-80">
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 640, height: 320 }}>
            <LineChart data={data} margin={{ top: 8, right: 12, bottom: 18, left: 4 }}>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} label={{ value: "Year", position: "insideBottom", offset: -10, fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={compactUsd} width={56} label={{ value: "USD", angle: -90, position: "insideLeft", fontSize: 12 }} />
              <Tooltip formatter={(v) => formatUsd(Number(v))} labelFormatter={(y) => `Year ${y}`} contentStyle={tooltipStyle} />
              <Legend verticalAlign="top" height={56} wrapperStyle={{ fontSize: 12 }} />
              <Line isAnimationActive={false} type="monotone" dataKey="capitalAppreciation" name="Property appreciation" stroke={COLORS.midnight} strokeWidth={2} dot={false} />
              {payout ? (
                <Line isAnimationActive={false} type="monotone" dataKey="cumulativeCashDistributions" name="Cash distributions to date" stroke={COLORS.green} strokeWidth={2} strokeDasharray="6 3" dot={false} />
              ) : (
                <Line isAnimationActive={false} type="monotone" dataKey="cumulativeReinvested" name="Reinvested distributions to date" stroke={COLORS.green} strokeWidth={2} strokeDasharray="6 3" dot={false} />
              )}
              {hasCalls ? (
                <Line isAnimationActive={false} type="monotone" dataKey="cumulativeCapitalCalls" name="Capital calls to date" stroke={COLORS.red} strokeWidth={2} strokeDasharray="2 3" dot={false} />
              ) : null}
              <Line isAnimationActive={false} type="monotone" dataKey="totalProfit" name="Profit if sold" stroke={COLORS.blue} strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </figure>

      <figure aria-label="ROI chart in percent">
        <figcaption className="text-sm font-semibold text-ink">ROI if sold at the end of each year (%)</figcaption>
        <p className="mt-1 text-sm text-muted">Shown on its own because it is a percentage, not a dollar amount. Sale costs are included, and year 0 is 0%.</p>
        <div className="mt-3 h-56 md:h-64">
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 640, height: 256 }}>
            <LineChart data={data} margin={{ top: 8, right: 12, bottom: 18, left: 4 }}>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} label={{ value: "Year", position: "insideBottom", offset: -10, fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatPercent(Number(v), 0)} width={56} />
              <Tooltip formatter={(v) => formatPercent(Number(v), 1)} labelFormatter={(y) => `Year ${y}`} contentStyle={tooltipStyle} />
              <Line isAnimationActive={false} type="monotone" dataKey="totalRoi" name="ROI if sold" stroke={COLORS.midnight} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </figure>
    </div>
  );
}

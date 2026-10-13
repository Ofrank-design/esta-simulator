type Props = {
  label: string;
  value: string;
  detail?: string;
  tone?: "neutral" | "positive" | "negative";
};

const TONE = { neutral: "text-midnight", positive: "text-growth", negative: "text-risk" } as const;

export function FinancialMetricCard({ label, value, detail, tone = "neutral" }: Props) {
  return (
    <div className="rounded-lg border border-line bg-white p-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className={`num mt-1 font-heading text-2xl font-bold ${TONE[tone]}`}>{value}</dd>
      {detail ? <dd className="mt-1 text-xs leading-relaxed text-muted">{detail}</dd> : null}
    </div>
  );
}

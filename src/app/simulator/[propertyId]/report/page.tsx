import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPropertyById } from "@/lib/data/properties";
import { ReportView } from "@/components/ReportView";
import { toProjectionInputs } from "@/lib/finance/assumptions";
import { projectInvestment } from "@/lib/finance/projections";
import { encodeAssumptions, parseAssumptionsDetailed } from "@/lib/simulator/params";
import { recordGetter, type SearchParamsRecord } from "@/lib/url";

type Props = {
  params: Promise<{ propertyId: string }>;
  searchParams: Promise<SearchParamsRecord>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { propertyId } = await params;
  const property = getPropertyById(propertyId);
  return { title: property ? `${property.name} scenario report` : "Report not found", robots: { index: false } };
}

export default function ReportPage({ params, searchParams }: Props) {
  return (
    <Suspense fallback={<p role="status" className="mx-auto max-w-4xl px-4 py-10 text-sm text-muted">Preparing your report…</p>}>
      <ReportContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function ReportContent({ params, searchParams }: Props) {
  const { propertyId } = await params;
  const property = getPropertyById(propertyId);
  if (!property) notFound();
  const { assumptions, notices } = parseAssumptionsDetailed(recordGetter(await searchParams), property);
  const result = projectInvestment(toProjectionInputs(property, assumptions));
  const q = encodeAssumptions(assumptions, property);
  return (
    <ReportView
      property={property}
      assumptions={assumptions}
      result={result}
      notices={notices}
      backHref={`/simulator/${property.id}${q ? `?${q}` : ""}`}
    />
  );
}

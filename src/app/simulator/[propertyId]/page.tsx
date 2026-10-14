import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PROPERTIES, getPropertyById } from "@/lib/data/properties";
import { SimulatorWorkspace } from "@/components/SimulatorWorkspace";
import { parseAssumptionsDetailed } from "@/lib/simulator/params";
import { recordGetter, type SearchParamsRecord } from "@/lib/url";
import { openGraphFor } from "@/lib/seo";

type Props = {
  params: Promise<{ propertyId: string }>;
  searchParams: Promise<SearchParamsRecord>;
};

export function generateStaticParams() {
  return PROPERTIES.map((p) => ({ propertyId: p.id }));
}

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { propertyId } = await params;
  const property = getPropertyById(propertyId);
  if (!property) return { title: "Property not found" };
  const description = `Model ten years of rent, costs and value changes for ${property.name}, a sample ${property.assetType} property. Invented numbers, hypothetical results.`;
  return {
    title: `${property.name} simulator`,
    description,
    openGraph: openGraphFor(`${property.name} simulator`, description),
  };
}

export default function SimulatorPage({ params, searchParams }: Props) {
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-6 md:px-8">
        <Link href="/" className="text-sm font-medium text-muted underline decoration-accent underline-offset-4 hover:text-midnight">
          Back to all properties
        </Link>
      </div>
      <Suspense fallback={<SimulatorSkeleton />}>
        <SimulatorContent params={params} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

/** Reads the URL on the server so the first paint already reflects shared assumptions. */
async function SimulatorContent({ params, searchParams }: Props) {
  const { propertyId } = await params;
  const property = getPropertyById(propertyId);
  if (!property) notFound();
  const { assumptions, notices } = parseAssumptionsDetailed(recordGetter(await searchParams), property);
  return <SimulatorWorkspace key={property.id} property={property} initialAssumptions={assumptions} initialNotices={notices} />;
}

function SimulatorSkeleton() {
  return (
    <div role="status" aria-busy="true" className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <span className="sr-only">Loading the simulator</span>
      <div className="h-10 w-72 rounded bg-white" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr]">
        <div className="h-[640px] rounded-lg bg-white" />
        <div className="h-[640px] rounded-lg bg-white" />
      </div>
    </div>
  );
}

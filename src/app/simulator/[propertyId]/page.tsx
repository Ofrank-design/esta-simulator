import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PROPERTIES, getPropertyById } from "@/lib/data/properties";
import { SimulatorWorkspace } from "@/components/SimulatorWorkspace";
import { parseAssumptions } from "@/lib/simulator/params";
import { recordGetter, type SearchParamsRecord } from "@/lib/url";

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
  return { title: property ? `${property.name} simulator` : "Property not found" };
}

export default function SimulatorPage({ params, searchParams }: Props) {
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-6 md:px-8">
        <Link href="/" className="text-sm text-muted underline decoration-accent underline-offset-4 hover:text-midnight">
          All properties
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
  const initialAssumptions = parseAssumptions(recordGetter(await searchParams), property);
  return <SimulatorWorkspace key={property.id} property={property} initialAssumptions={initialAssumptions} />;
}

function SimulatorSkeleton() {
  return (
    <div role="status" aria-busy="true" className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <span className="sr-only">Loading simulator</span>
      <div className="h-10 w-72 rounded bg-white" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr]">
        <div className="h-[640px] rounded-lg bg-white" />
        <div className="h-[640px] rounded-lg bg-white" />
      </div>
    </div>
  );
}

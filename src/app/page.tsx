import { Suspense } from "react";
import { PROPERTIES } from "@/lib/data/properties";
import { PropertyGrid } from "@/components/PropertyGrid";
import { Hero } from "@/components/Hero";
import { HowItWorksStrip } from "@/components/HowItWorksStrip";
import { parseListParams } from "@/lib/properties/query";
import { recordGetter, type SearchParamsRecord } from "@/lib/url";

export default function HomePage({ searchParams }: { searchParams: Promise<SearchParamsRecord> }) {
  return (
    <>
      <Hero />
      <section id="properties" aria-labelledby="featured-heading" className="mx-auto max-w-7xl scroll-mt-4 px-4 py-14 md:px-8">
        <h2 id="featured-heading">Sample properties to explore</h2>
        <p className="mt-2 max-w-2xl text-muted">
          Six invented properties with made up numbers, so you can see how the model behaves. None of them are real listings, and none are for sale.
        </p>
        <div className="mt-8">
          <Suspense fallback={<div role="status" aria-busy="true" className="h-[640px] rounded-xl bg-white/70"><span className="sr-only">Loading the properties</span></div>}>
            <FeaturedGrid searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
      <HowItWorksStrip />
    </>
  );
}

/** Reads ?type= and ?sort= on the server so shared links open already filtered. */
async function FeaturedGrid({ searchParams }: { searchParams: Promise<SearchParamsRecord> }) {
  const { type, sort } = parseListParams(recordGetter(await searchParams));
  return <PropertyGrid properties={PROPERTIES} initialType={type} initialSort={sort} />;
}

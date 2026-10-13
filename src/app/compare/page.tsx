import { Suspense } from "react";
import type { Metadata } from "next";
import { CompareWorkspace } from "@/components/CompareWorkspace";

export const metadata: Metadata = { title: "Compare scenarios" };

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <h1 className="text-3xl md:text-[40px]">Compare scenarios</h1>
      <p className="mt-2 max-w-2xl text-muted">
        See conservative, base and optimistic assumptions side by side, with the assumptions behind each result. All scenarios are hypothetical.
      </p>
      <Suspense fallback={<p className="mt-8 text-sm text-muted">Loading comparison…</p>}>
        <CompareWorkspace />
      </Suspense>
    </div>
  );
}

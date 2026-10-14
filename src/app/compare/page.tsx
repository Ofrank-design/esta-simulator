import { Suspense } from "react";
import type { Metadata } from "next";
import { CompareWorkspace } from "@/components/CompareWorkspace";

export const metadata: Metadata = {
  title: "Compare scenarios",
  description: "See a cautious, a base and an optimistic version of your assumptions side by side. Invented properties, hypothetical results.",
};

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <h1>Compare scenarios</h1>
      <p className="mt-2 max-w-2xl text-muted">
        See a cautious, a base and an optimistic version of your assumptions side by side. The base case is exactly what you set in the simulator. All results are hypothetical.
      </p>
      <Suspense fallback={<p role="status" className="mt-8 text-sm text-muted">Loading the comparison…</p>}>
        <CompareWorkspace />
      </Suspense>
    </div>
  );
}

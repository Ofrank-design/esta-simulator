import type { Metadata } from "next";
import { MethodologyView } from "@/components/MethodologyView";

export const metadata: Metadata = {
  title: "How the numbers are calculated",
  description:
    "The formulas, definitions, allowed ranges and exclusions behind every figure in ESTA Simulator, with a worked example. All results are hypothetical.",
};

export default function MethodologyPage() {
  return <MethodologyView />;
}

import { Calculator, Layers, SlidersHorizontal, ShieldCheck } from "lucide-react";

const STEPS = [
  { icon: SlidersHorizontal, title: "Pick a property", text: "Start with a sample property and its starting assumptions." },
  { icon: Calculator, title: "Change the assumptions", text: "Move the sliders for occupancy, costs, inflation and growth. The projection updates as you go." },
  { icon: Layers, title: "Compare outcomes", text: "Put a cautious, a base and an optimistic version side by side." },
  { icon: ShieldCheck, title: "Keep a copy", text: "Download a report or CSV, or copy a link to the exact scenario." },
];

export function HowItWorksStrip() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="mx-auto max-w-7xl scroll-mt-4 px-4 pb-16 md:px-8">
      <h2 id="how-heading" className="sr-only">How it works</h2>
      <ol className="grid gap-6 rounded-xl border border-line bg-white p-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent/15 text-accent-strong">
              <Icon aria-hidden className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-bold text-midnight">{title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-muted">{text}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

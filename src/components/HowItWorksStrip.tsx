import { Calculator, Layers, SlidersHorizontal, ShieldCheck } from "lucide-react";

const STEPS = [
  { icon: SlidersHorizontal, title: "Adjust Your Investment", text: "Use interactive sliders to fine-tune the assumptions." },
  { icon: Calculator, title: "See 10-Year Projections", text: "Track cash flow, appreciation and ROI as you change inputs." },
  { icon: Layers, title: "Compare Scenarios", text: "See conservative, base and optimistic cases side by side." },
  { icon: ShieldCheck, title: "Understand the Assumptions", text: "See exactly what drives each result, and what it leaves out." },
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
              <span className="mt-1 block text-xs leading-relaxed text-muted">{text}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, House, Play, ShieldCheck, TrendingUp } from "lucide-react";

const FEATURES = [
  { icon: House, title: "Fractional Ownership", text: "Model smaller investment amounts" },
  { icon: TrendingUp, title: "Real-Time Simulation", text: "See your potential returns" },
  { icon: Eye, title: "Transparent Assumptions", text: "Every input is visible" },
  { icon: ShieldCheck, title: "Illustrative Data", text: "Hypothetical results only" },
];

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden bg-midnight text-white">
      <Image
        src="/images/backgrounds/hero.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-[72%_center]"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-midnight/65 md:bg-transparent" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-midnight via-midnight/80 to-midnight/5 md:via-midnight/70" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-midnight/95 via-midnight/70 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 md:px-8 md:pb-12 md:pt-20">
        <p className="text-xs font-semibold tracking-[0.22em] text-white/90 md:text-sm">
          REAL ESTATE FRACTIONAL INVESTMENT SIMULATOR
        </p>
        <h1 id="hero-heading" className="mt-5 max-w-xl text-4xl leading-[1.1] text-white md:text-6xl">
          Own a Piece of
          <span className="block text-accent">Prime Real Estate</span>
        </h1>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-white/90 md:text-lg">
          Explore illustrative properties, simulate potential returns, and understand every assumption, all in one place.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/#properties"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-midnight transition-colors hover:bg-white"
          >
            Explore Properties <ArrowRight aria-hidden className="size-4" />
          </Link>
          <Link
            href="/#how-it-works"
            className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            <Play aria-hidden className="size-4" /> How It Works
          </Link>
        </div>
        <p className="mt-4 max-w-lg text-xs text-white/80">
          Conceptual simulator. Properties are mock data and results are hypothetical. This is not an offer to sell or invest.
        </p>

        <ul className="mt-12 grid gap-6 border-t border-white/15 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 text-accent">
                <Icon aria-hidden className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold">{title}</span>
                <span className="block text-xs text-white/80">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

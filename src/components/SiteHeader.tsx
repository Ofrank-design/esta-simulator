import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { NavLinks } from "./NavLinks";

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-white print:hidden">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-1 px-4 pt-3 md:px-8 md:py-3">
        <Link href="/" className="order-1 shrink-0">
          <Image
            src="/images/branding/esta-logo.png"
            alt="ESTA Simulator"
            width={129}
            height={40}
            priority
            className="h-10 w-auto"
          />
        </Link>
        <Suspense fallback={<div className="order-3 h-10 w-full md:order-2 md:w-[26rem]" aria-hidden="true" />}>
          <NavLinks />
        </Suspense>
        <Link
          href="/#properties"
          className="order-2 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-midnight transition-colors hover:bg-accent-strong hover:text-white md:order-3"
        >
          Get Started
        </Link>
      </div>
    </header>
  );
}

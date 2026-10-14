"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="mx-auto max-w-2xl px-4 py-20 text-center md:px-8">
      <h1>Something went wrong on our side</h1>
      <p className="mt-3 text-muted">
        The page couldn&apos;t load. Nothing you entered has been lost, because scenarios live in the address bar. Try again, or start from the sample properties.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        <button type="button" onClick={reset} className="rounded-lg bg-midnight px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#12335f]">
          Try again
        </button>
        <Link href="/#properties" className="text-sm font-semibold text-accent-strong underline decoration-accent underline-offset-4 hover:text-midnight">
          See the sample properties
        </Link>
      </div>
    </div>
  );
}

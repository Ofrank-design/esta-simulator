import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center md:px-8">
      <h1>We couldn&apos;t find that page</h1>
      <p className="mt-3 text-muted">
        The link may be mistyped, or it points to a property that isn&apos;t one of our samples. The sample properties are all on the home page.
      </p>
      <Link href="/#properties" className="mt-6 inline-block font-semibold text-midnight underline decoration-accent underline-offset-4">
        See the sample properties
      </Link>
    </div>
  );
}

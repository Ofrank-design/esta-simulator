import Link from "next/link";

export default function PropertyNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center md:px-8">
      <h1>We couldn&apos;t find that property</h1>
      <p className="mt-3 text-muted">That property ID isn&apos;t one of our sample properties. Pick one from the home page to open its simulator.</p>
      <Link href="/#properties" className="mt-6 inline-block font-semibold text-midnight underline decoration-accent underline-offset-4">
        See the sample properties
      </Link>
    </div>
  );
}

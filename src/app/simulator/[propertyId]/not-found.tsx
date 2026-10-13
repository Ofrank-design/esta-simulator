import Link from "next/link";

export default function PropertyNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center md:px-8">
      <h1 className="text-3xl">Property not found</h1>
      <p className="mt-3 text-muted">This property ID doesn&apos;t match any illustrative property.</p>
      <Link href="/" className="mt-6 inline-block font-medium text-midnight underline decoration-accent underline-offset-4">
        Back to all properties
      </Link>
    </div>
  );
}

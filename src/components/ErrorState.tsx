import type { ReactNode } from "react";

export function ErrorState({ title, errors, children }: { title: string; errors?: string[]; children?: ReactNode }) {
  return (
    <div role="alert" className="rounded-xl border border-risk/40 bg-white px-6 py-8">
      <h2 className="text-h3 text-risk">{title}</h2>
      {errors?.length ? (
        <>
          <p className="mt-2 text-sm text-muted">Here is what didn&apos;t work:</p>
          <ul className="mt-1 list-disc pl-5 text-sm text-muted">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </>
      ) : null}
      {children}
    </div>
  );
}

export function ErrorState({ title, errors }: { title: string; errors?: string[] }) {
  return (
    <div role="alert" className="rounded-lg border border-risk/40 bg-white px-6 py-8">
      <h2 className="text-xl text-risk">{title}</h2>
      {errors?.length ? (
        <ul className="mt-2 list-disc pl-5 text-sm text-muted">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

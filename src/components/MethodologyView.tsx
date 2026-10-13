import Link from "next/link";
import { MODEL_VERSION } from "@/lib/finance/projections";
import { methodologySections, type Block } from "@/lib/methodology";

function BlockView({ block }: { block: Block }) {
  switch (block.t) {
    case "p":
      return <p className="mt-4 leading-relaxed text-ink/90">{block.text}</p>;
    case "ul":
      return (
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-ink/90">
          {block.items.map((i) => <li key={i}>{i}</li>)}
        </ul>
      );
    case "formula":
      return (
        <pre
          tabIndex={0}
          role="region"
          aria-label="Formula, scrollable"
          className="mt-4 overflow-x-auto whitespace-pre rounded-lg border border-line bg-white p-4 font-mono text-[0.8125rem] leading-relaxed text-midnight"
        >
          {block.lines.join("\n")}
        </pre>
      );
    case "dl":
      return (
        <dl className="mt-4 space-y-4">
          {block.items.map((i) => (
            <div key={i.term}>
              <dt className="font-semibold text-ink">{i.term}</dt>
              <dd className="mt-1 leading-relaxed text-ink/90">{i.text}</dd>
            </div>
          ))}
        </dl>
      );
    case "table":
      return (
        <div role="region" aria-label={`${block.caption}, scrollable`} tabIndex={0} className="mt-4 overflow-x-auto rounded-lg border border-line bg-white">
          <table className="num w-full min-w-[34rem] text-left text-sm">
            <caption className="border-b border-line px-3 py-2 text-left text-xs font-semibold text-muted">{block.caption}</caption>
            <thead>
              <tr className="border-b border-line text-ink">
                {block.head.map((h) => <th key={h} scope="col" className="px-3 py-2 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((r) => (
                <tr key={r[0]} className="border-b border-line/60 align-top last:border-b-0">
                  {r.map((c, i) => i === 0
                    ? <th key={i} scope="row" className="px-3 py-2 font-semibold text-ink">{c}</th>
                    : <td key={i} className="px-3 py-2 text-ink/90">{c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export function MethodologyView() {
  const sections = methodologySections();
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold text-accent-strong">Methodology</p>
        <h1 className="mt-1">How the numbers are calculated</h1>
        <p className="mt-3 max-w-prose text-muted">
          Every figure in ESTA comes from the rules on this page. Nothing is estimated behind the scenes, and nothing here predicts the market. Model version {MODEL_VERSION}.
        </p>
        <p className="mt-2 text-sm text-muted">
          The same text is available as a file, <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">MODEL_METHODOLOGY.md</code>, in the project.
        </p>
      </header>

      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <div>
          <details className="rounded-lg border border-line bg-white px-4 py-3 lg:hidden">
            <summary className="cursor-pointer text-sm font-semibold text-midnight">On this page</summary>
            <nav aria-label="Sections, menu" className="mt-3">
              <ol className="space-y-2 text-sm">
                {sections.map((s) => (
                  <li key={s.id}><Link href={`/methodology#${s.id}`} className="text-ink/90 underline decoration-accent underline-offset-2 hover:text-midnight">{s.title}</Link></li>
                ))}
              </ol>
            </nav>
          </details>
          <nav aria-label="Sections" className="sticky top-6 hidden max-h-[calc(100vh-3rem)] overflow-y-auto lg:block">
            <p className="text-xs font-semibold text-muted">On this page</p>
            <ol className="mt-3 space-y-2 border-l border-line pl-4 text-sm">
              {sections.map((s) => (
                <li key={s.id}><Link href={`/methodology#${s.id}`} className="text-ink/80 hover:text-midnight hover:underline">{s.title}</Link></li>
              ))}
            </ol>
          </nav>
        </div>

        <article className="max-w-[46rem]">
          {sections.map((s) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-heading`} className="scroll-mt-6 border-b border-line pb-10 pt-2 first:pt-0 last:border-b-0 [&:not(:first-child)]:mt-10">
              <h2 id={`${s.id}-heading`}>{s.title}</h2>
              {s.blocks.map((b, i) => <BlockView key={i} block={b} />)}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}

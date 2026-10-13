"use client";

export function NoticeBanner({ notices, onDismiss }: { notices: string[]; onDismiss?: () => void }) {
  if (notices.length === 0) return null;
  return (
    <div role="status" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">We adjusted a few things from this link</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {notices.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
        {onDismiss ? (
          <button type="button" onClick={onDismiss} className="shrink-0 rounded px-2 py-1 text-sm font-semibold underline underline-offset-2">
            Dismiss
          </button>
        ) : null}
      </div>
    </div>
  );
}

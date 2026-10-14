"use client";

/** Last resort if the root layout itself fails. Plain markup, no dependencies. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#f1f5f9", color: "#1e293b", margin: 0 }}>
        <div role="alert" style={{ maxWidth: 560, margin: "0 auto", padding: "96px 16px", textAlign: "center" }}>
          <h1 style={{ color: "#0b2545" }}>Something went wrong on our side</h1>
          <p>The page couldn&apos;t load. Try again in a moment.</p>
          <button type="button" onClick={reset} style={{ background: "#0b2545", color: "#fff", border: 0, borderRadius: 8, padding: "10px 20px", fontWeight: 600, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { FEEDBACK_HREF } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy",
  description: "ESTA Simulator doesn't use accounts, cookies or analytics. Here is exactly what is and isn't collected.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-8">
      <h1>Privacy</h1>
      <p className="mt-3 text-muted">In short: ESTA doesn&apos;t ask who you are, and it doesn&apos;t track you.</p>

      <section className="mt-8" aria-labelledby="not-collected">
        <h2 id="not-collected">What ESTA doesn&apos;t do</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-ink/90">
          <li>There are no accounts or logins.</li>
          <li>It sets no cookies and uses no analytics, advertising or tracking scripts.</li>
          <li>It loads no fonts, images or scripts from other companies. Everything comes from this site.</li>
          <li>Your assumptions are worked out in your browser. Nothing you type into a slider is stored.</li>
        </ul>
      </section>

      <section className="mt-8" aria-labelledby="links">
        <h2 id="links">Links, reports and downloads</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-ink/90">
          <li>A scenario is saved only in the web address. Anyone who has the link can see those assumptions, so don&apos;t put anything personal into a link you share.</li>
          <li>The printable report is built from the assumptions in its address. The CSV is created in your browser and saved to your device.</li>
        </ul>
      </section>

      <section className="mt-8" aria-labelledby="hosting">
        <h2 id="hosting">What the host can see</h2>
        <p className="mt-3 leading-relaxed text-ink/90">
          Like any website, the company that hosts ESTA may keep standard server logs, such as the time of a visit, the page address (which includes any scenario settings in a link) and the visitor&apos;s IP address. ESTA doesn&apos;t read or use them for anything.
        </p>
      </section>

      <section className="mt-8" aria-labelledby="contact">
        <h2 id="contact">If you contact us</h2>
        <p className="mt-3 leading-relaxed text-ink/90">
          {FEEDBACK_HREF
            ? "If you send feedback, we receive whatever you choose to write, along with your email address if you use email. We use it only to answer you and to improve ESTA."
            : "There is no feedback form on this site at the moment."}
        </p>
      </section>

      <p className="mt-10 text-sm text-muted">
        If this ever changes, for example by adding analytics or accounts, this page will be updated first. This page is a plain description of how the site works, not legal advice.
      </p>
    </div>
  );
}

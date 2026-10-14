import Image from "next/image";
import Link from "next/link";
import { ILLUSTRATIVE_NOTE } from "@/lib/finance/definitions";
import { BUILD_COMMIT, FEEDBACK_HREF } from "@/lib/site-config";
import { MODEL_VERSION } from "@/lib/finance/projections";

export const DISCLAIMER_TEXT = ILLUSTRATIVE_NOTE;

export function Disclaimer() {
  return (
    <footer aria-label="Disclaimer" className="bg-midnight text-white/85 print:hidden">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-[auto_1fr] md:gap-12 md:px-8">
        <Image src="/images/branding/esta-logo-light.png" alt="ESTA Simulator" width={129} height={40} className="h-10 w-auto" />
        <div className="max-w-3xl text-sm leading-relaxed">
          <p>{DISCLAIMER_TEXT}</p>
          <p className="mt-2">
            A property&apos;s value is not cash you can spend, and a rise in value is not profit until the property is sold. Actual results depend on vacancies, costs, taxes, fees, financing and the market, none of which are fully modelled here.
          </p>
          <p className="mt-3">
            <Link href="/methodology" className="font-semibold text-white underline decoration-accent underline-offset-4 hover:text-accent">
              How the numbers are calculated
            </Link>
            <span aria-hidden="true" className="mx-3 text-white/40">|</span>
            <Link href="/privacy" className="font-semibold text-white underline decoration-accent underline-offset-4 hover:text-accent">
              Privacy
            </Link>
            {FEEDBACK_HREF ? (
              <>
                <span aria-hidden="true" className="mx-3 text-white/40">|</span>
                <a
                  href={FEEDBACK_HREF}
                  {...(FEEDBACK_HREF.startsWith("https") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="font-semibold text-white underline decoration-accent underline-offset-4 hover:text-accent"
                >
                  Tell us what&apos;s unclear, or what you&apos;d need
                </a>
              </>
            ) : null}
          </p>
          <p className="mt-4 text-xs text-white/70">
            Model version {MODEL_VERSION}
            {BUILD_COMMIT !== "unknown" ? <> · build <span data-testid="build-commit">{BUILD_COMMIT.slice(0, 7)}</span></> : null}
          </p>
        </div>
      </div>
    </footer>
  );
}

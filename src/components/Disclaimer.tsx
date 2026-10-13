import Image from "next/image";

export const DISCLAIMER_TEXT =
  "All properties, assumptions, and projections are illustrative. Modelled results are hypothetical and are not guarantees of investment performance. Actual returns may differ due to vacancy, expenses, taxes, fees, market movements, financing, and liquidity constraints. This simulator does not constitute investment, legal, or tax advice.";

export function Disclaimer() {
  return (
    <footer aria-label="Investment disclaimer" className="bg-midnight text-white/85">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-[auto_1fr] md:gap-12 md:px-8">
        <Image src="/images/branding/esta-logo-light.png" alt="ESTA Simulator" width={129} height={40} className="h-10 w-auto" />
        <div className="max-w-3xl text-xs leading-relaxed">
          <p>{DISCLAIMER_TEXT}</p>
          <p className="mt-2">
            Projected capital appreciation is not realized profit until an asset is sold, and property value is not the same as immediately available cash.
          </p>
        </div>
      </div>
    </footer>
  );
}

import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/inter";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { Disclaimer } from "@/components/Disclaimer";
import { BUILD_COMMIT, SITE_NAME, SITE_URL } from "@/lib/site-config";
import { OG_IMAGE, openGraphFor } from "@/lib/seo";

const DESCRIPTION =
  "Explore sample properties, change the assumptions, and see how rent, costs and value changes could play out over ten years. Invented numbers and hypothetical results, for learning only.";
const OG_DESCRIPTION = "Sample properties, invented numbers and hypothetical results, for learning how a property investment behaves.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "ESTA Simulator: test a property investment on paper", template: "%s · ESTA Simulator" },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "./" },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: openGraphFor("ESTA Simulator", OG_DESCRIPTION),
  twitter: {
    card: "summary_large_image",
    title: "ESTA Simulator",
    description: OG_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
  // Lets anyone confirm which commit a deployed site was built from.
  other: { "build-commit": BUILD_COMMIT },
};

export const viewport: Viewport = { themeColor: "#0B2545", colorScheme: "light" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-midnight focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">{children}</main>
        <Disclaimer />
      </body>
    </html>
  );
}

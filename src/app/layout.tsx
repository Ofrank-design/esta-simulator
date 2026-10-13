import type { Metadata } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/inter";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { Disclaimer } from "@/components/Disclaimer";

export const metadata: Metadata = {
  title: { default: "ESTA Simulator: test a property investment on paper", template: "%s · ESTA Simulator" },
  description:
    "Explore sample properties, change the assumptions, and see how rent, costs and value changes could play out over ten years. Invented numbers and hypothetical results, for learning only.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "ESTA Simulator",
    description: "Sample properties, invented numbers and hypothetical results, for learning how a property investment behaves.",
    images: [{ url: "/images/branding/og-image.jpg", width: 1200, height: 630, alt: "ESTA Simulator" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <Disclaimer />
      </body>
    </html>
  );
}

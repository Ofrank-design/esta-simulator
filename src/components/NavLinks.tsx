"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Home", active: (p: string) => p === "/" },
  { href: "/#properties", label: "Properties", active: () => false },
  { href: "/simulator/marina-residence", label: "Calculator", active: (p: string) => p.startsWith("/simulator") },
  { href: "/compare", label: "Compare", active: (p: string) => p === "/compare" },
  { href: "/#how-it-works", label: "How it works", active: () => false },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="order-3 -mx-4 w-[calc(100%+2rem)] overflow-x-auto px-4 md:order-2 md:mx-0 md:w-auto md:overflow-visible md:px-0">
      <ul className="flex items-center gap-6 whitespace-nowrap text-sm font-medium">
        {ITEMS.map((item) => {
          const active = item.active(pathname);
          return (
            <li key={item.label}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  "inline-block border-b-2 py-2 transition-colors " +
                  (active
                    ? "border-accent text-midnight"
                    : "border-transparent text-ink/80 hover:text-midnight")
                }
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

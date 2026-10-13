import { NextResponse, type NextRequest } from "next/server";
import { PROPERTIES } from "@/lib/data/properties";

const KNOWN_IDS = new Set(PROPERTIES.map((p) => p.id));

/**
 * Streamed pages can't change their HTTP status after the shell is sent, so an unknown property ID
 * would return 200. Rewriting it to a missing route gives a real 404 with the not-found page.
 */
export function proxy(request: NextRequest) {
  const id = request.nextUrl.pathname.split("/")[2] ?? "";
  if (!KNOWN_IDS.has(id)) {
    return NextResponse.rewrite(new URL("/not-found-property", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/simulator/:propertyId*"] };

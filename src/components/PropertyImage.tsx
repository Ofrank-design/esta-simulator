"use client";

import Image from "next/image";
import { useState } from "react";
import { FALLBACK_IMAGE } from "@/lib/data/properties";

type Props = {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

/** Renders a property photo and swaps to the local placeholder if it fails to load. */
export function PropertyImage({
  src,
  alt,
  priority = false,
  sizes = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw",
  className,
}: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc === src;

  return (
    <Image
      src={failed ? FALLBACK_IMAGE : src}
      alt={failed ? `${alt} (image unavailable)` : alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={failed}
      className={className}
      onError={() => setFailedSrc(src)}
    />
  );
}

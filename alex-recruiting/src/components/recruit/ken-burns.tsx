"use client";

import Image from "next/image";

interface KenBurnsImageProps {
  src: string;
  alt: string;
  className?: string;
  duration?: number;
}

export function KenBurnsImage({
  src,
  alt,
  className = "",
  duration = 12,
}: KenBurnsImageProps) {
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={
          reducedMotion
            ? undefined
            : {
                animation: `kenBurns ${duration}s ease-in-out infinite alternate`,
              }
        }
      />
    </div>
  );
}

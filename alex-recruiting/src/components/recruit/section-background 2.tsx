"use client";

import { useState, useCallback } from "react";

/**
 * Reusable background image component for recruit page sections.
 * Features: dark overlay, lazy loading, blur-up placeholder pattern.
 */

interface SectionBackgroundProps {
  /** Photo URL (from /api/photos/[id]/file) */
  src?: string | null;
  /** Alt text for accessibility */
  alt?: string;
  /** Overlay darkness (0-1). Default 0.8 */
  overlayOpacity?: number;
  /** Object position. Default "center" */
  position?: "cover" | "top" | "center" | "bottom";
  /** Whether to load eagerly (above-fold). Default false (lazy) */
  eager?: boolean;
  /** Additional className for the wrapper */
  className?: string;
  children?: React.ReactNode;
}

export function SectionBackground({
  src,
  alt = "",
  overlayOpacity = 0.8,
  position = "center",
  eager = false,
  className = "",
  children,
}: SectionBackgroundProps) {
  const [loaded, setLoaded] = useState(false);

  const onLoad = useCallback(() => setLoaded(true), []);

  const objectPosition =
    position === "cover"
      ? "center"
      : position === "top"
        ? "center top"
        : position === "bottom"
          ? "center bottom"
          : "center center";

  return (
    <div className={`relative ${className}`}>
      {/* Background image layer */}
      {src && (
        <div className="absolute inset-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            loading={eager ? "eager" : "lazy"}
            onLoad={onLoad}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ objectPosition }}
          />
          {/* Dark overlay */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(10, 10, 10, ${overlayOpacity})` }}
          />
        </div>
      )}

      {/* Content layer (above background) */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

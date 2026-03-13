"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedNumberProps {
  value: number;
  format?: "number" | "percent" | "compact";
  prefix?: string;
  suffix?: string;
  className?: string;
}

function formatValue(
  value: number,
  format: "number" | "percent" | "compact"
): string {
  switch (format) {
    case "percent":
      return `${Math.round(value)}%`;
    case "compact":
      if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
      if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
      return Math.round(value).toLocaleString();
    case "number":
    default:
      return Math.round(value).toLocaleString();
  }
}

// Ease-out curve: decelerates toward the end
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function AnimatedNumber({
  value,
  format = "number",
  prefix = "",
  suffix = "",
  className = "",
}: AnimatedNumberProps) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reducedMotion) {
      setDisplayed(value);
      return;
    }

    const duration = 1200; // ms
    startTimeRef.current = undefined;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === undefined) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOut(progress);

      setDisplayed(easedProgress * value);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, reducedMotion]);

  return (
    <span className={cn("font-mono", className)}>
      {prefix}
      {formatValue(displayed, format)}
      {suffix}
    </span>
  );
}

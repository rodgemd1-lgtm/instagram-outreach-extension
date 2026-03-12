"use client";

import { useEffect, useRef, useState } from "react";

interface DashboardTypewriterProps {
  text: string;
  className?: string;
  /** Delay in ms before typing starts. Default 300 */
  delay?: number;
}

export function DashboardTypewriter({
  text,
  className = "",
  delay = 300,
}: DashboardTypewriterProps) {
  const [displayedCount, setDisplayedCount] = useState(0);
  const [started, setStarted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Auto-start after delay
  useEffect(() => {
    if (reducedMotion) {
      setDisplayedCount(text.length);
      return;
    }

    const timeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timeout);
  }, [delay, reducedMotion, text.length]);

  // Type characters
  useEffect(() => {
    if (!started) return;

    setDisplayedCount(0);
    intervalRef.current = setInterval(() => {
      setDisplayedCount((prev) => {
        if (prev >= text.length) {
          clearInterval(intervalRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(intervalRef.current);
  }, [started, text]);

  const done = displayedCount >= text.length;

  return (
    <span className={className}>
      {text.slice(0, displayedCount)}
      {started && !done && (
        <span className="inline-block w-[2px] h-[1em] bg-[#ff000c] ml-0.5 animate-pulse align-text-bottom" />
      )}
    </span>
  );
}

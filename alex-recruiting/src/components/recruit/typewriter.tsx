"use client";

import { useEffect, useRef, useState } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  autoStart?: boolean;
  trigger?: boolean;
}

export function TypewriterText({
  text,
  speed = 40,
  className = "",
  autoStart = false,
  trigger = false,
}: TypewriterTextProps) {
  const [displayedCount, setDisplayedCount] = useState(0);
  const [started, setStarted] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (trigger && !started) setStarted(true);
  }, [trigger, started]);

  useEffect(() => {
    if (!started || reducedMotion) {
      if (reducedMotion) setDisplayedCount(text.length);
      return;
    }

    setDisplayedCount(0);
    intervalRef.current = setInterval(() => {
      setDisplayedCount((prev) => {
        if (prev >= text.length) {
          clearInterval(intervalRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, speed);

    return () => clearInterval(intervalRef.current);
  }, [started, text, speed, reducedMotion]);

  const done = displayedCount >= text.length;

  return (
    <span className={className}>
      {text.slice(0, displayedCount)}
      {started && !done && (
        <span className="inline-block w-[2px] h-[1em] bg-[#D4A853] ml-0.5 animate-pulse align-text-bottom" />
      )}
    </span>
  );
}

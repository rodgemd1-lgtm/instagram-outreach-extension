"use client";

import { useEffect, useRef, useState } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  autoStart?: boolean;
  trigger?: boolean;
  onComplete?: () => void;
}

export function TypewriterText({
  text,
  speed = 40,
  className = "",
  autoStart = false,
  trigger = false,
  onComplete,
}: TypewriterTextProps) {
  const [displayedCount, setDisplayedCount] = useState(0);
  const [started, setStarted] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
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
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const firedRef = useRef(false);

  useEffect(() => {
    if (done && started && !firedRef.current) {
      firedRef.current = true;
      onCompleteRef.current?.();
    }
  }, [done, started]);

  return (
    <span className={className}>
      {text.slice(0, displayedCount)}
      {started && !done && (
        <span className="inline-block w-[2px] h-[1em] bg-[#ff000c] ml-0.5 animate-pulse align-text-bottom" />
      )}
    </span>
  );
}

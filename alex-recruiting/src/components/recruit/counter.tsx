"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface CounterAnimationProps {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  trigger?: boolean;
}

export function CounterAnimation({
  target,
  suffix = "",
  prefix = "",
  duration = 1.5,
  className = "",
  trigger = false,
}: CounterAnimationProps) {
  const [value, setValue] = useState(0);
  const animated = useRef(false);
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reducedMotion) {
      setValue(target);
      return;
    }
    if (!trigger || animated.current) return;
    animated.current = true;

    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration,
      ease: "power3.out",
      onUpdate: () => setValue(Math.round(obj.val)),
    });
  }, [trigger, target, duration, reducedMotion]);

  return (
    <span className={className}>
      {prefix}{value.toLocaleString()}{suffix}
    </span>
  );
}

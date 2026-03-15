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
  decimals?: number;
}

export function CounterAnimation({
  target,
  suffix = "",
  prefix = "",
  duration = 1.5,
  className = "",
  trigger = false,
  decimals = 0,
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
      onUpdate: () =>
        setValue(
          decimals > 0
            ? parseFloat(obj.val.toFixed(decimals))
            : Math.round(obj.val)
        ),
    });
  }, [trigger, target, duration, decimals, reducedMotion]);

  return (
    <span className={className}>
      {prefix}{decimals > 0 ? value.toFixed(decimals) : value.toLocaleString()}{suffix}
    </span>
  );
}

"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

/* ──────────────────────────────────────────────────────────────
   Dashboard Motion Assembly Hook
   ──────────────────────────────────────────────────────────────
   A lighter variant of useRecruitAssembly for dashboard pages.
   Mount-based staggered entry animations (no scroll triggers).

   Data attribute: data-dash-animate
   Easing: back.out(1.7) desktop, power2.out mobile
   Default: opacity 0→1, y 20→0, 0.5s duration, 0.08s stagger
   ────────────────────────────────────────────────────────────── */

export interface DashboardAssemblyConfig {
  /** Stagger delay between children (seconds). Default 0.08 */
  stagger?: number;
  /** Animation duration per element (seconds). Default 0.5 */
  duration?: number;
  /** Initial delay before animation starts (seconds). Default 0 */
  delay?: number;
}

export function useDashboardAssembly(config: DashboardAssemblyConfig = {}) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const { stagger = 0.08, duration = 0.5, delay = 0 } = config;

  useLayoutEffect(() => {
    const el = scopeRef.current;
    if (!el) return;

    // ── Reduced-motion bypass ──
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      el.querySelectorAll("[data-dash-animate]").forEach((target) => {
        const htmlTarget = target as HTMLElement;
        htmlTarget.style.opacity = "1";
        htmlTarget.style.transform = "none";
      });
      return;
    }

    // ── GSAP Context (auto-cleanup) ──
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
        },
        (context) => {
          const { isDesktop } = context.conditions!;
          const ease = isDesktop ? "back.out(1.7)" : "power2.out";

          const targets = el.querySelectorAll("[data-dash-animate]");
          if (targets.length === 0) return;

          gsap.fromTo(
            targets,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration,
              ease,
              stagger,
              delay,
            }
          );
        }
      );
    }, el);

    return () => ctx.revert();
  }, [stagger, duration, delay]);

  return scopeRef;
}

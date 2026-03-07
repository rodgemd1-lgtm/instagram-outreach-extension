"use client";

import { useMemo } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";

/* ──────────────────────────────────────────────────────────────
   Academics Section — Compact pass/fail check
   LAAL Mechanism: Continuity Thread
   Two lines. Three data points. The coach's compliance question
   is answered and they move on. Respecting coach time = trust.

   Wave 1: none (below fold)
   Wave 2: simple fade-in
   ────────────────────────────────────────────────────────────── */

export function AcademicsSection() {
  const config = useMemo<AssemblyConfig>(
    () => ({
      wave2: [
        {
          containerSelector: '[data-gsap="acad-content"]',
          from: { y: 30, opacity: 0 },
          to: {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          individual: false,
          stagger: 0,
          scrollTrigger: {
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      ],
    }),
    []
  );

  const scopeRef = useRecruitAssembly(config);

  return (
    <section
      id="academics"
      ref={scopeRef}
      className="relative py-20 md:py-28 px-6 md:px-12"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div
        data-gsap="acad-content"
        className="max-w-5xl mx-auto"
      >
        <div data-gsap-wave="2" style={{ opacity: 0 }}>
          <span className="text-[10px] tracking-[0.5em] text-red-500/60 uppercase font-mono block mb-6">
            Academics
          </span>

          {/* Stat bar */}
          <div className="flex flex-wrap items-center gap-6 md:gap-10 mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-mono font-black text-white">
                3.25
              </span>
              <span className="text-[10px] tracking-[0.3em] text-white/30 uppercase">
                GPA
              </span>
            </div>
            <div className="w-px h-8 bg-white/10 hidden md:block" />
            <div className="flex items-baseline gap-2">
              <span className="text-lg md:text-xl font-mono font-bold text-white/80">
                NCAA
              </span>
              <span className="text-[10px] tracking-[0.3em] text-white/30 uppercase">
                Eligible
              </span>
            </div>
            <div className="w-px h-8 bg-white/10 hidden md:block" />
            <div className="flex items-baseline gap-2">
              <span className="text-lg md:text-xl font-mono font-bold text-white/80">
                NCSA
              </span>
              <span className="text-[10px] tracking-[0.3em] text-white/30 uppercase">
                Verified
              </span>
            </div>
          </div>

          <p className="text-white/30 text-sm">
            On track for Division I academic requirements.
          </p>
        </div>
      </div>
    </section>
  );
}

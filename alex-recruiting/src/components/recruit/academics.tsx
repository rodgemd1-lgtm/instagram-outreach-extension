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

          {/* Primary stat bar */}
          <div className="flex flex-wrap items-center gap-6 md:gap-10 mb-8">
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

          {/* Extended academic details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <AcademicDetail label="Intended Major" value="Business / Sport Mgmt" />
            <AcademicDetail label="PSAT (Projected)" value="1100+" />
            <AcademicDetail label="Honor Roll" value="3 Semesters" />
            <AcademicDetail label="Core GPA" value="3.25" />
          </div>

          {/* NCAA Eligibility Center badge */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-green-500/20 bg-green-500/[0.04]">
              <div className="relative w-10 h-10 rounded-full border-2 border-green-500/50 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-5 h-5 text-green-500"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-green-500 block leading-tight">
                  NCAA ELIGIBILITY CENTER
                </span>
                <span className="text-[10px] tracking-[0.15em] text-white/40 uppercase">
                  Registered &amp; On Track
                </span>
              </div>
            </div>

            <p className="text-white/40 text-sm max-w-xs">
              On track for Division I academic requirements. All core courses in progress.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function AcademicDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg px-4 py-3">
      <span className="text-[9px] tracking-[0.2em] text-white/30 uppercase block mb-1">
        {label}
      </span>
      <span className="text-sm font-mono font-semibold text-white/80">
        {value}
      </span>
    </div>
  );
}

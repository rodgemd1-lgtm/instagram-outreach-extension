"use client";

import { useMemo } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";

/* ──────────────────────────────────────────────────────────────
   Academics Section — The whole package
   LAAL Mechanism: Continuity Thread
   Connects the physical-athlete narrative to academic readiness,
   showing Jacob is the complete recruit — no gap in the story.

   Wave 1: none (below fold)
   Wave 2: academic cards + quote block scroll-reveal
   ────────────────────────────────────────────────────────────── */

export function AcademicsSection() {
  const config = useMemo<AssemblyConfig>(
    () => ({
      wave2: [
        {
          /* LAAL: Continuity Thread — academic cards extend the narrative */
          containerSelector: '[data-gsap="acad-cards"]',
          from: { y: 50, opacity: 0 },
          to: {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          individual: false,
          stagger: 0.1,
          scrollTrigger: {
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        },
        {
          /* LAAL: Continuity Thread — quote reinforces the thread */
          containerSelector: '[data-gsap="acad-quote"]',
          from: { y: 30, opacity: 0 },
          to: {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "sine.out",
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
      className="relative py-32 md:py-48 px-6 md:px-12"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-16 md:mb-24">
          <span className="text-[10px] tracking-[0.5em] text-red-500/60 uppercase font-mono block mb-6">
            Academics
          </span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-6">
            Student
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">
              {" "}
              athlete.
            </span>
            <br />
            Both words matter.
          </h2>
        </div>

        {/* Academic stat cards — Wave 2 batched */}
        <div
          data-gsap="acad-cards"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          <div
            data-gsap-wave="2"
            style={{ opacity: 0 }}
            className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 text-center"
          >
            <div className="text-5xl md:text-6xl font-mono font-black text-red-500 mb-3">
              3.25
            </div>
            <div className="text-[10px] tracking-[0.3em] text-white/30 uppercase mb-4">
              GPA
            </div>
            <p className="text-white/40 text-sm">
              Maintains academic excellence while training five days a week and
              starting varsity as a freshman.
            </p>
          </div>

          <div
            data-gsap-wave="2"
            style={{ opacity: 0 }}
            className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 text-center"
          >
            <div className="text-5xl md:text-6xl font-mono font-black text-white mb-3">
              NCAA
            </div>
            <div className="text-[10px] tracking-[0.3em] text-white/30 uppercase mb-4">
              Eligible
            </div>
            <p className="text-white/40 text-sm">
              On track for full NCAA eligibility. Core course requirements and
              GPA thresholds being met across all divisions.
            </p>
          </div>

          <div
            data-gsap-wave="2"
            style={{ opacity: 0 }}
            className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 text-center"
          >
            <div className="text-5xl md:text-6xl font-mono font-black text-white/80 mb-3">
              NCSA
            </div>
            <div className="text-[10px] tracking-[0.3em] text-white/30 uppercase mb-4">
              Verified
            </div>
            <p className="text-white/40 text-sm">
              Active NCSA profile with verified academic and athletic
              credentials. Professionally represented.
            </p>
          </div>
        </div>

        {/* The commitment message — Wave 2 */}
        <div data-gsap="acad-quote">
          <div
            data-gsap-wave="2"
            style={{ opacity: 0 }}
            className="bg-gradient-to-r from-red-500/5 to-rose-500/5 border border-red-500/10 rounded-2xl p-10 md:p-14"
          >
            <blockquote className="text-xl md:text-2xl font-light text-white/70 leading-relaxed italic">
              &ldquo;The weight room teaches discipline. The classroom teaches
              discipline too. Jacob doesn&apos;t separate the two -- he brings
              the same focus to both.&rdquo;
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-8 h-px bg-red-500/40" />
              <span className="text-xs tracking-[0.2em] text-red-500/60 uppercase">
                A commitment to excellence, everywhere
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

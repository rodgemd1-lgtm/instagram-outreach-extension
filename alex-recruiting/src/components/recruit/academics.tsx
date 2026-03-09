"use client";

import { useMemo } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";

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
      className="relative px-6 py-20 md:px-12 md:py-28"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A853]/20 to-transparent" />

      <div data-gsap="acad-content" className="mx-auto max-w-5xl">
        <div data-gsap-wave="2" style={{ opacity: 0 }}>
          <span className="mb-6 block font-jetbrains text-xs uppercase tracking-[0.3em] text-[#D4A853]/80">
            NCAA Eligibility &amp; Academics
          </span>

          <div className="mb-6 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] p-5 md:p-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/15 font-jetbrains text-xs font-bold text-emerald-300">
                ✓
              </span>
              <div>
                <p className="font-jetbrains text-sm font-bold text-emerald-300 md:text-base">
                  NCAA Eligibility: On Track
                </p>
                <p className="mt-1 text-sm text-[#F5F0E6]/50">
                  3.25 GPA as a freshman. Will he qualify? Yes. Eligibility path is clear and active.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8 flex flex-wrap items-center gap-6 md:gap-10">
            <div className="flex items-baseline gap-2">
              <span className="font-jetbrains text-3xl font-black text-white md:text-4xl">
                3.25
              </span>
              <span className="text-xs uppercase tracking-[0.2em] text-[#F5F0E6]/50">
                current GPA
              </span>
            </div>
            <div className="hidden h-8 w-px bg-white/10 md:block" />
            <div className="flex items-baseline gap-2">
              <span className="font-jetbrains text-lg font-bold text-emerald-300 md:text-xl">
                on track
              </span>
              <span className="text-xs uppercase tracking-[0.2em] text-[#F5F0E6]/50">
                NCAA eligibility
              </span>
            </div>
            <div className="hidden h-8 w-px bg-white/10 md:block" />
            <div className="flex items-baseline gap-2">
              <span className="font-jetbrains text-lg font-bold text-[#F5F0E6]/80 md:text-xl">
                24hr
              </span>
              <span className="text-xs uppercase tracking-[0.2em] text-[#F5F0E6]/50">
                transcript turnaround
              </span>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <AcademicDetail label="Will He Qualify?" value="Yes \u2014 3.25 GPA, eligibility path clear" />
            <AcademicDetail
              label="Transcript Available"
              value="Freshman transcript sent within 24 hours of request"
            />
            <AcademicDetail
              label="Core Course Status"
              value="On pace for NCAA Division I/II/III eligibility requirements"
            />
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
            <p className="text-sm leading-7 text-[#F5F0E6]/52">
              Coaches need one answer fast: will he qualify? The answer is yes.
              3.25 GPA, core courses on track, and the family provides updated
              transcripts within 24 hours of any request. No eligibility
              concerns. No academic risk.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function AcademicDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <span className="mb-1 block text-[9px] uppercase tracking-[0.2em] text-[#F5F0E6]/50">
        {label}
      </span>
      <span className="font-jetbrains text-sm font-semibold text-[#F5F0E6]/80">
        {value}
      </span>
    </div>
  );
}

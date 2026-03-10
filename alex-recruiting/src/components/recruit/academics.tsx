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
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff000c]/20 to-transparent" />

      <div data-gsap="acad-content" className="mx-auto max-w-5xl">
        <div data-gsap-wave="2" style={{ opacity: 0 }}>
          <span className="mb-6 block font-jetbrains text-xs uppercase tracking-[0.3em] text-[#ff000c]/80">
            NCAA Eligibility &amp; Academics
          </span>

          <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] p-5 md:p-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/15 font-jetbrains text-xs font-bold text-emerald-300">
                ✓
              </span>
              <div>
                <p className="font-jetbrains text-sm font-bold text-emerald-300 md:text-base">
                  GPA: 3.25 &nbsp;|&nbsp; NCAA Eligible &nbsp;|&nbsp; NCSA Verified
                </p>
                <p className="mt-1 text-sm text-[#FFFFFF]/50">
                  On track for Division I academic requirements. Transcript available within 24 hours of request.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

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
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div data-gsap="acad-content" className="mx-auto max-w-5xl">
        <div data-gsap-wave="2" style={{ opacity: 0 }}>
          <span className="mb-6 block font-mono text-[10px] uppercase tracking-[0.5em] text-red-500/60">
            Academics
          </span>

          <div className="mb-8 flex flex-wrap items-center gap-6 md:gap-10">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-black text-white md:text-4xl">
                3.25
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/30">
                current GPA
              </span>
            </div>
            <div className="hidden h-8 w-px bg-white/10 md:block" />
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-lg font-bold text-white/80 md:text-xl">
                live
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/30">
                transcript updates
              </span>
            </div>
            <div className="hidden h-8 w-px bg-white/10 md:block" />
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-lg font-bold text-white/80 md:text-xl">
                early
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/30">
                eligibility path
              </span>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <AcademicDetail label="Current Snapshot" value="3.25 GPA" />
            <AcademicDetail
              label="What Coaches Need"
              value="Freshman transcript and updates available on request"
            />
            <AcademicDetail
              label="Academic Track"
              value="Early, active, and easy to keep current"
            />
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
            <p className="text-sm leading-7 text-white/52">
              The academic section stays direct on purpose. Coaches do not need
              inflated testing claims or a fake finished story here. They need a
              clean snapshot, a real contact path, and confidence that the
              family can provide updated school information quickly.
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
      <span className="mb-1 block text-[9px] uppercase tracking-[0.2em] text-white/30">
        {label}
      </span>
      <span className="font-mono text-sm font-semibold text-white/80">
        {value}
      </span>
    </div>
  );
}

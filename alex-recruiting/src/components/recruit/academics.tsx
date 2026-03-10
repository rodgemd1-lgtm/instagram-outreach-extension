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
          containerSelector: '[data-gsap="acad-bar"]',
          from: { opacity: 0 },
          to: {
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
          },
          individual: false,
          stagger: 0,
          scrollTrigger: {
            start: "top 90%",
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
      className="relative bg-black py-8"
    >
      <div
        data-gsap="acad-bar"
        className="mx-auto max-w-3xl text-center"
      >
        <p
          data-gsap-wave="2"
          className="font-jetbrains text-sm tracking-wide md:text-base"
          style={{ opacity: 0 }}
        >
          <span className="text-white">GPA: 3.25</span>
          <span className="mx-3 inline-block h-1.5 w-1.5 rounded-full bg-[#ff000c] align-middle" />
          <span className="text-white/50">NCAA Eligible</span>
          <span className="mx-3 inline-block h-1.5 w-1.5 rounded-full bg-[#ff000c] align-middle" />
          <span className="text-white/50">NCSA Verified</span>
        </p>
      </div>
    </section>
  );
}

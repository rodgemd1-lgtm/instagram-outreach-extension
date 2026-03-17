"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";
import { CounterAnimation } from "./counter";

interface SocialProofMetrics {
  ncsaProfileViews: number;
  campInvites: number;
  coachFollowers: number;
  contactFormSubmissions?: number;
  competitorOffers: number;
  schoolsEngaged?: number;
  recentSchoolCount?: number;
  recentSchools?: string[];
  schoolNames?: string[];
}

const STATIC_PROOF = [
  "NCSA Verified Profile",
  "730+ Logged Training Sessions",
  "445 lb Deadlift (Verified)",
  "1st Place Discus \u2014 Conference",
  "1st Place Shot Put \u2014 Conference",
  "Varsity Starter as Freshman",
  "Two-Way OL/DL \u2014 Class of 2029",
  "Deep State Playoff Run",
  "Active D1/D2/D3 Program Interest",
  "2029 OL Class \u2014 Limited Depth",
];

export function SocialProofBanner() {
  const [metrics, setMetrics] = useState<SocialProofMetrics | null>(null);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetch("/api/recruit/social-proof")
      .then((r) => r.json())
      .then((data) => setMetrics(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const tickerItems = metrics?.schoolNames?.length
    ? metrics.schoolNames
    : STATIC_PROOF;

  const recentCount = metrics?.recentSchoolCount ?? 0;

  const config = useMemo<AssemblyConfig>(
    () => ({
      wave2: [
        {
          containerSelector: '[data-gsap="social-proof-content"]',
          from: { y: 20, opacity: 0 },
          to: {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          individual: false,
          stagger: 0,
          scrollTrigger: {
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      ],
    }),
    []
  );

  const scopeRef = useRecruitAssembly(config);

  return (
    <section ref={(el) => {
      (scopeRef as React.MutableRefObject<HTMLElement | null>).current = el;
      (sectionRef as React.MutableRefObject<HTMLElement | null>).current = el;
    }} className="relative overflow-hidden py-8 md:py-10">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff000c]/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ff000c]/20 to-transparent" />

      <div data-gsap="social-proof-content" className="mx-auto max-w-7xl px-6">
        <div data-gsap-wave="2" style={{ opacity: 0 }}>
          {/* Counter headline */}
          {recentCount > 0 && (
            <p className="mb-4 text-center font-jetbrains text-sm tracking-wide text-[#ff000c]">
              <CounterAnimation target={recentCount} trigger={inView} className="font-bold text-lg" />
              {" "}program{recentCount !== 1 ? "s" : ""} with OL scholarship openings actively evaluating
            </p>
          )}
          {recentCount === 0 && (
            <p className="mb-4 text-center font-jetbrains text-sm tracking-wide text-[#ff000c]">
              Active evaluation from D1, D2, and D3 programs with 2029 OL needs
            </p>
          )}

          {/* Scrolling ticker */}
          <div className="relative overflow-hidden">
            <div className="animate-scroll-ticker flex whitespace-nowrap">
              {[...tickerItems, ...tickerItems].map((item, i) => (
                <span
                  key={`${item}-${i}`}
                  className="mx-4 inline-flex items-center gap-2 font-jetbrains text-xs uppercase tracking-[0.2em] text-[#9CA3AF]"
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#ff000c]/40" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Metric pills */}
          {metrics && (metrics.ncsaProfileViews > 0 || metrics.campInvites > 0 || metrics.coachFollowers > 0) && (
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {metrics.ncsaProfileViews > 0 && (
                <div className="flex items-center gap-2 rounded-full border border-[#ff000c]/10 bg-[#ff000c]/[0.04] px-4 py-2">
                  <CounterAnimation target={metrics.ncsaProfileViews} trigger={inView} className="font-jetbrains text-sm font-bold text-[#ff000c]" />
                  <span className="font-jetbrains text-xs uppercase tracking-[0.1em] text-[#9CA3AF]">
                    Coach Profile Views
                  </span>
                </div>
              )}
              {metrics.campInvites > 0 && (
                <div className="flex items-center gap-2 rounded-full border border-[#ff000c]/10 bg-[#ff000c]/[0.04] px-4 py-2">
                  <CounterAnimation target={metrics.campInvites} trigger={inView} className="font-jetbrains text-sm font-bold text-[#ff000c]" />
                  <span className="font-jetbrains text-xs uppercase tracking-[0.1em] text-[#9CA3AF]">
                    Camp Invites
                  </span>
                </div>
              )}
              {metrics.coachFollowers > 0 && (
                <div className="flex items-center gap-2 rounded-full border border-[#ff000c]/10 bg-[#ff000c]/[0.04] px-4 py-2">
                  <CounterAnimation target={metrics.coachFollowers} trigger={inView} className="font-jetbrains text-sm font-bold text-[#ff000c]" />
                  <span className="font-jetbrains text-xs uppercase tracking-[0.1em] text-[#9CA3AF]">
                    College Coaches Following
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

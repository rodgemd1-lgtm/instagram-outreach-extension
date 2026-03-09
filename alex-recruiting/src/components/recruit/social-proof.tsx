"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useRecruitAssembly,
  type AssemblyConfig,
} from "@/hooks/useRecruitAssembly";

interface SocialProofMetrics {
  ncsaProfileViews: number;
  campInvites: number;
  coachFollowers: number;
  contactFormSubmissions?: number;
  competitorOffers: number;
  schoolsEngaged?: number;
}

function MetricPill({ label, value }: { label: string; value: number }) {
  if (value === 0) return null;
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-2">
      <span className="font-mono text-sm font-bold text-red-500">{value}</span>
      <span className="text-[10px] uppercase tracking-[0.15em] text-white/30">
        {label}
      </span>
    </div>
  );
}

export function SocialProofBanner() {
  const [metrics, setMetrics] = useState<SocialProofMetrics | null>(null);

  useEffect(() => {
    fetch("/api/recruit/social-proof")
      .then((r) => r.json())
      .then((data) => setMetrics(data))
      .catch(() => {});
  }, []);

  const hasMetrics = metrics && (
    metrics.ncsaProfileViews > 0 ||
    metrics.campInvites > 0 ||
    metrics.coachFollowers > 0 ||
    (metrics.contactFormSubmissions ?? 0) > 0
  );

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
    <section ref={scopeRef} className="relative overflow-hidden py-10 md:py-14">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div
        data-gsap="social-proof-content"
        className="mx-auto max-w-6xl px-6"
      >
        <div data-gsap-wave="2" style={{ opacity: 0 }}>
          {hasMetrics && (
            <div className="mb-6 flex flex-wrap justify-center gap-3 md:gap-6">
              <MetricPill label="Profile Views" value={metrics.ncsaProfileViews} />
              <MetricPill label="Camp Invites" value={metrics.campInvites} />
              <MetricPill label="Coaches Following" value={metrics.coachFollowers} />
              <MetricPill
                label="Coach Messages"
                value={metrics.contactFormSubmissions ?? 0}
              />
            </div>
          )}

          <p className="mb-6 text-center font-mono text-[10px] uppercase tracking-[0.5em] text-white/25">
            Verified recruiting context
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <ProofCard
              title="School names stay off the page until verified"
              body="The old carousel was removed. This page now shows verified activity only and avoids implying program interest that has not been confirmed."
            />
            <ProofCard
              title="Authenticated NCSA sync is now the source"
              body={
                (metrics?.schoolsEngaged ?? 0) > 0
                  ? `${metrics?.schoolsEngaged} verified school touchpoints are currently synced into the recruiting system.`
                  : "NCSA school-interest data is not published here until real synchronized activity is available."
              }
            />
            <ProofCard
              title="Coach packet is live"
              body="Impact film, training context, and a real contact path are available now, without placeholder proof."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProofCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-5">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/46">{body}</p>
    </div>
  );
}

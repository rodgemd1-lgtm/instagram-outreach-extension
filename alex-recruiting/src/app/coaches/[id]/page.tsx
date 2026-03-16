"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Wifi, Shield } from "lucide-react";
import {
  StitchPageHeader,
  StitchButton,
  StitchBadge,
  GlassCard,
  StatCard,
  SentimentBars,
  ActivityRadar,
  DMConsole,
} from "@/components/stitch";
import { StitchTabs } from "@/components/stitch/stitch-tabs";
import Image from "next/image";
import { getSchoolLogo, getSchoolColors } from "@/lib/data/school-branding";

interface CoachPersona {
  schoolId: string;
  schoolName: string;
  division: string;
  conference: string;
  priorityTier: string;
  communicationStyle: string;
  recruitingPriorities: string[];
  bestApproachMethod: string;
  bestApproachSteps: string[];
  engagementStrategy: string;
  dmOpenProbability: number;
  followBackProbability: number;
  estimatedResponseRate: number;
  optimalContactMonths: number[];
  optimalContactHours: number[];
  personaSource: "ai" | "deterministic";
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatHour(h: number): string {
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

export default function CoachDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [persona, setPersona] = useState<CoachPersona | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPersona() {
      try {
        const res = await fetch(`/api/coaches/personas?schoolId=${encodeURIComponent(id)}`);
        const data = await res.json();
        if (data.persona) {
          setPersona(data.persona);
        } else {
          setError("No persona data found for this school.");
        }
      } catch (err) {
        console.error("Failed to fetch persona:", err);
        setError("Failed to load coach intelligence data.");
      } finally {
        setLoading(false);
      }
    }
    fetchPersona();
  }, [id]);

  const logoPath = getSchoolLogo(id);
  const colors = getSchoolColors(id);

  if (loading) {
    return (
      <div className="space-y-6">
        <StitchButton variant="ghost" size="sm" onClick={() => router.push("/coaches")}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          War Room
        </StitchButton>
        <GlassCard className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C5050C] border-t-transparent" />
          <span className="ml-3 text-sm text-white/40">Loading intelligence...</span>
        </GlassCard>
      </div>
    );
  }

  if (error || !persona) {
    return (
      <div className="space-y-6">
        <StitchButton variant="ghost" size="sm" onClick={() => router.push("/coaches")}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          War Room
        </StitchButton>
        <GlassCard className="py-16 text-center">
          <p className="text-sm text-white/40">{error || "No intelligence data available."}</p>
          <StitchButton variant="outline" size="sm" className="mt-4" onClick={() => router.push("/coaches")}>
            Return to War Room
          </StitchButton>
        </GlassCard>
      </div>
    );
  }

  const tierVariant = persona.priorityTier === "Tier 1" ? "tier1" : persona.priorityTier === "Tier 2" ? "tier2" : "tier3";

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <StitchButton variant="ghost" size="sm" onClick={() => router.push("/coaches")}>
        <ArrowLeft className="mr-1 h-4 w-4" />
        War Room
      </StitchButton>

      {/* Profile Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="relative">
          <div
            className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2"
            style={{ borderColor: colors.primary + "60" }}
          >
            <Image src={logoPath} alt={persona.schoolName} width={64} height={64} className="opacity-80" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-[#0bda7d] border-2 border-[#0a0a0a]" />
        </div>
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            {persona.schoolName}
          </h1>
          <p className="mt-1 text-sm text-white/40">
            {persona.division} — {persona.conference} | {persona.communicationStyle.replace(/_/g, " ")}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StitchBadge variant={tierVariant as "tier1" | "tier2" | "tier3"}>{persona.priorityTier}</StitchBadge>
            <StitchBadge variant={persona.personaSource === "ai" ? "green" : "amber"} dot>
              {persona.personaSource === "ai" ? "AI Persona" : "Deterministic"}
            </StitchBadge>
          </div>
        </div>
        <div className="flex gap-2">
          <StitchButton variant="outline" size="sm">
            <Wifi className="mr-2 h-4 w-4" />
            Connect
          </StitchButton>
          <StitchButton variant="pirate" size="sm">
            <Shield className="mr-2 h-4 w-4" />
            Follow
          </StitchButton>
        </div>
      </div>

      {/* Quick stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="DM Open" value={`${Math.round(persona.dmOpenProbability * 100)}%`} />
        <StatCard label="Follow Back" value={`${Math.round(persona.followBackProbability * 100)}%`} />
        <StatCard label="Response Rate" value={`${Math.round(persona.estimatedResponseRate * 100)}%`} />
        <StatCard label="Priorities" value={persona.recruitingPriorities.length} />
      </div>

      {/* Tabs content */}
      <StitchTabs
        tabs={[
          { value: "intelligence", label: "Intelligence" },
          { value: "outreach", label: "Outreach" },
          { value: "actions", label: "Actions" },
        ]}
        defaultValue="intelligence"
      >
        {(activeTab) => (
          <>
            {activeTab === "intelligence" && (
              <>
              <div className="grid gap-6 md:grid-cols-3">
                {/* Left column */}
                <div className="space-y-6 md:col-span-2">
                  {/* Sentiment Bars */}
                  <GlassCard className="p-5">
                    <h3 className="stitch-label mb-4">Response Probabilities</h3>
                    <SentimentBars
                      bars={[
                        { label: "DM Open Probability", value: Math.round(persona.dmOpenProbability * 100), color: "#C5050C" },
                        { label: "Follow-Back Probability", value: Math.round(persona.followBackProbability * 100), color: "#00f2ff" },
                        { label: "Est. Response Rate", value: Math.round(persona.estimatedResponseRate * 100), color: "#0bda7d" },
                      ]}
                    />
                  </GlassCard>

                  {/* Activity Radar */}
                  <GlassCard className="p-5">
                    <h3 className="stitch-label mb-4">Activity Radar</h3>
                    <div className="mx-auto max-w-[280px]">
                      <ActivityRadar
                        data={{
                          posting: Math.round(persona.dmOpenProbability * 80),
                          engagement: Math.round(persona.followBackProbability * 90),
                          recruiting: Math.min(100, persona.recruitingPriorities.length * 25),
                          responsiveness: Math.round(persona.estimatedResponseRate * 100),
                          visibility: Math.round((persona.dmOpenProbability + persona.followBackProbability) * 50),
                        }}
                      />
                    </div>
                  </GlassCard>

                  {/* Contact Windows */}
                  <GlassCard className="p-5">
                    <h3 className="stitch-label mb-4">Optimal Contact Windows</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-[11px] text-white/30 mb-2">Best Months</p>
                        <div className="flex flex-wrap gap-1.5">
                          {persona.optimalContactMonths.length > 0
                            ? persona.optimalContactMonths.map((m) => (
                                <StitchBadge key={m} variant="default">{MONTH_NAMES[m - 1]}</StitchBadge>
                              ))
                            : <span className="text-xs text-white/20">No data</span>
                          }
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] text-white/30 mb-2">Peak Hours</p>
                        <div className="flex flex-wrap gap-1.5">
                          {persona.optimalContactHours.length > 0
                            ? persona.optimalContactHours.map((h) => (
                                <StitchBadge key={h} variant="default">{formatHour(h)}</StitchBadge>
                              ))
                            : <span className="text-xs text-white/20">No data</span>
                          }
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </div>

                {/* Right column — DM Console */}
                <div>
                  <DMConsole schoolId={id} schoolName={persona.schoolName} />
                </div>
              </div>

              {/* Deep Intelligence Stream */}
              <div className="mt-6">
                <h3 className="stitch-label mb-4">Deep Intelligence Stream</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <GlassCard className="p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#00f2ff]/60 mb-2">Recruiting Pattern</p>
                    <p className="text-sm text-white/60">
                      {persona.communicationStyle === "formal"
                        ? "Prefers structured, formal communication. Lead with credentials and measurables."
                        : persona.communicationStyle === "casual"
                          ? "Open to casual interaction. Engage naturally on X before formal outreach."
                          : "Standard recruiting communication style. Follow program protocols."}
                    </p>
                  </GlassCard>
                  <GlassCard className="p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#0bda7d]/60 mb-2">OL Pipeline Intel</p>
                    <p className="text-sm text-white/60">
                      {persona.recruitingPriorities.length > 0
                        ? `Program is actively recruiting: ${persona.recruitingPriorities.slice(0, 2).join(", ")}. Target window is open.`
                        : "Limited intel on current OL pipeline needs. Further research recommended."}
                    </p>
                  </GlassCard>
                  <GlassCard className="p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#C5050C]/60 mb-2">Win Probability</p>
                    <p className="text-sm text-white/60">
                      {persona.estimatedResponseRate > 0.5
                        ? "High engagement likelihood. Prioritize this target for immediate outreach."
                        : persona.estimatedResponseRate > 0.25
                          ? "Moderate response probability. Sustained engagement recommended before direct DM."
                          : "Lower response probability. Build visibility through consistent X engagement first."}
                    </p>
                  </GlassCard>
                </div>
              </div>
              </>
            )}

            {activeTab === "outreach" && (
              <GlassCard className="py-16 text-center">
                <p className="text-sm text-white/40">
                  No outreach history recorded yet for {persona.schoolName}.
                </p>
                <p className="mt-2 text-xs text-white/20">
                  Interactions will appear here once tracked.
                </p>
              </GlassCard>
            )}

            {activeTab === "actions" && (
              <div className="space-y-6">
                <GlassCard className="p-5">
                  <h3 className="stitch-label mb-3">Best Approach Method</h3>
                  <p className="text-sm text-white/70">{persona.bestApproachMethod}</p>
                </GlassCard>

                <GlassCard className="p-5">
                  <h3 className="stitch-label mb-4">Step-by-Step Action Plan</h3>
                  {persona.bestApproachSteps.length > 0 ? (
                    <ol className="space-y-3">
                      {persona.bestApproachSteps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full pirate-gradient text-xs font-bold text-white">
                            {idx + 1}
                          </span>
                          <span className="text-sm text-white/60">{step}</span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-sm text-white/30">No action steps generated yet.</p>
                  )}
                </GlassCard>

                {/* Recruiting Priorities */}
                <GlassCard className="p-5">
                  <h3 className="stitch-label mb-4">Recruiting Priorities</h3>
                  {persona.recruitingPriorities.length > 0 ? (
                    <ul className="space-y-2">
                      {persona.recruitingPriorities.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-white/60">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C5050C]" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-white/30">No priority data available.</p>
                  )}
                </GlassCard>

                <GlassCard className="p-5">
                  <h3 className="stitch-label mb-3">Engagement Strategy</h3>
                  <p className="text-sm text-white/60">
                    {persona.engagementStrategy || "No strategy data available."}
                  </p>
                </GlassCard>
              </div>
            )}
          </>
        )}
      </StitchTabs>
    </div>
  );
}

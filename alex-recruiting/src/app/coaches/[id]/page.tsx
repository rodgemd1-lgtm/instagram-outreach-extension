"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { SCPageHeader } from "@/components/sc/sc-page-header";
import { SCGlassCard } from "@/components/sc/sc-glass-card";
import { SCStatCard } from "@/components/sc/sc-stat-card";
import { SCBadge } from "@/components/sc/sc-badge";
import { SCButton } from "@/components/sc/sc-button";
import { SCTabs } from "@/components/sc/sc-tabs";
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
  const [activeTab, setActiveTab] = useState("intelligence");

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
        <SCButton variant="ghost" size="sm" onClick={() => router.push("/coaches")}>
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          War Room
        </SCButton>
        <SCGlassCard className="flex items-center justify-center py-20">
          <span className="material-symbols-outlined text-[24px] text-slate-500 animate-spin">progress_activity</span>
          <span className="ml-3 text-sm text-slate-500">Loading intelligence...</span>
        </SCGlassCard>
      </div>
    );
  }

  if (error || !persona) {
    return (
      <div className="space-y-6">
        <SCButton variant="ghost" size="sm" onClick={() => router.push("/coaches")}>
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          War Room
        </SCButton>
        <SCGlassCard className="py-16 text-center">
          <p className="text-sm text-slate-500">{error || "No intelligence data available."}</p>
          <SCButton variant="secondary" size="sm" className="mt-4" onClick={() => router.push("/coaches")}>
            Return to War Room
          </SCButton>
        </SCGlassCard>
      </div>
    );
  }

  const tierBadgeVariant = persona.priorityTier === "Tier 1" ? "danger" as const : persona.priorityTier === "Tier 2" ? "warning" as const : "default" as const;

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <SCButton variant="ghost" size="sm" onClick={() => router.push("/coaches")}>
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        War Room
      </SCButton>

      {/* Profile Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="relative">
          <div
            className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2"
            style={{ borderColor: colors.primary + "60" }}
          >
            <Image src={logoPath} alt={persona.schoolName} width={64} height={64} className="opacity-80" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 border-2 border-sc-bg" />
        </div>
        <div className="flex-1">
          <SCPageHeader
            title={persona.schoolName}
            subtitle={`${persona.division} -- ${persona.conference} | ${persona.communicationStyle.replace(/_/g, " ")}`}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <SCBadge variant={tierBadgeVariant}>{persona.priorityTier}</SCBadge>
            <SCBadge variant={persona.personaSource === "ai" ? "success" : "warning"}>
              {persona.personaSource === "ai" ? "AI Persona" : "Deterministic"}
            </SCBadge>
          </div>
        </div>
        <div className="flex gap-2">
          <SCButton variant="secondary" size="sm">
            <span className="material-symbols-outlined text-[16px]">wifi</span>
            Connect
          </SCButton>
          <SCButton size="sm">
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            Follow
          </SCButton>
        </div>
      </div>

      {/* Quick stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SCStatCard label="DM Open" value={`${Math.round(persona.dmOpenProbability * 100)}%`} icon="mail" />
        <SCStatCard label="Follow Back" value={`${Math.round(persona.followBackProbability * 100)}%`} icon="person_add" />
        <SCStatCard label="Response Rate" value={`${Math.round(persona.estimatedResponseRate * 100)}%`} icon="reply" />
        <SCStatCard label="Priorities" value={String(persona.recruitingPriorities.length)} icon="checklist" />
      </div>

      {/* Tabs */}
      <SCTabs
        tabs={[
          { value: "intelligence", label: "Intelligence" },
          { value: "outreach", label: "Outreach" },
          { value: "actions", label: "Actions" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab content */}
      {activeTab === "intelligence" && (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-6 md:col-span-2">
              {/* Response Probabilities */}
              <SCGlassCard className="p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Response Probabilities</p>
                <div className="space-y-3">
                  {[
                    { label: "DM Open Probability", value: Math.round(persona.dmOpenProbability * 100), color: "#C5050C" },
                    { label: "Follow-Back Probability", value: Math.round(persona.followBackProbability * 100), color: "#00f2ff" },
                    { label: "Est. Response Rate", value: Math.round(persona.estimatedResponseRate * 100), color: "#0bda7d" },
                  ].map((bar) => (
                    <div key={bar.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">{bar.label}</span>
                        <span className="font-mono text-white">{bar.value}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${bar.value}%`, backgroundColor: bar.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </SCGlassCard>

              {/* Contact Windows */}
              <SCGlassCard className="p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Optimal Contact Windows</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-[11px] text-slate-500 mb-2">Best Months</p>
                    <div className="flex flex-wrap gap-1.5">
                      {persona.optimalContactMonths.length > 0
                        ? persona.optimalContactMonths.map((m) => (
                            <SCBadge key={m} variant="default">{MONTH_NAMES[m - 1]}</SCBadge>
                          ))
                        : <span className="text-xs text-slate-600">No data</span>
                      }
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 mb-2">Peak Hours</p>
                    <div className="flex flex-wrap gap-1.5">
                      {persona.optimalContactHours.length > 0
                        ? persona.optimalContactHours.map((h) => (
                            <SCBadge key={h} variant="default">{formatHour(h)}</SCBadge>
                          ))
                        : <span className="text-xs text-slate-600">No data</span>
                      }
                    </div>
                  </div>
                </div>
              </SCGlassCard>
            </div>

            {/* Right column - DM quick panel */}
            <div>
              <SCGlassCard className="p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Quick DM</p>
                <p className="text-sm text-slate-500">
                  Use the outreach pipeline to draft and send DMs to {persona.schoolName}.
                </p>
                <SCButton variant="secondary" size="sm" className="mt-4 w-full" onClick={() => router.push(`/dashboard/outreach?coach=${id}`)}>
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                  Open DM Console
                </SCButton>
              </SCGlassCard>
            </div>
          </div>

          {/* Deep Intelligence Stream */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Deep Intelligence Stream</p>
            <div className="grid gap-4 md:grid-cols-3">
              <SCGlassCard className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-sc-accent-cyan/60 mb-2">Recruiting Pattern</p>
                <p className="text-sm text-slate-400">
                  {persona.communicationStyle === "formal"
                    ? "Prefers structured, formal communication. Lead with credentials and measurables."
                    : persona.communicationStyle === "casual"
                      ? "Open to casual interaction. Engage naturally on X before formal outreach."
                      : "Standard recruiting communication style. Follow program protocols."}
                </p>
              </SCGlassCard>
              <SCGlassCard className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/60 mb-2">OL Pipeline Intel</p>
                <p className="text-sm text-slate-400">
                  {persona.recruitingPriorities.length > 0
                    ? `Program is actively recruiting: ${persona.recruitingPriorities.slice(0, 2).join(", ")}. Target window is open.`
                    : "Limited intel on current OL pipeline needs. Further research recommended."}
                </p>
              </SCGlassCard>
              <SCGlassCard className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-sc-primary/60 mb-2">Win Probability</p>
                <p className="text-sm text-slate-400">
                  {persona.estimatedResponseRate > 0.5
                    ? "High engagement likelihood. Prioritize this target for immediate outreach."
                    : persona.estimatedResponseRate > 0.25
                      ? "Moderate response probability. Sustained engagement recommended before direct DM."
                      : "Lower response probability. Build visibility through consistent X engagement first."}
                </p>
              </SCGlassCard>
            </div>
          </div>
        </>
      )}

      {activeTab === "outreach" && (
        <SCGlassCard className="py-16 text-center">
          <p className="text-sm text-slate-500">
            No outreach history recorded yet for {persona.schoolName}.
          </p>
          <p className="mt-2 text-xs text-slate-600">
            Interactions will appear here once tracked.
          </p>
        </SCGlassCard>
      )}

      {activeTab === "actions" && (
        <div className="space-y-6">
          <SCGlassCard className="p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Best Approach Method</p>
            <p className="text-sm text-white/70">{persona.bestApproachMethod}</p>
          </SCGlassCard>

          <SCGlassCard className="p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Step-by-Step Action Plan</p>
            {persona.bestApproachSteps.length > 0 ? (
              <ol className="space-y-3">
                {persona.bestApproachSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sc-primary text-xs font-bold text-white">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-slate-400">{step}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-slate-600">No action steps generated yet.</p>
            )}
          </SCGlassCard>

          <SCGlassCard className="p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Recruiting Priorities</p>
            {persona.recruitingPriorities.length > 0 ? (
              <ul className="space-y-2">
                {persona.recruitingPriorities.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-400">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sc-primary" />
                    {p}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-600">No priority data available.</p>
            )}
          </SCGlassCard>

          <SCGlassCard className="p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Engagement Strategy</p>
            <p className="text-sm text-slate-400">
              {persona.engagementStrategy || "No strategy data available."}
            </p>
          </SCGlassCard>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { SCPageHeader, SCGlassCard, SCButton, SCBadge, SCStatCard } from "@/components/sc";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface AuditResult {
  audit: {
    photoQuality: boolean;
    headerImage: boolean;
    bioCompleteness: boolean;
    pinnedPost: boolean;
    postCadence: boolean;
    pillarDistribution: boolean;
    engagementRate: boolean;
    coachFollowCount: boolean;
    dmLog: boolean;
    constitutionCompliance: boolean;
    totalScore: number;
    recommendations: string[];
  };
  interpretation: {
    label: string;
    description: string;
    color: string;
  };
  systemReadiness?: {
    liveTweetsLast30Days: number;
    queuedPosts: number;
    approvedPosts: number;
    coachesInDatabase: number;
    coachesWithXHandles: number;
    coachesReadyForDM: number;
    dmsLoggedLast30Days: number;
    headerImageReady: boolean;
    usingLiveXData: boolean;
  };
}

type AuditKey = keyof AuditResult["audit"];

const auditItems: Array<{ key: AuditKey; label: string; description: string; icon: string }> = [
  { key: "photoQuality", label: "Profile Photo Quality", description: "High-resolution, current, athletic framing.", icon: "photo_camera" },
  { key: "headerImage", label: "Header Image", description: "Action-led header with current fit and strong readability.", icon: "panorama" },
  { key: "bioCompleteness", label: "Bio Completeness", description: "Position, size, school, year, GPA, and profile links.", icon: "badge" },
  { key: "pinnedPost", label: "Pinned Post", description: "Current film or profile post that sells the player quickly.", icon: "push_pin" },
  { key: "postCadence", label: "Post Cadence", description: "Steady weekly output instead of random bursts.", icon: "schedule" },
  { key: "pillarDistribution", label: "Content Mix", description: "Balanced spread across performance, work ethic, and character.", icon: "pie_chart" },
  { key: "engagementRate", label: "Engagement Rate", description: "Healthy response quality on recent posts.", icon: "trending_up" },
  { key: "coachFollowCount", label: "Coach Follows", description: "Visible traction from target programs.", icon: "group" },
  { key: "dmLog", label: "DM Activity", description: "Recent outreach is logged and moving.", icon: "send" },
  { key: "constitutionCompliance", label: "Compliance", description: "No content or workflow violations in the current system.", icon: "verified" },
];

function getScoreTone(score: number | undefined) {
  if (score == null) return { badge: "default" as const, color: "text-slate-400" };
  if (score >= 8) return { badge: "success" as const, color: "text-emerald-400" };
  if (score >= 5) return { badge: "warning" as const, color: "text-yellow-400" };
  return { badge: "danger" as const, color: "text-red-400" };
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function AuditPage() {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function runAudit() {
    setLoading(true);
    try {
      const res = await fetch("/api/audit", { cache: "no-store" });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Audit failed:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void runAudit();
  }, []);

  const scoreTone = useMemo(() => getScoreTone(result?.audit.totalScore), [result?.audit.totalScore]);

  const passCount = result
    ? auditItems.filter((item) => Boolean(result.audit[item.key])).length
    : 0;

  return (
    <div className="space-y-8">
      <SCPageHeader
        title="ROGUE SCOUT"
        kicker="Report Generator"
        subtitle="Audit the recruiting machine -- profile, cadence, coach engagement, and DM execution."
        actions={
          <SCButton onClick={() => void runAudit()} disabled={loading} variant="primary">
            <span className="material-symbols-outlined text-[18px]">
              {loading ? "sync" : "play_arrow"}
            </span>
            {loading ? "Running..." : "Run Audit"}
          </SCButton>
        }
      />

      {/* ---- Score Hero + Readiness ---- */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Score Panel */}
        <SCGlassCard variant="strong" className="p-6 lg:p-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            System Readiness
          </p>
          <div className="mt-4 flex items-end gap-4">
            <p className={cn("text-6xl font-black", scoreTone.color)}>
              {result?.audit.totalScore ?? "--"}
            </p>
            <div className="mb-2">
              <SCBadge variant={scoreTone.badge}>
                {result?.interpretation.label ?? "Loading"}
              </SCBadge>
            </div>
          </div>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            out of 10
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            {result?.interpretation.description ??
              "Checking profile, cadence, content mix, coach traction, and DM execution."}
          </p>

          {/* Mini progress bar */}
          <div className="mt-6 h-1.5 w-full rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-sc-primary shadow-[0_0_8px_rgba(197,5,12,0.5)] transition-all"
              style={{ width: `${((result?.audit.totalScore ?? 0) / 10) * 100}%` }}
            />
          </div>
        </SCGlassCard>

        {/* Readiness Metrics */}
        <SCGlassCard className="p-6 lg:p-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Audit Focus
          </p>
          <h2 className="mt-2 text-xl font-black italic uppercase text-white">
            Coach-facing trust signals
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            The score matters less than the blockers. Close the red items that affect how a coach
            experiences the account right now.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-sc-border bg-white/5 p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Header readiness
              </p>
              <p className="mt-1 text-lg font-black text-white">
                {result?.systemReadiness?.headerImageReady ? "Ready" : "Missing"}
              </p>
            </div>
            <div className="rounded-lg border border-sc-border bg-white/5 p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Live X signal
              </p>
              <p className="mt-1 text-lg font-black text-white">
                {result?.systemReadiness?.usingLiveXData ? "Live" : "Fallback"}
              </p>
            </div>
          </div>
        </SCGlassCard>
      </div>

      {/* ---- System Stats ---- */}
      {result?.systemReadiness && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SCStatCard
            label="Coach Database"
            value={`${result.systemReadiness.coachesInDatabase}`}
            icon="groups"
            trend={{
              value: `${result.systemReadiness.coachesWithXHandles} with X handles`,
              direction: "neutral",
            }}
          />
          <SCStatCard
            label="DM Pipeline"
            value={`${result.systemReadiness.coachesReadyForDM}`}
            icon="send"
            trend={{
              value: `${result.systemReadiness.dmsLoggedLast30Days} DMs in 30d`,
              direction: result.systemReadiness.dmsLoggedLast30Days > 0 ? "up" : "neutral",
            }}
          />
          <SCStatCard
            label="Post Queue"
            value={`${result.systemReadiness.queuedPosts}`}
            icon="article"
            trend={{
              value: `${result.systemReadiness.approvedPosts} approved`,
              direction: "neutral",
            }}
          />
          <SCStatCard
            label="Live X Signal"
            value={`${result.systemReadiness.liveTweetsLast30Days}`}
            icon="bolt"
            trend={{
              value: result.systemReadiness.usingLiveXData ? "Live posts in 30d" : "Internal fallback",
              direction: result.systemReadiness.usingLiveXData ? "up" : "neutral",
            }}
          />
        </div>
      )}

      {/* ---- Audit Checklist ---- */}
      <SCGlassCard className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="sc-section-title">Audit Checklist</h3>
          {result && (
            <SCBadge variant={passCount >= 8 ? "success" : passCount >= 5 ? "warning" : "danger"}>
              {passCount}/{auditItems.length} Passing
            </SCBadge>
          )}
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {auditItems.map((item) => {
            const passed = Boolean(result?.audit[item.key]);
            return (
              <div
                key={item.key}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-4 transition-colors",
                  passed
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-red-500/20 bg-red-500/5"
                )}
              >
                <span
                  className={cn(
                    "material-symbols-outlined mt-0.5 text-[20px]",
                    passed ? "text-emerald-400" : "text-red-400"
                  )}
                >
                  {passed ? "check_circle" : "cancel"}
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </SCGlassCard>

      {/* ---- Recommendations ---- */}
      {result && result.audit.recommendations.length > 0 && (
        <SCGlassCard variant="broadcast" className="p-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-sc-primary">warning</span>
            <h3 className="text-sm font-black uppercase tracking-widest text-white">
              Highest-impact fixes
            </h3>
          </div>
          <div className="mt-4 space-y-3">
            {result.audit.recommendations.map((rec, index) => (
              <div
                key={rec}
                className="rounded-lg border border-sc-border bg-white/5 p-4"
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-sc-primary">
                  Priority {index + 1}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{rec}</p>
              </div>
            ))}
          </div>
        </SCGlassCard>
      )}
    </div>
  );
}

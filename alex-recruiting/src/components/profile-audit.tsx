"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

const auditItems: Array<{ key: AuditKey; label: string; description: string }> = [
  { key: "photoQuality", label: "Profile Photo Quality", description: "High-resolution, current, athletic framing." },
  { key: "headerImage", label: "Header Image", description: "Action-led header with current fit and strong readability." },
  { key: "bioCompleteness", label: "Bio Completeness", description: "Position, size, school, year, GPA, and profile links." },
  { key: "pinnedPost", label: "Pinned Post", description: "Current film or profile post that sells the player quickly." },
  { key: "postCadence", label: "Post Cadence", description: "Steady weekly output instead of random bursts." },
  { key: "pillarDistribution", label: "Content Mix", description: "Balanced spread across performance, work ethic, and character." },
  { key: "engagementRate", label: "Engagement Rate", description: "Healthy response quality on recent posts." },
  { key: "coachFollowCount", label: "Coach Follows", description: "Visible traction from target programs." },
  { key: "dmLog", label: "DM Activity", description: "Recent outreach is logged and moving." },
  { key: "constitutionCompliance", label: "Compliance", description: "No content or workflow violations in the current system." },
];

function getScoreTone(score: number | undefined) {
  if (score == null) {
    return {
      badge: "secondary" as const,
      score: "text-[var(--app-muted)]",
      panel: "bg-[rgba(15,40,75,0.06)] text-[var(--app-navy-strong)]",
    };
  }

  if (score >= 8) {
    return {
      badge: "responded" as const,
      score: "text-emerald-300",
      panel: "bg-emerald-500/14 text-emerald-100",
    };
  }

  if (score >= 5) {
    return {
      badge: "draft" as const,
      score: "text-[var(--app-gold-soft)]",
      panel: "bg-[rgba(200,155,60,0.16)] text-[var(--app-gold-soft)]",
    };
  }

  return {
    badge: "rejected" as const,
    score: "text-rose-300",
    panel: "bg-rose-500/14 text-rose-100",
  };
}

export function ProfileAudit() {
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

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="bg-[linear-gradient(145deg,rgba(15,40,75,0.98),rgba(11,29,54,0.94))] p-6 text-white lg:p-8">
              <div className="shell-kicker border-white/10 bg-white/10 text-[var(--app-gold-soft)]">
                System Readiness
              </div>
              <div className="mt-5 flex items-end gap-4">
                <div>
                  <p className={cn("text-6xl font-semibold tracking-tight", scoreTone.score)}>
                    {result?.audit.totalScore ?? "—"}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/55">out of 10</p>
                </div>
                <Badge variant={scoreTone.badge} className="mb-2 border-white/10 bg-white/10 text-white">
                  {result?.interpretation.label ?? "Loading"}
                </Badge>
              </div>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/78">
                {result?.interpretation.description ??
                  "Checking profile, cadence, content mix, coach traction, and DM execution."}
              </p>
            </div>

            <div className="space-y-4 p-6 lg:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
                    Audit Focus
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--app-navy-strong)]">
                    Coach-facing trust signals
                  </h2>
                </div>
                <Button variant="outline" size="sm" onClick={() => void runAudit()} disabled={loading}>
                  <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                  Re-run audit
                </Button>
              </div>

              <div className={cn("rounded-[22px] border border-transparent px-4 py-4", scoreTone.panel)}>
                <p className="text-sm font-semibold">Primary reading</p>
                <p className="mt-2 text-sm leading-6 opacity-90">
                  The score matters less than the blockers. Close the red items that affect how a coach experiences the account right now.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="shell-metric">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
                    Header readiness
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--app-navy-strong)]">
                    {result?.systemReadiness?.headerImageReady ? "Ready" : "Missing"}
                  </p>
                  <p className="mt-1 text-xs text-[var(--app-muted)]">Header image should support the recruiting first impression.</p>
                </div>
                <div className="shell-metric">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
                    Live X signal
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--app-navy-strong)]">
                    {result?.systemReadiness?.usingLiveXData ? "Live" : "Fallback"}
                  </p>
                  <p className="mt-1 text-xs text-[var(--app-muted)]">Audit is reading real X activity when credentials are available.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {result?.systemReadiness ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Coach Database",
              value: `${result.systemReadiness.coachesInDatabase}`,
              detail: `${result.systemReadiness.coachesWithXHandles} with X handles`,
            },
            {
              label: "DM Pipeline",
              value: `${result.systemReadiness.coachesReadyForDM}`,
              detail: `${result.systemReadiness.dmsLoggedLast30Days} DMs logged in 30d`,
            },
            {
              label: "Post Queue",
              value: `${result.systemReadiness.queuedPosts}`,
              detail: `${result.systemReadiness.approvedPosts} approved to publish`,
            },
            {
              label: "Live X Signal",
              value: `${result.systemReadiness.liveTweetsLast30Days}`,
              detail: result.systemReadiness.usingLiveXData ? "Live posts in last 30 days" : "Using internal fallback data",
            },
          ].map((item) => (
            <div key={item.label} className="shell-metric">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
                {item.label}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--app-navy-strong)]">{item.value}</p>
              <p className="mt-1 text-xs text-[var(--app-muted)]">{item.detail}</p>
            </div>
          ))}
        </div>
      ) : null}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-[var(--app-navy-strong)]">Audit Checklist</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {auditItems.map((item) => {
            const passed = Boolean(result?.audit[item.key]);

            return (
              <div
                key={item.key}
                className={cn(
                  "rounded-[22px] border p-4",
                  passed
                    ? "border-emerald-200 bg-emerald-50/70"
                    : "border-rose-200 bg-rose-50/70"
                )}
              >
                <div className="flex items-start gap-3">
                  {passed ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  ) : (
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-[var(--app-navy-strong)]">{item.label}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--app-muted)]">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {result && result.audit.recommendations.length > 0 ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-[var(--app-navy-strong)]">
              <AlertTriangle className="h-4 w-4 text-[var(--app-gold)]" />
              Highest-impact fixes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.audit.recommendations.map((recommendation, index) => (
              <div
                key={recommendation}
                className="rounded-[22px] border border-[rgba(15,40,75,0.08)] bg-white/70 px-4 py-4"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
                  Priority {index + 1}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--app-ink)]">{recommendation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

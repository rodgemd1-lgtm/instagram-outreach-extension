"use client";

import { useEffect, useState } from "react";
import { SCPageHeader } from "@/components/sc/sc-page-header";
import { SCGlassCard } from "@/components/sc/sc-glass-card";
import { SCStatCard } from "@/components/sc/sc-stat-card";
import { SCBadge } from "@/components/sc/sc-badge";
import { SCTabs } from "@/components/sc/sc-tabs";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface EmailAnalytics {
  total: number;
  sent: number;
  opened: number;
  responded: number;
  openRate: number;
  responseRate: number;
}

type EmailStatus = "draft" | "queued" | "sent" | "opened" | "responded";

interface EmailRecord {
  id: string;
  coachName: string;
  schoolName: string;
  subject: string;
  status: EmailStatus;
  sentAt: string | null;
  openedAt: string | null;
  respondedAt: string | null;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const FILTER_TABS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Sent", value: "sent" },
  { label: "Opened", value: "opened" },
  { label: "Responded", value: "responded" },
  { label: "Draft", value: "draft" },
];

const STATUS_CONFIG: Record<
  EmailStatus,
  { variant: "default" | "info" | "warning" | "success" | "primary"; label: string }
> = {
  draft: { variant: "default", label: "Draft" },
  queued: { variant: "info", label: "Queued" },
  sent: { variant: "warning", label: "Sent" },
  opened: { variant: "success", label: "Opened" },
  responded: { variant: "primary", label: "Responded" },
};

/* ------------------------------------------------------------------ */
/*  Helper: format dates                                               */
/* ------------------------------------------------------------------ */

function formatDate(iso: string | null): string {
  if (!iso) return "--";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function EmailTracker() {
  const [analytics, setAnalytics] = useState<EmailAnalytics | null>(null);
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------- fetch analytics ---------- */
  useEffect(() => {
    let cancelled = false;

    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/outreach/email?analytics=true");
        if (!res.ok) throw new Error(`Analytics request failed (${res.status})`);
        const data = await res.json();
        if (!cancelled) setAnalytics(data.analytics);
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load analytics"
          );
      }
    }

    fetchAnalytics();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------- fetch emails (re-runs on tab change) ---------- */
  useEffect(() => {
    let cancelled = false;

    async function fetchEmails() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (activeTab !== "all") params.set("status", activeTab);

        const res = await fetch(`/api/outreach/email?${params.toString()}`);
        if (!res.ok) throw new Error(`Email list request failed (${res.status})`);
        const data = await res.json();
        if (!cancelled) setEmails(data.emails ?? []);
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load emails"
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchEmails();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="space-y-8">
      {/* Header */}
      <SCPageHeader
        title="Email Tracker"
        subtitle="Monitor outreach performance and track coach engagement"
        kicker="Analytics"
      />

      {/* Error banner */}
      {error && (
        <SCGlassCard className="p-4 border-l-4 border-l-red-500">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-400">
              error
            </span>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </SCGlassCard>
      )}

      {/* Analytics stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SCStatCard
          label="Total Sent"
          value={analytics?.sent ?? "--"}
          icon="send"
          trend={
            analytics
              ? {
                  value: `${analytics.total} total`,
                  direction: "neutral" as const,
                }
              : undefined
          }
        />
        <SCStatCard
          label="Open Rate"
          value={
            analytics
              ? `${Math.round(analytics.openRate * 100)}%`
              : "--"
          }
          icon="visibility"
          trend={
            analytics
              ? {
                  value: `${analytics.opened} opened`,
                  direction:
                    analytics.openRate > 0.5
                      ? ("up" as const)
                      : analytics.openRate > 0.2
                        ? ("neutral" as const)
                        : ("down" as const),
                }
              : undefined
          }
        />
        <SCStatCard
          label="Response Rate"
          value={
            analytics
              ? `${Math.round(analytics.responseRate * 100)}%`
              : "--"
          }
          icon="reply"
          trend={
            analytics
              ? {
                  value: `${analytics.responded} replied`,
                  direction:
                    analytics.responseRate > 0.3
                      ? ("up" as const)
                      : analytics.responseRate > 0.1
                        ? ("neutral" as const)
                        : ("down" as const),
                }
              : undefined
          }
        />
        <SCStatCard
          label="Pending"
          value={
            analytics
              ? analytics.total - analytics.sent
              : "--"
          }
          icon="schedule"
          trend={
            analytics
              ? {
                  value: "drafts + queued",
                  direction: "neutral" as const,
                }
              : undefined
          }
        />
      </div>

      {/* Filter tabs */}
      <SCTabs
        tabs={FILTER_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Email list */}
      <SCGlassCard className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="material-symbols-outlined text-[32px] text-slate-500 animate-spin">
              progress_activity
            </span>
            <span className="ml-3 text-sm text-slate-400">
              Loading emails...
            </span>
          </div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-outlined text-[48px] text-slate-600 mb-3">
              inbox
            </span>
            <p className="text-sm text-slate-500 font-medium">
              No emails found
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {activeTab === "all"
                ? "Compose your first email to get started"
                : `No emails with status "${activeTab}"`}
            </p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-sc-border text-[10px] font-black uppercase tracking-widest text-slate-500">
              <div className="col-span-3">Coach</div>
              <div className="col-span-3">School</div>
              <div className="col-span-3">Subject</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2 text-right">Date</div>
            </div>

            {/* Rows */}
            {emails.map((email) => {
              const statusCfg = STATUS_CONFIG[email.status];
              const displayDate =
                email.respondedAt ?? email.openedAt ?? email.sentAt;

              return (
                <div
                  key={email.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 border-b border-sc-border last:border-b-0 hover:bg-white/[0.02] transition-colors"
                >
                  {/* Coach name */}
                  <div className="col-span-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-slate-500">
                      person
                    </span>
                    <span className="text-sm font-semibold text-white truncate">
                      {email.coachName}
                    </span>
                  </div>

                  {/* School */}
                  <div className="col-span-3 flex items-center">
                    <span className="text-sm text-slate-300 truncate">
                      {email.schoolName}
                    </span>
                  </div>

                  {/* Subject */}
                  <div className="col-span-3 flex items-center">
                    <span className="text-sm text-slate-400 truncate">
                      {email.subject}
                    </span>
                  </div>

                  {/* Status badge */}
                  <div className="col-span-1 flex items-center">
                    <SCBadge variant={statusCfg.variant}>
                      {statusCfg.label}
                    </SCBadge>
                  </div>

                  {/* Date */}
                  <div className="col-span-2 flex items-center justify-end">
                    <span className="text-xs text-slate-500">
                      {formatDate(displayDate)}
                    </span>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </SCGlassCard>
    </div>
  );
}

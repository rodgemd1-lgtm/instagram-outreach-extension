"use client";

import { useState, useEffect, useCallback } from "react";
import { SCPageHeader } from "@/components/sc/sc-page-header";
import { SCGlassCard } from "@/components/sc/sc-glass-card";
import { SCStatCard } from "@/components/sc/sc-stat-card";
import { SCBadge } from "@/components/sc/sc-badge";
import { SCButton } from "@/components/sc/sc-button";
import { cn } from "@/lib/utils";

/* ── Types ── */
interface AgentStatus {
  id: string;
  name: string;
  description: string;
  cronSchedule: string;
  lastRunAt: string | null;
  consecutiveFailures: number;
  lastRunStatus: string | null;
  lastRunSummary: string | null;
  pendingActions: number;
}

interface AgentAction {
  id: string;
  agentId: string;
  runId: string;
  actionType: string;
  title: string;
  description: string | null;
  payload: Record<string, unknown>;
  status: string;
  priority: number;
  expiresAt: string | null;
  createdAt: string;
}

/* ── Agent Config ── */
const agentMeta: Record<string, { icon: string; schedule: string; displayName: string }> = {
  "coach-intelligence": { icon: "visibility", schedule: "Every 4 hours", displayName: "Target Scout" },
  "profile-optimizer": { icon: "shield", schedule: "Daily 7 AM CT", displayName: "Deadline Guardian" },
  "timing-optimizer": { icon: "timer", schedule: "Every 6 hours", displayName: "Content Engineer" },
  "placement-analyst": { icon: "school", schedule: "Daily 10 PM CT", displayName: "Placement Analyst" },
  "x-growth-agent": { icon: "bolt", schedule: "Manual Run", displayName: "X Growth Scraper" },
};

const actionTypeLabels: Record<string, string> = {
  update_bio: "Update Bio",
  update_profile_photo: "Update Photo",
  update_header: "Update Header",
  update_pinned_post: "Pin Post",
  schedule_post: "Schedule Post",
  send_dm: "Send DM",
  follow_coach: "Follow Coach",
  change_priority_tier: "Change Tier",
  generate_media_prompt: "Media Prompt",
  update_score: "Score Update",
  fire_alert: "Alert",
  update_posting_windows: "Timing Update",
  update_fit_scores: "Fit Scores",
  recommend_schedule: "Schedule",
};

const priorityVariant: Record<number, "danger" | "warning" | "info" | "default"> = {
  5: "danger",
  4: "warning",
  3: "warning",
  2: "info",
  1: "default",
};

/* ── Main Page ── */
export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningAgent, setRunningAgent] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [statusRes, actionsRes] = await Promise.all([
        fetch("/api/agents/status"),
        fetch("/api/agents/actions"),
      ]);
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setAgents(statusData.agents || []);
      }
      if (actionsRes.ok) {
        const actionsData = await actionsRes.json();
        setActions(actionsData.actions || []);
      }
      setError(null);
    } catch {
      setError("Could not connect to agent system. Make sure the database is configured.");
      setAgents([
        { id: "coach-intelligence", name: "Coach Intelligence", description: "Monitors coach activity and detects recruiting signals", cronSchedule: "0 */4 * * *", lastRunAt: null, consecutiveFailures: 0, lastRunStatus: null, lastRunSummary: null, pendingActions: 0 },
        { id: "profile-optimizer", name: "Profile Optimizer", description: "Evaluates and improves Jake's X profile daily", cronSchedule: "0 12 * * *", lastRunAt: null, consecutiveFailures: 0, lastRunStatus: null, lastRunSummary: null, pendingActions: 0 },
        { id: "timing-optimizer", name: "Timing Optimizer", description: "Finds optimal posting windows and coordinates schedule", cronSchedule: "0 0,6,12,18 * * *", lastRunAt: null, consecutiveFailures: 0, lastRunStatus: null, lastRunSummary: null, pendingActions: 0 },
        { id: "placement-analyst", name: "Placement Analyst", description: "Analyzes school fit and projects offer likelihood", cronSchedule: "0 3 * * *", lastRunAt: null, consecutiveFailures: 0, lastRunStatus: null, lastRunSummary: null, pendingActions: 0 },
        { id: "x-growth-agent", name: "X Growth Scraper", description: "Crawls X timelines extracting engagement metrics and recruiting signals via Playwright", cronSchedule: "Manual", lastRunAt: null, consecutiveFailures: 0, lastRunStatus: null, lastRunSummary: null, pendingActions: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  async function triggerAgent(agentId: string) {
    setRunningAgent(agentId);
    try {
      let res;
      if (agentId === "x-growth-agent") {
        res = await fetch("/api/agents/x-growth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ handle: "CoachFickell", maxTweets: 10 }),
        });
      } else {
        res = await fetch("/api/agents/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentId }),
        });
      }
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to trigger agent");
      }
      await fetchData();
    } catch {
      setError("Failed to trigger agent");
    } finally {
      setRunningAgent(null);
    }
  }

  async function handleAction(actionId: string, status: "approved" | "rejected") {
    setProcessingAction(actionId);
    try {
      await fetch(`/api/agents/actions/${actionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await fetchData();
    } catch {
      setError("Failed to update action");
    } finally {
      setProcessingAction(null);
    }
  }

  async function bulkAction(status: "approved" | "rejected") {
    const ids = actions.map((a) => a.id);
    if (ids.length === 0) return;
    try {
      await fetch("/api/agents/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionIds: ids, status }),
      });
      await fetchData();
    } catch {
      setError("Failed to bulk update actions");
    }
  }

  function formatTime(dateStr: string | null): string {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    return `${diffDays}d ago`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined text-[32px] animate-spin text-slate-400">
          progress_activity
        </span>
      </div>
    );
  }

  const totalPending = actions.length;
  const highPriority = actions.filter((a) => a.priority >= 4).length;
  const activeAgents = agents.filter((a) => a.lastRunStatus === "completed" || a.lastRunStatus === "running").length;
  const failedAgents = agents.filter((a) => (a.consecutiveFailures ?? 0) > 0).length;

  return (
    <div className="space-y-6">
      <SCPageHeader
        title="AI AGENTS"
        subtitle="5 autonomous agents managing Jacob's recruiting machine"
        actions={
          <SCButton variant="secondary" onClick={fetchData}>
            <span className="material-symbols-outlined text-[16px] mr-1">refresh</span>
            Refresh
          </SCButton>
        }
      />

      {error && (
        <SCGlassCard className="p-3 border-l-4 border-l-yellow-500">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-yellow-500 mt-0.5">warning</span>
            <p className="text-sm text-yellow-400">{error}</p>
          </div>
        </SCGlassCard>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SCStatCard label="Active Agents" value={`${activeAgents}/${agents.length}`} icon="smart_toy" />
        <SCStatCard label="Pending Actions" value={String(totalPending)} icon="bolt" />
        <SCStatCard label="High Priority" value={String(highPriority)} icon="priority_high" />
        <SCStatCard
          label="Issues"
          value={String(failedAgents)}
          icon={failedAgents === 0 ? "check_circle" : "error"}
        />
      </div>

      {/* Agent Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => {
          const meta = agentMeta[agent.id] || { icon: "smart_toy", schedule: agent.cronSchedule, displayName: agent.name };
          const isRunning = runningAgent === agent.id;
          const hasFailed = (agent.consecutiveFailures ?? 0) > 0;
          const isExpanded = expandedRun === agent.id;

          return (
            <SCGlassCard
              key={agent.id}
              variant={hasFailed ? "broadcast" : "default"}
              className="p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-sc-border">
                    <span className="material-symbols-outlined text-[20px] text-sc-primary">
                      {meta.icon}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{meta.displayName}</p>
                    <p className="text-xs text-slate-500">{meta.schedule}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {agent.pendingActions > 0 && (
                    <SCBadge variant="warning">{agent.pendingActions} pending</SCBadge>
                  )}
                  {agent.lastRunStatus === "completed" && (
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" title="Healthy" />
                  )}
                  {agent.lastRunStatus === "running" && (
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" title="Running" />
                  )}
                  {agent.lastRunStatus === "failed" && (
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500" title="Failed" />
                  )}
                  {!agent.lastRunStatus && (
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-600" title="Never run" />
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-3">{agent.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    {formatTime(agent.lastRunAt)}
                  </span>
                  {hasFailed && (
                    <span className="flex items-center gap-1 text-red-400">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      {agent.consecutiveFailures} failures
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {agent.lastRunSummary && (
                    <SCButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedRun(isExpanded ? null : agent.id)}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isExpanded ? "expand_less" : "expand_more"}
                      </span>
                    </SCButton>
                  )}
                  <SCButton
                    variant="secondary"
                    size="sm"
                    onClick={() => triggerAgent(agent.id)}
                    disabled={isRunning}
                  >
                    {isRunning ? (
                      <span className="material-symbols-outlined text-[14px] animate-spin mr-1">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-[14px] mr-1">play_arrow</span>
                    )}
                    {isRunning ? "Running..." : "Run Now"}
                  </SCButton>
                </div>
              </div>

              {isExpanded && agent.lastRunSummary && (
                <div className="mt-3 rounded-lg bg-white/5 border border-sc-border p-3">
                  <p className="text-xs text-slate-400 whitespace-pre-wrap">{agent.lastRunSummary}</p>
                </div>
              )}
            </SCGlassCard>
          );
        })}
      </div>

      {/* Approval Queue */}
      <SCGlassCard variant="strong" className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-yellow-500">bolt</span>
            <p className="text-sm font-bold text-white">Action Approval Queue</p>
            {totalPending > 0 && <SCBadge variant="warning">{totalPending}</SCBadge>}
          </div>
          {totalPending > 0 && (
            <div className="flex items-center gap-2">
              <SCButton variant="danger" size="sm" onClick={() => bulkAction("rejected")}>
                Reject All
              </SCButton>
              <SCButton size="sm" onClick={() => bulkAction("approved")}>
                Approve All
              </SCButton>
            </div>
          )}
        </div>

        {actions.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-[32px] text-emerald-500 mb-2">check_circle</span>
            <p className="text-sm text-slate-400">No pending actions</p>
            <p className="text-xs text-slate-600 mt-1">Agents will create actions on their next run</p>
          </div>
        ) : (
          <div className="space-y-2">
            {actions.map((action) => {
              const meta = agentMeta[action.agentId];
              const isProcessing = processingAction === action.id;

              return (
                <div
                  key={action.id}
                  className="flex items-start gap-3 rounded-lg border border-sc-border bg-white/5 p-3 hover:bg-white/[0.08] transition-colors"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
                    <span className="material-symbols-outlined text-[16px] text-sc-primary">
                      {meta?.icon || "smart_toy"}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-white">{action.title}</p>
                      <SCBadge variant={priorityVariant[action.priority] || "default"}>
                        P{action.priority}
                      </SCBadge>
                      <SCBadge variant="default">
                        {actionTypeLabels[action.actionType] || action.actionType}
                      </SCBadge>
                    </div>
                    {action.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{action.description}</p>
                    )}
                    <p className="text-[10px] text-slate-600 mt-1">
                      {formatTime(action.createdAt)} via {agents.find((a) => a.id === action.agentId)?.name || action.agentId}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      className="h-7 w-7 flex items-center justify-center rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      onClick={() => handleAction(action.id, "rejected")}
                      disabled={isProcessing}
                    >
                      <span className="material-symbols-outlined text-[18px]">cancel</span>
                    </button>
                    <button
                      className="h-7 w-7 flex items-center justify-center rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                      onClick={() => handleAction(action.id, "approved")}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SCGlassCard>

      {/* How It Works */}
      <SCGlassCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[20px] text-slate-400">person_search</span>
          <p className="text-sm font-bold text-white">How the Agent System Works</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { icon: "visibility", title: "Target Scout", desc: "Monitors coach activity, detects recruiting signals, and maps engagement patterns" },
            { icon: "shield", title: "Deadline Guardian", desc: "Audits profile quality, NCAA compliance, and recommends bio/photo improvements" },
            { icon: "timer", title: "Content Engineer", desc: "Optimizes posting windows, coach activity timing, and weekly content schedules" },
            { icon: "school", title: "Placement Analyst", desc: "Analyzes roster gaps, calculates fit scores, and projects offer likelihood" },
            { icon: "bolt", title: "X Growth Scraper", desc: "Locally executes Playwright to extract real timeline data and engagement metrics" },
          ].map((item) => (
            <div key={item.title} className="rounded-lg border border-sc-border bg-white/5 p-3">
              <span className="material-symbols-outlined text-[20px] text-sc-primary mb-2 block">
                {item.icon}
              </span>
              <p className="text-xs font-bold text-white">{item.title}</p>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-sc-border">
          <p className="text-xs text-slate-500">
            <span className="font-bold text-slate-400">Human-in-the-loop:</span>{" "}
            Profile changes, posts, DMs, and follows always require your approval. Internal analysis runs automatically.
          </p>
        </div>
      </SCGlassCard>
    </div>
  );
}

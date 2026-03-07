"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Bot,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Eye,
  UserSearch,
  Timer,
  GraduationCap,
  Shield,
  Zap,
  Activity,
  Loader2,
} from "lucide-react";

/* ─── Types ─── */
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

/* ─── Agent Config ─── */
const agentMeta: Record<string, { icon: typeof Bot; color: string; bgColor: string; schedule: string }> = {
  "coach-intelligence": {
    icon: Eye,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    schedule: "Every 4 hours",
  },
  "profile-optimizer": {
    icon: Shield,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    schedule: "Daily 7 AM CT",
  },
  "timing-optimizer": {
    icon: Timer,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    schedule: "Every 6 hours",
  },
  "placement-analyst": {
    icon: GraduationCap,
    color: "text-green-600",
    bgColor: "bg-green-50",
    schedule: "Daily 10 PM CT",
  },
};

const priorityColors: Record<number, string> = {
  5: "bg-red-100 text-red-700 border-red-200",
  4: "bg-orange-100 text-orange-700 border-orange-200",
  3: "bg-yellow-100 text-yellow-700 border-yellow-200",
  2: "bg-blue-100 text-blue-700 border-blue-200",
  1: "bg-slate-100 text-slate-600 border-slate-200",
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

/* ─── Main Page ─── */
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
      // Set default agent data for display
      setAgents([
        { id: "coach-intelligence", name: "Coach Intelligence", description: "Monitors coach activity and detects recruiting signals", cronSchedule: "0 */4 * * *", lastRunAt: null, consecutiveFailures: 0, lastRunStatus: null, lastRunSummary: null, pendingActions: 0 },
        { id: "profile-optimizer", name: "Profile Optimizer", description: "Evaluates and improves Jake's X profile daily", cronSchedule: "0 12 * * *", lastRunAt: null, consecutiveFailures: 0, lastRunStatus: null, lastRunSummary: null, pendingActions: 0 },
        { id: "timing-optimizer", name: "Timing Optimizer", description: "Finds optimal posting windows and coordinates schedule", cronSchedule: "0 0,6,12,18 * * *", lastRunAt: null, consecutiveFailures: 0, lastRunStatus: null, lastRunSummary: null, pendingActions: 0 },
        { id: "placement-analyst", name: "Placement Analyst", description: "Analyzes school fit and projects offer likelihood", cronSchedule: "0 3 * * *", lastRunAt: null, consecutiveFailures: 0, lastRunStatus: null, lastRunSummary: null, pendingActions: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  async function triggerAgent(agentId: string) {
    setRunningAgent(agentId);
    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });
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
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const totalPending = actions.length;
  const highPriority = actions.filter((a) => a.priority >= 4).length;
  const activeAgents = agents.filter((a) => a.lastRunStatus === "completed" || a.lastRunStatus === "running").length;
  const failedAgents = agents.filter((a) => (a.consecutiveFailures ?? 0) > 0).length;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bot className="h-5 w-5 text-slate-700" />
            Agent Command Center
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">4 autonomous agents managing Jacob&apos;s recruiting machine</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          className="flex items-center gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">{error}</p>
        </div>
      )}

      {/* ═══ SUMMARY CARDS ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Active Agents</p>
            <div className="flex items-end justify-between mt-1">
              <p className="text-2xl font-bold text-slate-900">{activeAgents}/4</p>
              <Activity className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Pending Actions</p>
            <div className="flex items-end justify-between mt-1">
              <p className="text-2xl font-bold text-slate-900">{totalPending}</p>
              {totalPending > 0 && <Zap className="h-5 w-5 text-yellow-500" />}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">High Priority</p>
            <div className="flex items-end justify-between mt-1">
              <p className="text-2xl font-bold text-slate-900">{highPriority}</p>
              {highPriority > 0 && <AlertTriangle className="h-5 w-5 text-red-500" />}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Issues</p>
            <div className="flex items-end justify-between mt-1">
              <p className="text-2xl font-bold text-slate-900">{failedAgents}</p>
              {failedAgents === 0 ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══ AGENT STATUS GRID ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => {
          const meta = agentMeta[agent.id] || { icon: Bot, color: "text-slate-600", bgColor: "bg-slate-50", schedule: agent.cronSchedule };
          const Icon = meta.icon;
          const isRunning = runningAgent === agent.id;
          const hasFailed = (agent.consecutiveFailures ?? 0) > 0;
          const isExpanded = expandedRun === agent.id;

          return (
            <Card key={agent.id} className={cn(
              "transition-all",
              hasFailed && "border-red-200",
              isRunning && "border-blue-200"
            )}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", meta.bgColor)}>
                      <Icon className={cn("h-5 w-5", meta.color)} />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{agent.name}</CardTitle>
                      <p className="text-xs text-slate-500 mt-0.5">{meta.schedule}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {agent.pendingActions > 0 && (
                      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-[10px]">
                        {agent.pendingActions} pending
                      </Badge>
                    )}
                    {agent.lastRunStatus === "completed" && (
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500" title="Healthy" />
                    )}
                    {agent.lastRunStatus === "running" && (
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" title="Running" />
                    )}
                    {agent.lastRunStatus === "failed" && (
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500" title="Failed" />
                    )}
                    {!agent.lastRunStatus && (
                      <div className="h-2.5 w-2.5 rounded-full bg-slate-300" title="Never run" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-slate-500 mb-3">{agent.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(agent.lastRunAt)}
                    </span>
                    {hasFailed && (
                      <span className="flex items-center gap-1 text-red-500">
                        <AlertTriangle className="h-3 w-3" />
                        {agent.consecutiveFailures} failures
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {agent.lastRunSummary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => setExpandedRun(isExpanded ? null : agent.id)}
                      >
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2.5 text-xs"
                      onClick={() => triggerAgent(agent.id)}
                      disabled={isRunning}
                    >
                      {isRunning ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                      <span className="ml-1">{isRunning ? "Running..." : "Run Now"}</span>
                    </Button>
                  </div>
                </div>

                {/* Expanded Run Summary */}
                {isExpanded && agent.lastRunSummary && (
                  <div className="mt-3 rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <p className="text-xs text-slate-600 whitespace-pre-wrap">{agent.lastRunSummary}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ═══ APPROVAL QUEUE ═══ */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Action Approval Queue
              {totalPending > 0 && (
                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-[10px] ml-1">
                  {totalPending}
                </Badge>
              )}
            </CardTitle>
            {totalPending > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => bulkAction("rejected")}
                >
                  Reject All
                </Button>
                <Button
                  size="sm"
                  className="h-7 px-2.5 text-xs bg-green-600 hover:bg-green-700"
                  onClick={() => bulkAction("approved")}
                >
                  Approve All
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {actions.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No pending actions</p>
              <p className="text-xs text-slate-400 mt-1">Agents will create actions on their next run</p>
            </div>
          ) : (
            <div className="space-y-2">
              {actions.map((action) => {
                const meta = agentMeta[action.agentId];
                const isProcessing = processingAction === action.id;

                return (
                  <div
                    key={action.id}
                    className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 hover:border-slate-200 transition-colors"
                  >
                    {/* Agent Icon */}
                    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", meta?.bgColor || "bg-slate-50")}>
                      {meta ? <meta.icon className={cn("h-4 w-4", meta.color)} /> : <Bot className="h-4 w-4 text-slate-400" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-slate-800">{action.title}</p>
                        <Badge className={cn("text-[10px] border", priorityColors[action.priority] || priorityColors[3])}>
                          P{action.priority}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {actionTypeLabels[action.actionType] || action.actionType}
                        </Badge>
                      </div>
                      {action.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{action.description}</p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1">
                        {formatTime(action.createdAt)} via {agentMeta[action.agentId]?.schedule ? agents.find((a) => a.id === action.agentId)?.name : action.agentId}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleAction(action.id, "rejected")}
                        disabled={isProcessing}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleAction(action.id, "approved")}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══ HOW IT WORKS ═══ */}
      <Card className="border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <UserSearch className="h-4 w-4 text-slate-500" />
            How the Agent System Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: Eye, color: "text-purple-600", bg: "bg-purple-50", title: "Coach Intelligence", desc: "Scans coach tweets, detects offers & signals, tracks follow changes every 4 hours" },
              { icon: Shield, color: "text-blue-600", bg: "bg-blue-50", title: "Profile Optimizer", desc: "Daily 10-point audit, bio variants, AI media prompts for photos/headers/video" },
              { icon: Timer, color: "text-orange-600", bg: "bg-orange-50", title: "Timing Optimizer", desc: "Scores 168 posting windows, builds weekly schedule, adapts to recruiting seasons" },
              { icon: GraduationCap, color: "text-green-600", bg: "bg-green-50", title: "Placement Analyst", desc: "School fit scores, offer projections, roster gap analysis, commitment tracking" },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-slate-100 p-3">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg mb-2", item.bg)}>
                  <item.icon className={cn("h-4 w-4", item.color)} />
                </div>
                <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-600">Human-in-the-loop:</span>{" "}
              Profile changes, posts, DMs, and follows always require your approval. Internal analysis runs automatically.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

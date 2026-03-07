// Agent System — Core Types

export type AgentId = "profile-optimizer" | "timing-optimizer" | "coach-intelligence" | "placement-analyst";

export type AgentActionStatus = "pending_approval" | "approved" | "rejected" | "executed" | "expired";

export type AgentRunStatus = "running" | "completed" | "failed";

export type ActionType =
  | "update_bio"
  | "update_profile_photo"
  | "update_header"
  | "update_pinned_post"
  | "schedule_post"
  | "send_dm"
  | "follow_coach"
  | "change_priority_tier"
  | "generate_media_prompt"
  | "update_score"
  | "fire_alert"
  | "update_posting_windows"
  | "update_fit_scores"
  | "recommend_schedule";

// Actions that require human approval before execution
export const REQUIRES_APPROVAL: ActionType[] = [
  "update_bio",
  "update_profile_photo",
  "update_header",
  "update_pinned_post",
  "schedule_post",
  "send_dm",
  "follow_coach",
  "change_priority_tier",
];

export interface AgentConfig {
  id: AgentId;
  name: string;
  description: string;
  cronSchedule: string;
  skills: string[];
}

export interface AgentAction {
  id: string;
  agentId: AgentId;
  runId: string;
  actionType: ActionType;
  title: string;
  description: string;
  payload: Record<string, unknown>;
  status: AgentActionStatus;
  priority: number; // 1-5, 5 = highest
  expiresAt: Date | null;
  createdAt: Date;
}

export interface AgentRun {
  id: string;
  agentId: AgentId;
  triggeredBy: "cron" | "manual";
  status: AgentRunStatus;
  startedAt: Date;
  completedAt: Date | null;
  summary: string | null;
  tokensUsed: number;
  actionsCreated: number;
  errorMessage: string | null;
}

export interface AgentState {
  agentId: AgentId;
  lastRunAt: Date | null;
  consecutiveFailures: number;
  metadata: Record<string, unknown>;
}

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  requiresApproval: boolean;
  execute: (context: SkillContext) => Promise<SkillResult>;
}

export interface SkillContext {
  runId: string;
  agentId: AgentId;
  parameters?: Record<string, unknown>;
}

export interface SkillResult {
  success: boolean;
  actions: SkillResultAction[];
  data?: Record<string, unknown>;
  error?: string;
}

export interface SkillResultAction {
  actionType: ActionType;
  title: string;
  description: string;
  payload: Record<string, unknown>;
  priority: number;
  expiresAt?: Date;
}

export interface ClaudeSkillCall {
  skillId: string;
  reasoning: string;
  parameters?: Record<string, unknown>;
}

export interface AgentClaudeResponse {
  analysis: string;
  skillCalls: ClaudeSkillCall[];
}

export const AGENT_CONFIGS: Record<AgentId, AgentConfig> = {
  "profile-optimizer": {
    id: "profile-optimizer",
    name: "Profile Optimizer",
    description: "Evaluates and improves Jake's X profile daily",
    cronSchedule: "0 12 * * *", // 7 AM CT
    skills: [
      "audit_profile",
      "generate_bio_variants",
      "recommend_bio_update",
      "generate_profile_photo_prompt",
      "generate_header_prompt",
      "generate_video_prompt",
      "analyze_competitor_profiles",
      "recommend_pinned_post",
    ],
  },
  "timing-optimizer": {
    id: "timing-optimizer",
    name: "Timing Optimizer",
    description: "Finds optimal posting windows and coordinates schedule",
    cronSchedule: "0 0,6,12,18 * * *", // Every 6 hours
    skills: [
      "analyze_engagement_windows",
      "map_coach_activity",
      "calculate_posting_window_scores",
      "build_weekly_schedule",
      "recommend_post_time",
      "detect_seasonal_patterns",
    ],
  },
  "coach-intelligence": {
    id: "coach-intelligence",
    name: "Coach Intelligence",
    description: "Monitors coach activity and detects recruiting signals",
    cronSchedule: "0 */4 * * *", // Every 4 hours
    skills: [
      "scan_coach_tweets",
      "detect_recruiting_signals",
      "detect_follow_changes",
      "update_behavior_profiles",
      "track_competitor_offers",
      "generate_engagement_alert",
      "recommend_dm_timing",
    ],
  },
  "placement-analyst": {
    id: "placement-analyst",
    name: "Placement Analyst",
    description: "Analyzes school fit and projects offer likelihood",
    cronSchedule: "0 3 * * *", // 10 PM CT
    skills: [
      "analyze_roster_gaps",
      "calculate_fit_scores",
      "project_offer_likelihood",
      "track_commitment_trends",
      "identify_opportunity_schools",
      "recommend_focus_shift",
      "generate_school_report",
    ],
  },
};

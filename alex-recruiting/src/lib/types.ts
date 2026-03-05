// Alex Recruiting Intelligence System — Shared Types

export type DivisionTier = "D1 FBS" | "D1 FCS" | "D2" | "D3" | "NAIA";
export type PriorityTier = "Tier 1" | "Tier 2" | "Tier 3";
export type FollowStatus = "not_followed" | "followed" | "followed_back" | "unfollowed";
export type DMStatus = "not_sent" | "drafted" | "approved" | "sent" | "responded" | "no_response";
export type PostStatus = "draft" | "approved" | "scheduled" | "posted" | "rejected";
export type ContentPillar = "performance" | "work_ethic" | "character";
export type AuditScore = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface Coach {
  id: string;
  name: string;
  title: string;
  schoolId: string;
  schoolName: string;
  division: DivisionTier;
  conference: string;
  xHandle: string;
  dmOpen: boolean;
  followStatus: FollowStatus;
  dmStatus: DMStatus;
  priorityTier: PriorityTier;
  olNeedScore: number; // 1-5
  xActivityScore: number; // 1-5
  lastEngaged: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface School {
  id: string;
  name: string;
  division: DivisionTier;
  conference: string;
  state: string;
  priorityTier: PriorityTier;
  olNeedScore: number;
  whyJacob: string;
  rosterUrl: string;
  staffUrl: string;
  officialXHandle: string;
  coaches: Coach[];
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  content: string;
  pillar: ContentPillar;
  hashtags: string[];
  mediaUrl: string | null;
  scheduledFor: string;
  bestTime: string;
  status: PostStatus;
  xPostId: string | null;
  impressions: number;
  engagements: number;
  engagementRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface DMMessage {
  id: string;
  coachId: string;
  coachName: string;
  schoolName: string;
  templateType: string;
  content: string;
  status: DMStatus;
  sentAt: string | null;
  respondedAt: string | null;
  responseContent: string | null;
  createdAt: string;
}

export interface EngagementEvent {
  id: string;
  eventType: "follow" | "follow_back" | "like" | "reply" | "retweet" | "mention" | "dm_response";
  coachId: string | null;
  coachName: string;
  schoolName: string;
  postId: string | null;
  details: string;
  timestamp: string;
}

export interface ProfileAudit {
  id: string;
  date: string;
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
  totalScore: AuditScore;
  recommendations: string[];
}

export interface CompetitorRecruit {
  id: string;
  name: string;
  xHandle: string;
  position: string;
  classYear: number;
  school: string;
  state: string;
  height: string;
  weight: string;
  followerCount: number;
  postCadence: number; // posts per week
  engagementRate: number;
  topContentTypes: string[];
  schoolInterestSignals: string[];
  lastUpdated: string;
}

export interface AnalyticsSnapshot {
  date: string;
  totalFollowers: number;
  coachFollows: number;
  dmsSent: number;
  dmResponseRate: number;
  postsPublished: number;
  avgEngagementRate: number;
  profileVisits: number;
  auditScore: AuditScore;
}

export interface WeeklyCalendarEntry {
  day: string;
  contentType: string;
  pillar: ContentPillar;
  bestTime: string;
  notes: string;
}

export interface HashtagCategory {
  category: string;
  hashtags: string[];
  priority: "every_post" | "film_training" | "broad" | "school_targeted" | "training" | "local" | "camp_event" | "targeted";
  notes: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  actions?: ChatAction[];
}

export interface ChatAction {
  type: "approve_post" | "reject_post" | "edit_post" | "send_dm" | "run_scrape" | "view_report";
  label: string;
  payload: Record<string, unknown>;
}

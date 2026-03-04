// ============ LEADS ============

export type LeadSource = 'followers' | 'following' | 'likers' | 'commenters' | 'manual' | 'csv_import';

export interface Lead {
  id: string;
  username: string;
  fullName: string | null;
  firstName: string | null;
  profileUrl: string;
  bio: string | null;
  followerCount: number | null;
  followingCount: number | null;
  externalUrl: string | null;
  avatarUrl: string | null;
  source: LeadSource;
  sourceTarget: string;
  customFields: Record<string, string>;
  tags: string[];
  listId: string;
  createdAt: number;
  updatedAt: number;
  enriched: boolean;
}

export interface LeadList {
  id: string;
  name: string;
  description: string;
  source: LeadSource;
  sourceTarget: string;
  leadCount: number;
  createdAt: number;
  updatedAt: number;
}

// ============ CAMPAIGNS ============

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'error';

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  leadListId: string;
  steps: CampaignStep[];
  settings: CampaignSettings;
  stats: CampaignStats;
  createdAt: number;
  updatedAt: number;
  startedAt: number | null;
  pausedAt: number | null;
  completedAt: number | null;
}

export interface CampaignStep {
  id: string;
  order: number;
  variants: MessageVariant[];
  delayAfterPrevious: number;
  delayUnit: 'minutes' | 'hours' | 'days';
}

export interface MessageVariant {
  id: string;
  label: string;
  text: string;
  weight: number;
}

export interface CampaignSettings {
  dailyLimit: number;
  minDelayBetweenSends: number;
  maxDelayBetweenSends: number;
  activeHoursStart: number;
  activeHoursEnd: number;
  stopOnReply: boolean;
  skipIfAlreadyMessaged: boolean;
}

export interface CampaignStats {
  totalLeads: number;
  sent: number;
  delivered: number;
  replied: number;
  failed: number;
  pending: number;
  responseRate: number;
}

// ============ CAMPAIGN-LEAD JUNCTION ============

export type CampaignLeadStatus =
  | 'queued'
  | 'in_progress'
  | 'waiting_delay'
  | 'completed'
  | 'replied'
  | 'failed'
  | 'skipped';

export interface CampaignLead {
  id: string;
  campaignId: string;
  leadId: string;
  username: string;
  status: CampaignLeadStatus;
  currentStepIndex: number;
  lastStepSentAt: number | null;
  nextStepDueAt: number | null;
  variantsSent: string[];
  errorCount: number;
  lastError: string | null;
  repliedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

// ============ MESSAGES ============

export interface SentMessage {
  id: string;
  campaignId: string;
  campaignLeadId: string;
  leadId: string;
  username: string;
  stepIndex: number;
  variantId: string;
  messageText: string;
  sentAt: number;
  status: 'sent' | 'failed' | 'pending';
  errorMessage: string | null;
}

export interface ReceivedMessage {
  id: string;
  leadId: string;
  username: string;
  campaignId: string | null;
  messageText: string;
  receivedAt: number;
  read: boolean;
}

// ============ SETTINGS ============

export interface AppSettings {
  id: 'global';
  globalDailyLimit: number;
  defaultMinDelay: number;
  defaultMaxDelay: number;
  defaultActiveHoursStart: number;
  defaultActiveHoursEnd: number;
  enrichLeadsOnScrape: boolean;
  notificationsEnabled: boolean;
  lastDailyReset: number;
  todaySendCount: number;
}

// ============ SCRAPE ============

export type ScrapeSource = 'followers' | 'following' | 'likers' | 'commenters';

export interface ScrapeRequest {
  source: ScrapeSource;
  target: string; // username or post URL
  maxLeads: number;
  listName: string;
}

export interface ScrapeProgress {
  source: ScrapeSource;
  target: string;
  scraped: number;
  total: number | null;
  status: 'running' | 'paused' | 'completed' | 'error';
  error?: string;
}

// ============ DM ============

export interface SendDMRequest {
  username: string;
  message: string;
}

export interface SendDMResult {
  success: boolean;
  timestamp: number;
  error?: string;
  retry?: boolean;
  retryAfter?: number;
}

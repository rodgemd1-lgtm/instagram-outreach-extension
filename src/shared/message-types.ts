import type {
  ScrapeRequest,
  ScrapeProgress,
  SendDMRequest,
  SendDMResult,
  Lead,
  ReceivedMessage,
} from './types';

// ============ Message type constants ============

export const MSG = {
  // Scraping
  START_SCRAPE: 'START_SCRAPE',
  STOP_SCRAPE: 'STOP_SCRAPE',
  SCRAPE_PROGRESS: 'SCRAPE_PROGRESS',
  SCRAPE_RESULT: 'SCRAPE_RESULT',
  SCRAPE_COMPLETE: 'SCRAPE_COMPLETE',
  SCRAPE_ERROR: 'SCRAPE_ERROR',

  // DM Sending
  SEND_DM: 'SEND_DM',
  DM_SENT: 'DM_SENT',
  DM_FAILED: 'DM_FAILED',

  // Campaign
  START_CAMPAIGN: 'START_CAMPAIGN',
  PAUSE_CAMPAIGN: 'PAUSE_CAMPAIGN',
  RESUME_CAMPAIGN: 'RESUME_CAMPAIGN',
  CANCEL_CAMPAIGN: 'CANCEL_CAMPAIGN',
  CAMPAIGN_STATUS: 'CAMPAIGN_STATUS',
  CAMPAIGN_ERROR: 'CAMPAIGN_ERROR',

  // Inbox
  CHECK_INBOX: 'CHECK_INBOX',
  REPLY_DETECTED: 'REPLY_DETECTED',
  SEND_REPLY: 'SEND_REPLY',

  // Session
  CHECK_SESSION: 'CHECK_SESSION',
  SESSION_STATUS: 'SESSION_STATUS',

  // DB operations (service worker <-> offscreen)
  DB_OPERATION: 'DB_OPERATION',
  DB_RESULT: 'DB_RESULT',

  // Intelligence
  SCRAPE_HUDL: 'SCRAPE_HUDL',
  HUDL_RESULT: 'HUDL_RESULT',
  ANALYZE_TWEETS: 'ANALYZE_TWEETS',
  TWEET_ANALYSIS_RESULT: 'TWEET_ANALYSIS_RESULT',
  COACH_BEHAVIOR_ANALYSIS: 'COACH_BEHAVIOR_ANALYSIS',
  COACH_BEHAVIOR_RESULT: 'COACH_BEHAVIOR_RESULT',
  RUN_INTELLIGENCE: 'RUN_INTELLIGENCE',
  INTELLIGENCE_RESULT: 'INTELLIGENCE_RESULT',

  // General
  GET_STATUS: 'GET_STATUS',
  STATUS_UPDATE: 'STATUS_UPDATE',
  OPEN_DASHBOARD: 'OPEN_DASHBOARD',
} as const;

// ============ Message payload types ============

export interface StartScrapeMessage {
  type: typeof MSG.START_SCRAPE;
  payload: ScrapeRequest;
}

export interface StopScrapeMessage {
  type: typeof MSG.STOP_SCRAPE;
}

export interface ScrapeProgressMessage {
  type: typeof MSG.SCRAPE_PROGRESS;
  payload: ScrapeProgress;
}

export interface ScrapeResultMessage {
  type: typeof MSG.SCRAPE_RESULT;
  payload: { leads: Partial<Lead>[]; listId: string };
}

export interface ScrapeCompleteMessage {
  type: typeof MSG.SCRAPE_COMPLETE;
  payload: { listId: string; totalScraped: number };
}

export interface SendDMMessage {
  type: typeof MSG.SEND_DM;
  payload: SendDMRequest;
}

export interface DMSentMessage {
  type: typeof MSG.DM_SENT;
  payload: SendDMResult & { username: string };
}

export interface StartCampaignMessage {
  type: typeof MSG.START_CAMPAIGN;
  payload: { campaignId: string };
}

export interface PauseCampaignMessage {
  type: typeof MSG.PAUSE_CAMPAIGN;
  payload: { campaignId: string };
}

export interface CheckInboxMessage {
  type: typeof MSG.CHECK_INBOX;
  payload: { usernames: string[] };
}

export interface ReplyDetectedMessage {
  type: typeof MSG.REPLY_DETECTED;
  payload: ReceivedMessage;
}

export interface CheckSessionMessage {
  type: typeof MSG.CHECK_SESSION;
}

export interface SessionStatusMessage {
  type: typeof MSG.SESSION_STATUS;
  payload: { loggedIn: boolean; username?: string };
}

export interface DBOperationMessage {
  type: typeof MSG.DB_OPERATION;
  payload: {
    operation: string;
    store: string;
    args: unknown[];
    requestId: string;
  };
}

export interface DBResultMessage {
  type: typeof MSG.DB_RESULT;
  payload: {
    requestId: string;
    result?: unknown;
    error?: string;
  };
}

export type ExtensionMessage =
  | StartScrapeMessage
  | StopScrapeMessage
  | ScrapeProgressMessage
  | ScrapeResultMessage
  | ScrapeCompleteMessage
  | SendDMMessage
  | DMSentMessage
  | StartCampaignMessage
  | PauseCampaignMessage
  | CheckInboxMessage
  | ReplyDetectedMessage
  | CheckSessionMessage
  | SessionStatusMessage
  | DBOperationMessage
  | DBResultMessage
  | { type: typeof MSG.STOP_SCRAPE }
  | { type: typeof MSG.GET_STATUS }
  | { type: typeof MSG.OPEN_DASHBOARD }
  | { type: typeof MSG.RESUME_CAMPAIGN; payload: { campaignId: string } }
  | { type: typeof MSG.CANCEL_CAMPAIGN; payload: { campaignId: string } }
  | { type: typeof MSG.STATUS_UPDATE; payload: unknown }
  | { type: typeof MSG.CAMPAIGN_STATUS; payload: unknown }
  | { type: typeof MSG.CAMPAIGN_ERROR; payload: { campaignId: string; error: string } }
  | { type: typeof MSG.SCRAPE_ERROR; payload: { error: string } }
  | { type: typeof MSG.DM_FAILED; payload: { username: string; error: string } }
  | { type: typeof MSG.SEND_REPLY; payload: SendDMRequest }
  | { type: typeof MSG.SCRAPE_HUDL; payload: { profileUrl: string } }
  | { type: typeof MSG.HUDL_RESULT; payload: { profile: unknown; error?: string } }
  | { type: typeof MSG.ANALYZE_TWEETS; payload: { handle: string; tweets: unknown[] } }
  | { type: typeof MSG.TWEET_ANALYSIS_RESULT; payload: { patterns: unknown[]; offers: unknown[] } }
  | { type: typeof MSG.COACH_BEHAVIOR_ANALYSIS; payload: { coaches: unknown[] } }
  | { type: typeof MSG.COACH_BEHAVIOR_RESULT; payload: { profiles: unknown[] } }
  | { type: typeof MSG.RUN_INTELLIGENCE; payload: { athleteId: string; athleteName: string } }
  | { type: typeof MSG.INTELLIGENCE_RESULT; payload: { score: unknown; timeline: unknown } };

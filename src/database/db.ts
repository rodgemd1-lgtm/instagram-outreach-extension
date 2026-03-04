import Dexie, { type Table } from 'dexie';
import type {
  Lead,
  LeadList,
  Campaign,
  CampaignLead,
  SentMessage,
  ReceivedMessage,
  AppSettings,
} from './models';
import {
  DEFAULT_DAILY_LIMIT,
  DEFAULT_MIN_DELAY_MS,
  DEFAULT_MAX_DELAY_MS,
  DEFAULT_ACTIVE_HOURS_START,
  DEFAULT_ACTIVE_HOURS_END,
} from '../shared/constants';

class OutreachDatabase extends Dexie {
  leads!: Table<Lead>;
  leadLists!: Table<LeadList>;
  campaigns!: Table<Campaign>;
  campaignLeads!: Table<CampaignLead>;
  sentMessages!: Table<SentMessage>;
  receivedMessages!: Table<ReceivedMessage>;
  settings!: Table<AppSettings>;

  constructor() {
    super('instagram_outreach_db');

    this.version(1).stores({
      leads: 'id, username, listId, source, createdAt, [listId+createdAt]',
      leadLists: 'id, name, createdAt',
      campaigns: 'id, status, createdAt, [status+createdAt]',
      campaignLeads:
        'id, campaignId, leadId, status, nextStepDueAt, [campaignId+status], [campaignId+nextStepDueAt], [status+nextStepDueAt]',
      sentMessages: 'id, campaignId, leadId, sentAt, [campaignId+sentAt], [leadId+sentAt]',
      receivedMessages: 'id, leadId, campaignId, receivedAt, read, [campaignId+receivedAt], [read+receivedAt]',
      settings: 'id',
    });
  }
}

export const db = new OutreachDatabase();

export async function initializeSettings(): Promise<void> {
  const existing = await db.settings.get('global');
  if (!existing) {
    await db.settings.put({
      id: 'global',
      globalDailyLimit: DEFAULT_DAILY_LIMIT,
      defaultMinDelay: DEFAULT_MIN_DELAY_MS,
      defaultMaxDelay: DEFAULT_MAX_DELAY_MS,
      defaultActiveHoursStart: DEFAULT_ACTIVE_HOURS_START,
      defaultActiveHoursEnd: DEFAULT_ACTIVE_HOURS_END,
      enrichLeadsOnScrape: false,
      notificationsEnabled: true,
      lastDailyReset: Date.now(),
      todaySendCount: 0,
    });
  }
}

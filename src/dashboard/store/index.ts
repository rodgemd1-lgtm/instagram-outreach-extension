import { create } from 'zustand';
import { db } from '../../database/db';
import type { Campaign, LeadList, AppSettings, ReceivedMessage } from '../../shared/types';

interface AppStore {
  // Campaigns
  campaigns: Campaign[];
  loadCampaigns: () => Promise<void>;

  // Lead Lists
  leadLists: LeadList[];
  loadLeadLists: () => Promise<void>;

  // Inbox
  unreadCount: number;
  loadUnreadCount: () => Promise<void>;

  // Settings
  settings: AppSettings | null;
  loadSettings: () => Promise<void>;

  // Scrape status
  scrapeStatus: { running: boolean; source: string; target: string; scraped: number } | null;
  setScrapeStatus: (status: AppStore['scrapeStatus']) => void;
}

export const useStore = create<AppStore>((set) => ({
  campaigns: [],
  loadCampaigns: async () => {
    const campaigns = await db.campaigns.orderBy('createdAt').reverse().toArray();
    set({ campaigns });
  },

  leadLists: [],
  loadLeadLists: async () => {
    const leadLists = await db.leadLists.orderBy('createdAt').reverse().toArray();
    set({ leadLists });
  },

  unreadCount: 0,
  loadUnreadCount: async () => {
    const count = await db.receivedMessages.where('read').equals(0).count();
    set({ unreadCount: count });
  },

  settings: null,
  loadSettings: async () => {
    const settings = await db.settings.get('global');
    set({ settings: settings ?? null });
  },

  scrapeStatus: null,
  setScrapeStatus: (status) => set({ scrapeStatus: status }),
}));

// Listen for real-time updates from service worker
if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((message) => {
    const store = useStore.getState();
    switch (message.type) {
      case 'DM_SENT':
      case 'CAMPAIGN_STATUS':
        store.loadCampaigns();
        break;
      case 'REPLY_DETECTED':
        store.loadUnreadCount();
        store.loadCampaigns();
        break;
      case 'SCRAPE_PROGRESS':
        store.setScrapeStatus({
          running: true,
          source: message.payload.source,
          target: message.payload.target,
          scraped: message.payload.scraped,
        });
        break;
      case 'SCRAPE_COMPLETE':
        store.setScrapeStatus(null);
        store.loadLeadLists();
        break;
    }
  });
}

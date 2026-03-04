import { MSG } from '../shared/message-types';
import { createLogger } from '../shared/logger';
import { setupAlarms, handleAlarm } from './alarm-manager';
import { handleCampaignMessage } from './campaign-executor';

const log = createLogger('ServiceWorker');

// ============ Offscreen Document Management ============

let offscreenCreating: Promise<void> | null = null;

async function ensureOffscreenDocument(): Promise<void> {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
  });
  if (existingContexts.length > 0) return;

  if (offscreenCreating) {
    await offscreenCreating;
    return;
  }

  offscreenCreating = chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: [chrome.offscreen.Reason.LOCAL_STORAGE],
    justification: 'IndexedDB access for campaign data storage',
  });

  await offscreenCreating;
  offscreenCreating = null;
  log.info('Offscreen document created');
}

// ============ Instagram Tab Management ============

async function findInstagramTab(): Promise<chrome.tabs.Tab | null> {
  const tabs = await chrome.tabs.query({ url: 'https://www.instagram.com/*' });
  if (tabs.length === 0) return null;
  // Prefer tabs on /direct/ for DM operations
  return tabs.find((t) => t.url?.includes('/direct/')) ?? tabs[0];
}

async function sendToContentScript(message: unknown): Promise<unknown> {
  const tab = await findInstagramTab();
  if (!tab?.id) {
    throw new Error('No Instagram tab found. Please open Instagram in a tab.');
  }
  return chrome.tabs.sendMessage(tab.id, message);
}

// ============ Message Router ============

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  log.debug('Message received', { type: message.type, from: sender.id ? 'extension' : 'content-script' });

  switch (message.type) {
    // Scraping
    case MSG.START_SCRAPE:
      sendToContentScript(message)
        .then((result) => sendResponse(result))
        .catch((err) => sendResponse({ error: err.message }));
      return true;

    case MSG.STOP_SCRAPE:
      sendToContentScript(message).catch((err) => log.error('Stop scrape failed', err));
      return false;

    case MSG.SCRAPE_RESULT:
      // Forward to offscreen for DB storage
      ensureOffscreenDocument()
        .then(() => chrome.runtime.sendMessage(message))
        .catch((err) => log.error('Scrape result storage failed', err));
      // Also broadcast to dashboard
      broadcastToDashboard(message);
      return false;

    case MSG.SCRAPE_COMPLETE:
    case MSG.SCRAPE_PROGRESS:
    case MSG.SCRAPE_ERROR:
      broadcastToDashboard(message);
      return false;

    // Campaign management
    case MSG.START_CAMPAIGN:
    case MSG.PAUSE_CAMPAIGN:
    case MSG.RESUME_CAMPAIGN:
    case MSG.CANCEL_CAMPAIGN:
      handleCampaignMessage(message, sendToContentScript)
        .then((result) => sendResponse(result))
        .catch((err) => sendResponse({ error: err.message }));
      return true;

    // DM results from content script
    case MSG.DM_SENT:
    case MSG.DM_FAILED:
      handleCampaignMessage(message, sendToContentScript).catch((err) =>
        log.error('DM result handling failed', err)
      );
      broadcastToDashboard(message);
      return false;

    // Inbox
    case MSG.CHECK_INBOX:
      sendToContentScript(message)
        .then((result) => sendResponse(result))
        .catch((err) => sendResponse({ error: err.message }));
      return true;

    case MSG.REPLY_DETECTED:
      handleCampaignMessage(message, sendToContentScript).catch((err) =>
        log.error('Reply handling failed', err)
      );
      broadcastToDashboard(message);
      return false;

    case MSG.SEND_REPLY:
      sendToContentScript({ type: MSG.SEND_DM, payload: message.payload })
        .then((result) => sendResponse(result))
        .catch((err) => sendResponse({ error: err.message }));
      return true;

    // Session
    case MSG.CHECK_SESSION:
      sendToContentScript(message)
        .then((result) => sendResponse(result))
        .catch((err) => sendResponse({ error: err.message }));
      return true;

    case MSG.SESSION_STATUS:
      broadcastToDashboard(message);
      return false;

    // Dashboard
    case MSG.OPEN_DASHBOARD:
      chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
      return false;

    case MSG.GET_STATUS:
      getExtensionStatus()
        .then((status) => sendResponse(status))
        .catch((err) => sendResponse({ error: err.message }));
      return true;

    default:
      return false;
  }
});

// ============ Alarms ============

chrome.alarms.onAlarm.addListener((alarm) => {
  handleAlarm(alarm, sendToContentScript);
});

// ============ Lifecycle ============

chrome.runtime.onInstalled.addListener(async () => {
  log.info('Extension installed/updated');
  await ensureOffscreenDocument();
  await setupAlarms();
});

chrome.runtime.onStartup.addListener(async () => {
  log.info('Browser started');
  await ensureOffscreenDocument();
  await setupAlarms();
});

// ============ Helpers ============

function broadcastToDashboard(message: unknown) {
  // Send to all extension pages (dashboard, popup)
  chrome.runtime.sendMessage(message).catch(() => {
    // No listeners - dashboard/popup not open, that's fine
  });
}

async function getExtensionStatus() {
  const tab = await findInstagramTab();
  return {
    instagramTabOpen: !!tab,
    instagramTabUrl: tab?.url ?? null,
  };
}

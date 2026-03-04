import { MSG } from '../../shared/message-types';
import { createLogger } from '../../shared/logger';
import { NavigationObserver, detectPage } from './page-detector';
import { scrapeFollowers } from './modules/followers-scraper';
import { scrapeFollowing } from './modules/following-scraper';
import { scrapeLikers } from './modules/likers-scraper';
import { scrapeCommenters } from './modules/commenters-scraper';
import { sendDM } from './modules/dm-sender';
import { checkInbox } from './modules/dm-reader';
import { isLoggedOut } from './utils/error-detector';
import type { ScrapeRequest, ScrapeSource, Lead } from '../../shared/types';

const log = createLogger('ContentScript');

let currentScrapeAbort = false;

// ============ Initialize ============

function init() {
  log.info('Content script loaded', { page: detectPage() });

  // Set up SPA navigation observer
  const navObserver = new NavigationObserver();
  navObserver.init();
  navObserver.onNavigate((info) => {
    log.debug('Navigation detected', info);
  });

  // Listen for messages from service worker
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    handleMessage(message, sendResponse);
    return true; // Keep channel open for async response
  });
}

// ============ Message Handler ============

async function handleMessage(
  message: { type: string; payload?: unknown },
  sendResponse: (response: unknown) => void
) {
  log.debug('Message received', { type: message.type });

  try {
    switch (message.type) {
      case MSG.START_SCRAPE: {
        const request = message.payload as ScrapeRequest;
        currentScrapeAbort = false;
        const result = await handleScrape(request);
        sendResponse(result);
        break;
      }

      case MSG.STOP_SCRAPE:
        currentScrapeAbort = true;
        sendResponse({ success: true });
        break;

      case MSG.SEND_DM: {
        const { username, message: msgText } = message.payload as { username: string; message: string };
        const result = await sendDM(username, msgText);
        sendResponse(result);
        break;
      }

      case MSG.CHECK_INBOX: {
        const { usernames } = message.payload as { usernames: string[] };
        const replies = await checkInbox(usernames);
        // Report each reply back to service worker
        for (const reply of replies) {
          chrome.runtime.sendMessage({
            type: MSG.REPLY_DETECTED,
            payload: {
              username: reply.username,
              messageText: reply.lastMessage,
              receivedAt: reply.timestamp,
              leadId: '',
              campaignId: null,
              read: false,
            },
          });
        }
        sendResponse({ success: true, repliesFound: replies.length });
        break;
      }

      case MSG.CHECK_SESSION:
        sendResponse({
          loggedIn: !isLoggedOut(),
          url: window.location.href,
        });
        break;

      default:
        sendResponse({ error: `Unknown message type: ${message.type}` });
    }
  } catch (err) {
    log.error('Message handling failed', { type: message.type, error: err });
    sendResponse({ error: (err as Error).message });
  }
}

// ============ Scraping Dispatcher ============

async function handleScrape(request: ScrapeRequest) {
  const onProgress = (scraped: number) => {
    chrome.runtime.sendMessage({
      type: MSG.SCRAPE_PROGRESS,
      payload: {
        source: request.source,
        target: request.target,
        scraped,
        total: request.maxLeads,
        status: 'running',
      },
    });
  };

  const onBatch = async (users: Array<{ username: string; fullName: string | null; profileUrl: string }>) => {
    const leads: Partial<Lead>[] = users.map((u) => ({
      username: u.username,
      fullName: u.fullName,
      profileUrl: u.profileUrl,
      source: request.source as Lead['source'],
      sourceTarget: request.target,
    }));

    chrome.runtime.sendMessage({
      type: MSG.SCRAPE_RESULT,
      payload: { leads, listId: '' }, // listId set by service worker
    });
  };

  const shouldStop = () => currentScrapeAbort;

  let totalScraped: number;

  switch (request.source) {
    case 'followers':
      totalScraped = await scrapeFollowers(request.target, request.maxLeads, onProgress, onBatch, shouldStop);
      break;
    case 'following':
      totalScraped = await scrapeFollowing(request.target, request.maxLeads, onProgress, onBatch, shouldStop);
      break;
    case 'likers':
      totalScraped = await scrapeLikers(request.target, request.maxLeads, onProgress, onBatch, shouldStop);
      break;
    case 'commenters':
      totalScraped = await scrapeCommenters(request.target, request.maxLeads, onProgress, onBatch, shouldStop);
      break;
    default:
      throw new Error(`Unknown scrape source: ${request.source}`);
  }

  chrome.runtime.sendMessage({
    type: MSG.SCRAPE_COMPLETE,
    payload: { listId: '', totalScraped },
  });

  return { success: true, totalScraped };
}

// ============ Start ============

init();

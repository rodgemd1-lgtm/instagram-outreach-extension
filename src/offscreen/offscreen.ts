import { db, initializeSettings } from '../database/db';
import { MSG } from '../shared/message-types';
import { createLogger } from '../shared/logger';

const log = createLogger('Offscreen');

// Initialize DB on load
initializeSettings().then(() => log.info('Database initialized'));

// Handle DB operations from service worker
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== MSG.DB_OPERATION) return false;

  const { operation, store, args, requestId } = message.payload;

  handleDBOperation(store, operation, args)
    .then((result) => {
      sendResponse({ type: MSG.DB_RESULT, payload: { requestId, result } });
    })
    .catch((error) => {
      log.error('DB operation failed', { store, operation, error: error.message });
      sendResponse({
        type: MSG.DB_RESULT,
        payload: { requestId, error: error.message },
      });
    });

  return true; // Keep message channel open for async response
});

async function handleDBOperation(
  store: string,
  operation: string,
  args: unknown[]
): Promise<unknown> {
  const table = (db as unknown as Record<string, unknown>)[store];
  if (!table || typeof table !== 'object') {
    throw new Error(`Unknown store: ${store}`);
  }

  const fn = (table as Record<string, unknown>)[operation];
  if (typeof fn !== 'function') {
    throw new Error(`Unknown operation: ${operation} on store: ${store}`);
  }

  return fn.apply(table, args);
}

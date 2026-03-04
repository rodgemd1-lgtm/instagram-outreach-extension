import { SELECTORS, findClickableByText } from '../dom-selectors';
import { waitForElement } from '../utils/dom-waiter';
import { simulateTyping, simulateClick, simulateEnter, randomDelay } from './action-simulator';
import { isActionBlocked, isRateLimited } from '../utils/error-detector';
import { createLogger } from '../../../shared/logger';
import type { SendDMResult } from '../../../shared/types';

const log = createLogger('DMSender');

export async function sendDM(username: string, message: string): Promise<SendDMResult> {
  log.info('Sending DM', { to: username });

  try {
    // 1. Navigate to new message
    window.location.href = 'https://www.instagram.com/direct/new/';
    await waitForElement(SELECTORS.DM_SEARCH_INPUT, 15000);
    await randomDelay(800, 1500);

    // 2. Type recipient username in search
    const searchInput = document.querySelector(SELECTORS.DM_SEARCH_INPUT) as HTMLElement;
    if (!searchInput) throw new Error('Search input not found');
    await simulateTyping(searchInput, username);
    await randomDelay(1000, 2000);

    // 3. Wait for and click the correct user in results
    const userResult = await findUserInResults(username);
    if (!userResult) {
      return { success: false, timestamp: Date.now(), error: `User ${username} not found in search` };
    }
    await simulateClick(userResult);
    await randomDelay(500, 1000);

    // 4. Click "Chat" or "Next" button
    const chatBtn = findClickableByText('Chat') ?? findClickableByText('Next');
    if (chatBtn) {
      await simulateClick(chatBtn);
      await randomDelay(800, 1500);
    }

    // 5. Wait for message input
    const messageInput = await waitForElement(SELECTORS.DM_MESSAGE_INPUT, 10000) as HTMLElement;
    await randomDelay(500, 1000);

    // 6. Type the message
    await simulateTyping(messageInput, message);
    await randomDelay(300, 800);

    // 7. Send - try button first, then Enter
    const sendBtn = document.querySelector(SELECTORS.DM_SEND_BUTTON) ?? findClickableByText('Send');
    if (sendBtn) {
      await simulateClick(sendBtn);
    } else {
      await simulateEnter(messageInput);
    }

    // 8. Wait and verify
    await randomDelay(1500, 2500);

    // Check for errors
    if (isActionBlocked()) {
      return { success: false, timestamp: Date.now(), error: 'ACTION_BLOCKED', retry: false };
    }
    if (isRateLimited()) {
      return {
        success: false,
        timestamp: Date.now(),
        error: 'RATE_LIMITED',
        retry: true,
        retryAfter: 3600000,
      };
    }

    log.info('DM sent', { to: username });
    return { success: true, timestamp: Date.now() };
  } catch (err) {
    const error = (err as Error).message;
    log.error('DM send failed', { to: username, error });

    if (isActionBlocked()) {
      return { success: false, timestamp: Date.now(), error: 'ACTION_BLOCKED', retry: false };
    }

    return { success: false, timestamp: Date.now(), error, retry: true };
  }
}

async function findUserInResults(username: string): Promise<Element | null> {
  // Wait for search results
  await randomDelay(500, 1000);

  // Look for the username in search results
  const maxWait = 5000;
  const start = Date.now();

  while (Date.now() - start < maxWait) {
    const results = document.querySelectorAll(
      'div[role="dialog"] div[role="button"], div[role="listbox"] div[role="option"]'
    );

    for (const result of results) {
      const links = result.querySelectorAll('a, span');
      for (const el of links) {
        if (el.textContent?.trim().toLowerCase() === username.toLowerCase()) {
          // Find the clickable checkbox/radio inside the result
          const checkbox = result.querySelector('input[type="checkbox"], div[role="checkbox"]');
          return checkbox ?? result;
        }
      }
    }

    await randomDelay(300, 500);
  }

  return null;
}

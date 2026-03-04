import { SELECTORS } from '../dom-selectors';
import { waitForElement } from '../utils/dom-waiter';
import { randomDelay } from './action-simulator';
import { createLogger } from '../../../shared/logger';

const log = createLogger('DMReader');

export interface InboxConversation {
  username: string;
  lastMessage: string;
  isFromThem: boolean;
  timestamp: number;
}

export async function checkInbox(
  targetUsernames: string[]
): Promise<InboxConversation[]> {
  log.debug('Checking inbox', { targetCount: targetUsernames.length });

  // Navigate to inbox if needed
  if (!window.location.pathname.startsWith('/direct/inbox')) {
    window.location.href = 'https://www.instagram.com/direct/inbox/';
    await waitForElement(SELECTORS.DM_CONVERSATION_LIST, 15000);
    await randomDelay(1000, 2000);
  }

  const usernameSet = new Set(targetUsernames.map((u) => u.toLowerCase()));
  const replies: InboxConversation[] = [];

  // Read visible conversations
  const conversations = document.querySelectorAll(SELECTORS.DM_CONVERSATION_ITEM);

  for (const conv of conversations) {
    // Extract username from conversation item
    const nameEl = conv.querySelector('span');
    const convUsername = nameEl?.textContent?.trim().toLowerCase();
    if (!convUsername || !usernameSet.has(convUsername)) continue;

    // Get last message preview
    const parent = conv.closest('div');
    const messagePreview = parent?.querySelector('span:last-child')?.textContent?.trim();

    // Check if the last message is from them (not from us)
    // Instagram marks sent messages differently - typically the last message
    // preview has different styling when it's from the other person
    const isFromThem = !parent?.textContent?.includes('You sent');

    if (messagePreview && isFromThem) {
      replies.push({
        username: convUsername,
        lastMessage: messagePreview,
        isFromThem: true,
        timestamp: Date.now(),
      });
    }
  }

  log.debug('Inbox check complete', { repliesFound: replies.length });
  return replies;
}

export async function readConversation(
  username: string
): Promise<Array<{ from: 'me' | 'them'; text: string; timestamp: number }>> {
  // Navigate to the conversation
  const conversations = document.querySelectorAll(SELECTORS.DM_CONVERSATION_ITEM);
  let targetConv: Element | null = null;

  for (const conv of conversations) {
    const nameEl = conv.querySelector('span');
    if (nameEl?.textContent?.trim().toLowerCase() === username.toLowerCase()) {
      targetConv = conv;
      break;
    }
  }

  if (!targetConv) return [];

  // Click on the conversation
  (targetConv as HTMLElement).click();
  await randomDelay(1000, 2000);

  // Read messages from the thread
  const messages: Array<{ from: 'me' | 'them'; text: string; timestamp: number }> = [];

  // Message elements vary by Instagram version, but generally:
  const messageElements = document.querySelectorAll('div[role="row"], div[data-testid="message"]');

  for (const msgEl of messageElements) {
    const text = msgEl.textContent?.trim();
    if (!text) continue;

    // Determine sender based on styling/position
    // Instagram typically aligns sent messages right and received messages left
    const rect = msgEl.getBoundingClientRect();
    const parentWidth = msgEl.parentElement?.getBoundingClientRect().width ?? window.innerWidth;
    const isFromMe = rect.left > parentWidth / 2;

    messages.push({
      from: isFromMe ? 'me' : 'them',
      text,
      timestamp: Date.now(), // Actual timestamp parsing would need more DOM inspection
    });
  }

  return messages;
}

import { SELECTORS, findByText } from '../dom-selectors';
import { waitForElement } from '../utils/dom-waiter';
import { simulateClick, randomDelay } from './action-simulator';
import { scrollAndCollect, findScrollableContainer } from './scroll-manager';
import { detectError } from '../utils/error-detector';
import { createLogger } from '../../../shared/logger';
import { SCRAPE_BATCH_SIZE } from '../../../shared/constants';

const log = createLogger('FollowersScraper');

interface ScrapedUser {
  username: string;
  fullName: string | null;
  profileUrl: string;
}

export async function scrapeFollowers(
  targetUsername: string,
  maxLeads: number,
  onProgress: (scraped: number) => void,
  onBatch: (users: ScrapedUser[]) => Promise<void>,
  shouldStop: () => boolean
): Promise<number> {
  log.info('Starting followers scrape', { target: targetUsername, max: maxLeads });

  // Navigate to profile if needed
  if (!window.location.pathname.startsWith(`/${targetUsername}`)) {
    window.location.href = `https://www.instagram.com/${targetUsername}/`;
    await waitForElement(SELECTORS.PROFILE_HEADER, 15000);
    await randomDelay(1000, 2000);
  }

  // Click followers link
  const followersLink =
    document.querySelector(SELECTORS.FOLLOWERS_LINK(targetUsername)) ??
    findByText('followers', 'a');

  if (!followersLink) throw new Error('Followers link not found');
  await simulateClick(followersLink);

  // Wait for dialog
  const dialog = await waitForElement(SELECTORS.DIALOG, 10000);
  await randomDelay(500, 1000);

  // Find scrollable container
  const scrollable = findScrollableContainer(dialog);
  if (!scrollable) throw new Error('Scrollable container not found in dialog');

  const seenUsernames = new Set<string>();
  let totalScraped = 0;

  const results = await scrollAndCollect<ScrapedUser>(
    { container: scrollable },
    (container) => extractUsers(container),
    (user) => seenUsernames.has(user.username),
    maxLeads,
    async (batch) => {
      for (const user of batch) seenUsernames.add(user.username);
      totalScraped += batch.length;
      onProgress(totalScraped);

      if (batch.length >= SCRAPE_BATCH_SIZE) {
        await onBatch(batch);
      }
    },
    () => {
      if (shouldStop()) return true;
      const error = detectError();
      if (error) {
        log.warn('Error detected during scrape', { error });
        return true;
      }
      return false;
    }
  );

  // Send remaining items
  if (results.length > 0) {
    const remaining = results.filter((u) => !seenUsernames.has(u.username));
    if (remaining.length > 0) await onBatch(remaining);
  }

  // Close dialog
  const closeBtn = document.querySelector(SELECTORS.DIALOG_CLOSE);
  if (closeBtn) await simulateClick(closeBtn);

  log.info('Scrape complete', { total: totalScraped });
  return totalScraped;
}

function extractUsers(container: Element): ScrapedUser[] {
  const users: ScrapedUser[] = [];
  const links = container.querySelectorAll('a[role="link"][href^="/"]');

  for (const link of links) {
    const href = link.getAttribute('href');
    if (!href || href === '/' || href.includes('/direct/') || href.includes('/explore/')) continue;

    const username = href.replace(/\//g, '');
    if (!username || username.includes(' ')) continue;

    // Try to find the full name (usually a span sibling or nearby span)
    const parentRow = link.closest('li, div[role="button"]');
    let fullName: string | null = null;
    if (parentRow) {
      const spans = parentRow.querySelectorAll('span');
      for (const span of spans) {
        const text = span.textContent?.trim();
        if (text && text !== username && !text.includes('Follow') && text.length < 60) {
          fullName = text;
          break;
        }
      }
    }

    users.push({
      username,
      fullName,
      profileUrl: `https://www.instagram.com/${username}/`,
    });
  }

  return users;
}

import { SELECTORS, findByText } from '../dom-selectors';
import { waitForElement } from '../utils/dom-waiter';
import { simulateClick, randomDelay } from './action-simulator';
import { scrollAndCollect, findScrollableContainer } from './scroll-manager';
import { detectError } from '../utils/error-detector';
import { createLogger } from '../../../shared/logger';

const log = createLogger('FollowingScraper');

interface ScrapedUser {
  username: string;
  fullName: string | null;
  profileUrl: string;
}

export async function scrapeFollowing(
  targetUsername: string,
  maxLeads: number,
  onProgress: (scraped: number) => void,
  onBatch: (users: ScrapedUser[]) => Promise<void>,
  shouldStop: () => boolean
): Promise<number> {
  log.info('Starting following scrape', { target: targetUsername, max: maxLeads });

  if (!window.location.pathname.startsWith(`/${targetUsername}`)) {
    window.location.href = `https://www.instagram.com/${targetUsername}/`;
    await waitForElement(SELECTORS.PROFILE_HEADER, 15000);
    await randomDelay(1000, 2000);
  }

  const followingLink =
    document.querySelector(SELECTORS.FOLLOWING_LINK(targetUsername)) ??
    findByText('following', 'a');

  if (!followingLink) throw new Error('Following link not found');
  await simulateClick(followingLink);

  const dialog = await waitForElement(SELECTORS.DIALOG, 10000);
  await randomDelay(500, 1000);

  const scrollable = findScrollableContainer(dialog);
  if (!scrollable) throw new Error('Scrollable container not found in dialog');

  const seenUsernames = new Set<string>();
  let totalScraped = 0;

  await scrollAndCollect<ScrapedUser>(
    { container: scrollable },
    (container) => extractUsers(container),
    (user) => seenUsernames.has(user.username),
    maxLeads,
    async (batch) => {
      for (const user of batch) seenUsernames.add(user.username);
      totalScraped += batch.length;
      onProgress(totalScraped);
      await onBatch(batch);
    },
    () => shouldStop() || !!detectError()
  );

  const closeBtn = document.querySelector(SELECTORS.DIALOG_CLOSE);
  if (closeBtn) await simulateClick(closeBtn);

  log.info('Following scrape complete', { total: totalScraped });
  return totalScraped;
}

function extractUsers(container: Element): ScrapedUser[] {
  const users: ScrapedUser[] = [];
  const links = container.querySelectorAll('a[role="link"][href^="/"]');

  for (const link of links) {
    const href = link.getAttribute('href');
    if (!href || href === '/') continue;

    const username = href.replace(/\//g, '');
    if (!username || username.includes(' ')) continue;

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

    users.push({ username, fullName, profileUrl: `https://www.instagram.com/${username}/` });
  }

  return users;
}

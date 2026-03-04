import { SELECTORS, findByText } from '../dom-selectors';
import { waitForElement } from '../utils/dom-waiter';
import { simulateClick, randomDelay } from './action-simulator';
import { scrollAndCollect, findScrollableContainer } from './scroll-manager';
import { detectError } from '../utils/error-detector';
import { createLogger } from '../../../shared/logger';

const log = createLogger('LikersScraper');

interface ScrapedUser {
  username: string;
  fullName: string | null;
  profileUrl: string;
}

export async function scrapeLikers(
  postUrl: string,
  maxLeads: number,
  onProgress: (scraped: number) => void,
  onBatch: (users: ScrapedUser[]) => Promise<void>,
  shouldStop: () => boolean
): Promise<number> {
  log.info('Starting likers scrape', { post: postUrl, max: maxLeads });

  // Navigate to post
  if (!window.location.href.includes(postUrl.replace('https://www.instagram.com', ''))) {
    window.location.href = postUrl;
    await randomDelay(2000, 3000);
  }

  // Click likes count to open likers dialog
  const likesButton =
    document.querySelector(SELECTORS.LIKES_SECTION) ?? findByText('likes', 'button');
  if (!likesButton) throw new Error('Likes button not found');
  await simulateClick(likesButton);

  const dialog = await waitForElement(SELECTORS.DIALOG, 10000);
  await randomDelay(500, 1000);

  const scrollable = findScrollableContainer(dialog);
  if (!scrollable) throw new Error('Scrollable container not found');

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

  log.info('Likers scrape complete', { total: totalScraped });
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

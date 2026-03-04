import { SELECTORS, findByText, findClickableByText } from '../dom-selectors';
import { waitForElement } from '../utils/dom-waiter';
import { simulateClick, randomDelay } from './action-simulator';
import { detectError } from '../utils/error-detector';
import { createLogger } from '../../../shared/logger';

const log = createLogger('CommentersScraper');

interface ScrapedUser {
  username: string;
  fullName: string | null;
  profileUrl: string;
}

export async function scrapeCommenters(
  postUrl: string,
  maxLeads: number,
  onProgress: (scraped: number) => void,
  onBatch: (users: ScrapedUser[]) => Promise<void>,
  shouldStop: () => boolean
): Promise<number> {
  log.info('Starting commenters scrape', { post: postUrl, max: maxLeads });

  if (!window.location.href.includes(postUrl.replace('https://www.instagram.com', ''))) {
    window.location.href = postUrl;
    await randomDelay(2000, 3000);
  }

  // Load all comments by clicking "View all X comments" or load more buttons
  await loadAllComments();

  const seenUsernames = new Set<string>();
  let totalScraped = 0;
  let lastCount = 0;

  while (!shouldStop() && totalScraped < maxLeads) {
    const users = extractCommenters();
    const newUsers = users.filter((u) => !seenUsernames.has(u.username));

    if (newUsers.length === 0 && totalScraped === lastCount) break;
    lastCount = totalScraped;

    for (const user of newUsers) {
      seenUsernames.add(user.username);
    }

    if (newUsers.length > 0) {
      totalScraped += newUsers.length;
      onProgress(totalScraped);
      await onBatch(newUsers);
    }

    // Try to load more comments
    const loadMore = findClickableByText('Load more comments') ??
      document.querySelector('button svg[aria-label="Load more comments"]')?.closest('button');
    if (loadMore) {
      await simulateClick(loadMore);
      await randomDelay(1500, 3000);
    } else {
      break;
    }

    if (detectError()) break;
  }

  log.info('Commenters scrape complete', { total: totalScraped });
  return totalScraped;
}

async function loadAllComments(): Promise<void> {
  // Click "View all X comments" if present
  const viewAll = findByText('View all', 'button') ?? findByText('View all', 'span');
  if (viewAll) {
    const btn = viewAll.closest('button') ?? viewAll;
    await simulateClick(btn);
    await randomDelay(1500, 3000);
  }
}

function extractCommenters(): ScrapedUser[] {
  const users: ScrapedUser[] = [];
  // Comments contain links to user profiles
  const commentLinks = document.querySelectorAll('ul a[href^="/"]');

  for (const link of commentLinks) {
    const href = link.getAttribute('href');
    if (!href || href === '/') continue;
    const username = href.replace(/\//g, '');
    if (!username || username.includes(' ') || username === 'explore' || username === 'p') continue;

    users.push({
      username,
      fullName: null,
      profileUrl: `https://www.instagram.com/${username}/`,
    });
  }

  return users;
}

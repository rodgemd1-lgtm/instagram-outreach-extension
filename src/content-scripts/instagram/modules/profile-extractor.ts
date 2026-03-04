import { SELECTORS } from '../dom-selectors';
import { waitForElement } from '../utils/dom-waiter';
import { randomDelay } from './action-simulator';
import { createLogger } from '../../../shared/logger';

const log = createLogger('ProfileExtractor');

export interface ProfileData {
  username: string;
  fullName: string | null;
  bio: string | null;
  followerCount: number | null;
  followingCount: number | null;
  externalUrl: string | null;
}

export async function extractProfile(username: string): Promise<ProfileData> {
  log.debug('Extracting profile', { username });

  // Navigate if needed
  if (!window.location.pathname.startsWith(`/${username}`)) {
    window.location.href = `https://www.instagram.com/${username}/`;
    await waitForElement(SELECTORS.PROFILE_HEADER, 15000);
    await randomDelay(500, 1500);
  }

  const header = document.querySelector(SELECTORS.PROFILE_HEADER);
  if (!header) throw new Error('Profile header not found');

  // Extract full name
  const nameEl = header.querySelector('span[dir="auto"]') ?? header.querySelector('h2');
  const fullName = nameEl?.textContent?.trim() ?? null;

  // Extract bio
  let bio: string | null = null;
  const bioSection = header.querySelector('div > span');
  if (bioSection) {
    bio = bioSection.textContent?.trim() ?? null;
  }

  // Extract counts
  const counts = header.querySelectorAll('li span, a span');
  let followerCount: number | null = null;
  let followingCount: number | null = null;

  for (const span of counts) {
    const text = span.textContent?.trim() ?? '';
    const title = span.getAttribute('title');
    const parentText = span.closest('li, a')?.textContent ?? '';

    if (parentText.includes('followers')) {
      followerCount = parseCount(title || text);
    } else if (parentText.includes('following')) {
      followingCount = parseCount(title || text);
    }
  }

  // Extract external URL
  const externalLink = header.querySelector('a[rel="me nofollow noopener noreferrer"]');
  const externalUrl = externalLink?.getAttribute('href') ?? null;

  return { username, fullName, bio, followerCount, followingCount, externalUrl };
}

function parseCount(text: string): number | null {
  if (!text) return null;
  const cleaned = text.replace(/,/g, '');
  if (cleaned.endsWith('K') || cleaned.endsWith('k')) {
    return Math.round(parseFloat(cleaned) * 1000);
  }
  if (cleaned.endsWith('M') || cleaned.endsWith('m')) {
    return Math.round(parseFloat(cleaned) * 1_000_000);
  }
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

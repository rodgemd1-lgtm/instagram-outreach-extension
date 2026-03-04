import { randomDelay } from './action-simulator';
import {
  SCROLL_DELAY_MIN,
  SCROLL_DELAY_MAX,
  SCROLL_AMOUNT_MIN,
  SCROLL_AMOUNT_MAX,
  MAX_NO_NEW_ITEMS,
} from '../../../shared/constants';

export interface ScrollConfig {
  container: HTMLElement;
  delayMin?: number;
  delayMax?: number;
  scrollAmountMin?: number;
  scrollAmountMax?: number;
  maxNoNewItems?: number;
  onNewContent?: () => void;
}

export async function scrollAndCollect<T>(
  config: ScrollConfig,
  extractItems: (container: HTMLElement) => T[],
  isDuplicate: (item: T) => boolean,
  maxItems: number,
  onBatch: (items: T[]) => Promise<void>,
  shouldStop: () => boolean
): Promise<T[]> {
  const {
    container,
    delayMin = SCROLL_DELAY_MIN,
    delayMax = SCROLL_DELAY_MAX,
    scrollAmountMin = SCROLL_AMOUNT_MIN,
    scrollAmountMax = SCROLL_AMOUNT_MAX,
    maxNoNewItems = MAX_NO_NEW_ITEMS,
  } = config;

  const allItems: T[] = [];
  let consecutiveNoNew = 0;

  while (!shouldStop() && allItems.length < maxItems) {
    // Extract current items
    const currentItems = extractItems(container);
    const newItems = currentItems.filter((item) => !isDuplicate(item));

    if (newItems.length > 0) {
      consecutiveNoNew = 0;
      allItems.push(...newItems);

      // Send batch
      await onBatch(newItems);
    } else {
      consecutiveNoNew++;
      if (consecutiveNoNew >= maxNoNewItems) break;
    }

    // Scroll down
    const scrollAmount =
      Math.floor(Math.random() * (scrollAmountMax - scrollAmountMin)) + scrollAmountMin;
    container.scrollBy({ top: scrollAmount, behavior: 'smooth' });

    // Wait for new content
    await randomDelay(delayMin, delayMax);
  }

  return allItems;
}

export function findScrollableContainer(root: Element): HTMLElement | null {
  // Look for scrollable container inside a dialog
  const candidates = root.querySelectorAll('div');
  for (const div of candidates) {
    const style = window.getComputedStyle(div);
    if (
      (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
      div.scrollHeight > div.clientHeight
    ) {
      return div as HTMLElement;
    }
  }
  return null;
}

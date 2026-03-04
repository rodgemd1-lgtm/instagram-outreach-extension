import { createLogger } from '../shared/logger';
import { gaussianRandom, isWithinHours, randomDelay } from '../shared/utils';
import {
  DEFAULT_DAILY_LIMIT,
  DEFAULT_MIN_DELAY_MS,
  DEFAULT_MAX_DELAY_MS,
  DEFAULT_ACTIVE_HOURS_START,
  DEFAULT_ACTIVE_HOURS_END,
  DAILY_LIMIT_VARIANCE,
} from '../shared/constants';

const log = createLogger('RateLimiter');

// Store state in chrome.storage.session for fast access from service worker
interface RateLimiterState {
  todaySendCount: number;
  lastDailyReset: number;
  effectiveDailyLimit: number;
}

async function getState(): Promise<RateLimiterState> {
  const result = await chrome.storage.session.get('rateLimiter');
  if (result.rateLimiter) return result.rateLimiter;

  // Initialize
  const state: RateLimiterState = {
    todaySendCount: 0,
    lastDailyReset: Date.now(),
    effectiveDailyLimit: calculateEffectiveLimit(DEFAULT_DAILY_LIMIT),
  };
  await chrome.storage.session.set({ rateLimiter: state });
  return state;
}

async function setState(state: RateLimiterState): Promise<void> {
  await chrome.storage.session.set({ rateLimiter: state });
}

function calculateEffectiveLimit(baseLimit: number): number {
  // Vary daily limit by +/- 15% using Gaussian distribution
  const variance = baseLimit * DAILY_LIMIT_VARIANCE;
  return Math.max(1, gaussianRandom(baseLimit, variance));
}

export async function canSend(): Promise<boolean> {
  const state = await getState();

  if (state.todaySendCount >= state.effectiveDailyLimit) {
    log.info('Daily limit reached', {
      sent: state.todaySendCount,
      limit: state.effectiveDailyLimit,
    });
    return false;
  }

  if (!isWithinHours(DEFAULT_ACTIVE_HOURS_START, DEFAULT_ACTIVE_HOURS_END)) {
    log.debug('Outside active hours');
    return false;
  }

  return true;
}

export async function recordSend(): Promise<void> {
  const state = await getState();
  state.todaySendCount++;
  await setState(state);
  log.debug('Send recorded', {
    todayCount: state.todaySendCount,
    limit: state.effectiveDailyLimit,
  });
}

export async function getTodayCount(): Promise<number> {
  const state = await getState();
  return state.todaySendCount;
}

export async function resetDailyCount(): Promise<void> {
  const state = await getState();
  state.todaySendCount = 0;
  state.lastDailyReset = Date.now();
  state.effectiveDailyLimit = calculateEffectiveLimit(DEFAULT_DAILY_LIMIT);
  await setState(state);
  log.info('Daily count reset', { newLimit: state.effectiveDailyLimit });
}

export async function applyDelay(): Promise<void> {
  const delay = gaussianRandom(
    (DEFAULT_MIN_DELAY_MS + DEFAULT_MAX_DELAY_MS) / 2,
    (DEFAULT_MAX_DELAY_MS - DEFAULT_MIN_DELAY_MS) / 4
  );
  const clampedDelay = Math.max(DEFAULT_MIN_DELAY_MS, Math.min(DEFAULT_MAX_DELAY_MS, delay));
  log.debug('Applying rate limit delay', { delayMs: clampedDelay });
  await randomDelay(clampedDelay, clampedDelay);
}

export async function getNextSendTime(): Promise<number> {
  const state = await getState();
  if (state.todaySendCount >= state.effectiveDailyLimit) {
    // Next send is tomorrow
    const tomorrow = new Date();
    tomorrow.setHours(DEFAULT_ACTIVE_HOURS_START, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.getTime();
  }
  return Date.now();
}

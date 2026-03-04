import {
  ALARM_CAMPAIGN_TICK,
  ALARM_INBOX_CHECK,
  ALARM_DAILY_RESET,
  CAMPAIGN_TICK_INTERVAL,
  INBOX_CHECK_INTERVAL,
} from '../shared/constants';
import { getNextMidnight } from '../shared/utils';
import { createLogger } from '../shared/logger';
import { executeCampaignTick } from './campaign-executor';
import { checkForReplies } from './session-monitor';
import { resetDailyCount } from './rate-limiter';

const log = createLogger('AlarmManager');

export async function setupAlarms(): Promise<void> {
  // Clear existing alarms first
  await chrome.alarms.clearAll();

  chrome.alarms.create(ALARM_CAMPAIGN_TICK, {
    delayInMinutes: 1,
    periodInMinutes: CAMPAIGN_TICK_INTERVAL,
  });

  chrome.alarms.create(ALARM_INBOX_CHECK, {
    delayInMinutes: 5,
    periodInMinutes: INBOX_CHECK_INTERVAL,
  });

  chrome.alarms.create(ALARM_DAILY_RESET, {
    when: getNextMidnight(),
    periodInMinutes: 1440, // 24 hours
  });

  log.info('Alarms set up', {
    campaignTick: `${CAMPAIGN_TICK_INTERVAL}min`,
    inboxCheck: `${INBOX_CHECK_INTERVAL}min`,
    dailyReset: new Date(getNextMidnight()).toISOString(),
  });
}

export async function handleAlarm(
  alarm: chrome.alarms.Alarm,
  sendToContentScript: (msg: unknown) => Promise<unknown>
): Promise<void> {
  switch (alarm.name) {
    case ALARM_CAMPAIGN_TICK:
      try {
        await executeCampaignTick(sendToContentScript);
      } catch (err) {
        log.error('Campaign tick failed', err);
      }
      break;

    case ALARM_INBOX_CHECK:
      try {
        await checkForReplies(sendToContentScript);
      } catch (err) {
        log.error('Inbox check failed', err);
      }
      break;

    case ALARM_DAILY_RESET:
      try {
        await resetDailyCount();
        log.info('Daily send count reset');
      } catch (err) {
        log.error('Daily reset failed', err);
      }
      break;

    default:
      log.warn('Unknown alarm', { name: alarm.name });
  }
}

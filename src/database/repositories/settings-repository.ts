import { db, initializeSettings } from '../db';
import type { AppSettings } from '../models';

export async function getSettings(): Promise<AppSettings> {
  await initializeSettings();
  return (await db.settings.get('global'))!;
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<void> {
  await db.settings.update('global', updates);
}

export async function incrementSendCount(): Promise<number> {
  const settings = await getSettings();
  const newCount = settings.todaySendCount + 1;
  await db.settings.update('global', { todaySendCount: newCount });
  return newCount;
}

export async function resetDailySendCount(): Promise<void> {
  await db.settings.update('global', {
    todaySendCount: 0,
    lastDailyReset: Date.now(),
  });
}

export async function getTodaySendCount(): Promise<number> {
  const settings = await getSettings();
  return settings.todaySendCount;
}

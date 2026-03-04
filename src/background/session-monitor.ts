import { db } from '../database/db';
import { MSG } from '../shared/message-types';
import { createLogger } from '../shared/logger';

const log = createLogger('SessionMonitor');

type SendFn = (msg: unknown) => Promise<unknown>;

export async function checkForReplies(sendToContentScript: SendFn): Promise<void> {
  // Get usernames from active campaigns
  const activeCampaigns = await db.campaigns.where('status').equals('active').toArray();
  if (activeCampaigns.length === 0) return;

  const activeUsernames = new Set<string>();
  for (const campaign of activeCampaigns) {
    const leads = await db.campaignLeads
      .where('[campaignId+status]')
      .anyOf(
        [campaign.id, 'in_progress'],
        [campaign.id, 'waiting_delay'],
        [campaign.id, 'completed']
      )
      .toArray();
    for (const lead of leads) {
      activeUsernames.add(lead.username);
    }
  }

  if (activeUsernames.size === 0) return;

  try {
    await sendToContentScript({
      type: MSG.CHECK_INBOX,
      payload: { usernames: Array.from(activeUsernames) },
    });
  } catch (err) {
    log.warn('Inbox check failed - Instagram tab may not be open', err);
  }
}

export async function checkSession(sendToContentScript: SendFn): Promise<boolean> {
  try {
    const result = (await sendToContentScript({
      type: MSG.CHECK_SESSION,
    })) as { loggedIn: boolean };
    return result?.loggedIn ?? false;
  } catch {
    log.warn('Session check failed');
    return false;
  }
}

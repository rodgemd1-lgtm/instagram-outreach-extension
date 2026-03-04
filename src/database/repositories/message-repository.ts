import { db } from '../db';
import type { SentMessage, ReceivedMessage } from '../models';
import { generateId } from '../../shared/utils';

export async function recordSentMessage(
  data: Omit<SentMessage, 'id'>
): Promise<SentMessage> {
  const msg: SentMessage = { ...data, id: generateId() };
  await db.sentMessages.put(msg);
  return msg;
}

export async function getSentMessagesByCampaign(campaignId: string): Promise<SentMessage[]> {
  return db.sentMessages.where('campaignId').equals(campaignId).toArray();
}

export async function getSentMessagesByLead(leadId: string): Promise<SentMessage[]> {
  return db.sentMessages.where('leadId').equals(leadId).toArray();
}

export async function recordReceivedMessage(
  data: Omit<ReceivedMessage, 'id'>
): Promise<ReceivedMessage> {
  const msg: ReceivedMessage = { ...data, id: generateId() };
  await db.receivedMessages.put(msg);
  return msg;
}

export async function getReceivedMessages(campaignId?: string): Promise<ReceivedMessage[]> {
  if (campaignId) {
    return db.receivedMessages
      .where('campaignId')
      .equals(campaignId)
      .reverse()
      .sortBy('receivedAt');
  }
  return db.receivedMessages.orderBy('receivedAt').reverse().toArray();
}

export async function getUnreadMessages(): Promise<ReceivedMessage[]> {
  return db.receivedMessages.where('read').equals(0).toArray();
}

export async function markMessageRead(id: string): Promise<void> {
  await db.receivedMessages.update(id, { read: true });
}

export async function getConversation(
  leadId: string
): Promise<{ sent: SentMessage[]; received: ReceivedMessage[] }> {
  const [sent, received] = await Promise.all([
    db.sentMessages.where('leadId').equals(leadId).sortBy('sentAt'),
    db.receivedMessages.where('leadId').equals(leadId).sortBy('receivedAt'),
  ]);
  return { sent, received };
}

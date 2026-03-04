import { db } from '../db';
import type { Campaign, CampaignLead, CampaignStatus } from '../models';
import { generateId } from '../../shared/utils';

export async function createCampaign(campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<Campaign> {
  const now = Date.now();
  const full: Campaign = {
    ...campaign,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  await db.campaigns.put(full);
  return full;
}

export async function getCampaign(id: string): Promise<Campaign | undefined> {
  return db.campaigns.get(id);
}

export async function getAllCampaigns(): Promise<Campaign[]> {
  return db.campaigns.orderBy('createdAt').reverse().toArray();
}

export async function getActiveCampaigns(): Promise<Campaign[]> {
  return db.campaigns.where('status').equals('active').toArray();
}

export async function updateCampaign(id: string, updates: Partial<Campaign>): Promise<void> {
  await db.campaigns.update(id, { ...updates, updatedAt: Date.now() });
}

export async function updateCampaignStatus(id: string, status: CampaignStatus): Promise<void> {
  const updates: Partial<Campaign> = { status, updatedAt: Date.now() };
  if (status === 'active') updates.startedAt = Date.now();
  if (status === 'paused') updates.pausedAt = Date.now();
  if (status === 'completed') updates.completedAt = Date.now();
  await db.campaigns.update(id, updates);
}

export async function deleteCampaign(id: string): Promise<void> {
  await db.campaignLeads.where('campaignId').equals(id).delete();
  await db.sentMessages.where('campaignId').equals(id).delete();
  await db.campaigns.delete(id);
}

// ============ Campaign Leads ============

export async function initializeCampaignLeads(
  campaignId: string,
  leads: { id: string; username: string }[]
): Promise<void> {
  const now = Date.now();
  const campaignLeads: CampaignLead[] = leads.map((lead) => ({
    id: `${campaignId}_${lead.id}`,
    campaignId,
    leadId: lead.id,
    username: lead.username,
    status: 'queued' as const,
    currentStepIndex: 0,
    lastStepSentAt: null,
    nextStepDueAt: null,
    variantsSent: [],
    errorCount: 0,
    lastError: null,
    repliedAt: null,
    createdAt: now,
    updatedAt: now,
  }));
  await db.campaignLeads.bulkPut(campaignLeads);
}

export async function getNextReadyLead(campaignId: string): Promise<CampaignLead | undefined> {
  const now = Date.now();
  // Get queued leads (haven't started) or those whose next step is due
  const queued = await db.campaignLeads
    .where('[campaignId+status]')
    .equals([campaignId, 'queued'])
    .first();
  if (queued) return queued;

  const waiting = await db.campaignLeads
    .where('[campaignId+status]')
    .equals([campaignId, 'waiting_delay'])
    .filter((cl) => cl.nextStepDueAt !== null && cl.nextStepDueAt <= now)
    .first();
  return waiting;
}

export async function updateCampaignLead(id: string, updates: Partial<CampaignLead>): Promise<void> {
  await db.campaignLeads.update(id, { ...updates, updatedAt: Date.now() });
}

export async function getCampaignLeads(campaignId: string): Promise<CampaignLead[]> {
  return db.campaignLeads.where('campaignId').equals(campaignId).toArray();
}

export async function getCampaignLeadByUsername(
  campaignId: string,
  username: string
): Promise<CampaignLead | undefined> {
  return db.campaignLeads
    .where('campaignId')
    .equals(campaignId)
    .filter((cl) => cl.username === username)
    .first();
}

export async function getCampaignStats(campaignId: string) {
  const leads = await db.campaignLeads.where('campaignId').equals(campaignId).toArray();
  const sent = leads.filter((l) => l.currentStepIndex > 0 || l.status === 'completed').length;
  const replied = leads.filter((l) => l.status === 'replied').length;
  const failed = leads.filter((l) => l.status === 'failed').length;
  const pending = leads.filter((l) => l.status === 'queued' || l.status === 'waiting_delay').length;

  return {
    totalLeads: leads.length,
    sent,
    delivered: sent,
    replied,
    failed,
    pending,
    responseRate: sent > 0 ? replied / sent : 0,
  };
}

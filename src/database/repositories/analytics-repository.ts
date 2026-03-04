import { db } from '../db';

export interface CampaignAnalytics {
  campaignId: string;
  campaignName: string;
  totalSent: number;
  totalReplied: number;
  responseRate: number;
  variantPerformance: VariantPerformance[];
}

export interface VariantPerformance {
  variantId: string;
  variantLabel: string;
  timesSent: number;
  timesReplied: number;
  responseRate: number;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  sent: number;
  replied: number;
}

export async function getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics | null> {
  const campaign = await db.campaigns.get(campaignId);
  if (!campaign) return null;

  const sentMessages = await db.sentMessages.where('campaignId').equals(campaignId).toArray();
  const campaignLeads = await db.campaignLeads.where('campaignId').equals(campaignId).toArray();
  const repliedLeadIds = new Set(
    campaignLeads.filter((cl) => cl.status === 'replied').map((cl) => cl.leadId)
  );

  // Calculate variant performance
  const variantMap = new Map<string, { sent: number; replied: number; label: string }>();
  for (const step of campaign.steps) {
    for (const variant of step.variants) {
      if (!variantMap.has(variant.id)) {
        variantMap.set(variant.id, { sent: 0, replied: 0, label: variant.label });
      }
    }
  }

  for (const msg of sentMessages) {
    const entry = variantMap.get(msg.variantId);
    if (entry) {
      entry.sent++;
      if (repliedLeadIds.has(msg.leadId)) {
        entry.replied++;
      }
    }
  }

  const variantPerformance: VariantPerformance[] = Array.from(variantMap.entries()).map(
    ([id, data]) => ({
      variantId: id,
      variantLabel: data.label,
      timesSent: data.sent,
      timesReplied: data.replied,
      responseRate: data.sent > 0 ? data.replied / data.sent : 0,
    })
  );

  return {
    campaignId,
    campaignName: campaign.name,
    totalSent: sentMessages.length,
    totalReplied: repliedLeadIds.size,
    responseRate: sentMessages.length > 0 ? repliedLeadIds.size / sentMessages.length : 0,
    variantPerformance,
  };
}

export async function getDailyStats(days = 30): Promise<DailyStats[]> {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const sentMessages = await db.sentMessages.where('sentAt').above(cutoff).toArray();
  const receivedMessages = await db.receivedMessages.where('receivedAt').above(cutoff).toArray();

  const statsMap = new Map<string, DailyStats>();

  for (const msg of sentMessages) {
    const date = new Date(msg.sentAt).toISOString().split('T')[0];
    if (!statsMap.has(date)) statsMap.set(date, { date, sent: 0, replied: 0 });
    statsMap.get(date)!.sent++;
  }

  for (const msg of receivedMessages) {
    const date = new Date(msg.receivedAt).toISOString().split('T')[0];
    if (!statsMap.has(date)) statsMap.set(date, { date, sent: 0, replied: 0 });
    statsMap.get(date)!.replied++;
  }

  return Array.from(statsMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export async function getOverallStats() {
  const [campaigns, sentCount, repliedCount, leadCount] = await Promise.all([
    db.campaigns.where('status').equals('active').count(),
    db.sentMessages.count(),
    db.receivedMessages.count(),
    db.leads.count(),
  ]);

  return {
    activeCampaigns: campaigns,
    totalSent: sentCount,
    totalReplied: repliedCount,
    totalLeads: leadCount,
    responseRate: sentCount > 0 ? repliedCount / sentCount : 0,
  };
}

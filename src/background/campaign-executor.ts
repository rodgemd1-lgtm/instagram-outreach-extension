import { db } from '../database/db';
import type { Campaign, CampaignLead, MessageVariant } from '../shared/types';
import { MSG, type ExtensionMessage } from '../shared/message-types';
import { renderTemplate, type TemplateContext } from '../shared/template-engine';
import { canSend, recordSend, applyDelay } from './rate-limiter';
import { MAX_RETRY_COUNT } from '../shared/constants';
import { createLogger } from '../shared/logger';

const log = createLogger('CampaignExecutor');

type SendFn = (msg: unknown) => Promise<unknown>;

// ============ Campaign Tick (called every 60s by alarm) ============

export async function executeCampaignTick(sendToContentScript: SendFn): Promise<void> {
  if (!(await canSend())) return;

  const activeCampaigns = await db.campaigns
    .where('status')
    .equals('active')
    .toArray();

  if (activeCampaigns.length === 0) return;

  for (const campaign of activeCampaigns) {
    if (!(await canSend())) break;

    const nextLead = await getNextReadyLead(campaign.id);
    if (!nextLead) {
      // Check if campaign is complete
      await checkCampaignCompletion(campaign);
      continue;
    }

    try {
      await processLead(campaign, nextLead, sendToContentScript);
    } catch (err) {
      log.error('Failed to process lead', {
        campaign: campaign.id,
        lead: nextLead.username,
        error: err,
      });
    }
  }
}

// ============ Process a single lead ============

async function processLead(
  campaign: Campaign,
  campaignLead: CampaignLead,
  sendToContentScript: SendFn
): Promise<void> {
  const step = campaign.steps[campaignLead.currentStepIndex];
  if (!step) {
    // All steps completed
    await db.campaignLeads.update(campaignLead.id, {
      status: 'completed',
      updatedAt: Date.now(),
    });
    return;
  }

  // Select variant (A/B testing)
  const variant = selectVariant(step.variants);

  // Get lead data for personalization
  const lead = await db.leads.get(campaignLead.leadId);
  if (!lead) {
    log.warn('Lead not found', { leadId: campaignLead.leadId });
    return;
  }

  // Render template
  const context: TemplateContext = {
    firstName: lead.firstName ?? lead.username,
    name: lead.fullName ?? lead.username,
    username: lead.username,
    ...lead.customFields,
  };
  const messageText = renderTemplate(variant.text, context);

  // Update status to in_progress
  await db.campaignLeads.update(campaignLead.id, {
    status: 'in_progress',
    updatedAt: Date.now(),
  });

  // Send DM via content script
  log.info('Sending DM', { username: lead.username, step: campaignLead.currentStepIndex });

  try {
    const result = (await sendToContentScript({
      type: MSG.SEND_DM,
      payload: { username: lead.username, message: messageText },
    })) as { success: boolean; error?: string; retry?: boolean };

    if (result?.success) {
      await onDMSuccess(campaign, campaignLead, variant, messageText);
    } else {
      await onDMFailure(campaign, campaignLead, result?.error ?? 'Unknown error', result?.retry);
    }
  } catch (err) {
    await onDMFailure(campaign, campaignLead, (err as Error).message, true);
  }
}

// ============ DM Result Handlers ============

async function onDMSuccess(
  campaign: Campaign,
  campaignLead: CampaignLead,
  variant: MessageVariant,
  messageText: string
): Promise<void> {
  const now = Date.now();
  const nextStepIndex = campaignLead.currentStepIndex + 1;
  const nextStep = campaign.steps[nextStepIndex];

  // Record sent message
  await db.sentMessages.add({
    id: crypto.randomUUID(),
    campaignId: campaign.id,
    campaignLeadId: campaignLead.id,
    leadId: campaignLead.leadId,
    username: campaignLead.username,
    stepIndex: campaignLead.currentStepIndex,
    variantId: variant.id,
    messageText,
    sentAt: now,
    status: 'sent',
    errorMessage: null,
  });

  // Update campaign lead
  const updates: Partial<CampaignLead> = {
    lastStepSentAt: now,
    currentStepIndex: nextStepIndex,
    variantsSent: [...campaignLead.variantsSent, variant.id],
    errorCount: 0,
    lastError: null,
    updatedAt: now,
  };

  if (nextStep) {
    updates.status = 'waiting_delay';
    updates.nextStepDueAt = now + nextStep.delayAfterPrevious;
  } else {
    updates.status = 'completed';
    updates.nextStepDueAt = null;
  }

  await db.campaignLeads.update(campaignLead.id, updates);

  // Record send for rate limiting
  await recordSend();
  await applyDelay();

  log.info('DM sent successfully', { username: campaignLead.username });
}

async function onDMFailure(
  campaign: Campaign,
  campaignLead: CampaignLead,
  error: string,
  retry?: boolean
): Promise<void> {
  const newErrorCount = campaignLead.errorCount + 1;

  if (error === 'ACTION_BLOCKED') {
    // Pause entire campaign
    log.warn('Action blocked - pausing campaign', { campaignId: campaign.id });
    await db.campaigns.update(campaign.id, {
      status: 'paused',
      pausedAt: Date.now(),
      updatedAt: Date.now(),
    });
    return;
  }

  if (newErrorCount >= MAX_RETRY_COUNT || !retry) {
    await db.campaignLeads.update(campaignLead.id, {
      status: 'failed',
      errorCount: newErrorCount,
      lastError: error,
      updatedAt: Date.now(),
    });
    log.error('Lead failed permanently', { username: campaignLead.username, error });
  } else {
    await db.campaignLeads.update(campaignLead.id, {
      status: 'queued', // Re-queue for retry
      errorCount: newErrorCount,
      lastError: error,
      updatedAt: Date.now(),
    });
    log.warn('DM failed, will retry', {
      username: campaignLead.username,
      error,
      attempt: newErrorCount,
    });
  }
}

// ============ Message Handlers (from service-worker router) ============

export async function handleCampaignMessage(
  message: ExtensionMessage,
  sendToContentScript: SendFn
): Promise<unknown> {
  switch (message.type) {
    case MSG.START_CAMPAIGN: {
      const { campaignId } = message.payload;
      const campaign = await db.campaigns.get(campaignId);
      if (!campaign) throw new Error(`Campaign ${campaignId} not found`);

      // Load leads and create CampaignLead records
      const leads = await db.leads.where('listId').equals(campaign.leadListId).toArray();
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

      // Update campaign status
      await db.campaigns.update(campaignId, {
        status: 'active',
        startedAt: now,
        updatedAt: now,
        stats: {
          totalLeads: leads.length,
          sent: 0,
          delivered: 0,
          replied: 0,
          failed: 0,
          pending: leads.length,
          responseRate: 0,
        },
      });

      log.info('Campaign started', { campaignId, leadCount: leads.length });
      return { success: true, leadCount: leads.length };
    }

    case MSG.PAUSE_CAMPAIGN: {
      await db.campaigns.update(message.payload.campaignId, {
        status: 'paused',
        pausedAt: Date.now(),
        updatedAt: Date.now(),
      });
      log.info('Campaign paused', { campaignId: message.payload.campaignId });
      return { success: true };
    }

    case MSG.RESUME_CAMPAIGN: {
      await db.campaigns.update(message.payload.campaignId, {
        status: 'active',
        updatedAt: Date.now(),
      });
      log.info('Campaign resumed', { campaignId: message.payload.campaignId });
      return { success: true };
    }

    case MSG.CANCEL_CAMPAIGN: {
      await db.campaigns.update(message.payload.campaignId, {
        status: 'completed',
        completedAt: Date.now(),
        updatedAt: Date.now(),
      });
      log.info('Campaign cancelled', { campaignId: message.payload.campaignId });
      return { success: true };
    }

    case MSG.REPLY_DETECTED: {
      const reply = message.payload;
      // Find active campaign leads for this username
      const activeCampaigns = await db.campaigns.where('status').equals('active').toArray();
      for (const campaign of activeCampaigns) {
        if (!campaign.settings.stopOnReply) continue;
        const cl = await db.campaignLeads
          .where('[campaignId+status]')
          .anyOf(
            [campaign.id, 'queued'],
            [campaign.id, 'in_progress'],
            [campaign.id, 'waiting_delay']
          )
          .filter((cl) => cl.username === reply.username)
          .first();
        if (cl) {
          await db.campaignLeads.update(cl.id, {
            status: 'replied',
            repliedAt: Date.now(),
            updatedAt: Date.now(),
          });
          log.info('Lead marked as replied', { username: reply.username, campaign: campaign.id });
        }
      }

      // Store received message
      await db.receivedMessages.add({
        id: crypto.randomUUID(),
        leadId: reply.leadId ?? '',
        username: reply.username,
        campaignId: reply.campaignId ?? null,
        messageText: reply.messageText,
        receivedAt: reply.receivedAt ?? Date.now(),
        read: false,
      });
      return { success: true };
    }

    default:
      return { success: false, error: 'Unknown message type' };
  }
}

// ============ Helpers ============

function selectVariant(variants: MessageVariant[]): MessageVariant {
  if (variants.length === 1) return variants[0];
  const totalWeight = variants.reduce((sum, v) => sum + (v.weight || 1), 0);
  let random = Math.random() * totalWeight;
  for (const variant of variants) {
    random -= variant.weight || 1;
    if (random <= 0) return variant;
  }
  return variants[0];
}

async function getNextReadyLead(campaignId: string): Promise<CampaignLead | undefined> {
  const now = Date.now();

  // First: queued leads (haven't started)
  const queued = await db.campaignLeads
    .where('[campaignId+status]')
    .equals([campaignId, 'queued'])
    .first();
  if (queued) return queued;

  // Then: leads whose delay has elapsed
  const waiting = await db.campaignLeads
    .where('[campaignId+status]')
    .equals([campaignId, 'waiting_delay'])
    .filter((cl) => cl.nextStepDueAt !== null && cl.nextStepDueAt <= now)
    .first();
  return waiting;
}

async function checkCampaignCompletion(campaign: Campaign): Promise<void> {
  const remaining = await db.campaignLeads
    .where('[campaignId+status]')
    .anyOf(
      [campaign.id, 'queued'],
      [campaign.id, 'in_progress'],
      [campaign.id, 'waiting_delay']
    )
    .count();

  if (remaining === 0) {
    await db.campaigns.update(campaign.id, {
      status: 'completed',
      completedAt: Date.now(),
      updatedAt: Date.now(),
    });
    log.info('Campaign completed', { campaignId: campaign.id });
  }
}

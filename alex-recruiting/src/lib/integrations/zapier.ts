// Zapier Webhook Integration for Automated X Posting
// Flow: Airtable "Ready" -> Zapier Webhook -> Post to X
// Also supports DM automation and Slack notifications

import type { AirtablePostRecord, AirtableDMRecord } from "../data/airtable-export";

// ─── Configuration ──────────────────────────────────────────────────────────

export interface ZapierConfig {
  webhookUrl: string;
  postWebhookUrl: string;
  dmWebhookUrl: string;
  slackWebhookUrl: string;
}

export function getZapierConfig(): ZapierConfig {
  return {
    webhookUrl:
      process.env.ZAPIER_WEBHOOK_URL || process.env.NEXT_PUBLIC_ZAPIER_WEBHOOK_URL || "",
    postWebhookUrl:
      process.env.ZAPIER_POST_WEBHOOK_URL ||
      process.env.NEXT_PUBLIC_ZAPIER_POST_WEBHOOK_URL ||
      "",
    dmWebhookUrl:
      process.env.ZAPIER_DM_WEBHOOK_URL || process.env.NEXT_PUBLIC_ZAPIER_DM_WEBHOOK_URL || "",
    slackWebhookUrl:
      process.env.ZAPIER_SLACK_WEBHOOK_URL ||
      process.env.NEXT_PUBLIC_ZAPIER_SLACK_WEBHOOK_URL ||
      "",
  };
}

export function isZapierConfigured(): boolean {
  const config = getZapierConfig();
  return Boolean(config.postWebhookUrl || config.webhookUrl);
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface ZapierPostPayload {
  action: "post_to_x";
  postId: string;
  content: string;
  hashtags: string;
  mediaType: string;
  mediaDescription: string;
  scheduledDate: string;
  scheduledTime: string;
  pillar: string;
  weekNumber: number;
  airtableRecordId?: string;
}

interface ZapierDMPayload {
  action: "send_dm";
  dmId: string;
  recipientHandle: string;
  message: string;
  sequence: string;
  tier: string;
  coachName: string;
  schoolName: string;
}

interface SlackNotificationPayload {
  text: string;
  blocks?: Array<{
    type: string;
    text?: { type: string; text: string };
    fields?: Array<{ type: string; text: string }>;
  }>;
}

interface ZapierResponse {
  status: "success" | "error";
  id?: string;
  message?: string;
  attempt_id?: string;
  request_id?: string;
}

// ─── Webhook Helpers ────────────────────────────────────────────────────────

async function sendWebhook<T>(
  url: string,
  payload: T
): Promise<ZapierResponse> {
  if (!url) {
    throw new Error("Zapier webhook URL is not configured.");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Zapier webhook failed (${response.status}): ${errorText}`);
  }

  // Zapier webhooks can return various formats
  const text = await response.text();
  try {
    return JSON.parse(text) as ZapierResponse;
  } catch {
    // Zapier catch hooks often return a simple success string
    return { status: "success", message: text };
  }
}

// ─── Post to X via Zapier ───────────────────────────────────────────────────

export async function triggerPostToX(
  post: AirtablePostRecord,
  airtableRecordId?: string,
  config?: ZapierConfig
): Promise<ZapierResponse> {
  const cfg = config || getZapierConfig();
  const webhookUrl = cfg.postWebhookUrl || cfg.webhookUrl;

  if (!webhookUrl) {
    throw new Error(
      "Zapier post webhook URL is not configured. Set ZAPIER_POST_WEBHOOK_URL in your environment."
    );
  }

  const payload: ZapierPostPayload = {
    action: "post_to_x",
    postId: post.id,
    content: post.content,
    hashtags: post.hashtags,
    mediaType: post.mediaType,
    mediaDescription: post.mediaDescription,
    scheduledDate: post.postDate,
    scheduledTime: post.postTime,
    pillar: post.pillar,
    weekNumber: post.weekNumber,
    airtableRecordId,
  };

  return sendWebhook(webhookUrl, payload);
}

// ─── Send DM via Zapier ─────────────────────────────────────────────────────

export async function triggerDMSend(
  dm: AirtableDMRecord,
  recipientHandle: string,
  coachName: string,
  schoolName: string,
  config?: ZapierConfig
): Promise<ZapierResponse> {
  const cfg = config || getZapierConfig();
  const webhookUrl = cfg.dmWebhookUrl || cfg.webhookUrl;

  if (!webhookUrl) {
    throw new Error(
      "Zapier DM webhook URL is not configured. Set ZAPIER_DM_WEBHOOK_URL in your environment."
    );
  }

  const payload: ZapierDMPayload = {
    action: "send_dm",
    dmId: dm.id,
    recipientHandle,
    message: dm.template,
    sequence: dm.sequence,
    tier: dm.tier,
    coachName,
    schoolName,
  };

  return sendWebhook(webhookUrl, payload);
}

// ─── Slack Notification ─────────────────────────────────────────────────────

export async function notifySlack(
  message: string,
  post?: AirtablePostRecord,
  config?: ZapierConfig
): Promise<ZapierResponse> {
  const cfg = config || getZapierConfig();

  if (!cfg.slackWebhookUrl) {
    throw new Error(
      "Slack webhook URL is not configured. Set ZAPIER_SLACK_WEBHOOK_URL in your environment."
    );
  }

  const payload: SlackNotificationPayload = post
    ? {
        text: message,
        blocks: [
          {
            type: "section",
            text: { type: "mrkdwn", text: `*${message}*` },
          },
          {
            type: "section",
            fields: [
              { type: "mrkdwn", text: `*Post ID:* ${post.id}` },
              { type: "mrkdwn", text: `*Pillar:* ${post.pillar}` },
              { type: "mrkdwn", text: `*Date:* ${post.postDate}` },
              { type: "mrkdwn", text: `*Time:* ${post.postTime}` },
              {
                type: "mrkdwn",
                text: `*Content:* ${post.content.substring(0, 100)}...`,
              },
              { type: "mrkdwn", text: `*Status:* ${post.status}` },
            ],
          },
        ],
      }
    : { text: message };

  return sendWebhook(cfg.slackWebhookUrl, payload);
}

// ─── Batch Operations ───────────────────────────────────────────────────────

export async function triggerBatchPostToX(
  posts: AirtablePostRecord[],
  config?: ZapierConfig
): Promise<{ succeeded: string[]; failed: Array<{ id: string; error: string }> }> {
  const succeeded: string[] = [];
  const failed: Array<{ id: string; error: string }> = [];

  for (const post of posts) {
    try {
      await triggerPostToX(post, undefined, config);
      succeeded.push(post.id);
    } catch (err) {
      failed.push({
        id: post.id,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
    // Slight delay between webhooks to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return { succeeded, failed };
}

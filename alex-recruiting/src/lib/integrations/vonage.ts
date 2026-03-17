interface VonageConfig {
  apiKey: string;
  apiSecret: string;
  fromNumber: string;
  defaultRecipients: string[];
}

export interface SmsSendResult {
  ok: boolean;
  to: string;
  messageId?: string;
  error?: string;
}

function getVonageConfig(): VonageConfig | null {
  const apiKey = process.env.VONAGE_API_KEY;
  const apiSecret = process.env.VONAGE_API_SECRET;
  const fromNumber = process.env.VONAGE_FROM_NUMBER;
  const defaultRecipients = (process.env.REMINDER_SMS_TO ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!apiKey || !apiSecret || !fromNumber) {
    return null;
  }

  return {
    apiKey,
    apiSecret,
    fromNumber,
    defaultRecipients,
  };
}

export function isSmsConfigured(): boolean {
  return getVonageConfig() !== null;
}

export function getDefaultReminderRecipients(): string[] {
  return getVonageConfig()?.defaultRecipients ?? [];
}

export async function sendSms(to: string, body: string): Promise<SmsSendResult> {
  const cfg = getVonageConfig();
  if (!cfg) {
    return {
      ok: false,
      to,
      error: "Vonage is not configured",
    };
  }

  try {
    const response = await fetch(
      "https://rest.nexmo.com/sms/json",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: cfg.apiKey,
          api_secret: cfg.apiSecret,
          to: to.replace(/\D/g, ""),
          from: cfg.fromNumber,
          text: body,
        }),
      }
    );

    const payload = await response.json().catch(() => ({}));
    const message = payload?.messages?.[0];

    if (!message || message.status !== "0") {
      return {
        ok: false,
        to,
        error: message?.["error-text"] ?? `Vonage request failed with status ${response.status}`,
      };
    }

    return {
      ok: true,
      to,
      messageId: message["message-id"],
    };
  } catch (error) {
    return {
      ok: false,
      to,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function sendSmsBatch(recipients: string[], body: string): Promise<SmsSendResult[]> {
  const uniqueRecipients = Array.from(new Set(recipients.filter(Boolean)));
  const results: SmsSendResult[] = [];

  for (const recipient of uniqueRecipients) {
    results.push(await sendSms(recipient, body));
  }

  return results;
}

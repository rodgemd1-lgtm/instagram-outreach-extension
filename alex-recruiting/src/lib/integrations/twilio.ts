interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  defaultRecipients: string[];
}

export interface SmsSendResult {
  ok: boolean;
  to: string;
  sid?: string;
  error?: string;
}

function getTwilioConfig(): TwilioConfig | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  const defaultRecipients = (process.env.REMINDER_SMS_TO ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!accountSid || !authToken || !fromNumber) {
    return null;
  }

  return {
    accountSid,
    authToken,
    fromNumber,
    defaultRecipients,
  };
}

export function isTwilioConfigured(): boolean {
  return getTwilioConfig() !== null;
}

export function getDefaultReminderRecipients(): string[] {
  return getTwilioConfig()?.defaultRecipients ?? [];
}

export async function sendSms(to: string, body: string): Promise<SmsSendResult> {
  const cfg = getTwilioConfig();
  if (!cfg) {
    return {
      ok: false,
      to,
      error: "Twilio is not configured",
    };
  }

  try {
    const auth = Buffer.from(`${cfg.accountSid}:${cfg.authToken}`).toString("base64");
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${cfg.accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: to,
          From: cfg.fromNumber,
          Body: body,
        }),
      }
    );

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        to,
        error: payload?.message ?? `Twilio request failed with status ${response.status}`,
      };
    }

    return {
      ok: true,
      to,
      sid: payload.sid,
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

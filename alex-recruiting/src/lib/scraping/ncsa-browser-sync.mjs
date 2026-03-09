import fs from "fs/promises";
import path from "path";
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://recruit-match.ncsasports.org";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

function clean(value) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function normalizeDivisionMeta(value) {
  const cleaned = clean(value)
    .replace(/\b(NCAA I-AA|NCAA I-AA)\b/gi, "NCAA FCS")
    .replace(/(, [A-Z]{2})[A-Z]\b/g, "$1");

  return cleaned;
}

function normalizeRelativeTime(value) {
  const compact = clean(value)
    .replace(/\b(\d+)\s*([smhdwy])M\b/gi, "$1$2")
    .replace(/\b(\d+)\s+([smhdwy])\b/gi, "$1$2");

  const match = compact.match(/^\d+[smhdwy]$/i);
  return match ? match[0].toLowerCase() : compact;
}

function uniqueBy(items, getKey) {
  const seen = new Set();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sanitizeHandleCandidate(candidate) {
  let value = clean(candidate).replace(/^@/, "");
  value = value.replace(/[^A-Za-z0-9_].*$/, "");
  value = value.replace(/(view|register|registration|reg|info|univ|uni)$/i, "");
  value = value.slice(0, 15);
  return value || null;
}

function extractXHandle(text) {
  const cleaned = clean(text);
  const explicit =
    cleaned.match(/(?:twitter|x)\s*:\s*@?([A-Za-z0-9_]{1,30})/i)?.[1] ??
    cleaned.match(/https:\/\/x\.com\/([A-Za-z0-9_]{1,30})(?:\b|\/)/i)?.[1] ??
    cleaned.match(/(?:^|[^A-Za-z0-9._%+-])@([A-Za-z0-9_]{1,30})/i)?.[1] ??
    null;

  const sanitized = explicit ? sanitizeHandleCandidate(explicit) : null;
  return sanitized ? `@${sanitized}` : null;
}

async function login(page) {
  await page.goto(`${BASE_URL}/clientrms/user_accounts/sign_in`, {
    waitUntil: "domcontentloaded",
  });
  await page.getByRole("textbox", { name: "Username or Email" }).fill(requireEnv("NCSA_EMAIL"));
  await page.getByRole("textbox", { name: "Password" }).fill(requireEnv("NCSA_PASSWORD"));
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForURL(/clientrms\/(dashboard\/show)?/, { timeout: 30000 });
}

async function waitForNcsaContent(page) {
  await page.waitForSelector("main", { timeout: 15000 });
  await page.waitForTimeout(1200);
}

async function scrapeCoachActivity(page) {
  await page.goto(`${BASE_URL}/clientrms/coach_communications/views`, {
    waitUntil: "domcontentloaded",
  });
  await waitForNcsaContent(page);

  const result = await page.evaluate(() => {
    const stats = {
      views: 0,
      searches: 0,
      follows: 0,
      opens: 0,
    };

    for (const label of ["views", "searches", "follows", "opens"]) {
      const values = Array.from(document.querySelectorAll("main *"))
        .filter((node) => node.textContent?.trim() === label)
        .map((node) => node.previousElementSibling?.textContent?.trim())
        .filter(Boolean);

      if (values[0]) {
        stats[label] = Number.parseInt(values[0], 10) || 0;
      }
    }

    const rows = Array.from(document.querySelectorAll("main li"))
      .map((item) => {
        const collegeLink = Array.from(item.querySelectorAll('a[href*="/clientrms/colleges/"]')).find(
          (anchor) => (anchor.textContent ?? "").trim().length > 0
        );
        const coachStrong = item.querySelector("strong");
        if (!collegeLink || !coachStrong) return null;

        const rawText = item.textContent?.replace(/\s+/g, " ").trim() ?? "";
        if (!/views|searches|follows|opens/i.test(rawText)) return null;

        const coachBlock = (coachStrong.textContent ?? "").replace(/\s+/g, " ").trim();
        const coachMatch = coachBlock.match(/^(.*?)\s+\((.*?)\)$/);
        const activityText =
          rawText.match(
            /(searched for athletes like you .*?|followed you .*?|viewed you .*?|opened your email .*?)(?=\d+\s*views|\d+\s*searches|$)/i
          )?.[1] ?? "";

        return {
          schoolName: collegeLink.textContent?.trim() ?? "",
          divisionMeta: rawText.match(/(NCAA [^•]+|NAIA|NJCAA|JC)\s+•\s+([A-Z,\s.-]+)/)?.[0] ?? "",
          coachName: coachMatch?.[1]?.trim() ?? coachBlock,
          coachTitle: coachMatch?.[2]?.trim() ?? "",
          activityText,
          counts: {
            views: Number.parseInt(rawText.match(/(\d+)\s+views/)?.[1] ?? "0", 10) || 0,
            searches: Number.parseInt(rawText.match(/(\d+)\s+searches/)?.[1] ?? "0", 10) || 0,
            follows: Number.parseInt(rawText.match(/(\d+)\s+follows/)?.[1] ?? "0", 10) || 0,
            opens: Number.parseInt(rawText.match(/(\d+)\s+opens/)?.[1] ?? "0", 10) || 0,
          },
          fitScore: Number.parseInt(rawText.match(/(\d+)%/)?.[1] ?? "0", 10) || 0,
        };
      })
      .filter(Boolean);

    return { stats, rows };
  });

  return {
    ...result,
    rows: result.rows.map((row) => ({
      ...row,
      schoolName: clean(row.schoolName),
      divisionMeta: normalizeDivisionMeta(row.divisionMeta),
      coachName: clean(row.coachName),
      coachTitle: clean(row.coachTitle),
      activityText: clean(row.activityText),
    })),
  };
}

async function scrapeInboxThreads(page, urlPrefix) {
  await page.goto(`${BASE_URL}${urlPrefix}`, { waitUntil: "domcontentloaded" });
  await waitForNcsaContent(page);

  const links = await page.evaluate((prefix) => {
    return Array.from(document.querySelectorAll(`a[href*="${prefix}/message/"]`))
      .filter((anchor) => anchor.querySelectorAll("p").length >= 3)
      .map((anchor) => {
        const paragraphs = Array.from(anchor.querySelectorAll("p")).map(
          (node) => node.textContent?.trim() ?? ""
        );
        const containerText = anchor.parentElement?.textContent?.replace(/\s+/g, " ").trim() ?? "";
        const relativeTime = containerText.match(/^\d+\s*[smhdwy]+/i)?.[0] ?? "";
        return {
          href: anchor.href,
          relativeTime,
          schoolName: paragraphs[0] ?? "",
          divisionMeta: paragraphs[1] ?? "",
          coachName: paragraphs[2] ?? "",
        };
      });
  }, urlPrefix);

  return uniqueBy(links, (item) => item.href).map((item) => ({
    ...item,
    relativeTime: normalizeRelativeTime(item.relativeTime),
    schoolName: clean(item.schoolName),
    divisionMeta: normalizeDivisionMeta(item.divisionMeta),
    coachName: clean(item.coachName),
  }));
}

async function scrapeCampInviteDetails(page, threads) {
  const details = [];

  for (const thread of threads) {
    await page.goto(thread.href, { waitUntil: "domcontentloaded" });
    await waitForNcsaContent(page);

    const detail = await page.evaluate(() => {
      const mainText = document.querySelector("main")?.textContent?.replace(/\s+/g, " ").trim() ?? "";
      const subject = Array.from(document.querySelectorAll("main strong"))
        .map((node) => node.textContent?.trim() ?? "")
        .find((value) => value && !value.includes("Coach"));
      const email = document.querySelector('main a[href^="mailto:"]')?.textContent?.trim() ?? null;

      return {
        subject: subject ?? "",
        email,
        bodyPreview: mainText.slice(0, 1200),
        rawBody: mainText,
      };
    });

    details.push({
      ...thread,
      ...detail,
      subject: clean(detail.subject),
      xHandle: extractXHandle(detail.rawBody),
    });
  }

  return details;
}

function activityToLead(activity) {
  const lower = activity.activityText.toLowerCase();
  let source = "manual";
  let sourceDetail = `NCSA activity: ${activity.activityText}`;

  if (lower.includes("viewed you")) {
    source = "profile_view";
    sourceDetail = `Viewed Jacob's NCSA profile — ${activity.activityText}`;
  } else if (lower.includes("followed you")) {
    sourceDetail = `NCSA follow: ${activity.activityText}`;
  } else if (lower.includes("searched for athletes like you")) {
    sourceDetail = `NCSA search: ${activity.activityText}`;
  }

  return {
    coachName: clean(activity.coachName),
    schoolName: clean(activity.schoolName),
    division: normalizeDivisionMeta(activity.divisionMeta),
    conference: "",
    source,
    sourceDetail,
    xHandle: null,
    outreachStatus: "new",
    assignedTo: "nina",
    notes: `Coach title: ${clean(activity.coachTitle)} | Fit: ${activity.fitScore}% | Counts: ${JSON.stringify(activity.counts)}`,
  };
}

function personalMessageToLead(message) {
  return {
    coachName: clean(message.coachName),
    schoolName: clean(message.schoolName),
    division: normalizeDivisionMeta(message.divisionMeta),
    conference: "",
    source: "message",
    sourceDetail: `NCSA inbox message — ${message.relativeTime || "recent"}`,
    xHandle: null,
    outreachStatus: "new",
    assignedTo: "nina",
    notes: "Imported from authenticated NCSA inbox",
  };
}

function campInviteToLead(invite) {
  return {
    coachName: clean(invite.coachName),
    schoolName: clean(invite.schoolName),
    division: normalizeDivisionMeta(invite.divisionMeta),
    conference: "",
    source: "camp_invite",
    sourceDetail: invite.subject ? `Camp invite: ${invite.subject}` : "Camp invite received",
    xHandle: invite.xHandle,
    outreachStatus: "new",
    assignedTo: "nina",
    notes: [invite.relativeTime, invite.email, invite.bodyPreview].filter(Boolean).join(" | "),
  };
}

async function importLeads(leads) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return { inserted: 0, skipped: leads.length, reason: "supabase_not_configured" };
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data: existing, error: existingError } = await supabase
    .from("ncsa_leads")
    .select("id, coach_name, school_name, source, source_detail, x_handle, division, notes");

  if (existingError) {
    throw existingError;
  }

  const existingRowsByKey = new Map(
    (existing ?? []).map((row) => [
      `${clean(row.coach_name)}|${clean(row.school_name)}|${clean(row.source)}|${clean(row.source_detail)}`,
      row,
    ])
  );

  const payload = [];
  const updates = [];

  for (const lead of leads) {
    const keyValue = `${clean(lead.coachName)}|${clean(lead.schoolName)}|${clean(lead.source)}|${clean(lead.sourceDetail)}`;
    const existingRow = existingRowsByKey.get(keyValue);
    const nextXHandle = lead.xHandle ? sanitizeHandleCandidate(lead.xHandle)?.replace(/^@/, "") : null;

    if (!existingRow) {
      payload.push(lead);
      existingRowsByKey.set(keyValue, { x_handle: nextXHandle });
      continue;
    }

    const currentXHandle = existingRow.x_handle
      ? sanitizeHandleCandidate(existingRow.x_handle)?.replace(/^@/, "")
      : null;
    const shouldUpdateXHandle =
      Boolean(nextXHandle) &&
      (!currentXHandle || currentXHandle !== nextXHandle);
    const shouldUpdateDivision =
      clean(existingRow.division) !== clean(lead.division) &&
      clean(lead.division).length <= clean(existingRow.division).length;
    const shouldUpdateNotes =
      clean(lead.notes).length > clean(existingRow.notes).length;

    if (shouldUpdateXHandle || shouldUpdateDivision || shouldUpdateNotes) {
      updates.push({
        id: existingRow.id,
        x_handle: shouldUpdateXHandle ? `@${nextXHandle}` : existingRow.x_handle,
        division: shouldUpdateDivision ? lead.division : existingRow.division,
        notes: shouldUpdateNotes ? lead.notes : existingRow.notes,
      });
    }
  }

  if (payload.length === 0 && updates.length === 0) {
    return { inserted: 0, updated: 0, skipped: leads.length, reason: "duplicates_only" };
  }

  if (payload.length > 0) {
    const { error } = await supabase.from("ncsa_leads").insert(
      payload.map((lead) => ({
        coach_name: lead.coachName,
        school_name: lead.schoolName,
        division: lead.division,
        conference: lead.conference,
        source: lead.source,
        source_detail: lead.sourceDetail,
        x_handle: lead.xHandle ? `@${sanitizeHandleCandidate(lead.xHandle)?.replace(/^@/, "")}` : null,
        outreach_status: lead.outreachStatus,
        assigned_to: lead.assignedTo,
        notes: lead.notes,
      }))
    );

    if (error) {
      throw error;
    }
  }

  if (updates.length > 0) {
    await Promise.all(
      updates.map(async (update) => {
        const { error } = await supabase
          .from("ncsa_leads")
          .update({
            x_handle: update.x_handle,
            division: update.division,
            notes: update.notes,
          })
          .eq("id", update.id);
        if (error) {
          throw error;
        }
      })
    );
  }

  return {
    inserted: payload.length,
    updated: updates.length,
    skipped: leads.length - payload.length,
    reason: "ok",
  };
}

export async function syncNcsaDashboard(options = {}) {
  const {
    writeSnapshot = true,
    snapshotPath = path.join(process.cwd(), ".ncsa-scrape-latest.json"),
    maxCampInviteThreads = 12,
  } = options;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await login(page);

    const coachActivity = await scrapeCoachActivity(page);
    const personalThreads = await scrapeInboxThreads(page, "/clientrms/message_center/inbox");
    const campThreads = await scrapeInboxThreads(page, "/clientrms/message_center/dmc_camp");
    const campInvites = await scrapeCampInviteDetails(
      page,
      campThreads.slice(0, maxCampInviteThreads)
    );

    const leads = [
      ...coachActivity.rows.map(activityToLead),
      ...personalThreads.map(personalMessageToLead),
      ...campInvites.map(campInviteToLead),
    ];

    const importResult = await importLeads(leads);

    const output = {
      syncedAt: new Date().toISOString(),
      coachActivity,
      personalThreads,
      campInvites,
      leadCountPrepared: leads.length,
      importResult,
    };

    if (writeSnapshot) {
      await fs.writeFile(snapshotPath, JSON.stringify(output, null, 2));
    }

    return output;
  } finally {
    await browser.close();
  }
}

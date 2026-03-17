#!/usr/bin/env npx tsx
/**
 * Delete old tweets and repost with fixed OG image card.
 * Uses Supabase-stored OAuth tokens (which are valid) instead of .env tokens.
 *
 * Usage: npx tsx scripts/repost-tweets.ts
 *        npx tsx scripts/repost-tweets.ts --dry-run
 */
import crypto from "crypto";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

function loadEnvFile(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // skip
  }
}

loadEnvFile(path.join(projectRoot, ".env.local"));
loadEnvFile(path.join(projectRoot, ".env"));

const CONSUMER_KEY = process.env.X_API_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.X_API_CONSUMER_SECRET!;

// ---------------------------------------------------------------------------
// Fetch valid tokens from Supabase
// ---------------------------------------------------------------------------

async function getStoredTokens(): Promise<{
  accessToken: string;
  accessTokenSecret: string;
}> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const res = await fetch(
    `${supabaseUrl}/rest/v1/scrape_jobs?select=result&type=eq.x_legacy_profile_auth&status=eq.completed&order=created_at.desc&limit=1`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Supabase query failed: HTTP ${res.status}`);
  }

  const rows = await res.json();
  if (rows.length === 0 || !rows[0].result?.access_token) {
    throw new Error("No stored X OAuth tokens found in Supabase");
  }

  return {
    accessToken: rows[0].result.access_token,
    accessTokenSecret: rows[0].result.access_token_secret,
  };
}

// ---------------------------------------------------------------------------
// OAuth 1.0a helpers
// ---------------------------------------------------------------------------

function rfc3986Encode(str: string): string {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const sortedKeys = Object.keys(params).sort();
  const paramString = sortedKeys
    .map((k) => `${rfc3986Encode(k)}=${rfc3986Encode(params[k])}`)
    .join("&");
  const baseString = `${method}&${rfc3986Encode(url)}&${rfc3986Encode(paramString)}`;
  const signingKey = `${rfc3986Encode(consumerSecret)}&${rfc3986Encode(tokenSecret)}`;
  return crypto.createHmac("sha1", signingKey).update(baseString).digest("base64");
}

function getOAuth1Header(method: string, url: string, accessToken: string, accessTokenSecret: string): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: CONSUMER_KEY,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

  const signature = generateOAuthSignature(method, url, oauthParams, CONSUMER_SECRET, accessTokenSecret);
  oauthParams.oauth_signature = signature;

  const headerParts = Object.keys(oauthParams)
    .sort()
    .map((k) => `${rfc3986Encode(k)}="${rfc3986Encode(oauthParams[k])}"`)
    .join(", ");

  return `OAuth ${headerParts}`;
}

// ---------------------------------------------------------------------------
// Delete a tweet by ID
// ---------------------------------------------------------------------------

async function deleteTweet(tweetId: string, accessToken: string, accessTokenSecret: string): Promise<boolean> {
  const url = `https://api.x.com/2/tweets/${tweetId}`;
  const authHeader = getOAuth1Header("DELETE", url, accessToken, accessTokenSecret);

  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(true);
        } else {
          console.error(`  DELETE failed: HTTP ${res.statusCode}: ${data.slice(0, 200)}`);
          resolve(false);
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

// ---------------------------------------------------------------------------
// Post a tweet
// ---------------------------------------------------------------------------

async function postTweet(text: string, accessToken: string, accessTokenSecret: string): Promise<{ id: string; text: string } | null> {
  const url = "https://api.x.com/2/tweets";
  const body = JSON.stringify({ text });
  const authHeader = getOAuth1Header("POST", url, accessToken, accessTokenSecret);

  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          const parsed = JSON.parse(data);
          resolve(parsed.data || null);
        } else {
          console.error(`  POST failed: HTTP ${res.statusCode}: ${data.slice(0, 300)}`);
          resolve(null);
        }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ---------------------------------------------------------------------------
// Tweets to delete and repost
// ---------------------------------------------------------------------------

const OLD_TWEET_IDS = [
  "2031522711474676032",
  "2031522742093140466",
  "2031522776033464333",
];

const REPOST_TWEETS = [
  `Made the Top 5 Most Improved Squat list this offseason — +75 lbs. Grateful for the coaches and training partners who push me every rep. How much further can I go? Showing up every day to find out.

https://alex-recruiting.vercel.app/recruit

#2029Recruit #OL #FootballRecruiting #PutInTheWork #WisconsinFootball`,

  `340 lb front squat as a freshman. +30 on DB bench this offseason. The numbers are climbing — but the technique and the details are what I'm really chasing. Better every day. Where does it go from here?

#2029Recruit #OL #FootballRecruiting #OffSeason #WisconsinFootball`,

  `Weight room is one piece of the puzzle. Film, mental game, footwork, leadership — building the complete package every day. Want to see the full picture?

https://alex-recruiting.vercel.app/recruit

#2029Recruit #OL #CFBRecruiting #FootballRecruiting #Pewaukee`,
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  console.log("=== Delete & Repost Tweets (OG Image Fix) ===\n");

  if (!CONSUMER_KEY || !CONSUMER_SECRET) {
    console.error("Missing X API consumer credentials. Check .env / .env.local");
    process.exit(1);
  }

  // Get valid tokens from Supabase
  console.log("Fetching stored OAuth tokens from Supabase...");
  const { accessToken, accessTokenSecret } = await getStoredTokens();
  console.log(`✓ Got stored tokens (token starts with ${accessToken.slice(0, 12)}...)\n`);

  // Step 1: Delete old tweets
  console.log("--- Step 1: Delete old tweets ---\n");
  for (const id of OLD_TWEET_IDS) {
    if (dryRun) {
      console.log(`  [DRY RUN] Would delete tweet ${id}`);
      continue;
    }
    console.log(`  Deleting tweet ${id}...`);
    const deleted = await deleteTweet(id, accessToken, accessTokenSecret);
    if (deleted) {
      console.log(`  ✓ Deleted tweet ${id}`);
    } else {
      console.log(`  ✗ Failed to delete tweet ${id} (may already be deleted)`);
    }
    // Small delay between API calls
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log("\n--- Step 2: Repost tweets ---\n");

  // Wait a bit between delete and repost
  if (!dryRun) {
    console.log("  Waiting 3 seconds before reposting...\n");
    await new Promise((r) => setTimeout(r, 3000));
  }

  for (let i = 0; i < REPOST_TWEETS.length; i++) {
    const text = REPOST_TWEETS[i];
    if (dryRun) {
      console.log(`  [DRY RUN] Would post tweet #${i + 1} (${text.length} chars):`);
      console.log(`  ${text.slice(0, 80)}...`);
      console.log();
      continue;
    }

    console.log(`  Posting tweet #${i + 1} (${text.length} chars)...`);
    const result = await postTweet(text, accessToken, accessTokenSecret);
    if (result) {
      console.log(`  ✓ Posted! ID: ${result.id}`);
      console.log(`    URL: https://x.com/i/status/${result.id}\n`);
    } else {
      console.error(`  ✗ Failed to post tweet #${i + 1}\n`);
    }
    // Delay between posts
    if (i < REPOST_TWEETS.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log("\nDone!");
}

main().catch(console.error);

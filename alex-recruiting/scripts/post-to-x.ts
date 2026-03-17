#!/usr/bin/env npx tsx
/**
 * Standalone X/Twitter posting script — OAuth 1.0a
 * Usage: npx tsx scripts/post-to-x.ts
 */
import crypto from "crypto";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load .env and .env.local
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
    // file doesn't exist, skip
  }
}

// Load .env first, then .env.local (overrides)
loadEnvFile(path.join(projectRoot, ".env"));
loadEnvFile(path.join(projectRoot, ".env.local"));

const CONSUMER_KEY = process.env.X_API_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.X_API_CONSUMER_SECRET!;
const ACCESS_TOKEN = process.env.X_API_ACCESS_TOKEN!;
const ACCESS_TOKEN_SECRET = process.env.X_API_ACCESS_TOKEN_SECRET!;

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

function getOAuth1Header(method: string, url: string, bodyParams: Record<string, string> = {}): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: CONSUMER_KEY,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: ACCESS_TOKEN,
    oauth_version: "1.0",
  };

  const allParams = { ...oauthParams, ...bodyParams };
  const signature = generateOAuthSignature(method, url, allParams, CONSUMER_SECRET, ACCESS_TOKEN_SECRET);
  oauthParams.oauth_signature = signature;

  const headerParts = Object.keys(oauthParams)
    .sort()
    .map((k) => `${rfc3986Encode(k)}="${rfc3986Encode(oauthParams[k])}"`)
    .join(", ");

  return `OAuth ${headerParts}`;
}

async function postTweet(text: string, mediaIds?: string[]): Promise<{ id: string; text: string } | null> {
  const url = "https://api.x.com/2/tweets";
  const body: Record<string, unknown> = { text };
  if (mediaIds && mediaIds.length > 0) {
    body.media = { media_ids: mediaIds };
  }
  const jsonBody = JSON.stringify(body);
  const authHeader = getOAuth1Header("POST", url);

  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(jsonBody),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            const parsed = JSON.parse(data);
            resolve(parsed.data || null);
          } else {
            console.error(`HTTP ${res.statusCode}: ${data}`);
            resolve(null);
          }
        });
      }
    );
    req.on("error", reject);
    req.write(jsonBody);
    req.end();
  });
}

// Upload image media via Twitter v1.1 chunked upload
async function uploadImage(filePath: string): Promise<string | null> {
  const fileBuffer = fs.readFileSync(filePath);
  const mimeType = filePath.endsWith(".png") ? "image/png" : "image/jpeg";
  const totalBytes = fileBuffer.length;

  // INIT
  const initUrl = "https://upload.twitter.com/1.1/media/upload.json";
  const initParams: Record<string, string> = {
    command: "INIT",
    total_bytes: totalBytes.toString(),
    media_type: mimeType,
    media_category: "tweet_image",
  };

  const initAuth = getOAuth1Header("POST", initUrl, initParams);
  const initBody = Object.entries(initParams)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

  const initResult = await new Promise<{ media_id_string: string } | null>((resolve, reject) => {
    const req = https.request(initUrl, {
      method: "POST",
      headers: {
        Authorization: initAuth,
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(initBody),
      },
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          console.error(`INIT failed: HTTP ${res.statusCode}: ${data}`);
          resolve(null);
        }
      });
    });
    req.on("error", reject);
    req.write(initBody);
    req.end();
  });

  if (!initResult) return null;
  const mediaId = initResult.media_id_string;
  console.log(`  Media INIT OK: ${mediaId}`);

  // APPEND — use multipart for binary data
  const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
  let segmentIndex = 0;
  for (let offset = 0; offset < totalBytes; offset += CHUNK_SIZE) {
    const chunk = fileBuffer.subarray(offset, Math.min(offset + CHUNK_SIZE, totalBytes));
    const boundary = `----FormBoundary${crypto.randomBytes(8).toString("hex")}`;

    // Build multipart body
    const parts: Buffer[] = [];
    // command field
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="command"\r\n\r\nAPPEND\r\n`));
    // media_id field
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="media_id"\r\n\r\n${mediaId}\r\n`));
    // segment_index field
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="segment_index"\r\n\r\n${segmentIndex}\r\n`));
    // media_data field (binary)
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="media_data"\r\n\r\n`));
    parts.push(Buffer.from(chunk.toString("base64")));
    parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));

    const multipartBody = Buffer.concat(parts);

    // For APPEND, use OAuth params without body params (multipart)
    const appendAuth = getOAuth1Header("POST", initUrl);

    await new Promise<void>((resolve, reject) => {
      const req = https.request(initUrl, {
        method: "POST",
        headers: {
          Authorization: appendAuth,
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
          "Content-Length": multipartBody.length,
        },
      }, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            console.error(`APPEND failed: HTTP ${res.statusCode}: ${data}`);
            reject(new Error(`APPEND failed: ${res.statusCode}`));
          }
        });
      });
      req.on("error", reject);
      req.write(multipartBody);
      req.end();
    });
    console.log(`  Segment ${segmentIndex} uploaded`);
    segmentIndex++;
  }

  // FINALIZE
  const finalizeParams: Record<string, string> = {
    command: "FINALIZE",
    media_id: mediaId,
  };
  const finalizeAuth = getOAuth1Header("POST", initUrl, finalizeParams);
  const finalizeBody = Object.entries(finalizeParams)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

  const finalResult = await new Promise<boolean>((resolve, reject) => {
    const req = https.request(initUrl, {
      method: "POST",
      headers: {
        Authorization: finalizeAuth,
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(finalizeBody),
      },
    }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`  Media FINALIZE OK`);
          resolve(true);
        } else {
          console.error(`FINALIZE failed: HTTP ${res.statusCode}: ${data}`);
          resolve(false);
        }
      });
    });
    req.on("error", reject);
    req.write(finalizeBody);
    req.end();
  });

  return finalResult ? mediaId : null;
}

// ─── POSTS TO PUBLISH ───────────────────────────────────────────────────────

const posts = [
  {
    id: 1,
    text: `Made the Top 5 Most Improved Squat list this offseason — +75 lbs. Grateful for the coaches and training partners who push me every rep. How much further can I go? Showing up every day to find out.

https://alex-recruiting.vercel.app/recruit

#2029Recruit #OL #FootballRecruiting #PutInTheWork #WisconsinFootball`,
    scheduled: "now",
  },
  {
    id: 2,
    text: `340 lb front squat as a freshman. +30 on DB bench this offseason. The numbers are climbing — but the technique and the details are what I'm really chasing. Better every day. Where does it go from here?

#2029Recruit #OL #FootballRecruiting #OffSeason #WisconsinFootball`,
    scheduled: "tomorrow_am",
  },
  {
    id: 3,
    text: `Weight room is one piece of the puzzle. Film, mental game, footwork, leadership — building the complete package every day. Want to see the full picture?

https://alex-recruiting.vercel.app/recruit

#2029Recruit #OL #CFBRecruiting #FootballRecruiting #Pewaukee`,
    scheduled: "tomorrow_pm",
  },
];

async function main() {
  console.log("=== X Posting Script ===\n");

  // Verify credentials
  if (!CONSUMER_KEY || !CONSUMER_SECRET || !ACCESS_TOKEN || !ACCESS_TOKEN_SECRET) {
    console.error("Missing X API credentials. Check .env / .env.local");
    process.exit(1);
  }
  console.log("✓ OAuth 1.0a credentials loaded\n");

  // Only post the first tweet (marked "now"); rest are for scheduling
  const postNow = posts.filter((p) => p.scheduled === "now");

  for (const post of postNow) {
    console.log(`Posting tweet #${post.id}...`);
    console.log(`Text (${post.text.length} chars):`);
    console.log(post.text);
    console.log("");

    const result = await postTweet(post.text);
    if (result) {
      console.log(`✓ Posted! Tweet ID: ${result.id}`);
      console.log(`  URL: https://x.com/i/status/${result.id}\n`);
    } else {
      console.error(`✗ Failed to post tweet #${post.id}\n`);
    }
  }

  // Log scheduled posts for later
  const scheduled = posts.filter((p) => p.scheduled !== "now");
  if (scheduled.length > 0) {
    console.log("─── Scheduled for later: ───");
    for (const post of scheduled) {
      console.log(`  Tweet #${post.id} (${post.scheduled}): ${post.text.slice(0, 60)}...`);
    }
  }
}

main().catch(console.error);

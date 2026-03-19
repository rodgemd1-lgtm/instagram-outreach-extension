import axios from "axios";
import crypto from "crypto";
import fs from "fs/promises";
import { enforceRateLimit, recordRequest, RateLimitError } from "./rate-limiter";
import { jacobProfile } from "@/lib/data/jacob-profile";
import {
  getStoredXLegacyProfileAccount,
  getUsableXOAuthAccount,
} from "@/lib/integrations/x-oauth";

const X_API_BASE = "https://api.x.com/2";
const X_TWEETS_API_URL = `${X_API_BASE}/tweets`;
const X_V2_MEDIA_UPLOAD_URL = `${X_API_BASE}/media/upload`;
const X_V2_MEDIA_INITIALIZE_URL = `${X_API_BASE}/media/upload/initialize`;
const X_V2_MEDIA_METADATA_URL = `${X_API_BASE}/media/metadata/create`;
const X_UPLOAD_API_URL = "https://upload.twitter.com/1.1/media/upload.json";
const X_MEDIA_METADATA_URL = "https://upload.twitter.com/1.1/media/metadata/create.json";
const CHUNK_SIZE_BYTES = 1024 * 1024;

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.X_API_BEARER_TOKEN}`,
    "Content-Type": "application/json",
  };
}

function getErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;

  const response = (error as { response?: { status?: unknown } }).response;
  return typeof response?.status === "number" ? response.status : undefined;
}

function isRateLimitFailure(error: unknown): boolean {
  return error instanceof RateLimitError || getErrorStatus(error) === 429;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

export function isXWriteConfigured(): boolean {
  return isLegacyXWriteConfigured();
}

export function isLegacyXWriteConfigured(): boolean {
  return Boolean(
    process.env.X_API_CONSUMER_KEY &&
      process.env.X_API_CONSUMER_SECRET &&
      process.env.X_API_ACCESS_TOKEN &&
      process.env.X_API_ACCESS_TOKEN_SECRET
  );
}

export interface XUser {
  id: string;
  name: string;
  username: string;
  description?: string;
  location?: string;
  url?: string;
  pinned_tweet_id?: string;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
  };
  verified?: boolean;
  profile_image_url?: string;
}

export interface XTweet {
  id: string;
  text: string;
  created_at: string;
  public_metrics?: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
    impression_count: number;
  };
  author_id?: string;
}

export interface XUploadedMedia {
  mediaId: string;
  mediaKey?: string | null;
  mediaType: string;
  mediaCategory: string;
  sourcePath: string;
}

let cachedSourceUserId: string | null = null;

async function getLegacySourceUserId(): Promise<string> {
  if (process.env.X_USER_ID) {
    return process.env.X_USER_ID;
  }

  if (cachedSourceUserId) {
    return cachedSourceUserId;
  }

  if (!jacobProfile.xHandle) {
    throw new Error("X_USER_ID is not configured");
  }

  const sourceUser = await verifyHandle(jacobProfile.xHandle);
  if (!sourceUser?.id) {
    throw new Error("Unable to resolve source X user ID");
  }

  cachedSourceUserId = sourceUser.id;
  return sourceUser.id;
}

function getOAuth2Headers(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

function isActionConfigurationError(error: unknown): boolean {
  return (
    error instanceof Error &&
    /(Reconnect X|No connected X account|missing scopes|refresh token|configured)/i.test(
      error.message
    )
  );
}

interface XWriteAuthContext {
  mode: "oauth2" | "oauth1";
  sourceUserId: string;
  accessToken?: string;
  accessTokenSecret?: string;
}

async function getWriteAuthContext(
  requiredScopes: string[]
): Promise<XWriteAuthContext> {
  const storedAccount = await getUsableXOAuthAccount();

  if (storedAccount) {
    const missingScopes = requiredScopes.filter(
      (scope) => !storedAccount.scopes.includes(scope)
    );

    if (missingScopes.length === 0) {
      return {
        mode: "oauth2",
        sourceUserId: storedAccount.provider_user_id,
        accessToken: storedAccount.access_token,
      };
    }

    const storedLegacyAccount = await getStoredXLegacyProfileAccount();
    if (storedLegacyAccount) {
      return {
        mode: "oauth1",
        sourceUserId: storedLegacyAccount.provider_user_id,
        accessToken: storedLegacyAccount.access_token,
        accessTokenSecret: storedLegacyAccount.access_token_secret,
      };
    }

    if (isLegacyXWriteConfigured()) {
      return {
        mode: "oauth1",
        sourceUserId: await getLegacySourceUserId(),
        accessToken: process.env.X_API_ACCESS_TOKEN,
        accessTokenSecret: process.env.X_API_ACCESS_TOKEN_SECRET,
      };
    }

    throw new Error(
      `Reconnect X to grant the missing scopes: ${missingScopes.join(", ")}`
    );
  }

  const storedLegacyAccount = await getStoredXLegacyProfileAccount();
  if (storedLegacyAccount) {
    return {
      mode: "oauth1",
      sourceUserId: storedLegacyAccount.provider_user_id,
      accessToken: storedLegacyAccount.access_token,
      accessTokenSecret: storedLegacyAccount.access_token_secret,
    };
  }

  if (isLegacyXWriteConfigured()) {
    return {
      mode: "oauth1",
      sourceUserId: await getLegacySourceUserId(),
      accessToken: process.env.X_API_ACCESS_TOKEN,
      accessTokenSecret: process.env.X_API_ACCESS_TOKEN_SECRET,
    };
  }

  throw new Error(
    "No connected X account or legacy X profile credentials are configured"
  );
}

async function getLegacyProfileAuthContext(): Promise<{
  accessToken: string;
  accessTokenSecret: string;
}> {
  const storedLegacyAccount = await getStoredXLegacyProfileAccount();
  if (storedLegacyAccount) {
    return {
      accessToken: storedLegacyAccount.access_token,
      accessTokenSecret: storedLegacyAccount.access_token_secret,
    };
  }

  if (isLegacyXWriteConfigured()) {
    return {
      accessToken: requireEnv("X_API_ACCESS_TOKEN"),
      accessTokenSecret: requireEnv("X_API_ACCESS_TOKEN_SECRET"),
    };
  }

  throw new Error(
    "No connected X profile-tools account or legacy X profile credentials are configured"
  );
}

// Verify a coach's X handle exists and is active
export async function verifyHandle(username: string): Promise<XUser | null> {
  const endpoint = `${X_API_BASE}/users/by/username/${username.replace("@", "")}`;
  enforceRateLimit(endpoint);
  try {
    const response = await axios.get(endpoint, {
      headers: getHeaders(),
      params: {
        "user.fields": "description,location,pinned_tweet_id,profile_image_url,public_metrics,url,verified",
      },
    });
    recordRequest(endpoint);
    return response.data.data || null;
  } catch (error) {
    if (isRateLimitFailure(error)) {
      throw error;
    }
    return null;
  }
}

// Get a user's followers (to track coach follow-backs)
export async function getFollowers(userId: string, maxResults: number = 100): Promise<XUser[]> {
  const endpoint = `${X_API_BASE}/users/${userId}/followers`;
  enforceRateLimit(endpoint);
  try {
    const response = await axios.get(endpoint, {
      headers: getHeaders(),
      params: {
        max_results: Math.min(maxResults, 1000),
        "user.fields": "description,public_metrics,verified",
      },
    });
    recordRequest(endpoint);
    return response.data.data || [];
  } catch {
    return [];
  }
}

// Get a user's following list (to see which coaches a recruit follows)
export async function getFollowing(userId: string, maxResults: number = 100): Promise<XUser[]> {
  const endpoint = `${X_API_BASE}/users/${userId}/following`;
  enforceRateLimit(endpoint);
  try {
    const response = await axios.get(endpoint, {
      headers: getHeaders(),
      params: {
        max_results: Math.min(maxResults, 1000),
        "user.fields": "description,public_metrics,verified",
      },
    });
    recordRequest(endpoint);
    return response.data.data || [];
  } catch {
    return [];
  }
}

// Search recent tweets by hashtag or keyword
export async function searchTweets(query: string, maxResults: number = 25): Promise<XTweet[]> {
  const endpoint = "search/recent";
  enforceRateLimit(endpoint);
  try {
    const response = await axios.get(`${X_API_BASE}/tweets/search/recent`, {
      headers: getHeaders(),
      params: {
        query,
        max_results: Math.min(maxResults, 100),
        "tweet.fields": "created_at,public_metrics,author_id",
      },
    });
    recordRequest(endpoint);
    return response.data.data || [];
  } catch (error) {
    if (isRateLimitFailure(error)) {
      throw error;
    }
    return [];
  }
}

export async function postTweet(text: string, mediaId?: string): Promise<{ id: string; text: string } | null> {
  const endpoint = "tweets";
  enforceRateLimit(endpoint);
  try {
    const auth = await getWriteAuthContext(["users.read", "tweet.write"]);
    const body: Record<string, unknown> = { text };
    if (mediaId) {
      body.media = { media_ids: [mediaId] };
    }

    const headers =
      auth.mode === "oauth2"
        ? getOAuth2Headers(auth.accessToken!)
        : {
            Authorization: getOAuth1Headers("POST", X_TWEETS_API_URL, {}, {
              accessToken: auth.accessToken,
              accessTokenSecret: auth.accessTokenSecret,
            }),
            "Content-Type": "application/json",
          };

    const response = await axios.post(X_TWEETS_API_URL, body, {
      headers,
    });
    recordRequest(endpoint);
    return response.data.data || null;
  } catch (error) {
    if (isActionConfigurationError(error)) {
      throw error;
    }
    console.error("Failed to post tweet:", error);
    return null;
  }
}

function buildFormBody(params: Record<string, string>): string {
  return Object.keys(params)
    .map((key) => `${rfc3986Encode(key)}=${rfc3986Encode(params[key])}`)
    .join("&");
}

function guessMimeType(filePath: string): string {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".mov")) return "video/quicktime";
  if (lower.endsWith(".m4v")) return "video/mp4";
  return "application/octet-stream";
}

function getMediaCategory(mimeType: string): string {
  if (mimeType === "image/gif") return "tweet_gif";
  if (mimeType.startsWith("video/")) return "tweet_video";
  return "tweet_image";
}

function shouldUseChunkedUpload(mimeType: string): boolean {
  return mimeType.startsWith("video/") || mimeType === "image/gif";
}

function extractProcessingState(responseData: unknown): {
  state: string;
  checkAfterSecs?: number;
} | null {
  if (!responseData || typeof responseData !== "object") return null;
  const processing = (responseData as { processing_info?: unknown }).processing_info;
  if (!processing || typeof processing !== "object") return null;

  const state = (processing as { state?: unknown }).state;
  const checkAfterSecs = (processing as { check_after_secs?: unknown }).check_after_secs;

  if (typeof state !== "string") return null;

  return {
    state,
    checkAfterSecs: typeof checkAfterSecs === "number" ? checkAfterSecs : undefined,
  };
}

function extractV2ProcessingState(responseData: unknown): {
  state: string;
  checkAfterSecs?: number;
} | null {
  if (!responseData || typeof responseData !== "object") return null;
  const data = (responseData as { data?: unknown }).data;
  if (!data || typeof data !== "object") return null;
  const processing = (data as { processing_info?: unknown }).processing_info;
  if (!processing || typeof processing !== "object") return null;

  const state = (processing as { state?: unknown }).state;
  const checkAfterSecs = (processing as { check_after_secs?: unknown }).check_after_secs;

  if (typeof state !== "string") return null;

  return {
    state,
    checkAfterSecs: typeof checkAfterSecs === "number" ? checkAfterSecs : undefined,
  };
}

function extractV2MediaData(responseData: unknown): {
  mediaId: string | null;
  mediaKey: string | null;
} {
  if (!responseData || typeof responseData !== "object") {
    return { mediaId: null, mediaKey: null };
  }

  const data = (responseData as { data?: unknown }).data;
  if (!data || typeof data !== "object") {
    return { mediaId: null, mediaKey: null };
  }

  return {
    mediaId:
      typeof (data as { id?: unknown }).id === "string"
        ? (data as { id: string }).id
        : null,
    mediaKey:
      typeof (data as { media_key?: unknown }).media_key === "string"
        ? (data as { media_key: string }).media_key
        : null,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createLegacyMediaMetadata(mediaId: string, altText: string): Promise<void> {
  const legacyAuth = await getLegacyProfileAuthContext();
  const payload = {
    media_id: mediaId,
    alt_text: { text: altText.slice(0, 1000) },
  };
  const authHeader = getOAuth1Headers("POST", X_MEDIA_METADATA_URL, {}, legacyAuth);

  try {
    await axios.post(X_MEDIA_METADATA_URL, payload, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Failed to attach media metadata:", error);
  }
}

async function createV2MediaMetadata(
  accessToken: string,
  mediaId: string,
  altText: string
): Promise<void> {
  try {
    await axios.post(
      X_V2_MEDIA_METADATA_URL,
      {
        media_id: mediaId,
        alt_text: { text: altText.slice(0, 1000) },
      },
      {
        headers: getOAuth2Headers(accessToken),
      }
    );
  } catch (error) {
    console.error("Failed to attach X v2 media metadata:", error);
  }
}

async function finalizeAndAwaitLegacyMedia(mediaId: string): Promise<void> {
  const legacyAuth = await getLegacyProfileAuthContext();
  const finalizeParams = {
    command: "FINALIZE",
    media_id: mediaId,
  };
  const finalizeAuth = getOAuth1Headers("POST", X_UPLOAD_API_URL, finalizeParams, legacyAuth);
  const finalizeResponse = await axios.post(
    X_UPLOAD_API_URL,
    buildFormBody(finalizeParams),
    {
      headers: {
        Authorization: finalizeAuth,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    }
  );

  recordRequest("media/upload:finalize");
  let processing = extractProcessingState(finalizeResponse.data);
  let attempts = 0;

  while (processing && (processing.state === "pending" || processing.state === "in_progress")) {
    attempts += 1;
    if (attempts > 12) {
      throw new Error(`Timed out waiting for X media processing on ${mediaId}`);
    }

    await sleep((processing.checkAfterSecs ?? 2) * 1000);

    const statusParams = {
      command: "STATUS",
      media_id: mediaId,
    };
    const statusAuth = getOAuth1Headers("GET", X_UPLOAD_API_URL, statusParams, legacyAuth);
    const statusResponse = await axios.get(X_UPLOAD_API_URL, {
      params: statusParams,
      headers: {
        Authorization: statusAuth,
      },
    });

    recordRequest("media/upload:status");
    processing = extractProcessingState(statusResponse.data);
    if (processing?.state === "failed") {
      throw new Error(`X media processing failed for ${mediaId}`);
    }
  }
}

async function finalizeAndAwaitV2Media(
  accessToken: string,
  mediaId: string
): Promise<void> {
  const finalizeResponse = await axios.post(
    `${X_V2_MEDIA_UPLOAD_URL}/${mediaId}/finalize`,
    {},
    {
      headers: getOAuth2Headers(accessToken),
    }
  );

  recordRequest("media/upload:finalize");
  let processing = extractV2ProcessingState(finalizeResponse.data);
  let attempts = 0;

  while (processing && (processing.state === "pending" || processing.state === "in_progress")) {
    attempts += 1;
    if (attempts > 12) {
      throw new Error(`Timed out waiting for X media processing on ${mediaId}`);
    }

    await sleep((processing.checkAfterSecs ?? 2) * 1000);

    const statusResponse = await axios.get(`${X_V2_MEDIA_UPLOAD_URL}/${mediaId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    recordRequest("media/upload:status");
    processing = extractV2ProcessingState(statusResponse.data);
    if (processing?.state === "failed") {
      throw new Error(`X media processing failed for ${mediaId}`);
    }
  }
}

async function uploadLegacyImageMedia(
  filePath: string,
  mimeType: string,
  altText?: string
): Promise<XUploadedMedia> {
  const legacyAuth = await getLegacyProfileAuthContext();
  const mediaData = (await fs.readFile(filePath)).toString("base64");
  const mediaCategory = getMediaCategory(mimeType);
  const params = {
    media_category: mediaCategory,
    media_data: mediaData,
  };
  const authHeader = getOAuth1Headers("POST", X_UPLOAD_API_URL, params, legacyAuth);
  const response = await axios.post(X_UPLOAD_API_URL, buildFormBody(params), {
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

  recordRequest("media/upload:image");
  const mediaId = response.data?.media_id_string;
  if (!mediaId) {
    throw new Error("X image upload did not return a media_id_string");
  }

  if (altText) {
    await createLegacyMediaMetadata(mediaId, altText);
  }

  return {
    mediaId,
    mediaKey: response.data?.media_key ?? null,
    mediaType: mimeType,
    mediaCategory,
    sourcePath: filePath,
  };
}

async function uploadLegacyChunkedMedia(
  filePath: string,
  mimeType: string
): Promise<XUploadedMedia> {
  const legacyAuth = await getLegacyProfileAuthContext();
  const mediaBuffer = await fs.readFile(filePath);
  const mediaCategory = getMediaCategory(mimeType);
  const initParams = {
    command: "INIT",
    total_bytes: String(mediaBuffer.byteLength),
    media_type: mimeType,
    media_category: mediaCategory,
  };
  const initAuth = getOAuth1Headers("POST", X_UPLOAD_API_URL, initParams, legacyAuth);
  const initResponse = await axios.post(X_UPLOAD_API_URL, buildFormBody(initParams), {
    headers: {
      Authorization: initAuth,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

  recordRequest("media/upload:init");
  const mediaId = initResponse.data?.media_id_string;
  if (!mediaId) {
    throw new Error("X chunked upload INIT did not return a media_id_string");
  }

  for (let offset = 0, segment = 0; offset < mediaBuffer.length; offset += CHUNK_SIZE_BYTES, segment += 1) {
    const chunk = mediaBuffer.subarray(offset, offset + CHUNK_SIZE_BYTES);
    const appendAuth = getOAuth1Headers("POST", X_UPLOAD_API_URL, {}, legacyAuth);
    const form = new FormData();
    form.append("command", "APPEND");
    form.append("media_id", mediaId);
    form.append("segment_index", String(segment));
    form.append("media", new Blob([chunk], { type: mimeType }), `segment-${segment}`);

    const appendResponse = await fetch(X_UPLOAD_API_URL, {
      method: "POST",
      headers: {
        Authorization: appendAuth,
      },
      body: form,
    });

    if (!appendResponse.ok) {
      throw new Error(`X chunked upload APPEND failed for segment ${segment}`);
    }

    recordRequest("media/upload:append");
  }

  await finalizeAndAwaitLegacyMedia(mediaId);

  return {
    mediaId,
    mediaKey: initResponse.data?.media_key ?? null,
    mediaType: mimeType,
    mediaCategory,
    sourcePath: filePath,
  };
}

async function uploadV2ChunkedMedia(
  filePath: string,
  mimeType: string,
  accessToken: string,
  altText?: string
): Promise<XUploadedMedia> {
  const mediaBuffer = await fs.readFile(filePath);
  const mediaCategory = getMediaCategory(mimeType);
  const initResponse = await axios.post(
    X_V2_MEDIA_INITIALIZE_URL,
    {
      total_bytes: mediaBuffer.byteLength,
      media_type: mimeType,
      media_category: mediaCategory,
      shared: false,
    },
    {
      headers: getOAuth2Headers(accessToken),
    }
  );

  recordRequest("media/upload:init");
  const { mediaId, mediaKey } = extractV2MediaData(initResponse.data);
  if (!mediaId) {
    throw new Error("X v2 media initialize did not return a media id");
  }

  for (let offset = 0, segment = 0; offset < mediaBuffer.length; offset += CHUNK_SIZE_BYTES, segment += 1) {
    const chunk = mediaBuffer.subarray(offset, offset + CHUNK_SIZE_BYTES);
    const form = new FormData();
    form.append("segment_index", String(segment));
    form.append("media", new Blob([chunk], { type: mimeType }), `segment-${segment}`);

    const appendResponse = await fetch(`${X_V2_MEDIA_UPLOAD_URL}/${mediaId}/append`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    });

    if (!appendResponse.ok) {
      throw new Error(`X v2 media append failed for segment ${segment}`);
    }

    recordRequest("media/upload:append");
  }

  await finalizeAndAwaitV2Media(accessToken, mediaId);

  if (altText) {
    await createV2MediaMetadata(accessToken, mediaId, altText);
  }

  return {
    mediaId,
    mediaKey,
    mediaType: mimeType,
    mediaCategory,
    sourcePath: filePath,
  };
}

export async function uploadMediaFromFile(
  filePath: string,
  options?: { altText?: string; mimeType?: string }
): Promise<XUploadedMedia | null> {
  enforceRateLimit("media/upload");

  try {
    const mimeType = options?.mimeType ?? guessMimeType(filePath);
    const auth = await getWriteAuthContext(["users.read", "tweet.write", "media.write"]);

    if (auth.mode === "oauth2") {
      return await uploadV2ChunkedMedia(
        filePath,
        mimeType,
        auth.accessToken!,
        options?.altText
      );
    }

    if (shouldUseChunkedUpload(mimeType)) {
      return await uploadLegacyChunkedMedia(filePath, mimeType);
    }

    return await uploadLegacyImageMedia(filePath, mimeType, options?.altText);
  } catch (error) {
    if (isActionConfigurationError(error)) {
      throw error;
    }
    console.error("Failed to upload media to X:", error);
    return null;
  }
}

export async function followUser(targetUserId: string): Promise<boolean> {
  const endpoint = "users/:id/following";
  enforceRateLimit(endpoint);

  try {
    const auth = await getWriteAuthContext(["users.read", "follows.write"]);
    const sourceUserId = auth.sourceUserId;
    const apiUrl = `${X_API_BASE}/users/${sourceUserId}/following`;
    const headers =
      auth.mode === "oauth2"
        ? getOAuth2Headers(auth.accessToken!)
        : {
            Authorization: getOAuth1Headers("POST", apiUrl, {}, {
              accessToken: auth.accessToken,
              accessTokenSecret: auth.accessTokenSecret,
            }),
            "Content-Type": "application/json",
          };
    const response = await axios.post(
      apiUrl,
      { target_user_id: targetUserId },
      {
        headers,
      }
    );

    recordRequest(endpoint);
    return response.data?.data?.following ?? response.status < 300;
  } catch (error) {
    if (isRateLimitFailure(error)) {
      throw error;
    }
    if (isActionConfigurationError(error)) {
      throw error;
    }

    const status = getErrorStatus(error);
    if (status !== 401 && status !== 403) {
      console.error("Failed to follow user:", error);
      return false;
    }

    try {
      const fallbackUrl = "https://api.x.com/1.1/friendships/create.json";
      const params = {
        user_id: targetUserId,
        follow: "true",
      };
      const legacyAuth = await getLegacyProfileAuthContext();
      const authHeader = getOAuth1Headers("POST", fallbackUrl, params, legacyAuth);
      const response = await axios.post(fallbackUrl, buildFormBody(params), {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      recordRequest("friendships/create");
      return Boolean(response.data?.id_str || response.data?.following);
    } catch (fallbackError) {
      console.error("Failed to follow user:", {
        error,
        fallbackError,
      });
      return false;
    }
  }
}

export async function likeTweet(tweetId: string): Promise<boolean> {
  const endpoint = "users/:id/likes";
  enforceRateLimit(endpoint);

  try {
    const auth = await getWriteAuthContext(["users.read", "like.write"]);
    const sourceUserId = auth.sourceUserId;
    const apiUrl = `${X_API_BASE}/users/${sourceUserId}/likes`;
    const headers =
      auth.mode === "oauth2"
        ? getOAuth2Headers(auth.accessToken!)
        : {
            Authorization: getOAuth1Headers("POST", apiUrl, {}, {
              accessToken: auth.accessToken,
              accessTokenSecret: auth.accessTokenSecret,
            }),
            "Content-Type": "application/json",
          };
    const response = await axios.post(
      apiUrl,
      { tweet_id: tweetId },
      {
        headers,
      }
    );

    recordRequest(endpoint);
    return response.data?.data?.liked ?? response.status < 300;
  } catch (error) {
    if (isRateLimitFailure(error)) {
      throw error;
    }
    if (isActionConfigurationError(error)) {
      throw error;
    }

    const status = getErrorStatus(error);
    if (status !== 401 && status !== 403) {
      console.error("Failed to like tweet:", error);
      return false;
    }

    try {
      const fallbackUrl = "https://api.x.com/1.1/favorites/create.json";
      const params = { id: tweetId };
      const legacyAuth = await getLegacyProfileAuthContext();
      const authHeader = getOAuth1Headers("POST", fallbackUrl, params, legacyAuth);
      const response = await axios.post(fallbackUrl, buildFormBody(params), {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      recordRequest("favorites/create");
      return Boolean(response.data?.id_str || response.data?.favorited);
    } catch (fallbackError) {
      console.error("Failed to like tweet:", {
        error,
        fallbackError,
      });
      return false;
    }
  }
}

export async function sendDM(
  recipientId: string,
  text: string
): Promise<{ id: string } | null> {
  const endpoint = "dm_conversations";
  enforceRateLimit(endpoint);

  try {
    const auth = await getWriteAuthContext(["dm.write"]);
    const apiUrl = `${X_API_BASE}/dm_conversations/with/${recipientId}/messages`;
    const body = { text };

    const response = await axios.post(apiUrl, body, {
      headers:
        auth.mode === "oauth2"
          ? getOAuth2Headers(auth.accessToken!)
          : {
              Authorization: getOAuth1Headers("POST", apiUrl, {}, {
                accessToken: auth.accessToken,
                accessTokenSecret: auth.accessTokenSecret,
              }),
              "Content-Type": "application/json",
            },
    });
    recordRequest(endpoint);
    return response.data.data || null;
  } catch (error) {
    if (isActionConfigurationError(error)) {
      throw error;
    }
    console.error("Failed to send DM:", error);
    return null;
  }
}

// Get user's tweet analytics (requires user auth)
export async function getUserTweets(
  userId: string,
  maxResults: number = 20
): Promise<XTweet[]> {
  const endpoint = "users/:id/tweets";
  enforceRateLimit(endpoint);
  try {
    const response = await axios.get(`${X_API_BASE}/users/${userId}/tweets`, {
      headers: getHeaders(),
      params: {
        max_results: Math.min(maxResults, 100),
        "tweet.fields": "created_at,public_metrics",
      },
    });
    recordRequest(endpoint);
    return response.data.data || [];
  } catch {
    return [];
  }
}

// Check if a specific user follows another (coach follow-back detection)
export async function checkFollowRelationship(
  sourceUserId: string,
  targetUserId: string
): Promise<{ following: boolean; followed_by: boolean }> {
  let following = false;
  let followed_by = false;

  // Check if source follows target
  const followingEndpoint = `${X_API_BASE}/users/${sourceUserId}/following`;
  enforceRateLimit(followingEndpoint);
  try {
    const response = await axios.get(followingEndpoint, {
      headers: getHeaders(),
      params: { "user.fields": "id" },
    });
    recordRequest(followingEndpoint);
    following = (response.data.data || []).some(
      (u: XUser) => u.id === targetUserId
    );
  } catch {
    // Default to false on error
  }

  // Check if target follows source (reverse check for follow-back detection)
  const followersEndpoint = `${X_API_BASE}/users/${sourceUserId}/followers`;
  enforceRateLimit(followersEndpoint);
  try {
    const response = await axios.get(followersEndpoint, {
      headers: getHeaders(),
      params: { "user.fields": "id" },
    });
    recordRequest(followersEndpoint);
    followed_by = (response.data.data || []).some(
      (u: XUser) => u.id === targetUserId
    );
  } catch {
    // Default to false on error
  }

  return { following, followed_by };
}

// ---------------------------------------------------------------------------
// OAuth 1.0a helpers for X API v1.1 endpoints
// ---------------------------------------------------------------------------

// RFC 3986 percent-encoding (required by OAuth 1.0a).
// encodeURIComponent leaves !'()* unencoded; OAuth needs them encoded.
function rfc3986Encode(str: string): string {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) =>
    `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function getOAuth1Headers(
  method: string,
  url: string,
  params: Record<string, string>,
  credentials?: {
    accessToken?: string;
    accessTokenSecret?: string;
  }
): string {
  const consumerKey = requireEnv("X_API_CONSUMER_KEY");
  const consumerSecret = requireEnv("X_API_CONSUMER_SECRET");
  const accessToken = credentials?.accessToken ?? process.env.X_API_ACCESS_TOKEN;
  const accessTokenSecret =
    credentials?.accessTokenSecret ?? process.env.X_API_ACCESS_TOKEN_SECRET;

  const oauthNonce = crypto.randomBytes(16).toString("hex");
  const oauthTimestamp = Math.floor(Date.now() / 1000).toString();

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: oauthNonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: oauthTimestamp,
    oauth_version: "1.0",
  };

  if (accessToken) {
    oauthParams.oauth_token = accessToken;
  }

  // Merge all params (oauth + request) for signature base string
  const allParams: Record<string, string> = { ...oauthParams, ...params };
  const sortedKeys = Object.keys(allParams).sort();
  const paramString = sortedKeys
    .map((k) => `${rfc3986Encode(k)}=${rfc3986Encode(allParams[k])}`)
    .join("&");

  const signatureBaseString = [
    method.toUpperCase(),
    rfc3986Encode(url),
    rfc3986Encode(paramString),
  ].join("&");

  const signingKey = `${rfc3986Encode(consumerSecret)}&${rfc3986Encode(
    accessTokenSecret ?? ""
  )}`;
  const oauthSignature = crypto
    .createHmac("sha1", signingKey)
    .update(signatureBaseString)
    .digest("base64");

  oauthParams["oauth_signature"] = oauthSignature;

  const headerString = Object.keys(oauthParams)
    .sort()
    .map((k) => `${rfc3986Encode(k)}="${rfc3986Encode(oauthParams[k])}"`)
    .join(", ");

  return `OAuth ${headerString}`;
}

// ---------------------------------------------------------------------------
// X API v1.1 — Profile update functions (OAuth 1.0a)
// ---------------------------------------------------------------------------

type XProfileFields = {
  name?: string;
  description?: string;
  location?: string;
  url?: string;
};

export interface XProfileUpdateFeedback {
  profile: Record<string, unknown>;
  skippedFields: Array<keyof XProfileFields>;
}

function buildProfileParams(fields: XProfileFields): Record<string, string> {
  const params: Record<string, string> = {};
  if (fields.name !== undefined) params.name = fields.name;
  if (fields.description !== undefined) params.description = fields.description;
  if (fields.location !== undefined) params.location = fields.location;
  if (fields.url !== undefined) params.url = fields.url;
  return params;
}

async function requestProfileUpdate(
  fields: XProfileFields
): Promise<Record<string, unknown>> {
  const legacyAuth = await getLegacyProfileAuthContext();
  const apiUrl = "https://api.twitter.com/1.1/account/update_profile.json";
  const params = buildProfileParams(fields);
  const authHeader = getOAuth1Headers("POST", apiUrl, params, legacyAuth);
  const body = Object.keys(params)
    .map((k) => `${rfc3986Encode(k)}=${rfc3986Encode(params[k])}`)
    .join("&");

  const response = await axios.post(apiUrl, body, {
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return response.data ?? {};
}

export async function updateProfileWithFeedback(
  fields: XProfileFields
): Promise<XProfileUpdateFeedback | null> {
  const endpoint = "update_profile";
  enforceRateLimit(endpoint);
  try {
    const response = await requestProfileUpdate(fields);
    recordRequest(endpoint);
    return { profile: response, skippedFields: [] };
  } catch (error) {
    if (fields.name !== undefined) {
      const retryFields = { ...fields };
      delete retryFields.name;

      if (Object.keys(buildProfileParams(retryFields)).length > 0) {
        try {
          const response = await requestProfileUpdate(retryFields);
          recordRequest(endpoint);
          return { profile: response, skippedFields: ["name"] };
        } catch (retryError) {
          console.error("Failed to update profile after skipping name:", {
            originalError: error,
            retryError,
          });
          return null;
        }
      }
    }

    console.error("Failed to update profile:", error);
    return null;
  }
}

export async function updateProfile(
  fields: XProfileFields
): Promise<Record<string, unknown> | null> {
  const result = await updateProfileWithFeedback(fields);
  return result?.profile ?? null;
}

export async function updateProfileImage(
  imageBase64: string
): Promise<Record<string, unknown> | null> {
  const endpoint = "update_profile_image";
  enforceRateLimit(endpoint);
  try {
    const legacyAuth = await getLegacyProfileAuthContext();
    const apiUrl =
      "https://api.twitter.com/1.1/account/update_profile_image.json";
    const params: Record<string, string> = { image: imageBase64 };

    const authHeader = getOAuth1Headers("POST", apiUrl, params, legacyAuth);

    const response = await axios.post(apiUrl, null, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      params,
    });

    recordRequest(endpoint);
    return response.data ?? null;
  } catch (error) {
    console.error("Failed to update profile image:", error);
    return null;
  }
}

export async function updateProfileBanner(
  imageBase64: string
): Promise<boolean> {
  const endpoint = "update_profile_banner";
  enforceRateLimit(endpoint);
  try {
    const legacyAuth = await getLegacyProfileAuthContext();
    const apiUrl =
      "https://api.twitter.com/1.1/account/update_profile_banner.json";
    const params: Record<string, string> = { banner: imageBase64 };

    const authHeader = getOAuth1Headers("POST", apiUrl, params, legacyAuth);

    const body = `banner=${encodeURIComponent(imageBase64)}`;
    const response = await axios.post(apiUrl, body, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    recordRequest(endpoint);
    // Twitter returns 200 with empty body on success, or 201/202
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.error("Failed to update profile banner:", error);
    return false;
  }
}

import axios from "axios";
import crypto from "crypto";
import fs from "fs/promises";
import { enforceRateLimit, recordRequest, RateLimitError } from "./rate-limiter";
const X_API_BASE = "https://api.twitter.com/2";
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

// Post a tweet using OAuth 1.0a (required for write operations)
export async function postTweet(text: string, mediaId?: string): Promise<{ id: string; text: string } | null> {
  const endpoint = "tweets";
  enforceRateLimit(endpoint);
  try {
    const apiUrl = "https://api.twitter.com/2/tweets";
    const body: Record<string, unknown> = { text };
    if (mediaId) {
      body.media = { media_ids: [mediaId] };
    }

    // For v2 JSON endpoints, body params are NOT included in the OAuth
    // signature base string — only the URL and OAuth params are signed.
    const authHeader = getOAuth1Headers("POST", apiUrl, {});

    const response = await axios.post(apiUrl, body, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });
    recordRequest(endpoint);
    return response.data.data || null;
  } catch (error) {
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createMediaMetadata(mediaId: string, altText: string): Promise<void> {
  const payload = {
    media_id: mediaId,
    alt_text: { text: altText.slice(0, 1000) },
  };
  const authHeader = getOAuth1Headers("POST", X_MEDIA_METADATA_URL, {});

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

async function finalizeAndAwaitMedia(mediaId: string): Promise<void> {
  const finalizeParams = {
    command: "FINALIZE",
    media_id: mediaId,
  };
  const finalizeAuth = getOAuth1Headers("POST", X_UPLOAD_API_URL, finalizeParams);
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
    const statusAuth = getOAuth1Headers("GET", X_UPLOAD_API_URL, statusParams);
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

async function uploadImageMedia(
  filePath: string,
  mimeType: string,
  altText?: string
): Promise<XUploadedMedia> {
  const mediaData = (await fs.readFile(filePath)).toString("base64");
  const mediaCategory = getMediaCategory(mimeType);
  const params = {
    media_category: mediaCategory,
    media_data: mediaData,
  };
  const authHeader = getOAuth1Headers("POST", X_UPLOAD_API_URL, params);
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
    await createMediaMetadata(mediaId, altText);
  }

  return {
    mediaId,
    mediaKey: response.data?.media_key ?? null,
    mediaType: mimeType,
    mediaCategory,
    sourcePath: filePath,
  };
}

async function uploadChunkedMedia(
  filePath: string,
  mimeType: string
): Promise<XUploadedMedia> {
  const mediaBuffer = await fs.readFile(filePath);
  const mediaCategory = getMediaCategory(mimeType);
  const initParams = {
    command: "INIT",
    total_bytes: String(mediaBuffer.byteLength),
    media_type: mimeType,
    media_category: mediaCategory,
  };
  const initAuth = getOAuth1Headers("POST", X_UPLOAD_API_URL, initParams);
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
    const appendAuth = getOAuth1Headers("POST", X_UPLOAD_API_URL, {});
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

  await finalizeAndAwaitMedia(mediaId);

  return {
    mediaId,
    mediaKey: initResponse.data?.media_key ?? null,
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
    if (shouldUseChunkedUpload(mimeType)) {
      return await uploadChunkedMedia(filePath, mimeType);
    }

    return await uploadImageMedia(filePath, mimeType, options?.altText);
  } catch (error) {
    console.error("Failed to upload media to X:", error);
    return null;
  }
}

export async function followUser(targetUserId: string): Promise<boolean> {
  const endpoint = "users/:id/following";
  enforceRateLimit(endpoint);

  try {
    const sourceUserId = requireEnv("X_USER_ID");
    const apiUrl = `${X_API_BASE}/users/${sourceUserId}/following`;
    const authHeader = getOAuth1Headers("POST", apiUrl, {});
    const response = await axios.post(
      apiUrl,
      { target_user_id: targetUserId },
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      }
    );

    recordRequest(endpoint);
    return response.data?.data?.following ?? response.status < 300;
  } catch (error) {
    if (isRateLimitFailure(error)) {
      throw error;
    }

    console.error("Failed to follow user:", error);
    return false;
  }
}

export async function likeTweet(tweetId: string): Promise<boolean> {
  const endpoint = "users/:id/likes";
  enforceRateLimit(endpoint);

  try {
    const sourceUserId = requireEnv("X_USER_ID");
    const apiUrl = `${X_API_BASE}/users/${sourceUserId}/likes`;
    const authHeader = getOAuth1Headers("POST", apiUrl, {});
    const response = await axios.post(
      apiUrl,
      { tweet_id: tweetId },
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      }
    );

    recordRequest(endpoint);
    return response.data?.data?.liked ?? response.status < 300;
  } catch (error) {
    if (isRateLimitFailure(error)) {
      throw error;
    }

    console.error("Failed to like tweet:", error);
    return false;
  }
}

// Send a DM using OAuth 1.0a (user-context auth required for DMs).
export async function sendDM(
  recipientId: string,
  text: string
): Promise<{ id: string } | null> {
  const endpoint = "dm_conversations";
  enforceRateLimit(endpoint);

  try {
    const apiUrl = `https://api.twitter.com/2/dm_conversations/with/${recipientId}/messages`;
    const body = { text };

    // OAuth 1.0a — same pattern as postTweet.
    // For v2 JSON endpoints, body params are NOT in the signature base string.
    const authHeader = getOAuth1Headers("POST", apiUrl, {});

    const response = await axios.post(apiUrl, body, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });
    recordRequest(endpoint);
    return response.data.data || null;
  } catch (error) {
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
  const endpoint = `${X_API_BASE}/users/${sourceUserId}/following`;
  enforceRateLimit(endpoint);
  try {
    const response = await axios.get(endpoint, {
      headers: getHeaders(),
      params: { "user.fields": "id" },
    });
    recordRequest(endpoint);
    const following = (response.data.data || []).some(
      (u: XUser) => u.id === targetUserId
    );
    return { following, followed_by: false }; // Need reverse check for followed_by
  } catch {
    return { following: false, followed_by: false };
  }
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
  params: Record<string, string>
): string {
  const consumerKey = requireEnv("X_API_CONSUMER_KEY");
  const consumerSecret = requireEnv("X_API_CONSUMER_SECRET");
  const accessToken = requireEnv("X_API_ACCESS_TOKEN");
  const accessTokenSecret = requireEnv("X_API_ACCESS_TOKEN_SECRET");

  const oauthNonce = crypto.randomBytes(16).toString("hex");
  const oauthTimestamp = Math.floor(Date.now() / 1000).toString();

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: oauthNonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: oauthTimestamp,
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

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

  const signingKey = `${rfc3986Encode(consumerSecret)}&${rfc3986Encode(accessTokenSecret)}`;
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
  const apiUrl = "https://api.twitter.com/1.1/account/update_profile.json";
  const params = buildProfileParams(fields);
  const authHeader = getOAuth1Headers("POST", apiUrl, params);
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
    const apiUrl =
      "https://api.twitter.com/1.1/account/update_profile_image.json";
    const params: Record<string, string> = { image: imageBase64 };

    const authHeader = getOAuth1Headers("POST", apiUrl, params);

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
    const apiUrl =
      "https://api.twitter.com/1.1/account/update_profile_banner.json";
    const params: Record<string, string> = { banner: imageBase64 };

    const authHeader = getOAuth1Headers("POST", apiUrl, params);

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

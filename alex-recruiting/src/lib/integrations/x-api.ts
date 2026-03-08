import axios from "axios";
import crypto from "crypto";
import { enforceRateLimit, recordRequest, RateLimitError } from "./rate-limiter";
const X_API_BASE = "https://api.twitter.com/2";

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

export interface XUser {
  id: string;
  name: string;
  username: string;
  description?: string;
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

// Verify a coach's X handle exists and is active
export async function verifyHandle(username: string): Promise<XUser | null> {
  const endpoint = `${X_API_BASE}/users/by/username/${username.replace("@", "")}`;
  enforceRateLimit(endpoint);
  try {
    const response = await axios.get(endpoint, {
      headers: getHeaders(),
      params: { "user.fields": "description,public_metrics,verified,profile_image_url" },
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
  const consumerKey = process.env.X_API_CONSUMER_KEY ?? "";
  const consumerSecret = process.env.X_API_CONSUMER_SECRET ?? "";
  const accessToken = process.env.X_API_ACCESS_TOKEN ?? "";
  const accessTokenSecret = process.env.X_API_ACCESS_TOKEN_SECRET ?? "";

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

export async function updateProfile(fields: {
  name?: string;
  description?: string;
  location?: string;
  url?: string;
}): Promise<Record<string, unknown> | null> {
  const endpoint = "update_profile";
  enforceRateLimit(endpoint);
  try {
    const apiUrl = "https://api.twitter.com/1.1/account/update_profile.json";
    const params: Record<string, string> = {};

    if (fields.name !== undefined) params.name = fields.name;
    if (fields.description !== undefined) params.description = fields.description;
    if (fields.location !== undefined) params.location = fields.location;
    if (fields.url !== undefined) params.url = fields.url;

    const authHeader = getOAuth1Headers("POST", apiUrl, params);

    // Build form body using RFC 3986 percent-encoding to match the
    // OAuth signature base string exactly.
    const body = Object.keys(params)
      .map((k) => `${rfc3986Encode(k)}=${rfc3986Encode(params[k])}`)
      .join("&");

    const response = await axios.post(apiUrl, body, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    recordRequest(endpoint);
    return response.data ?? null;
  } catch (error) {
    console.error("Failed to update profile:", error);
    return null;
  }
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

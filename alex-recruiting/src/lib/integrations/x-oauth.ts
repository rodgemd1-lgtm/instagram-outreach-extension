import axios from "axios";
import crypto from "crypto";

import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

const X_AUTHORIZE_URL = "https://x.com/i/oauth2/authorize";
const X_TOKEN_URL = "https://api.x.com/2/oauth2/token";
const X_ME_URL = "https://api.x.com/2/users/me";
const X_OAUTH1_REQUEST_TOKEN_URL = "https://api.x.com/oauth/request_token";
const X_OAUTH1_AUTHORIZE_URL = "https://api.x.com/oauth/authorize";
const X_OAUTH1_ACCESS_TOKEN_URL = "https://api.x.com/oauth/access_token";
const X_OAUTH1_VERIFY_CREDENTIALS_URL =
  "https://api.twitter.com/1.1/account/verify_credentials.json";
const X_OAUTH_COOKIE_TTL_SECONDS = 10 * 60;

export const X_OAUTH_STATE_COOKIE = "x_oauth_state";
export const X_OAUTH_VERIFIER_COOKIE = "x_oauth_code_verifier";
export const X_OAUTH_RETURN_TO_COOKIE = "x_oauth_return_to";
export const X_OAUTH1_REQUEST_TOKEN_COOKIE = "x_oauth1_request_token";
export const X_OAUTH1_REQUEST_SECRET_COOKIE = "x_oauth1_request_secret";
export const X_OAUTH1_RETURN_TO_COOKIE = "x_oauth1_return_to";

export const X_DEFAULT_SCOPES = [
  "users.read",
  "tweet.read",
  "tweet.write",
  "follows.write",
  "like.write",
  "media.write",
  "dm.read",
  "dm.write",
  "offline.access",
];

export interface XOAuthTokenResponse {
  token_type: string;
  access_token: string;
  expires_in?: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope?: string;
}

export interface XAuthenticatedUser {
  id: string;
  username: string;
  name: string;
  profile_image_url?: string;
}

export interface StoredXOAuthAccount {
  id: string;
  provider_user_id: string;
  username: string | null;
  display_name: string | null;
  access_token: string;
  refresh_token: string | null;
  token_type: string | null;
  scopes: string[];
  expires_at: string | null;
  refresh_token_expires_at: string | null;
  is_default: boolean;
  metadata: Record<string, unknown>;
}

export interface ResolveStoredXOAuthAccountOptions {
  accountId?: string;
  providerUserId?: string;
  username?: string;
}

export interface StoredXLegacyProfileAccount {
  id: string;
  provider_user_id: string;
  username: string | null;
  display_name: string | null;
  access_token: string;
  access_token_secret: string;
  is_default: boolean;
  metadata: Record<string, unknown>;
}

export interface XOAuth1RequestTokenResponse {
  oauth_token: string;
  oauth_token_secret: string;
  oauth_callback_confirmed?: string;
}

export interface XOAuth1AccessTokenResponse {
  oauth_token: string;
  oauth_token_secret: string;
  user_id: string;
  screen_name: string;
}

export interface XLegacyAuthenticatedUser {
  id: string;
  username: string;
  name: string;
  profile_image_url?: string;
}

export interface XOAuthConnectionStatus {
  connected: boolean;
  needsReconnect: boolean;
  authMode: "oauth2" | "legacy_oauth1" | "none";
  username: string | null;
  displayName: string | null;
  providerUserId: string | null;
  expiresAt: string | null;
  hasRefreshToken: boolean;
  missingScopes: string[];
  legacyProfileConnected: boolean;
  legacyProfileUsername: string | null;
  legacyProfileNeedsReconnect: boolean;
}

interface LegacyXOAuthJobRow {
  id: string;
  result: Omit<StoredXOAuthAccount, "id"> | null;
  created_at: string;
}

interface LegacyXOAuth1JobRow {
  id: string;
  result: Omit<StoredXLegacyProfileAccount, "id"> | null;
  created_at: string;
}

function sortRowsByCreatedAtDesc<T extends { created_at: string }>(rows: T[]): T[] {
  return [...rows].sort((left, right) => right.created_at.localeCompare(left.created_at));
}

function normalizeStoredXOAuthAccount(
  rowId: string,
  value: unknown
): StoredXOAuthAccount | null {
  if (!value) {
    return null;
  }

  let record: Record<string, unknown>;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (!parsed || typeof parsed !== "object") {
        return null;
      }
      record = parsed as Record<string, unknown>;
    } catch {
      return null;
    }
  } else if (typeof value === "object") {
    record = value as Record<string, unknown>;
  } else {
    return null;
  }

  const providerUserId =
    typeof record.provider_user_id === "string"
      ? record.provider_user_id
      : null;
  const accessToken =
    typeof record.access_token === "string" ? record.access_token : null;

  if (!providerUserId || !accessToken) {
    return null;
  }

  return {
    id: rowId,
    provider_user_id: providerUserId,
    username:
      typeof record.username === "string" ? record.username : providerUserId,
    display_name:
      typeof record.display_name === "string" ? record.display_name : null,
    access_token: accessToken,
    refresh_token:
      typeof record.refresh_token === "string" ? record.refresh_token : null,
    token_type:
      typeof record.token_type === "string" ? record.token_type : "bearer",
    scopes: Array.isArray(record.scopes)
      ? record.scopes.filter((scope): scope is string => typeof scope === "string")
      : [],
    expires_at:
      typeof record.expires_at === "string" ? record.expires_at : null,
    refresh_token_expires_at:
      typeof record.refresh_token_expires_at === "string"
        ? record.refresh_token_expires_at
        : null,
    is_default: Boolean(record.is_default),
    metadata:
      record.metadata && typeof record.metadata === "object"
        ? (record.metadata as Record<string, unknown>)
        : {},
  };
}

function normalizeStoredXLegacyProfileAccount(
  rowId: string,
  value: unknown
): StoredXLegacyProfileAccount | null {
  if (!value) {
    return null;
  }

  let record: Record<string, unknown>;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (!parsed || typeof parsed !== "object") {
        return null;
      }
      record = parsed as Record<string, unknown>;
    } catch {
      return null;
    }
  } else if (typeof value === "object") {
    record = value as Record<string, unknown>;
  } else {
    return null;
  }

  const providerUserId =
    typeof record.provider_user_id === "string"
      ? record.provider_user_id
      : null;
  const accessToken =
    typeof record.access_token === "string" ? record.access_token : null;
  const accessTokenSecret =
    typeof record.access_token_secret === "string"
      ? record.access_token_secret
      : null;

  if (!providerUserId || !accessToken || !accessTokenSecret) {
    return null;
  }

  return {
    id: rowId,
    provider_user_id: providerUserId,
    username:
      typeof record.username === "string" ? record.username : providerUserId,
    display_name:
      typeof record.display_name === "string" ? record.display_name : null,
    access_token: accessToken,
    access_token_secret: accessTokenSecret,
    is_default: Boolean(record.is_default),
    metadata:
      record.metadata && typeof record.metadata === "object"
        ? (record.metadata as Record<string, unknown>)
        : {},
  };
}

export function generateOAuthState(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function generateCodeVerifier(): string {
  return crypto.randomBytes(48).toString("base64url");
}

export function buildCodeChallenge(codeVerifier: string): string {
  return crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
}

function rfc3986Encode(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function buildOAuth1AuthorizationHeader(params: {
  method: string;
  url: string;
  requestParams?: Record<string, string>;
  oauthToken?: string;
  tokenSecret?: string;
}) {
  const consumerKey = process.env.X_API_CONSUMER_KEY;
  const consumerSecret = process.env.X_API_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error("Missing X OAuth 1.0a consumer credentials");
  }

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: "1.0",
  };

  if (params.oauthToken) {
    oauthParams.oauth_token = params.oauthToken;
  }

  const allParams = {
    ...oauthParams,
    ...(params.requestParams ?? {}),
  };

  const paramString = Object.keys(allParams)
    .sort()
    .map((key) => `${rfc3986Encode(key)}=${rfc3986Encode(allParams[key])}`)
    .join("&");

  const signatureBaseString = [
    params.method.toUpperCase(),
    rfc3986Encode(params.url),
    rfc3986Encode(paramString),
  ].join("&");

  const signingKey = `${rfc3986Encode(consumerSecret)}&${rfc3986Encode(
    params.tokenSecret ?? ""
  )}`;

  oauthParams.oauth_signature = crypto
    .createHmac("sha1", signingKey)
    .update(signatureBaseString)
    .digest("base64");

  const headerParams = {
    ...oauthParams,
    ...Object.fromEntries(
      Object.entries(params.requestParams ?? {}).filter(([key]) =>
        key.startsWith("oauth_")
      )
    ),
  };

  return `OAuth ${Object.keys(headerParams)
    .sort()
    .map((key) => `${rfc3986Encode(key)}="${rfc3986Encode(headerParams[key])}"`)
    .join(", ")}`;
}

function parseUrlEncodedResponse<T extends object>(
  value: string
): T {
  const params = new URLSearchParams(value);
  return Object.fromEntries(params.entries()) as T;
}

export function resolveXRedirectUri(request: Request): string {
  return new URL("/api/auth/callback/twitter", request.url).toString();
}

export function resolveXLegacyRedirectUri(request: Request): string {
  return new URL("/api/auth/callback/twitter/legacy", request.url).toString();
}

export function sanitizeReturnToPath(returnTo: string | null | undefined): string {
  if (!returnTo) {
    return "/";
  }

  try {
    const base = new URL("https://alex-recruiting.local");
    const sanitized = new URL(returnTo, base);

    if (sanitized.origin !== base.origin) {
      return "/";
    }

    if (!sanitized.pathname.startsWith("/") || sanitized.pathname.startsWith("//")) {
      return "/";
    }

    return `${sanitized.pathname}${sanitized.search}${sanitized.hash}`;
  } catch {
    return "/";
  }
}

export function buildXOAuth1AuthorizationUrl(requestToken: string): string {
  const url = new URL(X_OAUTH1_AUTHORIZE_URL);
  url.searchParams.set("oauth_token", requestToken);
  return url.toString();
}

export function getXOAuthCookieOptions() {
  return {
    httpOnly: true,
    maxAge: X_OAUTH_COOKIE_TTL_SECONDS,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function buildXAuthorizationUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
  codeVerifier: string;
  scopes?: string[];
}) {
  const url = new URL(X_AUTHORIZE_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", params.clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("scope", (params.scopes ?? X_DEFAULT_SCOPES).join(" "));
  url.searchParams.set("state", params.state);
  url.searchParams.set("code_challenge", buildCodeChallenge(params.codeVerifier));
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

export async function exchangeCodeForAccessToken(params: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}): Promise<XOAuthTokenResponse> {
  const clientId = process.env.X_API_CLIENT_ID;
  const clientSecret = process.env.X_API_CLIENT_SECRET;

  if (!clientId) {
    throw new Error("Missing X OAuth client credentials");
  }

  const body = new URLSearchParams({
    code: params.code,
    grant_type: "authorization_code",
    client_id: clientId,
    redirect_uri: params.redirectUri,
    code_verifier: params.codeVerifier,
  });

  const response = await axios.post<XOAuthTokenResponse>(X_TOKEN_URL, body.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...(clientSecret
        ? {
            Authorization: `Basic ${Buffer.from(
              `${clientId}:${clientSecret}`
            ).toString("base64")}`,
          }
        : {}),
    },
  });

  return response.data;
}

function isTokenExpired(expiresAt: string | null): boolean {
  if (!expiresAt) {
    return false;
  }

  const expiryMs = Date.parse(expiresAt);
  if (Number.isNaN(expiryMs)) {
    return true;
  }

  return expiryMs <= Date.now();
}

export async function refreshXAccessToken(
  refreshToken: string
): Promise<XOAuthTokenResponse> {
  const clientId = process.env.X_API_CLIENT_ID;
  const clientSecret = process.env.X_API_CLIENT_SECRET;

  if (!clientId) {
    throw new Error("Missing X OAuth client credentials");
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
  });

  const response = await axios.post<XOAuthTokenResponse>(X_TOKEN_URL, body.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...(clientSecret
        ? {
            Authorization: `Basic ${Buffer.from(
              `${clientId}:${clientSecret}`
            ).toString("base64")}`,
          }
        : {}),
    },
  });

  return response.data;
}

export async function requestXOAuth1RequestToken(params: {
  callbackUrl: string;
}): Promise<XOAuth1RequestTokenResponse> {
  const requestParams = {
    oauth_callback: params.callbackUrl,
  };
  const authorization = buildOAuth1AuthorizationHeader({
    method: "POST",
    url: X_OAUTH1_REQUEST_TOKEN_URL,
    requestParams,
  });

  const response = await axios.post(
    X_OAUTH1_REQUEST_TOKEN_URL,
    undefined,
    {
      headers: {
        Authorization: authorization,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return parseUrlEncodedResponse<XOAuth1RequestTokenResponse>(response.data);
}

export async function exchangeXOAuth1AccessToken(params: {
  oauthToken: string;
  oauthVerifier: string;
  requestTokenSecret: string;
}): Promise<XOAuth1AccessTokenResponse> {
  const requestParams = {
    oauth_token: params.oauthToken,
    oauth_verifier: params.oauthVerifier,
  };

  const authorization = buildOAuth1AuthorizationHeader({
    method: "POST",
    url: X_OAUTH1_ACCESS_TOKEN_URL,
    requestParams,
    oauthToken: params.oauthToken,
    tokenSecret: params.requestTokenSecret,
  });

  const response = await axios.post(
    X_OAUTH1_ACCESS_TOKEN_URL,
    undefined,
    {
      headers: {
        Authorization: authorization,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return parseUrlEncodedResponse<XOAuth1AccessTokenResponse>(response.data);
}

export async function fetchAuthenticatedXLegacyUser(params: {
  accessToken: string;
  accessTokenSecret: string;
}): Promise<XLegacyAuthenticatedUser> {
  const requestParams = {
    include_entities: "false",
    include_email: "false",
    skip_status: "true",
  };
  const authorization = buildOAuth1AuthorizationHeader({
    method: "GET",
    url: X_OAUTH1_VERIFY_CREDENTIALS_URL,
    requestParams,
    oauthToken: params.accessToken,
    tokenSecret: params.accessTokenSecret,
  });

  const response = await axios.get<{
    id_str: string;
    screen_name: string;
    name: string;
    profile_image_url_https?: string;
  }>(X_OAUTH1_VERIFY_CREDENTIALS_URL, {
    params: requestParams,
    headers: {
      Authorization: authorization,
    },
  });

  return {
    id: response.data.id_str,
    username: response.data.screen_name,
    name: response.data.name,
    profile_image_url: response.data.profile_image_url_https,
  };
}

export async function fetchAuthenticatedXUser(
  accessToken: string
): Promise<XAuthenticatedUser> {
  const response = await axios.get<{ data: XAuthenticatedUser }>(X_ME_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: {
      "user.fields": "profile_image_url",
    },
  });

  return response.data.data;
}

function computeExpiresAt(seconds: number | undefined): string | null {
  if (!seconds) {
    return null;
  }

  return new Date(Date.now() + seconds * 1000).toISOString();
}

function isTokenNearExpiry(expiresAt: string | null, bufferSeconds = 5 * 60): boolean {
  if (!expiresAt) {
    return false;
  }

  const expiryMs = Date.parse(expiresAt);
  if (Number.isNaN(expiryMs)) {
    return true;
  }

  return expiryMs <= Date.now() + bufferSeconds * 1000;
}

function isMissingTableError(error: unknown, tableName: string): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const typedError = error as {
    code?: string;
    message?: string;
    details?: string | null;
    hint?: string | null;
  };
  const message = [
    typedError.code,
    typedError.message,
    typedError.details,
    typedError.hint,
    JSON.stringify(error),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    (message.includes(tableName) || message.includes(`public.${tableName}`)) &&
    (typedError.code === "42P01" ||
      typedError.code === "PGRST205" ||
      message.includes("PGRST205") ||
      message.includes("42P01") ||
      message.includes("does not exist") ||
      message.includes("Could not find the table"))
  );
}

async function clearLegacyDefaultAccounts() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("scrape_jobs")
    .select("id,result,created_at")
    .eq("type", "x_oauth_account");

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as LegacyXOAuthJobRow[];

  for (const row of rows.filter((entry) => entry.result?.is_default)) {
    const { error: updateError } = await supabase
      .from("scrape_jobs")
      .update({
        result: {
          ...row.result,
          is_default: false,
        },
      })
      .eq("id", row.id);

    if (updateError) {
      throw updateError;
    }
  }
}

async function upsertLegacyXOAuthAccount(
  payload: Omit<StoredXOAuthAccount, "id">
): Promise<StoredXOAuthAccount> {
  const supabase = createAdminClient();
  await clearLegacyDefaultAccounts();

  const { data: existingRows, error: existingError } = await supabase
    .from("scrape_jobs")
    .select("id,result,created_at")
    .eq("type", "x_oauth_account");

  if (existingError) {
    throw existingError;
  }

  const rows = (existingRows ?? []) as LegacyXOAuthJobRow[];
  const existingRow = rows.find(
    (row) => row.result?.provider_user_id === payload.provider_user_id
  );

  if (existingRow) {
    const { error: updateError } = await supabase
      .from("scrape_jobs")
      .update({
        status: "completed",
        target_url: `x://oauth/${payload.provider_user_id}`,
        result: payload,
        completed_at: new Date().toISOString(),
      })
      .eq("id", existingRow.id);

    if (updateError) {
      throw updateError;
    }

    return {
      id: existingRow.id,
      ...payload,
    };
  }

  const { data, error } = await supabase
    .from("scrape_jobs")
    .insert({
      type: "x_oauth_account",
      target_url: `x://oauth/${payload.provider_user_id}`,
      status: "completed",
      result: payload,
      completed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id as string,
    ...payload,
  };
}

async function getLegacyStoredXOAuthAccount(
  options: ResolveStoredXOAuthAccountOptions = {}
): Promise<StoredXOAuthAccount | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("scrape_jobs")
    .select("id,result,created_at")
    .eq("type", "x_oauth_account");

  if (error) {
    console.error("Failed to load legacy X OAuth account storage:", error);
    return null;
  }

  const rows = (data ?? []) as LegacyXOAuthJobRow[];
  const accounts = sortRowsByCreatedAtDesc(rows)
    .map((row) => normalizeStoredXOAuthAccount(row.id, row.result))
    .filter((row): row is StoredXOAuthAccount => Boolean(row));

  if (options.accountId) {
    return accounts.find((row) => row.id === options.accountId) ?? null;
  }

  if (options.providerUserId) {
    return (
      accounts.find(
        (row) => row.provider_user_id === options.providerUserId
      ) ?? null
    );
  }

  if (options.username) {
    const normalizedUsername = options.username.replace(/^@/, "");
    return (
      accounts.find((row) => row.username === normalizedUsername) ?? null
    );
  }

  return (
    accounts.find((row) => row.is_default) ??
    accounts.sort((a, b) =>
      a.expires_at && b.expires_at
        ? b.expires_at.localeCompare(a.expires_at)
        : 0
    )[0] ??
    null
  );
}

export async function upsertXOAuthAccount(params: {
  tokenResponse: XOAuthTokenResponse;
  user: XAuthenticatedUser;
  metadata?: Record<string, unknown>;
}): Promise<StoredXOAuthAccount> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }

  const supabase = createAdminClient();
  const scopes = params.tokenResponse.scope
    ? params.tokenResponse.scope.split(" ").filter(Boolean)
    : [];

  const expiresAt = computeExpiresAt(params.tokenResponse.expires_in);
  const refreshTokenExpiresAt = computeExpiresAt(
    params.tokenResponse.refresh_token_expires_in
  );

  const storedPayload: Omit<StoredXOAuthAccount, "id"> = {
    provider_user_id: params.user.id,
    username: params.user.username,
    display_name: params.user.name,
    access_token: params.tokenResponse.access_token,
    refresh_token: params.tokenResponse.refresh_token ?? null,
    token_type: params.tokenResponse.token_type,
    scopes,
    expires_at: expiresAt,
    refresh_token_expires_at: refreshTokenExpiresAt,
    is_default: true,
    metadata: {
      profile_image_url: params.user.profile_image_url ?? null,
      ...params.metadata,
    },
  };

  const { error: clearDefaultError } = await supabase
    .from("x_oauth_accounts")
    .update({ is_default: false })
    .eq("provider", "x");

  if (clearDefaultError) {
    if (isMissingTableError(clearDefaultError, "x_oauth_accounts")) {
      return upsertLegacyXOAuthAccount(storedPayload);
    }
    throw clearDefaultError;
  }

  const payload = {
    provider: "x",
    ...storedPayload,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("x_oauth_accounts")
    .upsert(payload, { onConflict: "provider_user_id" })
    .select("*")
    .single();

  if (error) {
    if (isMissingTableError(error, "x_oauth_accounts")) {
      return upsertLegacyXOAuthAccount(storedPayload);
    }
    throw error;
  }

  return data as StoredXOAuthAccount;
}

export async function getStoredXOAuthAccount(
  options: ResolveStoredXOAuthAccountOptions = {}
): Promise<StoredXOAuthAccount | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createAdminClient();
  let query = supabase
    .from("x_oauth_accounts")
    .select("*")
    .eq("provider", "x");

  if (options.accountId) {
    query = query.eq("id", options.accountId);
  } else if (options.providerUserId) {
    query = query.eq("provider_user_id", options.providerUserId);
  } else if (options.username) {
    query = query.eq("username", options.username.replace(/^@/, ""));
  } else {
    query = query.eq("is_default", true);
  }

  const { data, error } = await query.limit(1);

  if (error) {
    if (isMissingTableError(error, "x_oauth_accounts")) {
      return getLegacyStoredXOAuthAccount(options);
    }
    console.error("Failed to load stored X OAuth account:", error);
    return null;
  }

  const rows = (data ?? []) as StoredXOAuthAccount[];
  if (rows[0]) {
    return rows[0];
  }

  // Older environments store OAuth accounts in scrape_jobs instead of
  // x_oauth_accounts. Prefer the dedicated table when present, but keep the
  // fallback active so auth remains readable across mixed deployments.
  return getLegacyStoredXOAuthAccount(options);
}

async function clearLegacyProfileDefaultAccounts() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("scrape_jobs")
    .select("id,result,created_at")
    .eq("type", "x_legacy_profile_auth");

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as LegacyXOAuth1JobRow[];

  for (const row of rows.filter((entry) => entry.result?.is_default)) {
    const { error: updateError } = await supabase
      .from("scrape_jobs")
      .update({
        result: {
          ...row.result,
          is_default: false,
        },
      })
      .eq("id", row.id);

    if (updateError) {
      throw updateError;
    }
  }
}

export async function upsertXLegacyProfileAccount(params: {
  accessToken: string;
  accessTokenSecret: string;
  user: XLegacyAuthenticatedUser;
  metadata?: Record<string, unknown>;
}): Promise<StoredXLegacyProfileAccount> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }

  const supabase = createAdminClient();
  await clearLegacyProfileDefaultAccounts();

  const payload: Omit<StoredXLegacyProfileAccount, "id"> = {
    provider_user_id: params.user.id,
    username: params.user.username,
    display_name: params.user.name,
    access_token: params.accessToken,
    access_token_secret: params.accessTokenSecret,
    is_default: true,
    metadata: {
      profile_image_url: params.user.profile_image_url ?? null,
      ...params.metadata,
    },
  };

  const { data: existingRows, error: existingError } = await supabase
    .from("scrape_jobs")
    .select("id,result,created_at")
    .eq("type", "x_legacy_profile_auth");

  if (existingError) {
    throw existingError;
  }

  const rows = (existingRows ?? []) as LegacyXOAuth1JobRow[];
  const existingRow = rows.find(
    (row) => row.result?.provider_user_id === payload.provider_user_id
  );

  if (existingRow) {
    const { error: updateError } = await supabase
      .from("scrape_jobs")
      .update({
        status: "completed",
        target_url: `x://legacy/${payload.provider_user_id}`,
        result: payload,
        completed_at: new Date().toISOString(),
      })
      .eq("id", existingRow.id);

    if (updateError) {
      throw updateError;
    }

    return {
      id: existingRow.id,
      ...payload,
    };
  }

  const { data, error } = await supabase
    .from("scrape_jobs")
    .insert({
      type: "x_legacy_profile_auth",
      target_url: `x://legacy/${payload.provider_user_id}`,
      status: "completed",
      result: payload,
      completed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id as string,
    ...payload,
  };
}

export async function getStoredXLegacyProfileAccount(
  options: ResolveStoredXOAuthAccountOptions = {}
): Promise<StoredXLegacyProfileAccount | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("scrape_jobs")
    .select("id,result,created_at")
    .eq("type", "x_legacy_profile_auth");

  if (error) {
    console.error("Failed to load stored X legacy profile account:", error);
    return null;
  }

  const rows = (data ?? []) as LegacyXOAuth1JobRow[];
  const accounts = sortRowsByCreatedAtDesc(rows)
    .map((row) => normalizeStoredXLegacyProfileAccount(row.id, row.result))
    .filter(
      (row): row is StoredXLegacyProfileAccount => Boolean(row)
    );

  if (options.accountId) {
    return accounts.find((row) => row.id === options.accountId) ?? null;
  }

  if (options.providerUserId) {
    return (
      accounts.find(
        (row) => row.provider_user_id === options.providerUserId
      ) ?? null
    );
  }

  if (options.username) {
    const normalizedUsername = options.username.replace(/^@/, "");
    return (
      accounts.find((row) => row.username === normalizedUsername) ?? null
    );
  }

  return (
    accounts.find((row) => row.is_default) ??
    accounts[0] ??
    null
  );
}

export async function refreshStoredXOAuthAccount(
  account: StoredXOAuthAccount
): Promise<StoredXOAuthAccount> {
  if (!account.refresh_token) {
    throw new Error("Stored X OAuth account does not have a refresh token");
  }

  const tokenResponse = await refreshXAccessToken(account.refresh_token);
  let refreshedUser: XAuthenticatedUser;

  try {
    refreshedUser = await fetchAuthenticatedXUser(tokenResponse.access_token);
  } catch {
    refreshedUser = {
      id: account.provider_user_id,
      username: account.username ?? account.provider_user_id,
      name:
        account.display_name ??
        account.username ??
        account.provider_user_id,
      profile_image_url:
        typeof account.metadata.profile_image_url === "string"
          ? account.metadata.profile_image_url
          : undefined,
    };
  }

  return upsertXOAuthAccount({
    tokenResponse: {
      ...tokenResponse,
      scope: tokenResponse.scope ?? account.scopes.join(" "),
    },
    user: refreshedUser,
    metadata: {
      ...account.metadata,
      refresh_source: "refresh_token",
    },
  });
}

export async function getUsableXOAuthAccount(
  options: ResolveStoredXOAuthAccountOptions = {}
): Promise<StoredXOAuthAccount | null> {
  const storedAccount = await getStoredXOAuthAccount(options);
  if (!storedAccount) {
    return null;
  }

  if (!isTokenNearExpiry(storedAccount.expires_at)) {
    return storedAccount;
  }

  if (!storedAccount.refresh_token) {
    return null;
  }

  try {
    return await refreshStoredXOAuthAccount(storedAccount);
  } catch (error) {
    console.error("Failed to refresh stored X OAuth account:", error);
    return isTokenExpired(storedAccount.expires_at) ? null : storedAccount;
  }
}

export async function getXOAuthConnectionStatus(
  requiredScopes: string[] = X_DEFAULT_SCOPES
): Promise<XOAuthConnectionStatus> {
  const storedAccount = await getStoredXOAuthAccount();
  const legacyProfileAccount = await getStoredXLegacyProfileAccount();
  if (!storedAccount) {
    return {
      connected: false,
      needsReconnect: true,
      authMode: legacyProfileAccount ? "legacy_oauth1" : "none",
      username: null,
      displayName: null,
      providerUserId: null,
      expiresAt: null,
      hasRefreshToken: false,
      missingScopes: [...requiredScopes],
      legacyProfileConnected: Boolean(legacyProfileAccount),
      legacyProfileUsername: legacyProfileAccount?.username ?? null,
      legacyProfileNeedsReconnect: !legacyProfileAccount,
    };
  }

  const usableAccount = await getUsableXOAuthAccount();
  const activeAccount = usableAccount ?? storedAccount;
  const missingScopes = requiredScopes.filter(
    (scope) => !activeAccount.scopes.includes(scope)
  );

  return {
    connected: Boolean(usableAccount),
    needsReconnect: !usableAccount || missingScopes.length > 0,
    authMode: "oauth2",
    username: activeAccount.username,
    displayName: activeAccount.display_name,
    providerUserId: activeAccount.provider_user_id,
    expiresAt: activeAccount.expires_at,
    hasRefreshToken: Boolean(activeAccount.refresh_token),
    missingScopes,
    legacyProfileConnected: Boolean(legacyProfileAccount),
    legacyProfileUsername: legacyProfileAccount?.username ?? null,
    legacyProfileNeedsReconnect: !legacyProfileAccount,
  };
}

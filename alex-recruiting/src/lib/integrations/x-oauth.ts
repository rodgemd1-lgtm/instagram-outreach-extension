import axios from "axios";
import crypto from "crypto";

import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

const X_AUTHORIZE_URL = "https://x.com/i/oauth2/authorize";
const X_TOKEN_URL = "https://api.x.com/2/oauth2/token";
const X_ME_URL = "https://api.x.com/2/users/me";
const X_OAUTH_COOKIE_TTL_SECONDS = 10 * 60;

export const X_OAUTH_STATE_COOKIE = "x_oauth_state";
export const X_OAUTH_VERIFIER_COOKIE = "x_oauth_code_verifier";
export const X_OAUTH_RETURN_TO_COOKIE = "x_oauth_return_to";

export const X_DEFAULT_SCOPES = [
  "users.read",
  "tweet.read",
  "tweet.write",
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

interface LegacyXOAuthJobRow {
  id: string;
  result: Omit<StoredXOAuthAccount, "id"> | null;
  created_at: string;
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

export function resolveXRedirectUri(request: Request): string {
  return new URL("/api/auth/callback/twitter", request.url).toString();
}

export function sanitizeReturnToPath(returnTo: string | null | undefined): string {
  if (!returnTo || !returnTo.startsWith("/")) {
    return "/";
  }

  return returnTo;
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

  if (!clientId || !clientSecret) {
    throw new Error("Missing X OAuth client credentials");
  }

  const body = new URLSearchParams({
    code: params.code,
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: params.redirectUri,
    code_verifier: params.codeVerifier,
  });

  const response = await axios.post<XOAuthTokenResponse>(X_TOKEN_URL, body.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return response.data;
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

function isMissingTableError(error: unknown, tableName: string): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const message = JSON.stringify(error);
  return (
    message.includes(tableName) &&
    (message.includes("42P01") ||
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
  const accounts = rows
    .map((row) => {
      if (!row.result) {
        return null;
      }

      return {
        id: row.id,
        ...row.result,
      } as StoredXOAuthAccount;
    })
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
    .eq("provider", "x")
    .limit(1);

  if (options.accountId) {
    query = query.eq("id", options.accountId);
  } else if (options.providerUserId) {
    query = query.eq("provider_user_id", options.providerUserId);
  } else if (options.username) {
    query = query.eq("username", options.username.replace(/^@/, ""));
  } else {
    query = query.eq("is_default", true);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    if (isMissingTableError(error, "x_oauth_accounts")) {
      return getLegacyStoredXOAuthAccount(options);
    }
    console.error("Failed to load stored X OAuth account:", error);
    return null;
  }

  return (data as StoredXOAuthAccount | null) ?? null;
}

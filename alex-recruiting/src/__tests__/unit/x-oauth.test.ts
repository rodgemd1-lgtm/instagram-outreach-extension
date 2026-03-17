import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockAxiosPost = vi.fn();
const mockAxiosGet = vi.fn();
const mockCreateAdminClient = vi.fn();
const mockIsSupabaseConfigured = vi.fn();

vi.mock("axios", () => ({
  default: {
    post: mockAxiosPost,
    get: mockAxiosGet,
  },
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: mockCreateAdminClient,
  isSupabaseConfigured: mockIsSupabaseConfigured,
}));

type QueryResponse = {
  data: unknown;
  error: unknown;
};

function makeAwaitableQuery(response: QueryResponse) {
  const query = {
    eq: vi.fn(() => query),
    limit: vi.fn(() => Promise.resolve(response)),
    then: (resolve: (value: QueryResponse) => unknown, reject?: (reason: unknown) => unknown) =>
      Promise.resolve(response).then(resolve, reject),
  };

  return query;
}

function createSupabaseClientMock(responses: {
  xOauthAccounts?: QueryResponse;
  scrapeJobsByType?: Record<string, QueryResponse>;
}) {
  return {
    from: vi.fn((table: string) => ({
      select: vi.fn(() => {
        if (table === "x_oauth_accounts") {
          return makeAwaitableQuery(
            responses.xOauthAccounts ?? { data: [], error: null }
          );
        }

        if (table === "scrape_jobs") {
          let activeResponse: QueryResponse = { data: [], error: null };
          const query = {
            eq: vi.fn((column: string, value: string) => {
              if (column === "type") {
                activeResponse =
                  responses.scrapeJobsByType?.[value] ?? { data: [], error: null };
              }
              return query;
            }),
            limit: vi.fn(() => Promise.resolve(activeResponse)),
            then: (
              resolve: (value: QueryResponse) => unknown,
              reject?: (reason: unknown) => unknown
            ) => Promise.resolve(activeResponse).then(resolve, reject),
          };

          return query;
        }

        throw new Error(`Unexpected table ${table}`);
      }),
      update: vi.fn(),
      insert: vi.fn(),
    })),
  };
}

describe("x-oauth helpers", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockIsSupabaseConfigured.mockReturnValue(true);
    mockCreateAdminClient.mockReturnValue(
      createSupabaseClientMock({
        xOauthAccounts: { data: [], error: null },
      })
    );
    process.env.X_API_CLIENT_ID = "client-id";
    process.env.X_API_CLIENT_SECRET = "client-secret";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("builds an authorize URL with PKCE parameters", async () => {
    const { buildCodeChallenge, buildXAuthorizationUrl } = await import(
      "@/lib/integrations/x-oauth"
    );

    const url = new URL(
      buildXAuthorizationUrl({
        clientId: "client-id",
        redirectUri: "https://alex-recruiting.vercel.app/api/auth/callback/twitter",
        state: "state-123",
        codeVerifier: "verifier-123",
      })
    );

    expect(url.origin).toBe("https://x.com");
    expect(url.pathname).toBe("/i/oauth2/authorize");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("client_id")).toBe("client-id");
    expect(url.searchParams.get("state")).toBe("state-123");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "https://alex-recruiting.vercel.app/api/auth/callback/twitter"
    );
    expect(url.searchParams.get("code_challenge")).toBe(
      buildCodeChallenge("verifier-123")
    );
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("scope")).toContain("dm.write");
  });

  it("sanitizes return paths and rejects open redirects", async () => {
    const { sanitizeReturnToPath } = await import(
      "@/lib/integrations/x-oauth"
    );

    expect(sanitizeReturnToPath("/dashboard")).toBe("/dashboard");
    expect(sanitizeReturnToPath("/profile-studio?tab=x#status")).toBe(
      "/profile-studio?tab=x#status"
    );
    expect(sanitizeReturnToPath("https://evil.example")).toBe("/");
    expect(sanitizeReturnToPath("//evil.example")).toBe("/");
    expect(sanitizeReturnToPath(undefined)).toBe("/");
  });

  it("uses HTTP Basic auth for the OAuth2 code exchange", async () => {
    mockAxiosPost.mockResolvedValueOnce({
      data: {
        access_token: "access-token",
        token_type: "bearer",
      },
    });

    const { exchangeCodeForAccessToken } = await import(
      "@/lib/integrations/x-oauth"
    );

    await exchangeCodeForAccessToken({
      code: "auth-code",
      codeVerifier: "verifier-123",
      redirectUri: "http://localhost:3001/api/auth/callback/twitter",
    });

    expect(mockAxiosPost).toHaveBeenCalledTimes(1);
    expect(mockAxiosPost.mock.calls[0][0]).toBe("https://api.x.com/2/oauth2/token");
    expect(mockAxiosPost.mock.calls[0][1]).toContain("grant_type=authorization_code");
    expect(mockAxiosPost.mock.calls[0][2].headers.Authorization).toBe(
      `Basic ${Buffer.from("client-id:client-secret").toString("base64")}`
    );
  });

  it("uses HTTP Basic auth for the refresh token exchange", async () => {
    mockAxiosPost.mockResolvedValueOnce({
      data: {
        access_token: "refreshed-access-token",
        token_type: "bearer",
      },
    });

    const { refreshXAccessToken } = await import(
      "@/lib/integrations/x-oauth"
    );

    await refreshXAccessToken("refresh-token-123");

    expect(mockAxiosPost).toHaveBeenCalledTimes(1);
    expect(mockAxiosPost.mock.calls[0][0]).toBe("https://api.x.com/2/oauth2/token");
    expect(mockAxiosPost.mock.calls[0][1]).toContain("grant_type=refresh_token");
    expect(mockAxiosPost.mock.calls[0][2].headers.Authorization).toBe(
      `Basic ${Buffer.from("client-id:client-secret").toString("base64")}`
    );
  });

  it("falls back to scrape_jobs when the dedicated oauth table is missing", async () => {
    mockCreateAdminClient.mockReturnValue(
      createSupabaseClientMock({
        xOauthAccounts: {
          data: null,
          error: {
            code: "PGRST205",
            message:
              "Could not find the table 'public.x_oauth_accounts' in the schema cache",
          },
        },
        scrapeJobsByType: {
          x_oauth_account: {
            data: [
              {
                id: "job-1",
                created_at: "2026-03-09T09:24:33.683755+00:00",
                result: JSON.stringify({
                  provider_user_id: "user-1",
                  username: "JacobRodge52987",
                  display_name: "Jacob Rodgers",
                  access_token: "access-token",
                  refresh_token: "refresh-token",
                  token_type: "bearer",
                  scopes: ["users.read", "tweet.write", "offline.access"],
                  expires_at: "2099-03-09T11:24:32.984Z",
                  refresh_token_expires_at: null,
                  is_default: true,
                  metadata: {
                    callback_path: "/api/auth/callback/twitter",
                  },
                }),
              },
            ],
            error: null,
          },
        },
      })
    );

    const { getStoredXOAuthAccount } = await import(
      "@/lib/integrations/x-oauth"
    );
    const account = await getStoredXOAuthAccount();

    expect(account).toMatchObject({
      id: "job-1",
      provider_user_id: "user-1",
      username: "JacobRodge52987",
      refresh_token: "refresh-token",
      is_default: true,
    });
  });

  it("falls back to scrape_jobs when the dedicated oauth table is empty", async () => {
    mockCreateAdminClient.mockReturnValue(
      createSupabaseClientMock({
        xOauthAccounts: {
          data: [],
          error: null,
        },
        scrapeJobsByType: {
          x_oauth_account: {
            data: [
              {
                id: "job-2",
                created_at: "2026-03-09T09:24:33.683755+00:00",
                result: {
                  provider_user_id: "user-2",
                  username: "JacobRodge52987",
                  display_name: "Jacob Rodgers",
                  access_token: "access-token-2",
                  refresh_token: "refresh-token-2",
                  token_type: "bearer",
                  scopes: ["users.read", "tweet.read", "offline.access"],
                  expires_at: "2099-03-09T11:24:32.984Z",
                  refresh_token_expires_at: null,
                  is_default: true,
                  metadata: {},
                },
              },
            ],
            error: null,
          },
        },
      })
    );

    const { getStoredXOAuthAccount } = await import(
      "@/lib/integrations/x-oauth"
    );
    const account = await getStoredXOAuthAccount();

    expect(account?.provider_user_id).toBe("user-2");
    expect(account?.access_token).toBe("access-token-2");
  });

  it("prefers the newest fallback account when no legacy row is marked default", async () => {
    mockCreateAdminClient.mockReturnValue(
      createSupabaseClientMock({
        xOauthAccounts: {
          data: [],
          error: null,
        },
        scrapeJobsByType: {
          x_oauth_account: {
            data: [
              {
                id: "job-old",
                created_at: "2026-03-08T09:24:33.683755+00:00",
                result: {
                  provider_user_id: "user-old",
                  username: "old-account",
                  display_name: "Old Account",
                  access_token: "old-access-token",
                  refresh_token: "old-refresh-token",
                  token_type: "bearer",
                  scopes: ["users.read"],
                  expires_at: null,
                  refresh_token_expires_at: null,
                  is_default: false,
                  metadata: {},
                },
              },
              {
                id: "job-new",
                created_at: "2026-03-09T09:24:33.683755+00:00",
                result: {
                  provider_user_id: "user-new",
                  username: "new-account",
                  display_name: "New Account",
                  access_token: "new-access-token",
                  refresh_token: "new-refresh-token",
                  token_type: "bearer",
                  scopes: ["users.read"],
                  expires_at: null,
                  refresh_token_expires_at: null,
                  is_default: false,
                  metadata: {},
                },
              },
            ],
            error: null,
          },
        },
      })
    );

    const { getStoredXOAuthAccount } = await import(
      "@/lib/integrations/x-oauth"
    );
    const account = await getStoredXOAuthAccount();

    expect(account?.provider_user_id).toBe("user-new");
    expect(account?.username).toBe("new-account");
  });

  it("returns a usable account from fallback storage in the status helper", async () => {
    mockCreateAdminClient.mockReturnValue(
      createSupabaseClientMock({
        xOauthAccounts: {
          data: [],
          error: null,
        },
        scrapeJobsByType: {
          x_oauth_account: {
            data: [
              {
                id: "job-3",
                created_at: "2026-03-09T09:24:33.683755+00:00",
                result: {
                  provider_user_id: "user-3",
                  username: "JacobRodge52987",
                  display_name: "Jacob Rodgers",
                  access_token: "access-token-3",
                  refresh_token: "refresh-token-3",
                  token_type: "bearer",
                  scopes: [
                    "users.read",
                    "tweet.read",
                    "tweet.write",
                    "follows.write",
                    "like.write",
                    "media.write",
                    "dm.read",
                    "dm.write",
                    "offline.access",
                  ],
                  expires_at: "2099-03-09T11:24:32.984Z",
                  refresh_token_expires_at: null,
                  is_default: true,
                  metadata: {},
                },
              },
            ],
            error: null,
          },
          x_legacy_profile_auth: {
            data: [
              {
                id: "legacy-job-1",
                created_at: "2026-03-09T09:27:23.491961+00:00",
                result: {
                  provider_user_id: "user-3",
                  username: "JacobRodge52987",
                  display_name: "Jacob Rodgers",
                  access_token: "legacy-token",
                  access_token_secret: "legacy-secret",
                  is_default: true,
                  metadata: {},
                },
              },
            ],
            error: null,
          },
        },
      })
    );

    const { getXOAuthConnectionStatus, X_DEFAULT_SCOPES } = await import(
      "@/lib/integrations/x-oauth"
    );
    const status = await getXOAuthConnectionStatus(X_DEFAULT_SCOPES);

    expect(status).toMatchObject({
      connected: true,
      needsReconnect: false,
      authMode: "oauth2",
      username: "JacobRodge52987",
      legacyProfileConnected: true,
      legacyProfileNeedsReconnect: false,
    });
  });

  it("keeps using a still-valid token when refresh fails", async () => {
    mockCreateAdminClient.mockReturnValue(
      createSupabaseClientMock({
        xOauthAccounts: {
          data: [],
          error: null,
        },
        scrapeJobsByType: {
          x_oauth_account: {
            data: [
              {
                id: "job-4",
                created_at: "2026-03-09T09:24:33.683755+00:00",
                result: {
                  provider_user_id: "user-4",
                  username: "JacobRodge52987",
                  display_name: "Jacob Rodgers",
                  access_token: "access-token-4",
                  refresh_token: "refresh-token-4",
                  token_type: "bearer",
                  scopes: ["users.read", "tweet.read", "offline.access"],
                  expires_at: new Date(Date.now() + 60_000).toISOString(),
                  refresh_token_expires_at: null,
                  is_default: true,
                  metadata: {},
                },
              },
            ],
            error: null,
          },
        },
      })
    );
    mockAxiosPost.mockRejectedValueOnce(new Error("temporary refresh failure"));

    const { getUsableXOAuthAccount } = await import(
      "@/lib/integrations/x-oauth"
    );
    const account = await getUsableXOAuthAccount();

    expect(account).toMatchObject({
      provider_user_id: "user-4",
      access_token: "access-token-4",
    });
  });

  it("reports oauth2 auth mode even when a stored account needs reconnect", async () => {
    mockCreateAdminClient.mockReturnValue(
      createSupabaseClientMock({
        xOauthAccounts: {
          data: [],
          error: null,
        },
        scrapeJobsByType: {
          x_oauth_account: {
            data: [
              {
                id: "job-expired",
                created_at: "2026-03-09T09:24:33.683755+00:00",
                result: {
                  provider_user_id: "user-expired",
                  username: "JacobRodge52987",
                  display_name: "Jacob Rodgers",
                  access_token: "expired-access-token",
                  refresh_token: null,
                  token_type: "bearer",
                  scopes: ["users.read", "tweet.read"],
                  expires_at: "2020-03-09T11:24:32.984Z",
                  refresh_token_expires_at: null,
                  is_default: true,
                  metadata: {},
                },
              },
            ],
            error: null,
          },
        },
      })
    );

    const { getXOAuthConnectionStatus, X_DEFAULT_SCOPES } = await import(
      "@/lib/integrations/x-oauth"
    );
    const status = await getXOAuthConnectionStatus(X_DEFAULT_SCOPES);

    expect(status).toMatchObject({
      connected: false,
      needsReconnect: true,
      authMode: "oauth2",
      username: "JacobRodge52987",
      hasRefreshToken: false,
    });
    expect(status.missingScopes).toContain("tweet.write");
  });
});

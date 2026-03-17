import { afterEach, describe, expect, it, vi } from "vitest";

const mockGetXOAuthConnectionStatus = vi.fn();
const mockIsLegacyXWriteConfigured = vi.fn();

vi.mock("@/lib/integrations/x-oauth", () => ({
  X_DEFAULT_SCOPES: ["users.read", "tweet.write"],
  getXOAuthConnectionStatus: mockGetXOAuthConnectionStatus,
}));

vi.mock("@/lib/integrations/x-api", () => ({
  isLegacyXWriteConfigured: mockIsLegacyXWriteConfigured,
}));

describe("GET /api/auth/twitter/status", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("exports a dynamic route and returns connection status", async () => {
    mockGetXOAuthConnectionStatus.mockResolvedValueOnce({
      connected: true,
      needsReconnect: false,
      authMode: "oauth2",
      username: "JacobRodge52987",
      displayName: "Jacob Rodgers",
      providerUserId: "user-1",
      expiresAt: "2099-03-09T11:24:32.984Z",
      hasRefreshToken: true,
      missingScopes: [],
      legacyProfileConnected: false,
      legacyProfileUsername: null,
      legacyProfileNeedsReconnect: true,
    });
    mockIsLegacyXWriteConfigured.mockReturnValue(false);

    const route = await import("@/app/api/auth/twitter/status/route");
    const response = await route.GET();
    const body = await response.json();

    expect(route.dynamic).toBe("force-dynamic");
    expect(mockGetXOAuthConnectionStatus).toHaveBeenCalledWith([
      "users.read",
      "tweet.write",
    ]);
    expect(body).toMatchObject({
      connected: true,
      authMode: "oauth2",
      username: "JacobRodge52987",
      legacyProfileToolsAvailable: false,
    });
  });

  it("reports legacy profile tools as available when legacy write config exists", async () => {
    mockGetXOAuthConnectionStatus.mockResolvedValueOnce({
      connected: false,
      needsReconnect: true,
      authMode: "none",
      username: null,
      displayName: null,
      providerUserId: null,
      expiresAt: null,
      hasRefreshToken: false,
      missingScopes: ["users.read", "tweet.write"],
      legacyProfileConnected: false,
      legacyProfileUsername: null,
      legacyProfileNeedsReconnect: true,
    });
    mockIsLegacyXWriteConfigured.mockReturnValue(true);

    const { GET } = await import("@/app/api/auth/twitter/status/route");
    const response = await GET();
    const body = await response.json();

    expect(body.legacyProfileToolsAvailable).toBe(true);
  });

  it("returns a 500 response when the status lookup throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockGetXOAuthConnectionStatus.mockRejectedValueOnce(
      new Error("supabase unavailable")
    );

    const { GET } = await import("@/app/api/auth/twitter/status/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      error: "Failed to load X connection status",
    });
  });
});

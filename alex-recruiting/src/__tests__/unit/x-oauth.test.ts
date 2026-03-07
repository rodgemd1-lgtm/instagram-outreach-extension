import { describe, expect, it } from "vitest";

import {
  buildCodeChallenge,
  buildXAuthorizationUrl,
  sanitizeReturnToPath,
} from "@/lib/integrations/x-oauth";

describe("x-oauth helpers", () => {
  it("builds an authorize URL with PKCE parameters", () => {
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

  it("sanitizes return paths to same-origin relative paths", () => {
    expect(sanitizeReturnToPath("/dashboard")).toBe("/dashboard");
    expect(sanitizeReturnToPath("https://evil.example")).toBe("/");
    expect(sanitizeReturnToPath(undefined)).toBe("/");
  });
});

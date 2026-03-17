import { NextResponse } from "next/server";

import {
  X_OAUTH1_REQUEST_SECRET_COOKIE,
  X_OAUTH1_REQUEST_TOKEN_COOKIE,
  X_OAUTH1_RETURN_TO_COOKIE,
  buildXOAuth1AuthorizationUrl,
  getXOAuthCookieOptions,
  requestXOAuth1RequestToken,
  resolveXLegacyRedirectUri,
  sanitizeReturnToPath,
} from "@/lib/integrations/x-oauth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const returnTo = sanitizeReturnToPath(
    requestUrl.searchParams.get("returnTo")
  );
  const redirectUrl = new URL(returnTo, requestUrl);

  try {
    const tokenResponse = await requestXOAuth1RequestToken({
      callbackUrl: resolveXLegacyRedirectUri(request),
    });

    const response = NextResponse.redirect(
      buildXOAuth1AuthorizationUrl(tokenResponse.oauth_token)
    );

    const cookieOptions = getXOAuthCookieOptions();
    response.cookies.set(
      X_OAUTH1_REQUEST_TOKEN_COOKIE,
      tokenResponse.oauth_token,
      cookieOptions
    );
    response.cookies.set(
      X_OAUTH1_REQUEST_SECRET_COOKIE,
      tokenResponse.oauth_token_secret,
      cookieOptions
    );
    response.cookies.set(X_OAUTH1_RETURN_TO_COOKIE, returnTo, cookieOptions);

    return response;
  } catch (error) {
    console.error("Failed to start X OAuth 1.0a flow:", error);
    redirectUrl.searchParams.set("xLegacyAuth", "error");
    redirectUrl.searchParams.set("reason", "legacy_request_token_failed");
    return NextResponse.redirect(redirectUrl);
  }
}

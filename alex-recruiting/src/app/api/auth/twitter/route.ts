import { NextResponse } from "next/server";

import {
  X_OAUTH_RETURN_TO_COOKIE,
  X_OAUTH_STATE_COOKIE,
  X_OAUTH_VERIFIER_COOKIE,
  buildXAuthorizationUrl,
  generateCodeVerifier,
  generateOAuthState,
  getXOAuthCookieOptions,
  resolveXRedirectUri,
  sanitizeReturnToPath,
} from "@/lib/integrations/x-oauth";

export async function GET(request: Request) {
  const clientId = process.env.X_API_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "Missing X_API_CLIENT_ID" },
      { status: 500 }
    );
  }

  const requestUrl = new URL(request.url);
  const state = generateOAuthState();
  const codeVerifier = generateCodeVerifier();
  const redirectUri = resolveXRedirectUri(request);
  const returnTo = sanitizeReturnToPath(
    requestUrl.searchParams.get("returnTo")
  );

  const response = NextResponse.redirect(
    buildXAuthorizationUrl({
      clientId,
      redirectUri,
      state,
      codeVerifier,
    })
  );

  const cookieOptions = getXOAuthCookieOptions();
  response.cookies.set(X_OAUTH_STATE_COOKIE, state, cookieOptions);
  response.cookies.set(X_OAUTH_VERIFIER_COOKIE, codeVerifier, cookieOptions);
  response.cookies.set(X_OAUTH_RETURN_TO_COOKIE, returnTo, cookieOptions);

  return response;
}

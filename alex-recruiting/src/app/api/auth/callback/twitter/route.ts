import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  X_OAUTH_RETURN_TO_COOKIE,
  X_OAUTH_STATE_COOKIE,
  X_OAUTH_VERIFIER_COOKIE,
  exchangeCodeForAccessToken,
  fetchAuthenticatedXUser,
  resolveXRedirectUri,
  sanitizeReturnToPath,
  upsertXOAuthAccount,
} from "@/lib/integrations/x-oauth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const { searchParams } = requestUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const cookieStore = cookies();
  const storedState = cookieStore.get(X_OAUTH_STATE_COOKIE)?.value;
  const codeVerifier = cookieStore.get(X_OAUTH_VERIFIER_COOKIE)?.value;
  const returnTo = sanitizeReturnToPath(
    cookieStore.get(X_OAUTH_RETURN_TO_COOKIE)?.value
  );

  const redirectUrl = new URL(returnTo, requestUrl);

  const clearCookies = (response: NextResponse) => {
    response.cookies.delete(X_OAUTH_STATE_COOKIE);
    response.cookies.delete(X_OAUTH_VERIFIER_COOKIE);
    response.cookies.delete(X_OAUTH_RETURN_TO_COOKIE);
    return response;
  };

  if (error) {
    redirectUrl.searchParams.set("xAuth", "error");
    redirectUrl.searchParams.set("reason", error);
    if (errorDescription) {
      redirectUrl.searchParams.set("detail", errorDescription);
    }
    return clearCookies(NextResponse.redirect(redirectUrl));
  }

  if (!code) {
    return NextResponse.json(
      { error: "No authorization code received" },
      { status: 400 }
    );
  }

  if (!state || !storedState || state !== storedState) {
    return NextResponse.json(
      { error: "Invalid OAuth state" },
      { status: 400 }
    );
  }

  if (!codeVerifier) {
    return NextResponse.json(
      { error: "Missing PKCE code verifier" },
      { status: 400 }
    );
  }

  try {
    const tokenResponse = await exchangeCodeForAccessToken({
      code,
      codeVerifier,
      redirectUri: resolveXRedirectUri(request),
    });

    const user = await fetchAuthenticatedXUser(tokenResponse.access_token);
    await upsertXOAuthAccount({
      tokenResponse,
      user,
      metadata: {
        callback_path: requestUrl.pathname,
      },
    });

    redirectUrl.searchParams.set("xAuth", "success");
    redirectUrl.searchParams.set("username", user.username);

    return clearCookies(NextResponse.redirect(redirectUrl));
  } catch (callbackError) {
    console.error("X OAuth callback failed:", callbackError);
    redirectUrl.searchParams.set("xAuth", "error");
    redirectUrl.searchParams.set("reason", "token_exchange_failed");
    return clearCookies(NextResponse.redirect(redirectUrl));
  }
}

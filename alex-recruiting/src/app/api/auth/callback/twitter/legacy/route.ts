import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  X_OAUTH1_REQUEST_SECRET_COOKIE,
  X_OAUTH1_REQUEST_TOKEN_COOKIE,
  X_OAUTH1_RETURN_TO_COOKIE,
  exchangeXOAuth1AccessToken,
  fetchAuthenticatedXLegacyUser,
  sanitizeReturnToPath,
  upsertXLegacyProfileAccount,
} from "@/lib/integrations/x-oauth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const searchParams = requestUrl.searchParams;
  const oauthToken = searchParams.get("oauth_token");
  const oauthVerifier = searchParams.get("oauth_verifier");
  const denied = searchParams.get("denied");
  const cookieStore = await cookies();
  const storedRequestToken = cookieStore.get(X_OAUTH1_REQUEST_TOKEN_COOKIE)?.value;
  const storedRequestSecret = cookieStore.get(X_OAUTH1_REQUEST_SECRET_COOKIE)?.value;
  const returnTo = sanitizeReturnToPath(
    cookieStore.get(X_OAUTH1_RETURN_TO_COOKIE)?.value
  );

  const redirectUrl = new URL(returnTo, requestUrl);

  const clearCookies = (response: NextResponse) => {
    response.cookies.delete(X_OAUTH1_REQUEST_TOKEN_COOKIE);
    response.cookies.delete(X_OAUTH1_REQUEST_SECRET_COOKIE);
    response.cookies.delete(X_OAUTH1_RETURN_TO_COOKIE);
    return response;
  };

  if (denied) {
    redirectUrl.searchParams.set("xLegacyAuth", "error");
    redirectUrl.searchParams.set("reason", "access_denied");
    return clearCookies(NextResponse.redirect(redirectUrl));
  }

  if (!oauthToken || !oauthVerifier) {
    return NextResponse.json(
      { error: "Missing OAuth 1.0a callback parameters" },
      { status: 400 }
    );
  }

  if (!storedRequestToken || oauthToken !== storedRequestToken) {
    return NextResponse.json(
      { error: "Invalid OAuth 1.0a request token" },
      { status: 400 }
    );
  }

  if (!storedRequestSecret) {
    return NextResponse.json(
      { error: "Missing OAuth 1.0a request token secret" },
      { status: 400 }
    );
  }

  try {
    const accessResponse = await exchangeXOAuth1AccessToken({
      oauthToken,
      oauthVerifier,
      requestTokenSecret: storedRequestSecret,
    });

    const user = await fetchAuthenticatedXLegacyUser({
      accessToken: accessResponse.oauth_token,
      accessTokenSecret: accessResponse.oauth_token_secret,
    });

    await upsertXLegacyProfileAccount({
      accessToken: accessResponse.oauth_token,
      accessTokenSecret: accessResponse.oauth_token_secret,
      user,
      metadata: {
        callback_path: requestUrl.pathname,
      },
    });

    redirectUrl.searchParams.set("xLegacyAuth", "success");
    redirectUrl.searchParams.set("legacyUsername", user.username);
    return clearCookies(NextResponse.redirect(redirectUrl));
  } catch (error) {
    console.error("X OAuth 1.0a callback failed:", error);
    redirectUrl.searchParams.set("xLegacyAuth", "error");
    redirectUrl.searchParams.set("reason", "legacy_token_exchange_failed");
    return clearCookies(NextResponse.redirect(redirectUrl));
  }
}

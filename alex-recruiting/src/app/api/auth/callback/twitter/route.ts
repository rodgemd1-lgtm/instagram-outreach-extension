import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code) {
    return NextResponse.json({ error: "No authorization code received" }, { status: 400 });
  }

  // For OAuth 2.0 PKCE flow — exchange code for access token
  // This is used when X redirects back after user authorization
  return NextResponse.json({
    message: "Authorization successful",
    code,
    state,
  });
}

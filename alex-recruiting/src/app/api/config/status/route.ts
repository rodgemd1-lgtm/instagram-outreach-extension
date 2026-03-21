import { NextRequest, NextResponse } from "next/server";
import { getAPIKeyStatus } from "@/lib/config/api-keys";
import { validateEnv } from "@/lib/env-check";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const status = getAPIKeyStatus();
  const configured = status.filter((s) => s.configured).length;
  const total = status.length;

  const env = validateEnv();

  return NextResponse.json({
    summary: `${configured}/${total} services configured`,
    env: {
      valid: env.valid,
      missing: env.missing,
    },
    services: status.map((s) => ({
      service: s.service,
      configured: s.configured,
      description: s.description,
    })),
  });
}

import { NextResponse } from "next/server";
import { getAPIKeyStatus } from "@/lib/config/api-keys";
import { validateEnv } from "@/lib/env-check";

export const dynamic = "force-dynamic";

export async function GET() {
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

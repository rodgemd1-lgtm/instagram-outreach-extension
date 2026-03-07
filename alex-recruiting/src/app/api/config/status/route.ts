import { NextResponse } from "next/server";
import { getAPIKeyStatus } from "@/lib/config/api-keys";

export async function GET() {
  const status = getAPIKeyStatus();
  const configured = status.filter((s) => s.configured).length;
  const total = status.length;

  return NextResponse.json({
    summary: `${configured}/${total} services configured`,
    services: status.map((s) => ({
      service: s.service,
      configured: s.configured,
      description: s.description,
    })),
  });
}

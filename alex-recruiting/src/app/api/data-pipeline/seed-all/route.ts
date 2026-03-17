/**
 * Data Pipeline — Seed All (Master Orchestrator)
 *
 * POST: Runs all 7 seed phases in sequence to fully populate the system.
 * GET:  Returns a status overview of all seed endpoints.
 *
 * Protected by CRON_SECRET via Authorization: Bearer header.
 */

import { NextRequest, NextResponse } from "next/server";
import { seedAll, type SeedPhaseResult } from "@/lib/data-pipeline/seed-orchestrator";

export const dynamic = "force-dynamic";

// ---------- Helpers ----------

function validateAuth(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // no secret configured = allow (dev mode)
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

// ---------- POST Handler ----------

export async function POST(request: NextRequest) {
  if (!validateAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orchestratorStart = Date.now();
  const baseUrl = new URL(request.url).origin;
  const cronSecret = process.env.CRON_SECRET || "";

  const results: SeedPhaseResult[] = await seedAll(baseUrl, cronSecret);

  const succeeded = results.filter((r) => r.status === 200).length;
  const failed = results.filter((r) => r.status !== 200).length;
  const totalDurationMs = Date.now() - orchestratorStart;

  return NextResponse.json({
    ok: failed === 0,
    phases: results,
    totalDurationMs,
    summary: { succeeded, failed },
  });
}

// ---------- GET Handler ----------

export async function GET(request: NextRequest) {
  if (!validateAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const endpoints = [
    {
      phase: "coaches",
      endpoint: "/api/data-pipeline/seed-coaches-expanded",
      description: "Expanded coach roster from 34 target programs",
      expectedRecords: "~150 coaches",
    },
    {
      phase: "intelligence",
      endpoint: "/api/data-pipeline/seed-intelligence",
      description: "Coach behavior signals and recruiting intel",
      expectedRecords: "~100 intelligence entries",
    },
    {
      phase: "content",
      endpoint: "/api/data-pipeline/seed-content",
      description: "Content calendar and post templates",
      expectedRecords: "~60 content pieces",
    },
    {
      phase: "outreach",
      endpoint: "/api/data-pipeline/seed-outreach",
      description: "DM campaigns and outreach sequences",
      expectedRecords: "~40 outreach entries",
    },
    {
      phase: "peers",
      endpoint: "/api/data-pipeline/seed-peers",
      description: "Class of 2029 peer recruit profiles",
      expectedRecords: "~50 peer profiles",
    },
    {
      phase: "tasks",
      endpoint: "/api/data-pipeline/seed-tasks",
      description: "REC team task queue and assignments",
      expectedRecords: "~30 tasks",
    },
    {
      phase: "learnings",
      endpoint: "/api/data-pipeline/seed-learnings",
      description: "4 weeks of outreach learning history",
      expectedRecords: "~28 learning entries",
    },
  ];

  return NextResponse.json({
    status: "ready",
    description: "Master seed orchestrator — POST to run all 7 phases in sequence",
    phases: endpoints,
    usage: "POST /api/data-pipeline/seed-all with Authorization: Bearer <CRON_SECRET>",
  });
}

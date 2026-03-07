import { NextRequest, NextResponse } from "next/server";
import type { DMMessage } from "@/lib/types";

const dmStore: DMMessage[] = [];

export async function GET() {
  const sorted = [...dmStore].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json({ dms: sorted, total: sorted.length });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const dm: DMMessage = {
    id: `dm-${Date.now()}`,
    coachId: body.coachId,
    coachName: body.coachName,
    schoolName: body.schoolName,
    templateType: body.templateType,
    content: body.content,
    status: "drafted",
    sentAt: null,
    respondedAt: null,
    responseContent: null,
    createdAt: new Date().toISOString(),
  };

  dmStore.push(dm);
  return NextResponse.json({ dm }, { status: 201 });
}

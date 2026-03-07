import { NextRequest, NextResponse } from "next/server";
import type { Post, ContentPillar } from "@/lib/types";

// In-memory post store
const postStore: Post[] = [];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const pillar = searchParams.get("pillar");

  let filtered = [...postStore];
  if (status) filtered = filtered.filter((p) => p.status === status);
  if (pillar) filtered = filtered.filter((p) => p.pillar === pillar);

  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ posts: filtered, total: filtered.length });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const post: Post = {
    id: `post-${Date.now()}`,
    content: body.content,
    pillar: body.pillar as ContentPillar,
    hashtags: body.hashtags || [],
    mediaUrl: body.mediaUrl || null,
    scheduledFor: body.scheduledFor || new Date().toISOString(),
    bestTime: body.bestTime || "",
    status: "draft",
    xPostId: null,
    impressions: 0,
    engagements: 0,
    engagementRate: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  postStore.push(post);
  return NextResponse.json({ post }, { status: 201 });
}

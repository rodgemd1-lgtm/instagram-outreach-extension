import { access } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { runProfileAudit, getScoreInterpretation } from "@/lib/alex/profile-audit";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { jacobProfile } from "@/lib/data/jacob-profile";
import { getUserTweets, verifyHandle } from "@/lib/integrations/x-api";
import { getAllPosts } from "@/lib/posts/store";
import type { Coach, DMMessage, Post } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PostRow {
  id: string;
  content: string;
  pillar: Post["pillar"];
  hashtags: string[] | null;
  media_url: string | null;
  scheduled_for: string | null;
  best_time: string | null;
  status: Post["status"];
  x_post_id: string | null;
  impressions: number | null;
  engagements: number | null;
  engagement_rate: number | null;
  created_at: string;
  updated_at: string;
}

interface CoachRow {
  id: string;
  name: string;
  title: string | null;
  school_id: string | null;
  school_name: string;
  division: Coach["division"];
  conference: string | null;
  x_handle: string | null;
  dm_open: boolean | null;
  follow_status: Coach["followStatus"] | null;
  dm_status: Coach["dmStatus"] | null;
  priority_tier: Coach["priorityTier"];
  ol_need_score: number | null;
  x_activity_score: number | null;
  last_engaged: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface DMMessageRow {
  id: string;
  coach_id: string | null;
  coach_name: string;
  school_name: string;
  template_type: string;
  content: string;
  status: DMMessage["status"] | null;
  sent_at: string | null;
  responded_at: string | null;
  response_content: string | null;
  created_at: string;
}

function mapPost(row: PostRow): Post {
  return {
    id: row.id,
    content: row.content,
    pillar: row.pillar,
    hashtags: row.hashtags ?? [],
    mediaUrl: row.media_url,
    scheduledFor: row.scheduled_for ?? "",
    bestTime: row.best_time ?? "",
    status: row.status,
    xPostId: row.x_post_id,
    impressions: row.impressions ?? 0,
    engagements: row.engagements ?? 0,
    engagementRate: row.engagement_rate ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCoach(row: CoachRow): Coach {
  return {
    id: row.id,
    name: row.name,
    title: row.title ?? "",
    schoolId: row.school_id ?? "",
    schoolName: row.school_name,
    division: row.division,
    conference: row.conference ?? "",
    xHandle: row.x_handle ?? "",
    dmOpen: row.dm_open ?? false,
    followStatus: row.follow_status ?? "not_followed",
    dmStatus: row.dm_status ?? "not_sent",
    priorityTier: row.priority_tier,
    olNeedScore: row.ol_need_score ?? 0,
    xActivityScore: row.x_activity_score ?? 0,
    lastEngaged: row.last_engaged,
    notes: row.notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDM(row: DMMessageRow): DMMessage {
  return {
    id: row.id,
    coachId: row.coach_id ?? "",
    coachName: row.coach_name,
    schoolName: row.school_name,
    templateType: row.template_type,
    content: row.content,
    status: row.status ?? "drafted",
    sentAt: row.sent_at,
    respondedAt: row.responded_at,
    responseContent: row.response_content,
    createdAt: row.created_at,
  };
}

function parseDate(value: string | null | undefined): number {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function isAfterThreshold(value: string | null | undefined, threshold: string): boolean {
  return parseDate(value) >= parseDate(threshold);
}

function inferPillarFromText(text: string): Post["pillar"] {
  const normalized = text.toLowerCase();

  if (/(gpa|classroom|community|grateful|leadership|character|student)/.test(normalized)) {
    return "character";
  }

  if (/(workout|weight room|training|bench|squat|recovery|film room|drill|grind)/.test(normalized)) {
    return "work_ethic";
  }

  return "performance";
}

function mapLiveTweetToPost(tweet: {
  id: string;
  text: string;
  created_at: string;
  public_metrics?: {
    like_count?: number;
    retweet_count?: number;
    reply_count?: number;
    impression_count?: number;
  };
}): Post {
  const impressions = tweet.public_metrics?.impression_count ?? 0;
  const engagements =
    (tweet.public_metrics?.like_count ?? 0) +
    (tweet.public_metrics?.retweet_count ?? 0) +
    (tweet.public_metrics?.reply_count ?? 0);

  return {
    id: tweet.id,
    content: tweet.text,
    pillar: inferPillarFromText(tweet.text),
    hashtags: Array.from(tweet.text.matchAll(/#[A-Za-z0-9_]+/g), (match) => match[0]),
    mediaUrl: null,
    scheduledFor: tweet.created_at,
    bestTime: "",
    status: "posted",
    xPostId: tweet.id,
    impressions,
    engagements,
    engagementRate: impressions > 0 ? (engagements / impressions) * 100 : 0,
    createdAt: tweet.created_at,
    updatedAt: tweet.created_at,
  };
}

function mergePosts(primary: Post[], secondary: Post[]): Post[] {
  const merged = [...primary];
  const seen = new Set(merged.map((post) => post.id));

  for (const post of secondary) {
    if (seen.has(post.id)) continue;
    merged.push(post);
    seen.add(post.id);
  }

  return merged.sort((a, b) => parseDate(b.createdAt) - parseDate(a.createdAt));
}

async function hasGeneratedHeader(): Promise<boolean> {
  try {
    await access(path.join(process.cwd(), "public", "header-image.png"));
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  let storedPostsLast30Days: Post[] = getAllPosts().filter((post) =>
    isAfterThreshold(post.createdAt, thirtyDaysAgo)
  );
  let coaches: Coach[] = [];
  let dmsLast30Days: DMMessage[] = [];

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();

    const [postsResponse, coachesResponse, dmsResponse] = await Promise.all([
      supabase.from("posts").select("*").gte("created_at", thirtyDaysAgo),
      supabase.from("coaches").select("*"),
      supabase.from("dm_messages").select("*").gte("created_at", thirtyDaysAgo),
    ]);

    const supabasePosts = ((postsResponse.data ?? []) as PostRow[]).map(mapPost);
    storedPostsLast30Days = mergePosts(supabasePosts, storedPostsLast30Days);
    coaches = ((coachesResponse.data ?? []) as CoachRow[]).map(mapCoach);
    dmsLast30Days = ((dmsResponse.data ?? []) as DMMessageRow[]).map(mapDM);
  }

  const headerImage = await hasGeneratedHeader();
  const xUser = await verifyHandle(jacobProfile.xHandle.replace("@", ""));
  const liveTweets =
    xUser?.id
      ? (await getUserTweets(xUser.id, 30))
          .filter((tweet) => isAfterThreshold(tweet.created_at, thirtyDaysAgo))
          .map(mapLiveTweetToPost)
      : [];
  const postsLast30Days = liveTweets.length > 0 ? liveTweets : storedPostsLast30Days;
  const hasProfilePhoto = Boolean(xUser?.profile_image_url);
  const bioText = xUser?.description ?? jacobProfile.bio;
  const hasRecruitingLink = Boolean(jacobProfile.ncsaProfileUrl || jacobProfile.hudlUrl || jacobProfile.websiteUrl);
  const bioHasAllElements = Boolean(
    bioText &&
      bioText.includes("OL") &&
      bioText.includes("Pewaukee") &&
      bioText.includes("29") &&
      hasRecruitingLink
  );

  const audit = runProfileAudit({
    hasProfilePhoto,
    hasHeaderImage: headerImage,
    bioHasAllElements,
    hasPinnedPost: Boolean(xUser?.pinned_tweet_id),
    pinnedPostAge: 0,
    postsLast30Days,
    coaches,
    dmsLast30Days,
    constitutionViolations: 0,
  });

  const interpretation = getScoreInterpretation(audit.totalScore);
  const queuedPosts = storedPostsLast30Days.filter((post) => post.status !== "posted");
  const approvedPosts = storedPostsLast30Days.filter(
    (post) => post.status === "approved" || post.status === "scheduled"
  );
  const coachesWithHandles = coaches.filter((coach) => coach.xHandle).length;
  const coachesReadyForDM = coaches.filter(
    (coach) => coach.xHandle && coach.dmStatus !== "responded"
  ).length;

  return NextResponse.json({
    audit,
    interpretation,
    systemReadiness: {
      liveTweetsLast30Days: liveTweets.length,
      queuedPosts: queuedPosts.length,
      approvedPosts: approvedPosts.length,
      coachesInDatabase: coaches.length,
      coachesWithXHandles: coachesWithHandles,
      coachesReadyForDM,
      dmsLoggedLast30Days: dmsLast30Days.length,
      headerImageReady: headerImage,
      usingLiveXData: liveTweets.length > 0,
    },
  });
}

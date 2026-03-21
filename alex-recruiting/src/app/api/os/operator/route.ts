import { NextRequest, NextResponse } from "next/server";
import { autoFollowCoaches } from "@/lib/growth/auto-engage";
import { jacobProfile } from "@/lib/data/jacob-profile";
import { FIVE_YEAR_FUTURE_BACK } from "@/lib/strategy/future-back";
import type { Coach, Post } from "@/lib/types";
import type {
  OSBriefingResponse,
  OSOperatorCard,
  OSOperatorResponse,
} from "@/lib/os/types";

export const dynamic = "force-dynamic";

interface PostsResponse {
  posts?: Post[];
}

interface CoachesResponse {
  coaches?: Coach[];
}

type BriefingResponse = OSBriefingResponse;

function validateOperatorAuth(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return request.headers.get("authorization") === `Bearer ${cronSecret}`;
}

function normalizeCommand(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

async function fetchJson<T>(
  req: NextRequest,
  path: string,
  fallback: T
): Promise<T> {
  try {
    const response = await fetch(new URL(path, req.url), { cache: "no-store" });
    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

async function postJson<T>(
  req: NextRequest,
  path: string,
  body?: Record<string, unknown>
): Promise<{ ok: boolean; status: number; data: T | Record<string, unknown> }> {
  try {
    const response = await fetch(new URL(path, req.url), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = (await response.json().catch(() => ({}))) as T | Record<string, unknown>;
    return { ok: response.ok, status: response.status, data };
  } catch {
    return { ok: false, status: 500, data: {} };
  }
}

function includesAny(input: string, values: string[]): boolean {
  return values.some((value) => input.includes(value));
}

function toCoachCards(coaches: Coach[]): OSOperatorCard[] {
  return coaches.slice(0, 3).map((coach) => ({
    id: coach.id,
    title: coach.name,
    detail: `${coach.schoolName} · ${coach.title || "Coach pipeline"}`,
    meta: coach.xHandle || "Needs handle enrichment",
    href: "/coaches",
    hrefLabel: "Open pipeline",
  }));
}

function buildDraftMessage(coach: Coach, origin: string): string {
  const firstName = coach.name.split(" ")[0] || "Coach";
  const link = jacobProfile.ncsaProfileUrl || jacobProfile.hudlUrl || `${origin}/recruit`;

  return [
    `${firstName}, Jacob Rodgers here.`,
    `I'm a Class of ${jacobProfile.classYear} ${jacobProfile.position} from ${jacobProfile.school} in ${jacobProfile.city}, ${jacobProfile.state}.`,
    `Wanted to share my recruiting profile and latest film: ${link}`,
    "Appreciate you taking a look.",
  ].join(" ");
}

function routeFromCommand(input: string): string | null {
  if (includesAny(input, ["post", "publish", "queue", "tweet"])) return "/posts";
  if (includesAny(input, ["coach", "pipeline", "follow target"])) return "/coaches";
  if (includesAny(input, ["dm", "message", "outreach"])) return "/dms";
  if (includesAny(input, ["media", "reel", "photo", "video"])) return "/media-lab";
  if (includesAny(input, ["intelligence", "research"])) return "/intelligence";
  if (includesAny(input, ["studio", "profile", "banner", "header"])) return "/profile-studio";
  if (includesAny(input, ["future-back", "future back", "strategos", "innovation studio", "five year"])) return "/intelligence";
  if (includesAny(input, ["website", "site", "recruit page"])) return "/recruit";
  return null;
}

export async function POST(req: NextRequest) {
  if (!validateOperatorAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const command = normalizeCommand(body.command);
  const lower = command.toLowerCase();

  if (!command) {
    return NextResponse.json(
      { status: "error", message: "Give the operator a command to run." } satisfies OSOperatorResponse,
      { status: 400 }
    );
  }

  if (
    includesAny(lower, ["what should i do", "what do i do", "today", "priorit", "next step"])
  ) {
    const briefing = await fetchJson<BriefingResponse>(req, "/api/os/briefing", {
      generatedAt: new Date().toISOString(),
      headline: "The operator could not load your daily brief.",
      summary: "Open the dashboard and refresh the briefing.",
      metrics: [],
      priorities: [],
      workflows: [],
      activity: [],
      operatorPrompts: [],
      team: [],
    });

    const cards = briefing.priorities.slice(0, 3).map((priority) => ({
      id: priority.id,
      title: priority.title,
      detail: priority.summary,
      meta: priority.detail,
      href: priority.href,
      hrefLabel: priority.actionKind === "link" ? priority.actionLabel : "Open room",
      command: priority.command,
      commandLabel: priority.actionKind === "operator" ? priority.actionLabel : undefined,
    }));

    return NextResponse.json({
      status: "info",
      message: `${briefing.headline} ${briefing.summary}`,
      cards,
      followUpPrompts: briefing.operatorPrompts,
    } satisfies OSOperatorResponse);
  }

  if (includesAny(lower, ["future-back", "future back", "strategos", "innovation studio", "five year"])) {
    return NextResponse.json({
      status: "info",
      message: `${FIVE_YEAR_FUTURE_BACK.title}: ${FIVE_YEAR_FUTURE_BACK.northStar}`,
      cards: [
        ...FIVE_YEAR_FUTURE_BACK.horizons.slice(0, 2).map((horizon) => ({
          id: horizon.id,
          title: horizon.horizon,
          detail: horizon.headline,
          meta: horizon.outcome,
          href: "/intelligence",
          hrefLabel: "Open future-back lens",
        })),
        {
          id: "future-back-next-90",
          title: "Next 90 days",
          detail: FIVE_YEAR_FUTURE_BACK.next90Days[0] ?? "Finish the next capability bet.",
          meta: "Reverse-engineered from the 2031 destination",
          href: "/intelligence",
          hrefLabel: "Open intelligence room",
        },
      ],
      followUpPrompts: ["What should I do today?", "Open intelligence room", "Show follow targets"],
      focusPath: "/intelligence",
    } satisfies OSOperatorResponse);
  }

  if (includesAny(lower, ["approve"]) && includesAny(lower, ["post", "draft", "tweet"])) {
    const postsData = await fetchJson<PostsResponse>(req, "/api/posts?status=draft", {});
    const nextPost = postsData.posts?.[0];

    if (!nextPost) {
      return NextResponse.json({
        status: "warning",
        message: "There are no draft posts waiting for approval right now.",
        followUpPrompts: ["What should I do today?", "Show follow targets"],
        focusPath: "/posts",
      } satisfies OSOperatorResponse);
    }

    const approval = await postJson(req, `/api/posts/${nextPost.id}/approve`);
    if (!approval.ok) {
      const errorMessage =
        typeof approval.data === "object" &&
        approval.data &&
        "error" in approval.data &&
        typeof approval.data.error === "string"
          ? approval.data.error
          : "The post could not be approved.";

      return NextResponse.json(
        { status: "error", message: errorMessage, focusPath: "/posts" } satisfies OSOperatorResponse,
        { status: 502 }
      );
    }

    return NextResponse.json({
      status: "success",
      message: "The next draft is approved and waiting in the publishing queue.",
      cards: [
        {
          id: nextPost.id,
          title: "Approved post",
          detail: nextPost.content.slice(0, 140),
          meta: nextPost.bestTime || "Best time pending",
          href: "/posts",
          hrefLabel: "Open queue",
          command: "send the approved post",
          commandLabel: "Send it now",
        },
      ],
      followUpPrompts: ["Send the approved post", "What should I do today?"],
      focusPath: "/posts",
    } satisfies OSOperatorResponse);
  }

  if (includesAny(lower, ["send", "publish"]) && includesAny(lower, ["post", "tweet"])) {
    const postsData = await fetchJson<PostsResponse>(req, "/api/posts?status=approved", {});
    const nextPost = postsData.posts?.[0];

    if (!nextPost) {
      return NextResponse.json({
        status: "warning",
        message: "There is no approved post ready to publish yet. Approve the next draft first.",
        followUpPrompts: ["Approve the next post", "What should I do today?"],
        focusPath: "/posts",
      } satisfies OSOperatorResponse);
    }

    const sent = await postJson<{ tweetUrl?: string }>(req, `/api/posts/${nextPost.id}/send`, {
      text: nextPost.content,
      mediaUrl: nextPost.mediaUrl,
    });

    if (!sent.ok) {
      const errorMessage =
        typeof sent.data === "object" &&
        sent.data &&
        "error" in sent.data &&
        typeof sent.data.error === "string"
          ? sent.data.error
          : "Publishing to X failed.";

      return NextResponse.json(
        { status: "error", message: errorMessage, focusPath: "/posts" } satisfies OSOperatorResponse,
        { status: 502 }
      );
    }

    const tweetUrl =
      typeof sent.data === "object" &&
      sent.data &&
      "tweetUrl" in sent.data &&
      typeof sent.data.tweetUrl === "string"
        ? sent.data.tweetUrl
        : undefined;

    return NextResponse.json({
      status: "success",
      message: tweetUrl
        ? `The approved post is live on X.`
        : "The approved post was sent to X.",
      cards: [
        {
          id: nextPost.id,
          title: "Published post",
          detail: nextPost.content.slice(0, 140),
          meta: tweetUrl ?? "Live on X",
          href: tweetUrl,
          hrefLabel: tweetUrl ? "Open live post" : "Open X",
        },
      ],
      followUpPrompts: ["What should I do today?", "Draft the next DM"],
      focusPath: "/posts",
    } satisfies OSOperatorResponse);
  }

  if (
    includesAny(lower, ["draft"]) &&
    includesAny(lower, ["dm", "message", "outreach"])
  ) {
    const coachesData = await fetchJson<CoachesResponse>(req, "/api/coaches", {});
    const coach =
      (coachesData.coaches ?? [])
        .filter((candidate) => Boolean(candidate.xHandle) && candidate.dmStatus !== "sent")
        .sort((a, b) => b.olNeedScore + b.xActivityScore - (a.olNeedScore + a.xActivityScore))[0] ??
      null;

    if (!coach) {
      return NextResponse.json({
        status: "warning",
        message: "There is not a clean DM-ready coach record yet. Tighten handles and coach priority first.",
        cards: toCoachCards((coachesData.coaches ?? []).slice(0, 3)),
        followUpPrompts: ["Show follow targets", "Open the coach pipeline"],
        focusPath: "/coaches",
      } satisfies OSOperatorResponse);
    }

    const origin = new URL(req.url).origin;
    const draft = await postJson<{ dm?: { id?: string } }>(req, "/api/dms", {
      coachId: coach.id,
      coachName: coach.name,
      schoolName: coach.schoolName,
      templateType: "operator_draft",
      content: buildDraftMessage(coach, origin),
      sendNow: false,
    });

    if (!draft.ok) {
      return NextResponse.json(
        {
          status: "error",
          message: "The operator could not create the DM draft.",
          focusPath: "/dms",
        } satisfies OSOperatorResponse,
        { status: 502 }
      );
    }

    return NextResponse.json({
      status: "success",
      message: `A DM draft is ready for ${coach.name} at ${coach.schoolName}.`,
      cards: [
        {
          id: coach.id,
          title: coach.name,
          detail: coach.schoolName,
          meta: coach.xHandle,
          href: "/dms",
          hrefLabel: "Open drafts",
        },
      ],
      followUpPrompts: ["Open the coach pipeline", "What should I do today?"],
      focusPath: "/dms",
    } satisfies OSOperatorResponse);
  }

  if (includesAny(lower, ["follow target", "growth target", "show targets", "who should i follow"])) {
    const growthData = await fetchJson<{ targets?: Array<{ handle: string; name: string; engagementTip?: string; reason?: string; priority: string }> }>(
      req,
      "/api/growth/targets?limit=5",
      {}
    );

    const cards =
      (growthData.targets ?? []).slice(0, 4).map((target) => ({
        id: target.handle,
        title: `${target.name} ${target.handle}`,
        detail: target.engagementTip ?? target.reason ?? "Review this target in the growth room.",
        meta: `${target.priority} priority`,
        href: "/connections",
        hrefLabel: "Open targets",
      })) ?? [];

    return NextResponse.json({
      status: "info",
      message:
        cards.length > 0
          ? "These are the best live follow targets right now."
          : "There are no strong live targets to review right now.",
      cards,
      followUpPrompts: ["Follow three coaches", "Open the coach pipeline"],
      focusPath: "/connections",
    } satisfies OSOperatorResponse);
  }

  if (includesAny(lower, ["follow"]) && includesAny(lower, ["coach", "target"])) {
    const result = await autoFollowCoaches(3);
    const successful = result.details.filter((item) => item.status === "followed");

    return NextResponse.json({
      status: successful.length > 0 ? "success" : "warning",
      message:
        successful.length > 0
          ? `Followed ${successful.length} coach${successful.length === 1 ? "" : "es"} from the live database.`
          : "No coaches were followed. Review the coach pipeline and X handle quality first.",
      cards: successful.slice(0, 3).map((item, index) => ({
        id: `${item.coach}-${index}`,
        title: item.coach,
        detail: item.school,
        meta: item.status,
        href: "/coaches",
        hrefLabel: "Open pipeline",
      })),
      followUpPrompts: ["Show follow targets", "What should I do today?"],
      focusPath: "/coaches",
    } satisfies OSOperatorResponse);
  }

  if (includesAny(lower, ["header", "banner"])) {
    const banner = await postJson<{ uploadMessage?: string }>(req, "/api/profile/header?upload=true");

    if (!banner.ok) {
      const errorMessage =
        typeof banner.data === "object" &&
        banner.data &&
        "error" in banner.data &&
        typeof banner.data.error === "string"
          ? banner.data.error
          : "The banner upload failed.";

      return NextResponse.json(
        { status: "error", message: errorMessage, focusPath: "/profile-studio" } satisfies OSOperatorResponse,
        { status: 502 }
      );
    }

    const uploadMessage =
      typeof banner.data === "object" &&
      banner.data &&
      "uploadMessage" in banner.data &&
      typeof banner.data.uploadMessage === "string"
        ? banner.data.uploadMessage
        : "The current header was uploaded to X.";

    return NextResponse.json({
      status: "success",
      message: uploadMessage,
      followUpPrompts: ["What should I do today?", "Open design studio"],
      focusPath: "/profile-studio",
    } satisfies OSOperatorResponse);
  }

  const focusPath = routeFromCommand(lower);
  if (focusPath) {
    return NextResponse.json({
      status: "info",
      message: `Opening the right workspace for "${command}".`,
      focusPath,
      followUpPrompts: ["What should I do today?", "Show follow targets"],
    } satisfies OSOperatorResponse);
  }

  return NextResponse.json({
    status: "info",
    message:
      "The operator can handle today’s brief, post approvals, live publishing, DM drafting, follow-target review, coach follows, and header uploads right now.",
    followUpPrompts: [
      "What should I do today?",
      "Approve the next post",
      "Send the approved post",
      "Draft the next DM",
      "Show follow targets",
      "Show the future-back plan",
    ],
  } satisfies OSOperatorResponse);
}

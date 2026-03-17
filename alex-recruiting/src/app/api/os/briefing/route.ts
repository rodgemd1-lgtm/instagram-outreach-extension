import { NextRequest, NextResponse } from "next/server";
import type { Coach, DMMessage, Post } from "@/lib/types";
import type { RecTask } from "@/lib/rec/types";
import { SUSAN_FULL_STUDIO } from "@/lib/media-lab/team";
import type {
  OSActivityItem,
  OSBriefingResponse,
  OSMetric,
  OSPriority,
  OSTeamSpotlight,
  OSWorkflow,
} from "@/lib/os/types";

export const dynamic = "force-dynamic";

interface AuditResponse {
  audit?: {
    totalScore?: number;
    recommendations?: string[];
  };
  interpretation?: {
    label?: string;
  };
  systemReadiness?: {
    queuedPosts?: number;
    approvedPosts?: number;
    coachesInDatabase?: number;
    coachesReadyForDM?: number;
    liveTweetsLast30Days?: number;
  };
}

interface PostsResponse {
  posts?: Post[];
}

interface CoachesResponse {
  coaches?: Coach[];
}

interface DMsResponse {
  dms?: DMMessage[];
}

interface TasksResponse {
  tasks?: RecTask[];
}

interface GrowthTarget {
  handle: string;
  name: string;
  priority: "high" | "medium" | "low";
  rating?: number;
  relevanceScore?: number;
  engagementTip?: string;
  reason?: string;
}

interface GrowthResponse {
  targets?: GrowthTarget[];
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

function formatDateLabel(value: string | null | undefined): string {
  if (!value) return "Just now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function topTeamSpotlights(): OSTeamSpotlight[] {
  const spotlightOrder = [
    "susan",
    "strategos",
    "nova",
    "marcus",
    "prism",
    "lens",
    "dashboard",
    "trey",
  ];

  return SUSAN_FULL_STUDIO.filter((member) => spotlightOrder.includes(member.id))
    .sort((a, b) => spotlightOrder.indexOf(a.id) - spotlightOrder.indexOf(b.id))
    .map((member) => ({
    id: member.id,
    name: member.name,
    role: member.role,
    ownership: member.owns[0] ?? member.role,
    note: member.background,
    }));
}

export async function GET(req: NextRequest) {
  const [auditData, postsData, coachesData, dmsData, tasksData, growthData] =
    await Promise.all([
      fetchJson<AuditResponse>(req, "/api/audit", {}),
      fetchJson<PostsResponse>(req, "/api/posts", {}),
      fetchJson<CoachesResponse>(req, "/api/coaches", {}),
      fetchJson<DMsResponse>(req, "/api/dms", {}),
      fetchJson<TasksResponse>(req, "/api/rec/tasks", {}),
      fetchJson<GrowthResponse>(req, "/api/growth/targets?limit=6", {}),
    ]);

  const posts = postsData.posts ?? [];
  const coaches = coachesData.coaches ?? [];
  const dms = dmsData.dms ?? [];
  const tasks = tasksData.tasks ?? [];
  const targets = growthData.targets ?? [];

  const draftPosts = posts.filter((post) => post.status === "draft");
  const approvedPosts = posts.filter((post) => post.status === "approved");
  const postedPosts = posts.filter((post) => post.status === "posted");
  const dmReadyCoaches = coaches
    .filter((coach) => Boolean(coach.xHandle) && coach.dmStatus !== "sent")
    .sort((a, b) => b.olNeedScore + b.xActivityScore - (a.olNeedScore + a.xActivityScore));
  const openTasks = [...tasks]
    .filter((task) => task.status !== "completed")
    .sort((a, b) => a.priority - b.priority);
  const highTargets = targets.filter((target) => target.priority === "high");
  const queuedPosts = auditData.systemReadiness?.queuedPosts ?? draftPosts.length + approvedPosts.length;
  const coachesReadyForDM = auditData.systemReadiness?.coachesReadyForDM ?? dmReadyCoaches.length;
  const liveTweetsLast30Days =
    auditData.systemReadiness?.liveTweetsLast30Days ?? postedPosts.length;
  const auditScore = auditData.audit?.totalScore ?? null;
  const auditLabel = auditData.interpretation?.label ?? "Unscored";

  const metrics: OSMetric[] = [
    {
      label: "Focus score",
      value: auditScore == null ? "—" : `${auditScore}/10`,
      detail: auditLabel,
    },
    {
      label: "Posts ready",
      value: `${approvedPosts.length}`,
      detail: `${draftPosts.length} more need review`,
    },
    {
      label: "Coach moves",
      value: `${coachesReadyForDM}`,
      detail: `${highTargets.length} high-value follow targets`,
    },
    {
      label: "Open tasks",
      value: `${openTasks.length}`,
      detail: `${liveTweetsLast30Days} live X posts in 30 days`,
    },
  ];

  const priorities: OSPriority[] = [];

  if (approvedPosts.length > 0) {
    priorities.push({
      id: "send-approved-post",
      title: "Send the next approved post",
      summary: "There is already an approved X post in queue. Publishing it is the fastest momentum move today.",
      detail: approvedPosts[0]?.content.slice(0, 120) ?? "Approved post waiting in queue.",
      status: "ready",
      command: "send the approved post",
      href: "/posts",
      actionLabel: "Publish now",
      actionKind: "operator",
    });
  } else if (draftPosts.length > 0) {
    priorities.push({
      id: "approve-next-post",
      title: "Approve the next draft",
      summary: "You already have draft content. One review decision unlocks the posting workflow.",
      detail: draftPosts[0]?.content.slice(0, 120) ?? "Draft ready for approval.",
      status: "ready",
      command: "approve the next post",
      href: "/posts",
      actionLabel: "Approve next draft",
      actionKind: "operator",
    });
  } else {
    priorities.push({
      id: "build-next-posts",
      title: "Refresh content creation",
      summary: "The queue is empty, so the next move is generating or curating fresh media-backed posts.",
      detail: "Move into Media Lab and build the next round of X-ready drafts.",
      command: "what should I do today?",
      href: "/media-lab",
      actionLabel: "Open media lab",
      actionKind: "link",
      status: "attention",
    });
  }

  if (dmReadyCoaches.length > 0) {
    priorities.push({
      id: "draft-next-dm",
      title: "Draft outreach for the next coach",
      summary: "The app already has coach records with enough signal to start a direct outreach draft.",
      detail: `${dmReadyCoaches[0].name} at ${dmReadyCoaches[0].schoolName} is the best next outreach move.`,
      status: "ready",
      command: "draft the next dm",
      href: "/dms",
      actionLabel: "Draft outreach",
      actionKind: "operator",
    });
  } else {
    priorities.push({
      id: "review-coach-pipeline",
      title: "Strengthen the coach pipeline",
      summary: "There are not enough DM-ready coaches yet, so the next move is enrichment and prioritization.",
      detail: `${coaches.length} coaches are in the database. Tighten handles, priorities, and next actions.`,
      status: "attention",
      href: "/coaches",
      actionLabel: "Open coach pipeline",
      actionKind: "link",
    });
  }

  if (highTargets.length > 0) {
    priorities.push({
      id: "review-follow-targets",
      title: "Review high-value follow targets",
      summary: "Follower growth should come from accounts that matter to recruiting, not generic audience volume.",
      detail: `${highTargets[0].name} ${highTargets[0].handle} is one of ${highTargets.length} high-value targets right now.`,
      status: "ready",
      command: "show follow targets",
      href: "/connections",
      actionLabel: "See top targets",
      actionKind: "operator",
    });
  } else {
    priorities.push({
      id: "check-system-health",
      title: "Check the system and audit blockers",
      summary: "If there is no clean growth target list, the most useful move is reviewing system health and blocked workflows.",
      detail: (auditData.audit?.recommendations ?? [])[0] ?? "Review the live audit for missing recruiting inputs.",
      status: "attention",
      href: "/audit",
      actionLabel: "Open audit",
      actionKind: "link",
    });
  }

  if (openTasks.length > 0) {
    priorities.push({
      id: "highest-priority-task",
      title: openTasks[0].title,
      summary: "This is the highest-priority structured task in the recruiting system right now.",
      detail: openTasks[0].description || "Open the task system and move this forward.",
      status: "attention",
      href: "/agency",
      actionLabel: "Open task board",
      actionKind: "link",
    });
  }

  const workflows: OSWorkflow[] = [
    {
      id: "publish",
      title: "Publishing",
      summary: "Move one post from queue to X without hunting for the right screen.",
      metric: `${queuedPosts} queued`,
      href: "/posts",
      hrefLabel: "Open post queue",
      command: approvedPosts.length > 0 ? "send the approved post" : "approve the next post",
      actionLabel: approvedPosts.length > 0 ? "Publish now" : "Approve next",
      actionKind: "operator",
      steps: [
        { label: "Review", detail: `${draftPosts.length} drafts are waiting for judgment.` },
        { label: "Approve", detail: `${approvedPosts.length} posts are approved and ready to move.` },
        { label: "Publish", detail: "Send the approved post straight to X." },
      ],
    },
    {
      id: "outreach",
      title: "Outreach",
      summary: "Turn the coach list into a next conversation, not just a database.",
      metric: `${coachesReadyForDM} DM-ready`,
      href: "/dms",
      hrefLabel: "Open outreach room",
      command: dmReadyCoaches.length > 0 ? "draft the next dm" : undefined,
      actionLabel: dmReadyCoaches.length > 0 ? "Draft next DM" : "Review coaches",
      actionKind: dmReadyCoaches.length > 0 ? "operator" : "link",
      steps: [
        { label: "Pick", detail: `${coaches.length} coaches are in the pipeline.` },
        { label: "Draft", detail: "Generate the next respectful, concise outreach note." },
        { label: "Track", detail: `${dms.length} DM records are already logged.` },
      ],
    },
    {
      id: "growth",
      title: "Growth",
      summary: "Work follower growth as recruiting visibility, not vanity metrics.",
      metric: `${highTargets.length} high-priority targets`,
      href: "/connections",
      hrefLabel: "Open growth targets",
      command: "show follow targets",
      actionLabel: "Review targets",
      actionKind: "operator",
      steps: [
        { label: "Scan", detail: `${targets.length} live targets are available to review.` },
        { label: "Follow", detail: "Move only on accounts worth a coach noticing." },
        { label: "Measure", detail: `${liveTweetsLast30Days} live posts are shaping the surface coaches see.` },
      ],
    },
  ];

  const activity: OSActivityItem[] = [];

  if (postedPosts[0]) {
    activity.push({
      id: `post-${postedPosts[0].id}`,
      label: "Latest live post",
      detail: postedPosts[0].content.slice(0, 100),
      timeLabel: formatDateLabel(postedPosts[0].createdAt),
    });
  }

  if (dms[0]) {
    activity.push({
      id: `dm-${dms[0].id}`,
      label: `Last DM ${dms[0].status}`,
      detail: `${dms[0].coachName} · ${dms[0].schoolName}`,
      timeLabel: formatDateLabel(dms[0].createdAt),
    });
  }

  if (openTasks[0]) {
    activity.push({
      id: `task-${openTasks[0].id}`,
      label: "Highest-priority task",
      detail: openTasks[0].title,
      timeLabel: formatDateLabel(openTasks[0].createdAt),
    });
  }

  if (highTargets[0]) {
    activity.push({
      id: `target-${highTargets[0].handle}`,
      label: "Top growth target",
      detail: `${highTargets[0].name} ${highTargets[0].handle}`,
      timeLabel: "Live discovery",
    });
  }

  const response: OSBriefingResponse = {
    generatedAt: new Date().toISOString(),
    headline:
      priorities[0]?.title ??
      "The system is live, but it needs a clear operator-led next move.",
    summary:
      approvedPosts.length > 0
        ? "Start by publishing the approved post, then move into outreach and growth."
        : "The fastest path today is to review one decision, turn it into action, and let the operator move the system forward.",
    metrics,
    priorities: priorities.slice(0, 4),
    workflows,
    activity: activity.slice(0, 4),
    operatorPrompts: [
      "What should I do today?",
      approvedPosts.length > 0 ? "Send the approved post" : "Approve the next post",
      dmReadyCoaches.length > 0 ? "Draft the next DM" : "Show DM-ready coaches",
      "Show follow targets",
      "Show the future-back plan",
      "Upload the header to X",
    ],
    team: topTeamSpotlights(),
  };

  return NextResponse.json(response);
}

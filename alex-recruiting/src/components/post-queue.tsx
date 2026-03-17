"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  Check,
  Clock,
  Edit3,
  Image as ImageIcon,
  RefreshCw,
  Send,
  X,
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { dispatchOperatorCommand } from "@/lib/os/operator-client";
import type { Post } from "@/lib/types";
import { cn, formatDate, getPillarLabel } from "@/lib/utils";

function mediaLabel(mediaUrl: string | null): string | null {
  if (!mediaUrl) return null;
  return mediaUrl.includes("/api/videos/serve") ? "Video attached" : "Photo attached";
}

const statusOrder: Record<Post["status"], number> = {
  approved: 0,
  draft: 1,
  scheduled: 2,
  posted: 3,
  rejected: 4,
};

export function PostQueue() {
  const [drafts, setDrafts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDrafts = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load posts");
      }

      setDrafts(data.posts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDrafts();
  }, [fetchDrafts]);

  async function refreshQueue() {
    setRefreshing(true);
    await fetchDrafts();
    setRefreshing(false);
  }

  async function handleApprove(id: string) {
    setActionId(id);

    try {
      const res = await fetch(`/api/posts/${id}/approve`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to approve post");
      }

      setDrafts((prev) => prev.map((draft) => (draft.id === id ? { ...draft, status: "approved" } : draft)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve post");
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(id: string) {
    setActionId(id);

    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reject post");
      }

      setDrafts((prev) => prev.map((draft) => (draft.id === id ? { ...draft, status: "rejected" } : draft)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject post");
    } finally {
      setActionId(null);
    }
  }

  async function handleSend(post: Post) {
    setActionId(post.id);

    try {
      const res = await fetch(`/api/posts/${post.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: post.content,
          mediaUrl: post.mediaUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send post to X");
      }

      setDrafts((prev) =>
        prev.map((draft) =>
          draft.id === post.id
            ? {
                ...draft,
                status: "posted",
                xPostId: data.tweetId ?? draft.xPostId,
              }
            : draft
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send post to X");
    } finally {
      setActionId(null);
    }
  }

  function handleEdit(id: string, content: string) {
    setEditingId(id);
    setEditContent(content);
  }

  async function saveEdit(id: string) {
    setActionId(id);

    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save post");
      }

      setDrafts((prev) =>
        prev.map((draft) => (draft.id === id ? { ...draft, content: editContent } : draft))
      );
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save post");
    } finally {
      setActionId(null);
    }
  }

  const orderedDrafts = useMemo(
    () =>
      [...drafts].sort((a, b) => {
        const statusDelta = statusOrder[a.status] - statusOrder[b.status];
        if (statusDelta !== 0) return statusDelta;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }),
    [drafts]
  );

  const reviewPosts = orderedDrafts.filter((post) => post.status === "draft");
  const approvedPosts = orderedDrafts.filter((post) => post.status === "approved");
  const postedPosts = orderedDrafts.filter((post) => post.status === "posted");
  const rejectedPosts = orderedDrafts.filter((post) => post.status === "rejected");
  const nextDraft = reviewPosts[0] ?? null;
  const nextApproved = approvedPosts[0] ?? null;

  const nextAction = nextApproved
    ? {
        title: "Send the approved post",
        detail: "A post is already approved. Publish it now and then return for the next decision.",
        label: "Publish now",
        command: "Send the approved post",
      }
    : nextDraft
      ? {
          title: "Review the next draft",
          detail: "One approval unlocks the next publishing move. Tighten the copy and approve it.",
          label: "Approve next draft",
          command: "Approve the next post",
        }
      : {
          title: "Generate the next post set",
          detail: "The queue is empty. Go to Media Lab to build more media-backed drafts.",
          label: "Open Media Lab",
          command: "What should I do today?",
        };

  const publishStats = [
    {
      label: "Step 1",
      title: "Review",
      value: `${reviewPosts.length}`,
      detail: nextDraft ? "Drafts are waiting for judgment." : "No drafts are waiting right now.",
      active: !nextApproved,
    },
    {
      label: "Step 2",
      title: "Approve",
      value: `${approvedPosts.length}`,
      detail: nextApproved ? "Approved posts are ready to go live." : "Approve one draft to unlock this step.",
      active: Boolean(nextApproved),
    },
    {
      label: "Step 3",
      title: "Publish",
      value: `${postedPosts.length}`,
      detail: "Live posts become proof that the system is moving.",
      active: Boolean(nextApproved),
    },
  ];

  function pillarColor(pillar: string) {
    switch (pillar) {
      case "performance":
        return "performance";
      case "work_ethic":
        return "work_ethic";
      case "character":
        return "character";
      default:
        return "secondary";
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="shell-panel-strong overflow-hidden px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="shell-kicker">
              <Bot className="h-3.5 w-3.5" />
              Operator-led publishing
            </span>
            <Badge className="border-[rgba(15,40,75,0.1)] bg-white/70 text-[var(--app-navy-strong)] hover:bg-white/70">
              Real X queue
            </Badge>
          </div>

          <div className="mt-4 max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--app-navy-strong)]">
              This room should make one thing obvious: what to publish next.
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--app-muted)] sm:text-base">
              Review the next draft, approve it if it strengthens Jacob&apos;s recruiting story, then send the approved post to X. The operator can also do those moves for you from this same screen.
            </p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {publishStats.map((step) => (
              <div
                key={step.label}
                className={cn(
                  "rounded-[24px] border p-4 transition-transform duration-200",
                  step.active
                    ? "border-[rgba(15,40,75,0.16)] bg-[linear-gradient(145deg,rgba(15,40,75,0.98),rgba(10,28,53,0.94))] text-white shadow-[0_20px_46px_rgba(15,40,75,0.18)]"
                    : "border-[rgba(15,40,75,0.08)] bg-white/80 text-[var(--app-navy-strong)]"
                )}
              >
                <p className={cn("text-[11px] font-semibold uppercase tracking-[0.18em]", step.active ? "text-[var(--app-gold-soft)]" : "text-[var(--app-muted)]")}>
                  {step.label}
                </p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">{step.title}</p>
                    <p className={cn("mt-2 text-sm leading-6", step.active ? "text-white/72" : "text-[var(--app-muted)]")}>
                      {step.detail}
                    </p>
                  </div>
                  <p className="text-3xl font-semibold tracking-tight">{step.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="shell-panel-strong px-5 py-5 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
            Do next
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--app-navy-strong)]">
            {nextAction.title}
          </h3>
          <p className="mt-3 text-sm leading-7 text-[var(--app-muted)]">
            {nextAction.detail}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={() => dispatchOperatorCommand({ command: nextAction.command })}>
              {nextAction.label}
            </Button>
            <Button asChild variant="outline">
              <Link href={nextApproved || nextDraft ? "/posts" : "/media-lab"}>
                {nextApproved || nextDraft ? "Stay in queue" : "Open Media Lab"}
              </Link>
            </Button>
          </div>

          <div className="mt-6 rounded-[26px] border border-[rgba(15,40,75,0.08)] bg-[linear-gradient(145deg,rgba(255,248,238,0.9),rgba(241,245,248,0.9))] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
              Quick actions
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Button
                variant="outline"
                className="justify-between bg-white/80"
                onClick={() => dispatchOperatorCommand({ command: "Approve the next post" })}
              >
                Approve next draft
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="justify-between bg-white/80"
                onClick={() => dispatchOperatorCommand({ command: "Send the approved post" })}
              >
                Send approved post
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button asChild variant="outline" className="justify-between bg-white/80">
                <Link href="/media-lab">
                  Open Media Lab
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="justify-between bg-white/80"
                onClick={() => dispatchOperatorCommand({ command: "What should I do today?" })}
              >
                Ask for today&apos;s plan
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {error ? (
            <p className="mt-4 text-sm text-rose-600">{error}</p>
          ) : null}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Pending review", value: reviewPosts.length, tone: "text-[var(--app-navy-strong)]" },
          { label: "Approved", value: approvedPosts.length, tone: "text-emerald-700" },
          { label: "Posted", value: postedPosts.length, tone: "text-blue-700" },
          { label: "Rejected", value: rejectedPosts.length, tone: "text-rose-700" },
        ].map((stat) => (
          <div key={stat.label} className="shell-metric">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-muted)]">
              {stat.label}
            </p>
            <p className={cn("mt-2 text-3xl font-semibold tracking-tight", stat.tone)}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="shell-panel flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm leading-6 text-[var(--app-muted)]">
            The queue is backed by the live post store. Start at the top of the list, because approved posts and draft decisions are sorted ahead of older posted items.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="bg-white/76">
            <Link href="/media-lab">Open Media Lab</Link>
          </Button>
          <Button
            onClick={() => void refreshQueue()}
            disabled={refreshing}
            className="bg-[var(--app-navy-strong)] text-white hover:bg-[var(--app-navy)]"
          >
            {refreshing ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh queue
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-[var(--app-muted)]" />
        </div>
      ) : orderedDrafts.length === 0 ? (
        <Card>
          <CardContent className="space-y-4 p-8 text-center">
            <p className="text-lg font-semibold text-[var(--app-navy-strong)]">No posts are queued yet.</p>
            <p className="text-sm leading-6 text-[var(--app-muted)]">
              Build the media lab snapshot to rank Jacob&apos;s best photos and clips, then the analyzer will queue coach-facing X drafts here automatically.
            </p>
            <div className="flex justify-center">
              <Button asChild className="bg-[var(--app-navy-strong)] text-white hover:bg-[var(--app-navy)]">
                <Link href="/media-lab">Build Media Lab</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orderedDrafts.map((draft) => (
            <Card
              key={draft.id}
              className={cn("overflow-hidden", draft.status === "rejected" && "opacity-55")}
              data-testid="post-queue-card"
            >
              <CardHeader className="border-b border-[rgba(15,40,75,0.08)] bg-[rgba(15,40,75,0.03)] pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={pillarColor(draft.pillar) as "performance" | "work_ethic" | "character"}>
                      {getPillarLabel(draft.pillar)}
                    </Badge>
                    <Badge variant={draft.status === "approved" ? "approved" : draft.status === "rejected" ? "rejected" : draft.status === "posted" ? "posted" : "draft"}>
                      {draft.status}
                    </Badge>
                    {(nextApproved?.id === draft.id || nextDraft?.id === draft.id) && draft.status !== "posted" ? (
                      <Badge className="border-[rgba(15,40,75,0.1)] bg-[rgba(200,155,60,0.14)] text-[var(--app-navy-strong)] hover:bg-[rgba(200,155,60,0.14)]">
                        Act on this next
                      </Badge>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {draft.bestTime || "Best time pending"}
                    </div>
                    <span>{formatDate(draft.scheduledFor)}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 p-6">
                {editingId === draft.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(event) => setEditContent(event.target.value)}
                      rows={5}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => void saveEdit(draft.id)}
                        disabled={actionId === draft.id}
                        className="bg-[var(--app-navy-strong)] text-white hover:bg-[var(--app-navy)]"
                      >
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="whitespace-pre-wrap text-sm leading-7">{draft.content}</p>
                    {mediaLabel(draft.mediaUrl) ? (
                      <div className="rounded-[18px] border border-[rgba(15,40,75,0.08)] bg-[rgba(15,40,75,0.04)] p-3 text-xs text-[var(--app-muted)]">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-3 w-3" />
                          <span>{mediaLabel(draft.mediaUrl)}</span>
                        </div>
                        {draft.mediaUrl ? (
                          <a
                            href={draft.mediaUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-block font-medium text-[var(--app-navy)] hover:text-[var(--app-navy-strong)]"
                          >
                            Open attached media
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                    <div className="flex flex-wrap gap-1">
                      {draft.hashtags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-[rgba(15,40,75,0.08)] bg-white/76 px-2 py-1 text-xs text-[var(--app-navy)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    {draft.xPostId ? (
                      <a
                        href={`https://x.com/i/status/${draft.xPostId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block text-xs font-medium text-[var(--app-navy)] hover:text-[var(--app-navy-strong)]"
                      >
                        Open posted tweet
                      </a>
                    ) : null}
                  </div>
                )}
              </CardContent>

              {(draft.status === "draft" || draft.status === "approved") && editingId !== draft.id ? (
                <CardFooter className="gap-2 border-t border-[rgba(15,40,75,0.08)] bg-[rgba(15,40,75,0.02)] px-6 py-4">
                  {draft.status === "draft" ? (
                    <Button size="sm" variant="success" onClick={() => void handleApprove(draft.id)} disabled={actionId === draft.id}>
                      <Check className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                  ) : null}
                  <Button size="sm" variant="outline" onClick={() => handleEdit(draft.id, draft.content)} disabled={actionId === draft.id}>
                    <Edit3 className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                  {draft.status === "approved" ? (
                    <Button
                      size="sm"
                      onClick={() => void handleSend(draft)}
                      disabled={actionId === draft.id}
                      className="bg-[var(--app-navy-strong)] text-white hover:bg-[var(--app-navy)]"
                    >
                      <Send className="mr-1 h-4 w-4" />
                      Send to X
                    </Button>
                  ) : null}
                  <Button size="sm" variant="destructive" onClick={() => void handleReject(draft.id)} disabled={actionId === draft.id}>
                    <X className="mr-1 h-4 w-4" />
                    Reject
                  </Button>
                </CardFooter>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SCPageHeader,
  SCGlassCard,
  SCStatCard,
  SCBadge,
  SCButton,
} from "@/components/sc";
import { dispatchOperatorCommand } from "@/lib/os/operator-client";
import type { Post } from "@/lib/types";
import { formatDate, getPillarLabel } from "@/lib/utils";

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

function getPillarBadgeVariant(pillar: string): "info" | "warning" | "success" | "default" {
  switch (pillar) {
    case "performance": return "info";
    case "work_ethic": return "warning";
    case "character": return "success";
    default: return "default";
  }
}

function getStatusBadgeVariant(status: string): "success" | "danger" | "warning" | "info" | "default" | "primary" {
  switch (status) {
    case "approved": return "success";
    case "rejected": return "danger";
    case "posted": return "primary";
    case "draft": return "default";
    case "scheduled": return "info";
    default: return "default";
  }
}

export default function PostsPage() {
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
      if (!res.ok) throw new Error(data.error || "Failed to load posts");
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
      if (!res.ok) throw new Error(data.error || "Failed to approve post");
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
      if (!res.ok) throw new Error(data.error || "Failed to reject post");
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
        body: JSON.stringify({ text: post.content, mediaUrl: post.mediaUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send post to X");
      setDrafts((prev) =>
        prev.map((draft) =>
          draft.id === post.id
            ? { ...draft, status: "posted", xPostId: data.tweetId ?? draft.xPostId }
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
      if (!res.ok) throw new Error(data.error || "Failed to save post");
      setDrafts((prev) => prev.map((draft) => (draft.id === id ? { ...draft, content: editContent } : draft)));
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

  return (
    <div className="space-y-6">
      <SCPageHeader
        kicker="Publishing Queue"
        title="POST QUEUE"
        subtitle="Shape every X post to feel coach-relevant, restrained, and worth sending."
      />

      {/* Hero: Publishing Pipeline + Do Next */}
      <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <SCGlassCard variant="strong" className="p-5">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-sc-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">smart_toy</span>
              Operator-led publishing
            </span>
            <SCBadge variant="default">Real X queue</SCBadge>
          </div>

          <h2 className="text-xl font-black text-white">
            This room should make one thing obvious: what to publish next.
          </h2>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            Review the next draft, approve it if it strengthens Jacob&apos;s recruiting story, then send the approved post to X.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {publishStats.map((step) => (
              <div
                key={step.label}
                className={`rounded-lg border p-4 transition-all ${
                  step.active
                    ? "border-sc-primary/30 bg-sc-primary/10 text-white"
                    : "border-sc-border bg-white/5 text-slate-300"
                }`}
              >
                <p className={`text-[10px] font-black uppercase tracking-widest ${
                  step.active ? "text-sc-primary" : "text-slate-500"
                }`}>
                  {step.label}
                </p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">{step.title}</p>
                    <p className={`mt-1 text-xs leading-relaxed ${step.active ? "text-white/70" : "text-slate-500"}`}>
                      {step.detail}
                    </p>
                  </div>
                  <p className="text-2xl font-black">{step.value}</p>
                </div>
              </div>
            ))}
          </div>
        </SCGlassCard>

        <SCGlassCard variant="strong" className="p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Do next</p>
          <h3 className="mt-2 text-lg font-black text-white">{nextAction.title}</h3>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">{nextAction.detail}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <SCButton variant="primary" onClick={() => dispatchOperatorCommand({ command: nextAction.command })}>
              <span className="material-symbols-outlined text-[16px]">play_arrow</span>
              {nextAction.label}
            </SCButton>
            <SCButton variant="secondary" asChild>
              <Link href={nextApproved || nextDraft ? "/posts" : "/media-lab"}>
                {nextApproved || nextDraft ? "Stay in queue" : "Open Media Lab"}
              </Link>
            </SCButton>
          </div>

          <div className="mt-5 rounded-lg border border-sc-border bg-white/5 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Quick actions</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <SCButton
                variant="ghost"
                size="sm"
                className="justify-between"
                onClick={() => dispatchOperatorCommand({ command: "Approve the next post" })}
              >
                Approve next draft
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </SCButton>
              <SCButton
                variant="ghost"
                size="sm"
                className="justify-between"
                onClick={() => dispatchOperatorCommand({ command: "Send the approved post" })}
              >
                Send approved post
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </SCButton>
              <SCButton variant="ghost" size="sm" className="justify-between" asChild>
                <Link href="/media-lab">
                  Open Media Lab
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </SCButton>
              <SCButton
                variant="ghost"
                size="sm"
                className="justify-between"
                onClick={() => dispatchOperatorCommand({ command: "What should I do today?" })}
              >
                Ask for today&apos;s plan
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </SCButton>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-400">{error}</p>
          )}
        </SCGlassCard>
      </div>

      {/* Stats Row */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SCStatCard label="Pending review" value={String(reviewPosts.length)} icon="rate_review" />
        <SCStatCard label="Approved" value={String(approvedPosts.length)} icon="check_circle" />
        <SCStatCard label="Posted" value={String(postedPosts.length)} icon="send" />
        <SCStatCard label="Rejected" value={String(rejectedPosts.length)} icon="cancel" />
      </div>

      {/* Queue Controls */}
      <SCGlassCard className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400 max-w-2xl">
            The queue is backed by the live post store. Start at the top of the list, because approved posts and draft decisions are sorted ahead of older posted items.
          </p>
          <div className="flex gap-2 flex-shrink-0">
            <SCButton variant="secondary" asChild>
              <Link href="/media-lab">Open Media Lab</Link>
            </SCButton>
            <SCButton
              variant="primary"
              onClick={() => void refreshQueue()}
              disabled={refreshing}
            >
              <span className={`material-symbols-outlined text-[16px] ${refreshing ? "animate-spin" : ""}`}>refresh</span>
              Refresh queue
            </SCButton>
          </div>
        </div>
      </SCGlassCard>

      {/* Post Cards */}
      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <span className="material-symbols-outlined text-[32px] text-slate-500 animate-spin">progress_activity</span>
        </div>
      ) : orderedDrafts.length === 0 ? (
        <SCGlassCard className="py-12 text-center">
          <span className="material-symbols-outlined text-[40px] text-white/10">inbox</span>
          <p className="text-lg font-bold text-white mt-3">No posts are queued yet.</p>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Build the media lab snapshot to rank Jacob&apos;s best photos and clips, then the analyzer will queue coach-facing X drafts here automatically.
          </p>
          <SCButton variant="primary" className="mt-4" asChild>
            <Link href="/media-lab">Build Media Lab</Link>
          </SCButton>
        </SCGlassCard>
      ) : (
        <div className="space-y-4">
          {orderedDrafts.map((draft) => (
            <SCGlassCard
              key={draft.id}
              className={`overflow-hidden ${draft.status === "rejected" ? "opacity-55" : ""}`}
            >
              {/* Card Header */}
              <div className="border-b border-sc-border bg-white/[0.03] px-5 py-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <SCBadge variant={getPillarBadgeVariant(draft.pillar)}>
                      {getPillarLabel(draft.pillar)}
                    </SCBadge>
                    <SCBadge variant={getStatusBadgeVariant(draft.status)}>
                      {draft.status}
                    </SCBadge>
                    {(nextApproved?.id === draft.id || nextDraft?.id === draft.id) && draft.status !== "posted" && (
                      <SCBadge variant="warning">Act on this next</SCBadge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {draft.bestTime || "Best time pending"}
                    </div>
                    <span>{formatDate(draft.scheduledFor)}</span>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 space-y-3">
                {editingId === draft.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(event) => setEditContent(event.target.value)}
                      rows={5}
                      className="w-full rounded-lg border border-sc-border bg-sc-bg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sc-primary/50"
                    />
                    <div className="flex gap-2">
                      <SCButton
                        variant="primary"
                        size="sm"
                        onClick={() => void saveEdit(draft.id)}
                        disabled={actionId === draft.id}
                      >
                        Save
                      </SCButton>
                      <SCButton variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                        Cancel
                      </SCButton>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">{draft.content}</p>
                    {mediaLabel(draft.mediaUrl) && (
                      <div className="rounded-lg border border-sc-border bg-white/5 p-3 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[14px]">image</span>
                          <span>{mediaLabel(draft.mediaUrl)}</span>
                        </div>
                        {draft.mediaUrl && (
                          <a
                            href={draft.mediaUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-block text-xs font-bold text-sc-primary hover:underline"
                          >
                            Open attached media
                          </a>
                        )}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {draft.hashtags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-sc-border bg-white/5 px-2 py-1 text-xs text-slate-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    {draft.xPostId && (
                      <a
                        href={`https://x.com/i/status/${draft.xPostId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-sc-primary hover:underline"
                      >
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        Open posted tweet
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer: Actions */}
              {(draft.status === "draft" || draft.status === "approved") && editingId !== draft.id && (
                <div className="flex flex-wrap gap-2 border-t border-sc-border bg-white/[0.02] px-5 py-3">
                  {draft.status === "draft" && (
                    <SCButton
                      variant="primary"
                      size="sm"
                      onClick={() => void handleApprove(draft.id)}
                      disabled={actionId === draft.id}
                    >
                      <span className="material-symbols-outlined text-[14px]">check</span>
                      Approve
                    </SCButton>
                  )}
                  <SCButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(draft.id, draft.content)}
                    disabled={actionId === draft.id}
                  >
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                    Edit
                  </SCButton>
                  {draft.status === "approved" && (
                    <SCButton
                      variant="primary"
                      size="sm"
                      onClick={() => void handleSend(draft)}
                      disabled={actionId === draft.id}
                    >
                      <span className="material-symbols-outlined text-[14px]">send</span>
                      Send to X
                    </SCButton>
                  )}
                  <SCButton
                    variant="danger"
                    size="sm"
                    onClick={() => void handleReject(draft.id)}
                    disabled={actionId === draft.id}
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                    Reject
                  </SCButton>
                </div>
              )}
            </SCGlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

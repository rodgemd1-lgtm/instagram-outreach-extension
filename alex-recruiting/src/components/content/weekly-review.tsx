"use client";

import { useState, useCallback } from "react";
import { SCGlassCard, SCButton, SCBadge } from "@/components/sc";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface WeekPost {
  id: string;
  dayOfWeek: string;
  date: string;
  content: string;
  pillar: string;
  hashtags: string[];
  bestTime: string;
  mediaSuggestion: string;
  psychologyMechanism: string;
  status: "draft" | "approved" | "rejected" | "scheduled";
  mediaUrl?: string | null;
}

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const PILLAR_STYLES: Record<string, { dot: string; badge: "info" | "warning" | "success" }> = {
  performance: { dot: "bg-blue-500", badge: "info" },
  work_ethic: { dot: "bg-yellow-500", badge: "warning" },
  character: { dot: "bg-emerald-500", badge: "success" },
};

const PILLAR_LABELS: Record<string, string> = {
  performance: "Performance",
  work_ethic: "Work Ethic",
  character: "Character",
};

const STATUS_BADGE: Record<string, "default" | "success" | "danger" | "info"> = {
  draft: "default",
  approved: "success",
  rejected: "danger",
  scheduled: "info",
};

const MECHANISM_LABELS: Record<string, string> = {
  identity_resonance: "Identity Resonance",
  reciprocity: "Reciprocity",
  commitment_consistency: "Commitment",
  scarcity: "Scarcity",
  loss_aversion: "Loss Aversion",
  narrative_transportation: "Narrative",
  curiosity_gap: "Curiosity Gap",
  autonomy_bias: "Autonomy Bias",
};

/* ------------------------------------------------------------------ */
/* Day Card                                                            */
/* ------------------------------------------------------------------ */

function DayCard({
  post,
  onApprove,
  onReject,
  onEdit,
  onDelete,
  onSchedule,
  onAttachMedia,
}: {
  post: WeekPost;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onSchedule: (id: string) => void;
  onAttachMedia: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const pillarStyle = PILLAR_STYLES[post.pillar] || PILLAR_STYLES.performance;
  const charCount = post.content.length;

  const handleSaveEdit = () => {
    onEdit(post.id, editContent);
    setEditing(false);
  };

  return (
    <SCGlassCard className="p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-sm font-black text-white">{post.dayOfWeek}</span>
            <span className="text-[10px] text-slate-500">{post.date}</span>
          </div>
          <SCBadge variant={pillarStyle.badge}>
            <span className={cn("inline-block h-1.5 w-1.5 rounded-full mr-1.5", pillarStyle.dot)} />
            {PILLAR_LABELS[post.pillar] || post.pillar}
          </SCBadge>
          <SCBadge variant={STATUS_BADGE[post.status] || "default"}>
            {post.status}
          </SCBadge>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500">{post.bestTime}</span>
        </div>
      </div>

      {/* Content */}
      {editing ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full rounded-lg border border-sc-border bg-white/5 p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-sc-primary resize-none"
            rows={4}
          />
          <div className="flex items-center justify-between">
            <span className={cn("text-[10px]", editContent.length > 280 ? "text-yellow-500" : "text-slate-500")}>
              {editContent.length}/280
            </span>
            <div className="flex gap-2">
              <SCButton variant="ghost" size="sm" onClick={() => { setEditing(false); setEditContent(post.content); }}>
                Cancel
              </SCButton>
              <SCButton variant="primary" size="sm" onClick={handleSaveEdit}>
                Save
              </SCButton>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-slate-200 leading-relaxed">{post.content}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={cn("text-[10px]", charCount > 280 ? "text-yellow-500" : "text-slate-500")}>
              {charCount} chars
            </span>
            {post.hashtags.length > 0 && (
              <span className="text-[10px] text-blue-400">
                {post.hashtags.map((h) => `#${h}`).join(" ")}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Psychology & media row */}
      <div className="flex items-center justify-between border-t border-sc-border pt-3">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-500">
            <span className="material-symbols-outlined text-[12px] align-middle mr-0.5">psychology</span>
            {MECHANISM_LABELS[post.psychologyMechanism] || post.psychologyMechanism}
          </span>
          {post.mediaSuggestion && (
            <span className="text-[10px] text-slate-500 max-w-[200px] truncate" title={post.mediaSuggestion}>
              <span className="material-symbols-outlined text-[12px] align-middle mr-0.5">image</span>
              {post.mediaSuggestion}
            </span>
          )}
          {post.mediaUrl && (
            <SCBadge variant="success">
              <span className="material-symbols-outlined text-[12px] mr-0.5">check</span>
              Media attached
            </SCBadge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAttachMedia(post.id)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5"
            title="Attach media"
          >
            <span className="material-symbols-outlined text-[18px]">attach_file</span>
          </button>
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5"
            title="Edit"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          {post.status === "draft" && (
            <button
              onClick={() => onApprove(post.id)}
              className="rounded-lg p-1.5 text-emerald-400 transition-colors hover:bg-emerald-500/10"
              title="Approve"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </button>
          )}
          {post.status === "approved" && (
            <button
              onClick={() => onSchedule(post.id)}
              className="rounded-lg p-1.5 text-blue-400 transition-colors hover:bg-blue-500/10"
              title="Schedule"
            >
              <span className="material-symbols-outlined text-[18px]">schedule_send</span>
            </button>
          )}
          <button
            onClick={() => onReject(post.id)}
            className="rounded-lg p-1.5 text-red-400 transition-colors hover:bg-red-500/10"
            title="Reject"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-500/10"
            title="Delete"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>
    </SCGlassCard>
  );
}

/* ------------------------------------------------------------------ */
/* Main Component                                                      */
/* ------------------------------------------------------------------ */

export function WeeklyReview() {
  const [posts, setPosts] = useState<WeekPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [context, setContext] = useState("");
  const [showContextInput, setShowContextInput] = useState(false);
  const [weekStart, setWeekStart] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [mediaPickerPostId, setMediaPickerPostId] = useState<string | null>(null);

  // Generate a week of content
  const handleGenerate = useCallback(async () => {
    try {
      setGenerating(true);
      setActionMessage(null);

      const body: Record<string, string> = {};
      if (context.trim()) body.context = context.trim();

      const res = await fetch("/api/content/generate-week", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate");
      }

      const data = await res.json();
      setPosts(data.posts || []);
      setWeekStart(data.weekStart || null);
      setActionMessage(`Generated ${data.generated} posts for the week of ${data.weekStart}.${data.fallback ? " (Using templates — AI API key not configured)" : ""}`);
    } catch (err) {
      console.error("Generate week failed:", err);
      setActionMessage("Failed to generate weekly content. Check your API key.");
    } finally {
      setGenerating(false);
    }
  }, [context]);

  // Approve a single post
  const handleApprove = (id: string) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: "approved" } : p)));
    setActionMessage("Post approved.");
  };

  // Reject a single post
  const handleReject = (id: string) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: "rejected" } : p)));
    setActionMessage("Post rejected.");
  };

  // Edit post content
  const handleEdit = (id: string, newContent: string) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, content: newContent } : p)));
    setActionMessage("Post updated.");
  };

  // Delete a post
  const handleDelete = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setActionMessage("Post deleted.");
  };

  // Schedule a post
  const handleSchedule = (id: string) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status: "scheduled" } : p)));
    setActionMessage("Post scheduled.");
  };

  // Approve all drafts
  const handleApproveAll = () => {
    const draftCount = posts.filter((p) => p.status === "draft").length;
    setPosts((prev) => prev.map((p) => (p.status === "draft" ? { ...p, status: "approved" } : p)));
    setActionMessage(`Approved ${draftCount} posts.`);
  };

  // Schedule all approved
  const handleScheduleAll = () => {
    const approvedCount = posts.filter((p) => p.status === "approved").length;
    setPosts((prev) => prev.map((p) => (p.status === "approved" ? { ...p, status: "scheduled" } : p)));
    setActionMessage(`Scheduled ${approvedCount} posts.`);
  };

  // Add a custom post
  const handleAddPost = () => {
    const newPost: WeekPost = {
      id: `wp-custom-${Date.now()}`,
      dayOfWeek: "Custom",
      date: new Date().toISOString().slice(0, 10),
      content: "",
      pillar: "performance",
      hashtags: [],
      bestTime: "12:00 PM CST",
      mediaSuggestion: "",
      psychologyMechanism: "commitment_consistency",
      status: "draft",
    };
    setPosts((prev) => [...prev, newPost]);
  };

  // Attach media (opens picker)
  const handleAttachMedia = (id: string) => {
    setMediaPickerPostId(id);
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!mediaPickerPostId || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === mediaPickerPostId ? { ...p, mediaUrl: url } : p
      )
    );
    setMediaPickerPostId(null);
    setActionMessage("Media attached.");
  };

  // Stats
  const draftCount = posts.filter((p) => p.status === "draft").length;
  const approvedCount = posts.filter((p) => p.status === "approved").length;
  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;
  const rejectedCount = posts.filter((p) => p.status === "rejected").length;

  return (
    <div className="space-y-6">
      {/* Generator controls */}
      <SCGlassCard className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-white">AI Content Creator</h3>
            <p className="text-sm text-slate-400">Generate a week of posts powered by Claude AI</p>
          </div>
          <div className="flex items-center gap-2">
            <SCButton
              variant="ghost"
              size="sm"
              onClick={() => setShowContextInput(!showContextInput)}
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              Context
            </SCButton>
            <SCButton
              onClick={handleGenerate}
              disabled={generating}
            >
              <span className="material-symbols-outlined text-[18px]">
                {generating ? "sync" : "auto_awesome"}
              </span>
              {generating ? "Generating..." : "Generate Week"}
            </SCButton>
          </div>
        </div>

        {/* Optional context input */}
        {showContextInput && (
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Week Context (optional)
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="E.g., 'Camp at Wisconsin this Saturday', 'Game film dropped Monday', 'Academic honor roll announced'..."
              className="w-full rounded-lg border border-sc-border bg-white/5 p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-sc-primary resize-none"
              rows={3}
            />
          </div>
        )}
      </SCGlassCard>

      {/* Action feedback */}
      {actionMessage && (
        <SCGlassCard variant="broadcast" className="px-4 py-3">
          <p className="text-sm font-bold text-white">{actionMessage}</p>
        </SCGlassCard>
      )}

      {/* Posts exist — show review UI */}
      {posts.length > 0 && (
        <>
          {/* Stats bar */}
          <SCGlassCard className="flex flex-wrap items-center gap-4 p-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Week of {weekStart}:
            </span>
            <span className="text-sm font-black text-white">{posts.length}</span>
            <span className="text-xs text-slate-500">posts</span>
            <span className="text-slate-600">|</span>
            <span className="text-sm font-black text-slate-300">{draftCount}</span>
            <span className="text-xs text-slate-500">drafts</span>
            <span className="text-slate-600">|</span>
            <span className="text-sm font-black text-emerald-400">{approvedCount}</span>
            <span className="text-xs text-slate-500">approved</span>
            <span className="text-slate-600">|</span>
            <span className="text-sm font-black text-blue-400">{scheduledCount}</span>
            <span className="text-xs text-slate-500">scheduled</span>
            {rejectedCount > 0 && (
              <>
                <span className="text-slate-600">|</span>
                <span className="text-sm font-black text-red-400">{rejectedCount}</span>
                <span className="text-xs text-slate-500">rejected</span>
              </>
            )}

            <div className="ml-auto flex items-center gap-2">
              <SCButton variant="ghost" size="sm" onClick={handleAddPost}>
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add Post
              </SCButton>
              {draftCount > 0 && (
                <SCButton variant="primary" size="sm" onClick={handleApproveAll}>
                  <span className="material-symbols-outlined text-[16px]">done_all</span>
                  Approve All ({draftCount})
                </SCButton>
              )}
              {approvedCount > 0 && (
                <SCButton variant="secondary" size="sm" onClick={handleScheduleAll}>
                  <span className="material-symbols-outlined text-[16px]">schedule_send</span>
                  Schedule All ({approvedCount})
                </SCButton>
              )}
            </div>
          </SCGlassCard>

          {/* Day-by-day cards */}
          <div className="space-y-3">
            {posts.map((post) => (
              <DayCard
                key={post.id}
                post={post}
                onApprove={handleApprove}
                onReject={handleReject}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSchedule={handleSchedule}
                onAttachMedia={handleAttachMedia}
              />
            ))}
          </div>
        </>
      )}

      {/* Empty state */}
      {!generating && posts.length === 0 && (
        <SCGlassCard className="flex flex-col items-center justify-center px-8 py-16 text-center">
          <span className="material-symbols-outlined mb-4 text-[48px] text-slate-600">
            edit_note
          </span>
          <h3 className="text-lg font-black text-white">No posts generated yet</h3>
          <p className="mt-2 max-w-sm text-sm text-slate-400">
            Click &quot;Generate Week&quot; to create 5-7 AI-powered posts with pillar balance,
            psychology mechanisms, and optimal timing. You can review, edit, and approve each one.
          </p>
        </SCGlassCard>
      )}

      {/* Loading state */}
      {generating && posts.length === 0 && (
        <SCGlassCard className="flex flex-col items-center justify-center px-8 py-16 text-center">
          <span className="material-symbols-outlined animate-spin mb-4 text-[48px] text-sc-primary">
            progress_activity
          </span>
          <h3 className="text-lg font-black text-white">Generating your week...</h3>
          <p className="mt-2 text-sm text-slate-400">
            Claude is crafting 5-7 posts with pillar balance and psychology mechanisms.
          </p>
        </SCGlassCard>
      )}

      {/* Hidden file input for media attachment */}
      {mediaPickerPostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <SCGlassCard className="w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-black text-white">Attach Media</h3>
            <p className="text-sm text-slate-400">Upload a photo or video to attach to this post.</p>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="block w-full text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-sc-primary file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-sc-primary/80"
            />
            <div className="flex justify-end">
              <SCButton variant="ghost" size="sm" onClick={() => setMediaPickerPostId(null)}>
                Cancel
              </SCButton>
            </div>
          </SCGlassCard>
        </div>
      )}
    </div>
  );
}

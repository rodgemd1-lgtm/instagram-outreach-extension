"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { SlideOver } from "./slide-over";
import { Badge } from "./badge";
import { PILLAR_CONFIG, ALL_PILLARS, type CalendarPillar } from "@/lib/dashboard/pillar-config";
import { toBackendPillar } from "@/lib/dashboard/pillar-config";
import { cn } from "@/lib/utils";
import type { CalendarPost } from "./calendar-grid";

/* ------------------------------------------------------------------ */
/*  Hashtag suggestions per pillar                                     */
/* ------------------------------------------------------------------ */

const PILLAR_HASHTAGS: Record<CalendarPillar, string[]> = {
  film: ["#FilmDontLie", "#OLPlay", "#Pancake", "#HighlightReel"],
  training: ["#OffseasonGrind", "#IronSharpensIron", "#GetBetter", "#WorkEthic"],
  academic: ["#StudentAthlete", "#GPA", "#Classof2029", "#ScholarBaller"],
  camp: ["#CampSeason", "#Compete", "#ShowOut", "#EliteCamp"],
  lifestyle: ["#RecruitLife", "#BeyondTheField", "#Brand", "#JourneyToCollege"],
};

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface PostComposerProps {
  open: boolean;
  onClose: () => void;
  editPost?: CalendarPost | null;
  defaultDate?: Date | null;
  onSaved: () => void;
}

/* ------------------------------------------------------------------ */
/*  Status badge helper                                                */
/* ------------------------------------------------------------------ */

function statusVariant(status: string) {
  switch (status) {
    case "posted":
      return "success" as const;
    case "scheduled":
      return "accent" as const;
    case "draft":
      return "warning" as const;
    default:
      return "default" as const;
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PostComposer({
  open,
  onClose,
  editPost,
  defaultDate,
  onSaved,
}: PostComposerProps) {
  const [content, setContent] = useState("");
  const [pillar, setPillar] = useState<CalendarPillar>("film");
  const [hashtags, setHashtags] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("08:00");
  const [saving, setSaving] = useState(false);

  /* ---- Populate fields when editing or setting default date ---- */
  const resetForm = useCallback(() => {
    if (editPost) {
      setContent(editPost.content);
      setPillar(editPost.pillar);
      setHashtags("");
      setMediaUrl("");
      if (editPost.scheduledFor) {
        const d = new Date(editPost.scheduledFor);
        setDate(format(d, "yyyy-MM-dd"));
        setTime(format(d, "HH:mm"));
      }
    } else {
      setContent("");
      setPillar("film");
      setHashtags("");
      setMediaUrl("");
      if (defaultDate) {
        setDate(format(defaultDate, "yyyy-MM-dd"));
        setTime("08:00");
      } else {
        setDate(format(new Date(), "yyyy-MM-dd"));
        setTime("08:00");
      }
    }
  }, [editPost, defaultDate]);

  useEffect(() => {
    if (open) resetForm();
  }, [open, resetForm]);

  /* ---- Pillar change auto-fills hashtag suggestions ---- */
  function handlePillarChange(p: CalendarPillar) {
    setPillar(p);
    if (!hashtags.trim()) {
      setHashtags(PILLAR_HASHTAGS[p].slice(0, 3).join(", "));
    }
  }

  /* ---- Build scheduledFor ISO string ---- */
  function buildScheduledFor(): string {
    if (!date) return new Date().toISOString();
    const [y, m, d] = date.split("-").map(Number);
    const [hh, mm] = time.split(":").map(Number);
    return new Date(y, m - 1, d, hh, mm).toISOString();
  }

  /* ---- API helpers ---- */
  async function createOrUpdate(status: string): Promise<string | null> {
    const body = {
      content,
      pillar: toBackendPillar(pillar),
      hashtags: hashtags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      mediaUrl: mediaUrl || null,
      scheduledFor: buildScheduledFor(),
      status,
    };

    const isEdit = !!editPost;
    const url = isEdit ? `/api/posts/${editPost.id}` : "/api/posts";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.post?.id ?? editPost?.id ?? null;
  }

  async function handleSaveDraft() {
    setSaving(true);
    try {
      await createOrUpdate("draft");
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleSchedule() {
    setSaving(true);
    try {
      await createOrUpdate("scheduled");
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handlePostNow() {
    setSaving(true);
    try {
      const postId = await createOrUpdate("draft");
      if (postId) {
        await fetch(`/api/posts/${postId}/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: content, mediaUrl: mediaUrl || undefined }),
        });
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  /* ---- Character count ---- */
  const charCount = content.length;
  const charWarning = charCount >= 260;
  const charOver = charCount > 280;

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title={editPost ? "Edit Post" : "New Post"}
      subtitle="Compose content for X"
      wide
    >
      <div className="space-y-5">
        {/* Status badge for existing posts */}
        {editPost && (
          <div>
            <Badge variant={statusVariant(editPost.status)}>
              {editPost.status}
            </Badge>
          </div>
        )}

        {/* ---- Content textarea ---- */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-dash-text-secondary">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            maxLength={280}
            placeholder="What's happening on the recruiting trail?"
            className="w-full rounded-lg border border-dash-border bg-dash-bg px-3 py-2 text-sm text-dash-text placeholder:text-dash-muted focus:border-dash-accent focus:outline-none focus:ring-1 focus:ring-dash-accent"
          />
          <p
            className={cn(
              "mt-1 text-right text-xs",
              charOver
                ? "text-dash-danger font-semibold"
                : charWarning
                  ? "text-dash-danger"
                  : "text-dash-muted"
            )}
          >
            {charCount}/280
          </p>
        </div>

        {/* ---- Pillar selector ---- */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-dash-text-secondary">
            Pillar
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_PILLARS.map((p) => {
              const cfg = PILLAR_CONFIG[p];
              const selected = p === pillar;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePillarChange(p)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    selected
                      ? cn(cfg.bgClass, cfg.textClass, "ring-1 ring-current")
                      : "bg-dash-surface-raised text-dash-muted hover:text-dash-text"
                  )}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ---- Hashtags ---- */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-dash-text-secondary">
            Hashtags
          </label>
          <input
            type="text"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="#FilmDontLie, #OLPlay"
            className="w-full rounded-lg border border-dash-border bg-dash-bg px-3 py-2 text-sm text-dash-text placeholder:text-dash-muted focus:border-dash-accent focus:outline-none focus:ring-1 focus:ring-dash-accent"
          />
          <p className="mt-1 text-[11px] text-dash-muted">Comma-separated</p>
        </div>

        {/* ---- Media URL ---- */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-dash-text-secondary">
            Media URL <span className="text-dash-muted">(optional)</span>
          </label>
          <input
            type="text"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="/optimized-media/clip.mp4 or https://..."
            className="w-full rounded-lg border border-dash-border bg-dash-bg px-3 py-2 text-sm text-dash-text placeholder:text-dash-muted focus:border-dash-accent focus:outline-none focus:ring-1 focus:ring-dash-accent"
          />
        </div>

        {/* ---- Date + Time ---- */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-dash-text-secondary">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-dash-border bg-dash-bg px-3 py-2 text-sm text-dash-text focus:border-dash-accent focus:outline-none focus:ring-1 focus:ring-dash-accent"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-dash-text-secondary">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-lg border border-dash-border bg-dash-bg px-3 py-2 text-sm text-dash-text focus:border-dash-accent focus:outline-none focus:ring-1 focus:ring-dash-accent"
            />
          </div>
        </div>

        {/* ---- Tip ---- */}
        <p className="rounded-lg bg-dash-accent/10 px-3 py-2 text-xs text-dash-accent">
          Coaches are most active 7-9am CT on Tue/Wed/Thu
        </p>

        {/* ---- Action buttons ---- */}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            disabled={saving || !content.trim() || charOver}
            onClick={handleSaveDraft}
            className="rounded-lg border border-dash-border px-4 py-2 text-sm font-medium text-dash-text transition-colors hover:bg-dash-surface-raised disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={saving || !content.trim() || charOver}
            onClick={handleSchedule}
            className="rounded-lg bg-dash-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-dash-accent/90 disabled:opacity-50"
          >
            Schedule
          </button>
          <button
            type="button"
            disabled={saving || !content.trim() || charOver}
            onClick={handlePostNow}
            className="rounded-lg bg-dash-success px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-dash-success/90 disabled:opacity-50"
          >
            Post Now
          </button>
        </div>
      </div>
    </SlideOver>
  );
}

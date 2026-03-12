"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { SlideOver } from "./slide-over";
import { Badge } from "@/components/ui/badge";
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
      return "posted" as const;
    case "scheduled":
      return "approved" as const;
    case "draft":
      return "draft" as const;
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
  const charWarning = charCount >= 250;
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
          <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            placeholder="What's happening on the recruiting trail?"
            className="w-full rounded-lg border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#ff000c] focus:outline-none focus:ring-1 focus:ring-[#ff000c]"
          />
          <p
            className={cn(
              "mt-1 text-right text-xs",
              charOver
                ? "text-[#EF4444] font-semibold"
                : charWarning
                  ? "text-[#F59E0B]"
                  : "text-white/40"
            )}
          >
            {charCount}/280
          </p>
        </div>

        {/* ---- Pillar selector ---- */}
        <div>
          <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">
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
                    "rounded-lg px-3 py-2 text-xs font-medium transition-colors border",
                    selected
                      ? "border-current bg-white/5"
                      : "border-white/5 bg-[#0A0A0A] text-white/40 hover:text-white/60 hover:bg-[#111111]"
                  )}
                  style={selected ? { color: cfg.color, borderColor: cfg.color } : undefined}
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: cfg.color }}
                    />
                    {cfg.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ---- Hashtags ---- */}
        <div>
          <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">
            Hashtags
          </label>
          <input
            type="text"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="#FilmDontLie, #OLPlay"
            className="w-full rounded-lg border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#ff000c] focus:outline-none focus:ring-1 focus:ring-[#ff000c]"
          />
          {/* Hashtag suggestion pills */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PILLAR_HASHTAGS[pillar].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  const current = hashtags.split(",").map((t) => t.trim()).filter(Boolean);
                  if (!current.includes(tag)) {
                    setHashtags(current.length ? `${hashtags}, ${tag}` : tag);
                  }
                }}
                className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* ---- Media URL ---- */}
        <div>
          <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">
            Media URL <span className="text-white/20">(optional)</span>
          </label>
          <input
            type="text"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="/optimized-media/clip.mp4 or https://..."
            className="w-full rounded-lg border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#ff000c] focus:outline-none focus:ring-1 focus:ring-[#ff000c]"
          />
        </div>

        {/* ---- Date + Time ---- */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white focus:border-[#ff000c] focus:outline-none focus:ring-1 focus:ring-[#ff000c] [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#111111] px-3 py-2 text-sm text-white focus:border-[#ff000c] focus:outline-none focus:ring-1 focus:ring-[#ff000c] [color-scheme:dark]"
            />
          </div>
        </div>

        {/* ---- Tip ---- */}
        <p className="rounded-lg bg-[#ff000c]/10 border border-[#ff000c]/20 px-3 py-2 text-xs text-[#ff000c]">
          Coaches are most active 7-9am CT on Tue/Wed/Thu
        </p>

        {/* ---- Action buttons ---- */}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || !content.trim() || charOver}
            onClick={handleSaveDraft}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5 disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={saving || !content.trim() || charOver}
            onClick={handleSchedule}
            className="rounded-lg bg-[#ff000c] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#cc000a] disabled:opacity-50"
          >
            Schedule
          </button>
          <button
            type="button"
            disabled={saving || !content.trim() || charOver}
            onClick={handlePostNow}
            className="rounded-lg bg-[#22C55E] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#22C55E]/90 disabled:opacity-50"
          >
            Post Now
          </button>
        </div>
      </div>
    </SlideOver>
  );
}

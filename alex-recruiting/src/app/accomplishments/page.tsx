"use client";

import { useState, useEffect, useCallback } from "react";
import {
  SCPageHeader,
  SCGlassCard,
  SCBadge,
  SCButton,
} from "@/components/sc";

interface Accomplishment {
  id: string;
  type: "pr" | "award" | "milestone";
  title: string;
  value: string;
  unit: string;
  mediaUrl: string | null;
  mediaPath: string | null;
  postedToX: boolean;
  tweetId: string | null;
  createdAt: string;
}

const TYPE_OPTIONS = [
  { value: "pr", label: "PR (Personal Record)", icon: "track_changes" },
  { value: "award", label: "Award", icon: "emoji_events" },
  { value: "milestone", label: "Milestone", icon: "stars" },
] as const;

function getTypeBadge(type: string) {
  switch (type) {
    case "pr":
      return { label: "PR", variant: "success" as const, icon: "track_changes" };
    case "award":
      return { label: "Award", variant: "warning" as const, icon: "emoji_events" };
    case "milestone":
      return { label: "Milestone", variant: "info" as const, icon: "stars" };
    default:
      return { label: type, variant: "default" as const, icon: "stars" };
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function AccomplishmentsPage() {
  const [accomplishments, setAccomplishments] = useState<Accomplishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [postingId, setPostingId] = useState<string | null>(null);

  // Form state
  const [type, setType] = useState<"pr" | "award" | "milestone">("pr");
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaPath, setMediaPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchAccomplishments = useCallback(async () => {
    try {
      const res = await fetch("/api/accomplishments");
      const data = await res.json();
      setAccomplishments(data.accomplishments || []);
    } catch (err) {
      console.error("Failed to fetch accomplishments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccomplishments();
  }, [fetchAccomplishments]);

  const resetForm = () => {
    setTitle("");
    setValue("");
    setUnit("");
    setMediaUrl(null);
    setMediaPath(null);
  };

  const handleSubmit = async (postToX: boolean) => {
    if (!title.trim() || !value.trim() || !unit.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/accomplishments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: title.trim(),
          value: value.trim(),
          unit: unit.trim(),
          mediaUrl,
          mediaPath,
          postToX,
        }),
      });

      if (res.ok) {
        resetForm();
        await fetchAccomplishments();
      }
    } catch (err) {
      console.error("Failed to save accomplishment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostToX = async (acc: Accomplishment) => {
    setPostingId(acc.id);
    try {
      const res = await fetch("/api/accomplishments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: acc.id,
          type: acc.type,
          title: acc.title,
          value: acc.value,
          unit: acc.unit,
        }),
      });

      if (res.ok) {
        await fetchAccomplishments();
      }
    } catch (err) {
      console.error("Failed to post to X:", err);
    } finally {
      setPostingId(null);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "accomplishments");

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setMediaUrl(data.url);
        setMediaPath(data.path ?? null);
      }
    } catch (err) {
      console.error("Failed to upload media:", err);
    } finally {
      setUploading(false);
    }
  };

  const isFormValid = title.trim() && value.trim() && unit.trim();

  return (
    <div className="space-y-6">
      <SCPageHeader
        kicker="Track & Share"
        title="ACCOMPLISHMENTS"
        subtitle="Track PRs, awards, and milestones"
      />

      {/* Add Accomplishment Form */}
      <SCGlassCard className="p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-sc-primary">add_circle</span>
          Log Accomplishment
        </h2>

        <div className="space-y-4">
          {/* Type selector */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TYPE_OPTIONS.map((opt) => {
                const isSelected = type === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setType(opt.value)}
                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition-all ${
                      isSelected
                        ? "bg-sc-primary/20 text-sc-primary border border-sc-primary/40 shadow-lg shadow-sc-primary-glow"
                        : "bg-white/5 text-slate-400 border border-sc-border hover:border-sc-primary/30"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{opt.icon}</span>
                    {opt.value === "pr" ? "PR" : opt.label.split(" ")[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Dumbbell Bench Press"
              className="w-full rounded-lg bg-white/5 border border-sc-border px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sc-primary/50 focus:ring-1 focus:ring-sc-primary/20"
            />
          </div>

          {/* Value and Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                Value
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g., 85"
                className="w-full rounded-lg bg-white/5 border border-sc-border px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sc-primary/50 focus:ring-1 focus:ring-sc-primary/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g., lb DBs"
                className="w-full rounded-lg bg-white/5 border border-sc-border px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sc-primary/50 focus:ring-1 focus:ring-sc-primary/20"
              />
            </div>
          </div>

          {/* Media Upload */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
              Media (optional)
            </label>
            {mediaUrl ? (
              <div className="flex items-center gap-3 rounded-lg bg-white/5 border border-sc-border px-4 py-3">
                <span className="material-symbols-outlined text-[20px] text-emerald-400">image</span>
                <span className="text-sm text-slate-300 truncate flex-1">Media uploaded</span>
                <button
                  onClick={() => {
                    setMediaUrl(null);
                    setMediaPath(null);
                  }}
                  className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 rounded-lg bg-white/5 border border-dashed border-sc-border px-4 py-4 cursor-pointer hover:border-sc-primary/30 transition-colors">
                {uploading ? (
                  <span className="material-symbols-outlined text-[20px] text-slate-500 animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[20px] text-slate-500">cloud_upload</span>
                )}
                <span className="text-sm text-slate-500">
                  {uploading ? "Uploading..." : "Click to upload image or video"}
                </span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
          </div>

          {/* Caption Preview (PR type) */}
          {type === "pr" && title && value && unit && (
            <SCGlassCard variant="broadcast" className="p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                X Post Preview
              </p>
              <p className="text-sm text-slate-300 whitespace-pre-line">
                {`New PR! ${title}: ${value} ${unit} \u{1F4AA}\n\nJacob Rodgers | #79 | OL | Pewaukee HS '29\n#ClassOf2029 #OLine #StrengthTraining`}
              </p>
            </SCGlassCard>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <SCButton
              variant="secondary"
              size="md"
              onClick={() => handleSubmit(false)}
              disabled={!isFormValid || submitting}
              className="flex-1"
            >
              {submitting ? (
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[16px]">check</span>
              )}
              Save
            </SCButton>
            <SCButton
              variant="primary"
              size="md"
              onClick={() => handleSubmit(true)}
              disabled={!isFormValid || submitting}
              className="flex-1"
            >
              {submitting ? (
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[16px]">send</span>
              )}
              Save &amp; Post to X
            </SCButton>
          </div>
        </div>
      </SCGlassCard>

      {/* Timeline */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Timeline</h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="material-symbols-outlined text-[24px] text-slate-500 animate-spin">progress_activity</span>
          </div>
        ) : accomplishments.length === 0 ? (
          <SCGlassCard className="flex flex-col items-center justify-center text-center py-16">
            <span className="material-symbols-outlined text-[48px] text-white/10">emoji_events</span>
            <p className="mt-4 text-lg font-bold text-white/50">No accomplishments logged yet</p>
            <p className="mt-2 text-sm text-slate-500">
              Track PRs, awards, and milestones to build your recruiting profile. Use the form above to log your first one.
            </p>
          </SCGlassCard>
        ) : (
          <div className="space-y-3">
            {accomplishments.map((acc) => {
              const badge = getTypeBadge(acc.type);

              return (
                <SCGlassCard key={acc.id} className="p-4 hover:border-sc-primary/20 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Media thumbnail */}
                    {acc.mediaUrl ? (
                      <div className="hidden sm:block flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-white/5 border border-sc-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={acc.mediaUrl}
                          alt={acc.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="hidden sm:flex flex-shrink-0 w-16 h-16 rounded-lg bg-white/5 border border-sc-border items-center justify-center">
                        <span className="material-symbols-outlined text-[24px] text-white/10">{badge.icon}</span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <SCBadge variant={badge.variant}>
                          <span className="material-symbols-outlined text-[10px] mr-0.5">{badge.icon}</span>
                          {badge.label}
                        </SCBadge>
                        {acc.postedToX && (
                          <SCBadge variant="info">
                            <span className="material-symbols-outlined text-[10px] mr-0.5">check</span>
                            Posted
                          </SCBadge>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-white">{acc.title}</h3>
                      <p className="text-lg font-black text-sc-primary">
                        {acc.value}{" "}
                        <span className="text-sm font-normal text-slate-400">{acc.unit}</span>
                      </p>

                      <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                        <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                        {formatDate(acc.createdAt)} at {formatTime(acc.createdAt)}
                      </div>
                    </div>

                    {/* Post to X button */}
                    {!acc.postedToX && (
                      <SCButton
                        variant="secondary"
                        size="sm"
                        onClick={() => handlePostToX(acc)}
                        disabled={postingId === acc.id}
                        className="flex-shrink-0"
                      >
                        {postingId === acc.id ? (
                          <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                        ) : (
                          <span className="material-symbols-outlined text-[14px]">send</span>
                        )}
                        Post to X
                      </SCButton>
                    )}
                  </div>
                </SCGlassCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

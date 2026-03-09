"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Trophy,
  Star,
  Target,
  Plus,
  Send,
  Check,
  Upload,
  Loader2,
  Calendar,
  ImageIcon,
} from "lucide-react";

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
  { value: "pr", label: "PR (Personal Record)", icon: Target },
  { value: "award", label: "Award", icon: Trophy },
  { value: "milestone", label: "Milestone", icon: Star },
] as const;

function getTypeBadge(type: string) {
  switch (type) {
    case "pr":
      return {
        label: "PR",
        className: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
        icon: Target,
      };
    case "award":
      return {
        label: "Award",
        className: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
        icon: Trophy,
      };
    case "milestone":
      return {
        label: "Milestone",
        className: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
        icon: Star,
      };
    default:
      return {
        label: type,
        className: "bg-gray-500/20 text-gray-400 border border-gray-500/30",
        icon: Star,
      };
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
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
              <Trophy className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Accomplishments</h1>
              <p className="text-sm text-gray-400">
                Track PRs, awards, and milestones
              </p>
            </div>
          </div>
        </div>

        {/* Add Accomplishment Form */}
        <div className="mb-10 rounded-xl border border-gray-800 bg-gray-950 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-emerald-400" />
            Log Accomplishment
          </h2>

          <div className="space-y-4">
            {/* Type selector */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TYPE_OPTIONS.map((opt) => {
                  const isSelected = type === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setType(opt.value)}
                      className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                        isSelected
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-700"
                      }`}
                    >
                      <opt.icon className="h-4 w-4" />
                      {opt.value === "pr" ? "PR" : opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Dumbbell Bench Press"
                className="w-full rounded-lg bg-gray-900 border border-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>

            {/* Value and Unit — side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Value
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="e.g., 85"
                  className="w-full rounded-lg bg-gray-900 border border-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Unit
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g., lb DBs"
                  className="w-full rounded-lg bg-gray-900 border border-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Media (optional)
              </label>
              {mediaUrl ? (
                <div className="flex items-center gap-3 rounded-lg bg-gray-900 border border-gray-800 px-4 py-3">
                  <ImageIcon className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm text-gray-300 truncate flex-1">
                    Media uploaded
                  </span>
                  <button
                    onClick={() => {
                      setMediaUrl(null);
                      setMediaPath(null);
                    }}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 border border-dashed border-gray-700 px-4 py-4 cursor-pointer hover:border-gray-600 transition-colors">
                  {uploading ? (
                    <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5 text-gray-500" />
                  )}
                  <span className="text-sm text-gray-500">
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
              <div className="rounded-lg bg-gray-900/50 border border-gray-800 p-4">
                <p className="text-xs font-medium text-gray-500 mb-2">
                  X Post Preview
                </p>
                <p className="text-sm text-gray-300 whitespace-pre-line">
                  {`New PR! ${title}: ${value} ${unit} \u{1F4AA}\n\nJacob Rodgers | #79 | OL | Pewaukee HS '29\n#ClassOf2029 #OLine #StrengthTraining`}
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => handleSubmit(false)}
                disabled={!isFormValid || submitting}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gray-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Save
              </button>
              <button
                onClick={() => handleSubmit(true)}
                disabled={!isFormValid || submitting}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Save &amp; Post to X
              </button>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Timeline</h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 text-gray-500 animate-spin" />
            </div>
          ) : accomplishments.length === 0 ? (
            <div className="text-center py-16 rounded-xl border border-gray-800 bg-gray-950">
              <Trophy className="h-10 w-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                No accomplishments yet. Log your first one above!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {accomplishments.map((acc) => {
                const badge = getTypeBadge(acc.type);
                const BadgeIcon = badge.icon;

                return (
                  <div
                    key={acc.id}
                    className="rounded-xl border border-gray-800 bg-gray-950 p-4 hover:border-gray-700 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Media thumbnail */}
                      {acc.mediaUrl ? (
                        <div className="hidden sm:block flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={acc.mediaUrl}
                            alt={acc.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="hidden sm:flex flex-shrink-0 w-16 h-16 rounded-lg bg-gray-900 border border-gray-800 items-center justify-center">
                          <BadgeIcon className="h-6 w-6 text-gray-700" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
                          >
                            <BadgeIcon className="h-3 w-3" />
                            {badge.label}
                          </span>
                          {acc.postedToX && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-0.5 text-xs font-medium">
                              <Check className="h-3 w-3" />
                              Posted
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-semibold text-white">
                          {acc.title}
                        </h3>
                        <p className="text-lg font-bold text-emerald-400">
                          {acc.value}{" "}
                          <span className="text-sm font-normal text-gray-400">
                            {acc.unit}
                          </span>
                        </p>

                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(acc.createdAt)} at{" "}
                          {formatTime(acc.createdAt)}
                        </div>
                      </div>

                      {/* Post to X button */}
                      {!acc.postedToX && (
                        <button
                          onClick={() => handlePostToX(acc)}
                          disabled={postingId === acc.id}
                          className="flex-shrink-0 flex items-center gap-1.5 rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-xs font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50"
                        >
                          {postingId === acc.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                          Post to X
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

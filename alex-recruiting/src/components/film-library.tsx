"use client";

import { useState, useEffect, useCallback } from "react";
import { SCPageHeader } from "@/components/sc/sc-page-header";
import { SCGlassCard } from "@/components/sc/sc-glass-card";
import { SCBadge } from "@/components/sc/sc-badge";
import { SCButton } from "@/components/sc/sc-button";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Film {
  id: string;
  title: string;
  description: string;
  url?: string;
  thumbnailUrl?: string;
  duration: string;
  tags: string[];
  plays: number;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Fallback data (real clips, real stats)                             */
/* ------------------------------------------------------------------ */

const FALLBACK_FILMS: Film[] = [
  {
    id: "film-1",
    title: "Week 3 vs Arrowhead \u2014 Pancake Blocks",
    description: "3 pancake blocks in run game",
    tags: ["run-blocking", "pancake", "varsity"],
    plays: 47,
    duration: "2:15",
    createdAt: "2025-10-15",
  },
  {
    id: "film-2",
    title: "Pass Protection Reps \u2014 Fall Camp",
    description: "1-on-1 pass pro drills against D-line",
    tags: ["pass-pro", "camp", "technique"],
    plays: 32,
    duration: "1:45",
    createdAt: "2025-08-20",
  },
  {
    id: "film-3",
    title: "Game Film: Pewaukee vs Kettle Moraine",
    description: "Full game snaps, both OL and DL",
    tags: ["game-film", "OL", "DL", "varsity"],
    plays: 89,
    duration: "4:30",
    createdAt: "2025-09-28",
  },
  {
    id: "film-4",
    title: "Strength Training Highlights",
    description: "445 deadlift, 350 squat, 265 bench clips",
    tags: ["strength", "training", "measurables"],
    plays: 156,
    duration: "1:20",
    createdAt: "2026-01-10",
  },
  {
    id: "film-5",
    title: "Camp Highlights \u2014 UW-Whitewater",
    description: "Best reps from summer prospect day",
    tags: ["camp", "UW-Whitewater", "showcase"],
    plays: 63,
    duration: "3:00",
    createdAt: "2025-07-12",
  },
];

/* ------------------------------------------------------------------ */
/*  Filter tags                                                        */
/* ------------------------------------------------------------------ */

const FILTER_TAGS = [
  { label: "All", value: "all" },
  { label: "Run Blocking", value: "run-blocking" },
  { label: "Pass Pro", value: "pass-pro" },
  { label: "Game Film", value: "game-film" },
  { label: "Camp", value: "camp" },
  { label: "Strength", value: "strength" },
] as const;

/* ------------------------------------------------------------------ */
/*  Icons (inline SVG to avoid dependency)                             */
/* ------------------------------------------------------------------ */

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function FilmIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="7" x2="7" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="17" x2="22" y2="17" />
      <line x1="17" y1="7" x2="22" y2="7" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FilmLibrary() {
  const [films, setFilms] = useState<Film[]>([]);
  const [activeTag, setActiveTag] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  /* Fetch films from API, fall back to static data */
  useEffect(() => {
    let cancelled = false;

    async function fetchFilms() {
      try {
        const res = await fetch("/api/videos");
        if (!res.ok) throw new Error("API error");
        const data = await res.json();

        if (!cancelled) {
          const videos: Film[] = data.videos ?? data.assets ?? [];
          setFilms(videos.length > 0 ? videos : FALLBACK_FILMS);
        }
      } catch {
        if (!cancelled) {
          setFilms(FALLBACK_FILMS);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchFilms();
    return () => {
      cancelled = true;
    };
  }, []);

  /* Filter logic */
  const filtered =
    activeTag === "all"
      ? films
      : films.filter((f) => f.tags.some((t) => t === activeTag));

  /* Copy shareable link */
  const handleShare = useCallback(
    async (film: Film) => {
      const url = film.url ?? `${window.location.origin}/film/${film.id}`;
      try {
        await navigator.clipboard.writeText(url);
        setCopiedId(film.id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch {
        // Fallback for non-secure contexts
        const input = document.createElement("input");
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
        setCopiedId(film.id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    },
    []
  );

  /* ---- Loading skeleton ---- */
  if (loading) {
    return (
      <div className="space-y-6">
        <SCPageHeader title="Film Library" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SCGlassCard key={i} className="p-4 animate-pulse">
              <div className="h-40 bg-white/5 rounded-lg mb-3" />
              <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </SCGlassCard>
          ))}
        </div>
      </div>
    );
  }

  /* ---- Empty state ---- */
  if (films.length === 0) {
    return (
      <div className="space-y-6">
        <SCPageHeader title="Film Library" />
        <SCGlassCard className="p-12 text-center">
          <FilmIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400 text-lg font-medium">
            No films yet. Upload your first highlight reel.
          </p>
        </SCGlassCard>
      </div>
    );
  }

  /* ---- Main render ---- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <SCPageHeader
        title="Film Library"
        actions={
          <SCBadge variant="primary">
            {films.length} {films.length === 1 ? "clip" : "clips"}
          </SCBadge>
        }
      />

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TAGS.map((tag) => (
          <button
            key={tag.value}
            onClick={() => setActiveTag(tag.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-tight transition-all ${
              activeTag === tag.value
                ? "bg-sc-primary text-white shadow-lg shadow-sc-primary-glow"
                : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            {tag.label}
          </button>
        ))}
      </div>

      {/* Film grid */}
      {filtered.length === 0 ? (
        <SCGlassCard className="p-8 text-center">
          <p className="text-slate-400">
            No films match this filter. Try a different tag.
          </p>
        </SCGlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((film) => (
            <SCGlassCard key={film.id} className="overflow-hidden group">
              {/* Thumbnail placeholder */}
              <div className="relative h-44 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                {film.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={film.thumbnailUrl}
                    alt={film.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <PlayIcon className="w-14 h-14 text-white/20 group-hover:text-white/40 transition-colors" />
                )}
                {/* Duration badge */}
                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {film.duration}
                </span>
              </div>

              {/* Card body */}
              <div className="p-4 space-y-3">
                {/* Title */}
                <h3 className="text-sm font-bold text-white leading-tight line-clamp-2">
                  {film.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-400 line-clamp-2">
                  {film.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {film.tags.map((tag) => (
                    <SCBadge key={tag} variant="default" className="text-[9px]">
                      {tag}
                    </SCBadge>
                  ))}
                </div>

                {/* Stats row */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    {/* Play count */}
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <EyeIcon className="w-3.5 h-3.5" />
                      {film.plays}
                    </span>
                    {/* Coach views indicator */}
                    <span className="text-[10px] text-slate-600 font-medium">
                      Coach Views
                    </span>
                  </div>

                  {/* Share button */}
                  <SCButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(film)}
                    className="text-[11px] gap-1"
                  >
                    <LinkIcon className="w-3 h-3" />
                    {copiedId === film.id ? "Copied!" : "Share Link"}
                  </SCButton>
                </div>
              </div>
            </SCGlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

export interface RecruitVideo {
  id: string;
  name: string;
  category: string | null;
  duration: number | null;
  thumbnailUrl: string | null;
  filePath: string | null;
}

/**
 * Fetches videos from /api/videos and filters for recruit page use.
 * Returns categorized video lists.
 */
export function useRecruitVideos() {
  const [videos, setVideos] = useState<RecruitVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchVideos() {
      try {
        const res = await fetch("/api/videos");
        if (!res.ok) return;

        const data: RecruitVideo[] = await res.json();
        if (cancelled) return;

        setVideos(data);
      } catch {
        // Silently fail — page renders without video
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchVideos();
    return () => {
      cancelled = true;
    };
  }, []);

  // Get highlight reels
  const highlightReels = videos.filter(
    (v) => v.category === "highlight_reel"
  );

  // Get short clips for film-stats thumbnails
  const clips = videos.filter(
    (v) => v.category === "clip" || v.category === "micro_clip"
  );

  // Get game film
  const gameFilm = videos.filter((v) => v.category === "game_film");

  return {
    videos,
    highlightReels,
    clips,
    gameFilm,
    loading,
  };
}

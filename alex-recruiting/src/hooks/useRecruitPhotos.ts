"use client";

import { useEffect, useState } from "react";
import { SECTION_PHOTOS, type SectionPhotoConfig } from "@/lib/recruit/photos";

interface PhotoRecord {
  id: string;
  name: string;
  category: string;
  filePath: string;
  favorite: boolean;
}

/**
 * Real photos of Jacob Rodgers — served from public/recruit/photos/
 * These replace AI-generated placeholders with actual game photos.
 * API photos still override these when available.
 */
const STATIC_PHOTOS: Record<string, string> = {
  hero: "/recruit/photos/hero-79.jpg",
  "film-reel": "/recruit/photos/film-reel-bg.jpg",
  origin: "/recruit/photos/training-room.jpg",
  character: "/recruit/photos/coach-portrait.jpg",
  fit: "/recruit/photos/room-fit.jpg",
};

/**
 * Returns a map of section ID -> photo URL.
 * Uses real game photos by default,
 * with API-sourced photos as overrides.
 */
export function useRecruitPhotos() {
  const [photoMap, setPhotoMap] = useState<Record<string, string>>(STATIC_PHOTOS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const host = window.location.hostname;
    if (!["localhost", "127.0.0.1"].includes(host)) {
      return () => {
        cancelled = true;
      };
    }

    async function fetchPhotos() {
      try {
        setLoading(true);
        const res = await fetch("/api/photos");
        if (!res.ok) return;

        const payload = await res.json();
        const photos: PhotoRecord[] = Array.isArray(payload)
          ? payload
          : payload.photos ?? [];

        if (cancelled || photos.length === 0) return;

        // Build overrides from real photos
        const overrides: Record<string, string> = {};
        for (const [sectionId, config] of Object.entries(SECTION_PHOTOS)) {
          const photo = findBestPhoto(photos, config);
          if (photo) {
            overrides[sectionId] = `/api/photos/${photo.id}/file`;
          }
        }

        // Merge: real photos override static defaults
        setPhotoMap((prev) => ({ ...prev, ...overrides }));
      } catch {
        // Static images remain — sections still look great
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPhotos();
    return () => {
      cancelled = true;
    };
  }, []);

  return { photoMap, loading };
}

function findBestPhoto(
  photos: PhotoRecord[],
  config: SectionPhotoConfig
): PhotoRecord | undefined {
  if (config.photoId) {
    return photos.find((p) => p.id === config.photoId);
  }
  const candidates = photos.filter((p) => p.category === config.category);
  const favorite = candidates.find((p) => p.favorite);
  return favorite || candidates[0];
}

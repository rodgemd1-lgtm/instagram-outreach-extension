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
  hero: "/recruit/photos/hero-walkout.jpg",
  "film-reel": "/recruit/photos/film-action.jpg",
  origin: "/recruit/photos/origin-stance.jpg",
  character: "/recruit/photos/character-sideline.jpg",
  fit: "/recruit/photos/fit-blocking.jpg",
};

/**
 * Returns a map of section ID -> photo URL.
 * Uses real game photos by default,
 * with API-sourced photos as overrides.
 */
export function useRecruitPhotos() {
  const [photoMap, setPhotoMap] = useState<Record<string, string>>(STATIC_PHOTOS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchPhotos() {
      try {
        const res = await fetch("/api/photos");
        if (!res.ok) return;

        const photos: PhotoRecord[] = await res.json();
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

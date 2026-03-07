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
 * Fetches curated photos from /api/photos for the recruit page.
 * Returns a map of section ID -> photo URL.
 */
export function useRecruitPhotos() {
  const [photoMap, setPhotoMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchPhotos() {
      try {
        // Fetch all photos
        const res = await fetch("/api/photos");
        if (!res.ok) return;

        const photos: PhotoRecord[] = await res.json();

        if (cancelled) return;

        // Build section -> photo URL map
        const map: Record<string, string> = {};

        for (const [sectionId, config] of Object.entries(SECTION_PHOTOS)) {
          const photo = findBestPhoto(photos, config);
          if (photo) {
            map[sectionId] = `/api/photos/${photo.id}/file`;
          }
        }

        setPhotoMap(map);
      } catch {
        // Silently fail — sections render fine without photos
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
  // If a specific ID is requested, use it
  if (config.photoId) {
    return photos.find((p) => p.id === config.photoId);
  }

  // Filter by category
  const candidates = photos.filter((p) => p.category === config.category);

  // Prefer favorites
  const favorite = candidates.find((p) => p.favorite);
  if (favorite) return favorite;

  // Return first match
  return candidates[0];
}

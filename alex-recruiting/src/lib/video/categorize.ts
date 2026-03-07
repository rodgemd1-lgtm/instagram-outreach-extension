import type { VideoCategory } from "@/lib/types";

export function categorizeVideo(
  durationSeconds: number,
  fileSizeBytes: number
): VideoCategory {
  const sizeMB = fileSizeBytes / (1024 * 1024);

  if (durationSeconds > 120 && sizeMB > 100) return "highlight_reel";
  if (durationSeconds > 30 && sizeMB > 30) return "game_film";
  if (durationSeconds < 5) return "micro_clip";
  return "clip";
}

"use client";

interface StalenessIndicatorProps {
  lastUpdated: string | null;
  className?: string;
}

function getRelativeTime(isoString: string): { text: string; isStale: boolean } {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;

  if (Number.isNaN(diffMs) || diffMs < 0) {
    return { text: "Updated just now", isStale: false };
  }

  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);

  if (minutes < 1) {
    return { text: "Updated just now", isStale: false };
  }
  if (minutes < 60) {
    return { text: `Updated ${minutes}m ago`, isStale: false };
  }
  if (hours < 24) {
    return { text: `Updated ${hours}h ago`, isStale: false };
  }
  return {
    text: `Data is ${days} day${days === 1 ? "" : "s"} old`,
    isStale: true,
  };
}

export function StalenessIndicator({ lastUpdated, className = "" }: StalenessIndicatorProps) {
  if (!lastUpdated) return null;

  const { text, isStale } = getRelativeTime(lastUpdated);

  return (
    <p
      className={`text-xs ${
        isStale ? "text-amber-500" : "text-gray-400"
      } ${className}`}
    >
      {isStale ? "\u26A0\uFE0F " : ""}
      {text}
    </p>
  );
}

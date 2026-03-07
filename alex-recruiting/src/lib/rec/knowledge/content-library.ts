// Content library knowledge base
// Summarizes Jacob's video inventory for system prompt injection

let videoStoreAvailable = false;
let getAllAssets: (() => Array<{ category: string | null; name: string }>) | null = null;

try {
  // Attempt to import the video store — may fail in non-Node environments or if store doesn't exist
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const store = require("@/lib/video/store");
  if (store && typeof store.getAllAssets === "function") {
    getAllAssets = store.getAllAssets;
    videoStoreAvailable = true;
  }
} catch {
  videoStoreAvailable = false;
}

interface VideoSummary {
  total: number;
  highlightReels: number;
  gameFilm: number;
  clips: number;
  microClips: number;
}

function getVideoSummaryFromStore(): VideoSummary | null {
  if (!videoStoreAvailable || !getAllAssets) return null;

  try {
    const assets = getAllAssets();
    if (!assets || assets.length === 0) return null;

    const summary: VideoSummary = {
      total: assets.length,
      highlightReels: 0,
      gameFilm: 0,
      clips: 0,
      microClips: 0,
    };

    for (const asset of assets) {
      const cat = asset.category || "clip";
      switch (cat) {
        case "highlight_reel":
          summary.highlightReels++;
          break;
        case "game_film":
          summary.gameFilm++;
          break;
        case "micro_clip":
          summary.microClips++;
          break;
        case "clip":
        default:
          summary.clips++;
          break;
      }
    }

    return summary;
  } catch {
    return null;
  }
}

function getStaticSummary(): VideoSummary {
  return {
    total: 74,
    highlightReels: 1,
    gameFilm: 1,
    clips: 57,
    microClips: 15,
  };
}

export function getKnowledgeContext(): string {
  const lines: string[] = [];
  const summary = getVideoSummaryFromStore() || getStaticSummary();
  const isLive = getVideoSummaryFromStore() !== null;

  lines.push("=== CONTENT LIBRARY (Jacob's Video Inventory) ===\n");
  lines.push(`Source: ${isLive ? "Live video store" : "Static baseline (video store not loaded)"}\n`);

  lines.push(`Total videos: ${summary.total}`);
  lines.push(`  Highlight reels: ${summary.highlightReels}`);
  lines.push(`  Game film: ${summary.gameFilm}`);
  lines.push(`  Training/play clips: ${summary.clips}`);
  lines.push(`  Micro clips (< 15s, optimized for X): ${summary.microClips}`);

  lines.push("\nCONTENT STRATEGY NOTES:");
  lines.push("  - Highlight reel should be pinned post and included in every coach DM");
  lines.push("  - Game film clips best for Tuesday-Thursday posting (coach film review windows)");
  lines.push("  - Micro clips optimized for X autoplay — use for daily engagement posts");
  lines.push("  - Training clips show work ethic — post these on weight room / offseason days");
  lines.push("  - Rotate content categories to maintain the 40/30/15/10/5 content mix");

  if (summary.total < 50) {
    lines.push("\n  WARNING: Video inventory is below 50. Prioritize filming more training and game content.");
  }

  return lines.join("\n");
}

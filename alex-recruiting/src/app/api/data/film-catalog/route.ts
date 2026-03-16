/**
 * POST /api/data/film-catalog
 *
 * Catalogs film and video assets from the database, generating metadata summaries
 * and suggesting a catalog structure based on content pillar distribution.
 *
 * Request body (optional):
 *   { refresh?: boolean }  — force re-scan of all assets (default: false)
 *
 * Response:
 *   {
 *     success: true,
 *     catalog: {
 *       totalClips: number,
 *       totalDuration: number,
 *       categories: CategorySummary[],
 *       sources: SourceSummary[],
 *       suggestions: SuggestedClip[],
 *       lastUpdated: string
 *     }
 *   }
 *
 * If no video data exists in the database, returns a suggested catalog structure
 * with recommended clips per category based on the weekly content calendar.
 */

import { NextRequest, NextResponse } from "next/server";
import { db, isDbConfigured } from "@/lib/db";
import * as schema from "@/lib/db/schema";

interface CategorySummary {
  category: string;
  label: string;
  clipCount: number;
  totalDuration: number;
  averageDuration: number;
}

interface SourceSummary {
  source: string;
  clipCount: number;
  totalSize: number;
}

interface SuggestedClip {
  category: string;
  title: string;
  description: string;
  pillar: string;
  priority: "high" | "medium" | "low";
  estimatedDuration: number;
}

interface FilmCatalog {
  totalClips: number;
  totalDuration: number;
  categories: CategorySummary[];
  sources: SourceSummary[];
  suggestions: SuggestedClip[];
  lastUpdated: string;
}

/** All recognized video categories and their display labels. */
const CATEGORY_LABELS: Record<string, string> = {
  game_film: "Game Film",
  training: "Training Clips",
  camp: "Camp Footage",
  highlight_reel: "Highlight Reels",
  interview: "Interview / Character",
  micro_clip: "Micro Clips (Social)",
};

export async function POST(req: NextRequest) {
  try {
    await req.json().catch(() => ({}));

    let catalog: FilmCatalog;

    if (isDbConfigured()) {
      try {
        catalog = await buildCatalogFromDb();
      } catch (dbError) {
        console.error("[film-catalog] DB query failed:", dbError);
        catalog = buildSuggestedCatalog();
      }
    } else {
      catalog = buildSuggestedCatalog();
    }

    return NextResponse.json({
      success: true,
      catalog,
    });
  } catch (error) {
    console.error("[POST /api/data/film-catalog]", error);
    return NextResponse.json(
      {
        error: `Film catalog failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}

/**
 * Build catalog from actual video asset records in the database.
 */
async function buildCatalogFromDb(): Promise<FilmCatalog> {
  const assets = await db.select().from(schema.videoAssets);

  if (assets.length === 0) {
    // No video data — return suggested catalog structure
    return buildSuggestedCatalog();
  }

  // Aggregate by category
  const categoryMap = new Map<string, { clips: number; duration: number }>();
  const sourceMap = new Map<string, { clips: number; size: number }>();
  let totalDuration = 0;

  for (const asset of assets) {
    const cat = asset.category || "uncategorized";
    const existing = categoryMap.get(cat) || { clips: 0, duration: 0 };
    existing.clips += 1;
    existing.duration += asset.duration || 0;
    categoryMap.set(cat, existing);

    const src = asset.source || "unknown";
    const srcExisting = sourceMap.get(src) || { clips: 0, size: 0 };
    srcExisting.clips += 1;
    srcExisting.size += asset.fileSize || 0;
    sourceMap.set(src, srcExisting);

    totalDuration += asset.duration || 0;
  }

  const categories: CategorySummary[] = Array.from(categoryMap.entries()).map(
    ([category, data]) => ({
      category,
      label: CATEGORY_LABELS[category] || category,
      clipCount: data.clips,
      totalDuration: data.duration,
      averageDuration: data.clips > 0 ? Math.round(data.duration / data.clips) : 0,
    })
  );

  const sources: SourceSummary[] = Array.from(sourceMap.entries()).map(
    ([source, data]) => ({
      source,
      clipCount: data.clips,
      totalSize: data.size,
    })
  );

  // Generate suggestions for missing or underrepresented categories
  const suggestions = generateSuggestions(categoryMap);

  return {
    totalClips: assets.length,
    totalDuration,
    categories: categories.sort((a, b) => b.clipCount - a.clipCount),
    sources: sources.sort((a, b) => b.clipCount - a.clipCount),
    suggestions,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Build a suggested catalog structure when no video data exists.
 * Based on the weekly content calendar pillar distribution:
 *   - Performance: game film, highlight reels (3 days/week)
 *   - Work Ethic: training clips (2 days/week)
 *   - Character: interviews, off-field content (2 days/week)
 */
function buildSuggestedCatalog(): FilmCatalog {
  const categories: CategorySummary[] = Object.entries(CATEGORY_LABELS).map(
    ([category, label]) => ({
      category,
      label,
      clipCount: 0,
      totalDuration: 0,
      averageDuration: 0,
    })
  );

  const suggestions = generateFullSuggestions();

  return {
    totalClips: 0,
    totalDuration: 0,
    categories,
    sources: [],
    suggestions,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Generate clip suggestions for categories that are missing or underrepresented,
 * accounting for existing content in the database.
 */
function generateSuggestions(
  existingCategories: Map<string, { clips: number; duration: number }>
): SuggestedClip[] {
  const suggestions: SuggestedClip[] = [];

  // Target clip counts per category based on weekly pillar distribution
  const targetCounts: Record<string, number> = {
    game_film: 8,
    training: 6,
    camp: 4,
    highlight_reel: 3,
    interview: 3,
    micro_clip: 10,
  };

  for (const [category, target] of Object.entries(targetCounts)) {
    const existing = existingCategories.get(category)?.clips || 0;
    if (existing < target) {
      const deficit = target - existing;
      const templateSuggestions = getSuggestionsForCategory(category);
      // Add up to the deficit number of suggestions
      suggestions.push(...templateSuggestions.slice(0, deficit));
    }
  }

  return suggestions;
}

/**
 * Generate a full set of suggestions when no content exists at all.
 */
function generateFullSuggestions(): SuggestedClip[] {
  const allSuggestions: SuggestedClip[] = [];

  const categories = [
    "game_film",
    "training",
    "camp",
    "highlight_reel",
    "interview",
    "micro_clip",
  ];

  for (const category of categories) {
    allSuggestions.push(...getSuggestionsForCategory(category));
  }

  return allSuggestions;
}

/**
 * Get template suggestions for a specific video category.
 */
function getSuggestionsForCategory(category: string): SuggestedClip[] {
  switch (category) {
    case "game_film":
      return [
        {
          category: "game_film",
          title: "Varsity Game Highlights - Full Drive",
          description:
            "Capture a full offensive drive from a varsity game showing multiple blocking assignments. Include pass protection and run blocking sequences.",
          pillar: "performance",
          priority: "high",
          estimatedDuration: 120,
        },
        {
          category: "game_film",
          title: "Pass Protection Reps - All-22 Angle",
          description:
            "Compile 8-10 pass protection reps from the All-22 film angle. Show technique in both 1-on-1 and slide protection scenarios.",
          pillar: "performance",
          priority: "high",
          estimatedDuration: 90,
        },
        {
          category: "game_film",
          title: "Run Blocking Highlights - Zone Scheme",
          description:
            "Select best run blocking reps showing zone-blocking technique, combo blocks, and finishing at the second level.",
          pillar: "performance",
          priority: "high",
          estimatedDuration: 90,
        },
        {
          category: "game_film",
          title: "Pancake Block Compilation",
          description:
            "Compile the best pancake blocks from the season. Coaches love seeing dominance at the point of attack.",
          pillar: "performance",
          priority: "medium",
          estimatedDuration: 60,
        },
      ];

    case "training":
      return [
        {
          category: "training",
          title: "Weight Room Session - Squat/Clean Day",
          description:
            "Film a full weight room session highlighting squat and power clean PRs. Show proper form and intensity.",
          pillar: "work_ethic",
          priority: "high",
          estimatedDuration: 60,
        },
        {
          category: "training",
          title: "Footwork Drill Progression",
          description:
            "Record a ladder drill and pass-set footwork progression. Show improvement over time with side-by-side comparisons.",
          pillar: "work_ethic",
          priority: "medium",
          estimatedDuration: 45,
        },
        {
          category: "training",
          title: "Spring Practice - Individual Period",
          description:
            "Capture OL individual period drills during spring practice. Show hand placement, punch technique, and kick-slide.",
          pillar: "work_ethic",
          priority: "high",
          estimatedDuration: 90,
        },
      ];

    case "camp":
      return [
        {
          category: "camp",
          title: "University Camp - 1-on-1 Pass Rush Reps",
          description:
            "Film all 1-on-1 pass rush reps at university prospect camps. These are the most-watched clips by college coaches.",
          pillar: "performance",
          priority: "high",
          estimatedDuration: 120,
        },
        {
          category: "camp",
          title: "Camp Measurables and Testing",
          description:
            "Record official measurables testing at camps: height, weight, wingspan, 40-yard dash, shuttle, and vertical jump.",
          pillar: "performance",
          priority: "medium",
          estimatedDuration: 45,
        },
      ];

    case "highlight_reel":
      return [
        {
          category: "highlight_reel",
          title: "Sophomore Season Highlight Reel (2:00)",
          description:
            "A 2-minute highlight reel combining the best game film, pancake blocks, and pull blocks from the sophomore season. Add music and title cards.",
          pillar: "performance",
          priority: "high",
          estimatedDuration: 120,
        },
        {
          category: "highlight_reel",
          title: "Complete Player Showcase (3:00)",
          description:
            "A comprehensive 3-minute reel showing pass protection, run blocking, and athleticism. Include measurables overlay and contact info at the end.",
          pillar: "performance",
          priority: "medium",
          estimatedDuration: 180,
        },
      ];

    case "interview":
      return [
        {
          category: "interview",
          title: "Why I Play Football - Personal Story",
          description:
            "A 60-second authentic piece about what football means to you, your goals, and your work ethic. Coaches want to see character and coachability.",
          pillar: "character",
          priority: "medium",
          estimatedDuration: 60,
        },
        {
          category: "interview",
          title: "Team Leadership Moment",
          description:
            "Capture a genuine leadership moment — pre-game huddle, coaching a teammate, or post-game sportsmanship. Shows character beyond film.",
          pillar: "character",
          priority: "medium",
          estimatedDuration: 45,
        },
      ];

    case "micro_clip":
      return [
        {
          category: "micro_clip",
          title: "Best Play of the Week (15s)",
          description:
            "A 15-second clip of the best play from the latest game or practice. Optimized for X/Twitter autoplay.",
          pillar: "performance",
          priority: "high",
          estimatedDuration: 15,
        },
        {
          category: "micro_clip",
          title: "Training Clip of the Day (10s)",
          description:
            "A 10-second clip from the gym or practice field. Short, punchy content that keeps the profile active between games.",
          pillar: "work_ethic",
          priority: "high",
          estimatedDuration: 10,
        },
        {
          category: "micro_clip",
          title: "Pancake Block - Slow Motion (8s)",
          description:
            "A slow-motion pancake block clip. These consistently get the highest engagement from football Twitter.",
          pillar: "performance",
          priority: "medium",
          estimatedDuration: 8,
        },
      ];

    default:
      return [];
  }
}

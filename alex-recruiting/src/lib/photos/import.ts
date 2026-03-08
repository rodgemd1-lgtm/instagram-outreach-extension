// Import photos from local directories into the photo store

import fs from "fs";
import path from "path";
import { insertPhoto, type PhotoAssetRecord } from "./store";

const PHOTO_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".heic", ".webp"]);

interface PhotoSource {
  dir: string;
  label: string;
  categoryHint: PhotoAssetRecord["category"];
}

const PHOTO_SOURCES: PhotoSource[] = [
  {
    dir: "/Users/mikerodgers/Downloads/iCloud Photos from Michael Rodgers",
    label: "iCloud Photos",
    categoryHint: "action",
  },
  {
    dir: "/Users/mikerodgers/Desktop/Images",
    label: "Desktop Images",
    categoryHint: "other",
  },
  {
    dir: "/Users/mikerodgers/Desktop/Images/Photos",
    label: "Desktop Photos",
    categoryHint: "other",
  },
  {
    dir: "/Users/mikerodgers/Desktop/Images/Hero Images",
    label: "Hero Images",
    categoryHint: "generated",
  },
  {
    dir: "/Users/mikerodgers/Desktop/Videos/Jake's Videos",
    label: "Jake's Videos Folder",
    categoryHint: "portrait",
  },
];

function getMimeType(ext: string): string {
  const types: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".heic": "image/heic",
    ".webp": "image/webp",
  };
  return types[ext.toLowerCase()] || "image/unknown";
}

function guessCategory(filePath: string, hint: PhotoAssetRecord["category"]): PhotoAssetRecord["category"] {
  const name = path.basename(filePath).toLowerCase();

  if (name.includes("profile")) return "profile";
  if (name.includes("event")) return "event";

  // iCloud IMG_0245-0253 are known action/game shots
  const match = name.match(/img_(\d+)/);
  if (match) {
    const num = parseInt(match[1]);
    if (num >= 245 && num <= 253) return "action";
    if (num >= 3884 && num <= 3898) return "training";
    if (num >= 4684 && num <= 4691) return "action";
  }

  // hf_ prefix files are AI-generated
  if (name.startsWith("hf_")) return "generated";

  // att. prefix files are small attachment thumbnails
  if (name.startsWith("att.")) return "other";

  return hint;
}

function guessTags(filePath: string, category: PhotoAssetRecord["category"]): string[] {
  const tags: string[] = ["jacob-rodgers"];

  if (category === "action") tags.push("football", "game-action");
  if (category === "training") tags.push("football", "training", "offseason");
  if (category === "portrait") tags.push("portrait");
  if (category === "profile") tags.push("profile", "headshot");
  if (category === "generated") tags.push("ai-generated");
  if (category === "team") tags.push("football", "team");

  return tags;
}

export function importPhotosFromSources(): { imported: number; skipped: number; errors: string[] } {
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const source of PHOTO_SOURCES) {
    if (!fs.existsSync(source.dir)) {
      errors.push(`Directory not found: ${source.dir}`);
      continue;
    }

    let files: string[];
    try {
      files = fs.readdirSync(source.dir);
    } catch {
      errors.push(`Cannot read directory: ${source.dir}`);
      continue;
    }

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!PHOTO_EXTENSIONS.has(ext)) continue;

      const filePath = path.join(source.dir, file);

      try {
        const stat = fs.statSync(filePath);
        const category = guessCategory(filePath, source.categoryHint);
        const tags = guessTags(filePath, category);

        const result = insertPhoto({
          name: file,
          source: source.label,
          sourceFolder: source.dir,
          filePath,
          fileSize: stat.size,
          mimeType: getMimeType(ext),
          tags,
          category,
          width: null,
          height: null,
          description: null,
          favorite: category === "action" || category === "profile",
        });

        // insertPhoto returns existing record if already imported (dedupe)
        if (result.createdAt === new Date().toISOString().split("T")[0]) {
          imported++;
        } else {
          imported++; // Count as imported since insertPhoto handles dedupe
        }
      } catch (e) {
        errors.push(`Error importing ${file}: ${e}`);
        skipped++;
      }
    }
  }

  return { imported, skipped, errors };
}

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
  {
    dir: "/Users/mikerodgers/Desktop/Jacob Media Master",
    label: "Jacob Media Master",
    categoryHint: "action",
  },
  {
    dir: "/tmp/alex-recruiting-export",
    label: "Photos App Export",
    categoryHint: "action",
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
  const normalizedPath = filePath.toLowerCase();

  if (normalizedPath.includes("james-workout")) return "training";
  if (normalizedPath.includes("football")) return "action";

  if (name.includes("profile")) return "profile";
  if (name.includes("event")) return "event";

  // iCloud IMG_0245-0253 are known action/game shots
  const match = name.match(/img_(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 237 && num <= 253) return "action";
    if (num >= 3554 && num <= 3654) return "training";
    if (num >= 3884 && num <= 3898) return "training";
    if (num >= 4319 && num <= 4320) return "action";
    if (num >= 4684 && num <= 4691) return "action";
  }

  // hf_ prefix files are AI-generated
  if (name.startsWith("hf_")) return "generated";

  // att. prefix files are small attachment thumbnails
  if (name.startsWith("att.")) return "other";

  return hint;
}

function shouldImportPhoto(filePath: string, source: PhotoSource): boolean {
  const name = path.basename(filePath).toLowerCase();

  if (name.startsWith("hf_") || name.startsWith("att.")) return false;
  if (name.includes("chatgpt image")) return false;
  if (name.includes("hero-")) return false;
  if (name.includes("screenshot")) return false;
  if (name.startsWith("event-photo")) return false;

  if (source.label === "Photos App Export") {
    return true;
  }

  if (source.label === "Jacob Media Master") {
    return true;
  }

  if (name === "jacob profile picture.jpg") return true;
  if (name === "jake's photo.jpeg") return true;

  const match = name.match(/img_(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 237 && num <= 253) return true;
    if (num >= 3554 && num <= 3654) return true;
    if (num >= 3884 && num <= 3898) return true;
    if (num >= 4319 && num <= 4320) return true;
    if (num >= 4684 && num <= 4691) return true;
  }

  return false;
}

function collectPhotoFiles(dir: string, depth = 0): string[] {
  if (depth > 4) return [];

  let entries: string[];
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return [];
  }

  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);

    let stat;
    try {
      stat = fs.statSync(fullPath);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      files.push(...collectPhotoFiles(fullPath, depth + 1));
      continue;
    }

    if (stat.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
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

    const files = collectPhotoFiles(source.dir);
    if (files.length === 0) {
      continue;
    }

    for (const filePath of files) {
      const ext = path.extname(filePath).toLowerCase();
      if (!PHOTO_EXTENSIONS.has(ext)) continue;
      if (!shouldImportPhoto(filePath, source)) continue;

      try {
        const stat = fs.statSync(filePath);
        const category = guessCategory(filePath, source.categoryHint);
        const tags = guessTags(filePath, category);

        const result = insertPhoto({
          name: path.basename(filePath),
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

        imported += result ? 1 : 0;
      } catch (e) {
        errors.push(`Error importing ${path.basename(filePath)}: ${e}`);
        skipped++;
      }
    }
  }

  return { imported, skipped, errors };
}

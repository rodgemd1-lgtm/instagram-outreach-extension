// File-backed photo asset store for development without a database
// Persists to .photo-store.json so data survives hot reloads

import fs from "fs";
import path from "path";

const STORE_PATH = path.join(process.cwd(), ".photo-store.json");

export interface PhotoAssetRecord {
  id: string;
  name: string;
  source: string;
  sourceFolder: string | null;
  filePath: string;
  fileSize: number | null;
  mimeType: string | null;
  tags: string[];
  category: "action" | "portrait" | "training" | "team" | "event" | "generated" | "profile" | "other";
  width: number | null;
  height: number | null;
  description: string | null;
  usedInPosts: string[];
  favorite: boolean;
  createdAt: string;
}

let nextId = 1;

function generateId(): string {
  return `photo-${Date.now()}-${nextId++}`;
}

function normalizeAssetName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+\(\d+\)(?=\.[^.]+$)/, "")
    .replace(/\s+\d+(?=\.[^.]+$)/, "");
}

function readStore(): PhotoAssetRecord[] {
  try {
    const data = fs.readFileSync(STORE_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeStore(photos: PhotoAssetRecord[]): void {
  fs.writeFileSync(STORE_PATH, JSON.stringify(photos, null, 2));
}

export function getAllPhotos(): PhotoAssetRecord[] {
  return readStore().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getPhotoById(id: string): PhotoAssetRecord | undefined {
  return readStore().find((p) => p.id === id);
}

export function getPhotosByCategory(category: PhotoAssetRecord["category"]): PhotoAssetRecord[] {
  return readStore().filter((p) => p.category === category);
}

export function getFavoritePhotos(): PhotoAssetRecord[] {
  return readStore().filter((p) => p.favorite);
}

export function insertPhoto(
  data: Omit<PhotoAssetRecord, "id" | "createdAt" | "usedInPosts">
): PhotoAssetRecord {
  const store = readStore();
  const existing = store.find((photo) => {
    if (photo.filePath === data.filePath) {
      return true;
    }

    if (
      normalizeAssetName(photo.name) === normalizeAssetName(data.name) &&
      photo.fileSize !== null &&
      data.fileSize !== null &&
      photo.fileSize === data.fileSize
    ) {
      return true;
    }

    return false;
  });
  if (existing) return existing;

  const photo: PhotoAssetRecord = {
    ...data,
    id: generateId(),
    usedInPosts: [],
    createdAt: new Date().toISOString(),
  };
  store.push(photo);
  writeStore(store);
  return photo;
}

export function updatePhoto(
  id: string,
  updates: Partial<PhotoAssetRecord>
): PhotoAssetRecord | undefined {
  const store = readStore();
  const index = store.findIndex((p) => p.id === id);
  if (index === -1) return undefined;
  store[index] = { ...store[index], ...updates };
  writeStore(store);
  return store[index];
}

export function toggleFavorite(id: string): PhotoAssetRecord | undefined {
  const store = readStore();
  const index = store.findIndex((p) => p.id === id);
  if (index === -1) return undefined;
  store[index].favorite = !store[index].favorite;
  writeStore(store);
  return store[index];
}

export function getPhotoStats(): {
  total: number;
  byCategory: Record<string, number>;
  favorites: number;
  usedInPosts: number;
} {
  const store = readStore();
  const byCategory: Record<string, number> = {};
  let favorites = 0;
  let usedInPosts = 0;

  for (const photo of store) {
    byCategory[photo.category] = (byCategory[photo.category] || 0) + 1;
    if (photo.favorite) favorites++;
    if (photo.usedInPosts.length > 0) usedInPosts++;
  }

  return { total: store.length, byCategory, favorites, usedInPosts };
}

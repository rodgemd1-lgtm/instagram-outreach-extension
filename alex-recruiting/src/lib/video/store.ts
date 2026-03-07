// File-backed video asset store for development without a database
// Persists to .video-store.json so data survives hot reloads

import fs from "fs";
import path from "path";

const STORE_PATH = path.join(process.cwd(), ".video-store.json");

export interface VideoAssetRecord {
  id: string;
  name: string;
  source: string;
  sourceAlbum: string | null;
  filePath: string | null;
  supabaseUrl: string | null;
  storagePath: string | null;
  fileSize: number | null;
  duration: number | null;
  mimeType: string | null;
  tags: string[];
  thumbnailUrl: string | null;
  uploadStatus: string;
  uploadedAt: string | null;
  createdAt: string;
  category: string | null;
  optimizedFilePath: string | null;
  width: number | null;
  height: number | null;
}

let nextId = 1;

function generateId(): string {
  return `local-${Date.now()}-${nextId++}`;
}

function readStore(): VideoAssetRecord[] {
  try {
    const data = fs.readFileSync(STORE_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeStore(assets: VideoAssetRecord[]): void {
  fs.writeFileSync(STORE_PATH, JSON.stringify(assets, null, 2));
}

export function getAllAssets(): VideoAssetRecord[] {
  return readStore().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getAssetById(id: string): VideoAssetRecord | undefined {
  return readStore().find((a) => a.id === id);
}

export function insertAsset(
  data: Omit<VideoAssetRecord, "id" | "createdAt" | "supabaseUrl" | "storagePath" | "sourceAlbum" | "uploadedAt">
): VideoAssetRecord {
  const store = readStore();
  const asset: VideoAssetRecord = {
    ...data,
    id: generateId(),
    supabaseUrl: null,
    storagePath: null,
    sourceAlbum: null,
    uploadedAt: null,
    createdAt: new Date().toISOString(),
  };
  store.push(asset);
  writeStore(store);
  return asset;
}

export function updateAsset(
  id: string,
  updates: Partial<VideoAssetRecord>
): VideoAssetRecord | undefined {
  const store = readStore();
  const index = store.findIndex((a) => a.id === id);
  if (index === -1) return undefined;
  store[index] = { ...store[index], ...updates };
  writeStore(store);
  return store[index];
}

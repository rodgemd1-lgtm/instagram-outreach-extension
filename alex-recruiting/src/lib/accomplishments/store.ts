// File-backed accomplishments store for development without a database
// Persists to .accomplishments.json so data survives hot reloads
// Uses Supabase if configured, otherwise falls back to file store

import fs from "fs";
import path from "path";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { createAdminClient } from "@/lib/supabase/admin";

const STORE_PATH = path.join(process.cwd(), ".accomplishments.json");
const TABLE_NAME = "accomplishments";

export interface Accomplishment {
  id: string;
  type: "pr" | "award" | "milestone";
  title: string;
  value: string;
  unit: string;
  mediaUrl: string | null;
  mediaPath: string | null;
  postedToX: boolean;
  tweetId: string | null;
  createdAt: string;
}

let nextId = 1;

function generateId(): string {
  return `acc-${Date.now()}-${nextId++}`;
}

// ---------------------------------------------------------------------------
// File-backed helpers
// ---------------------------------------------------------------------------

function readFileStore(): Accomplishment[] {
  try {
    const data = fs.readFileSync(STORE_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeFileStore(items: Accomplishment[]): void {
  fs.writeFileSync(STORE_PATH, JSON.stringify(items, null, 2));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function addAccomplishment(
  data: Omit<Accomplishment, "id" | "createdAt" | "postedToX" | "tweetId">
): Promise<Accomplishment> {
  const accomplishment: Accomplishment = {
    ...data,
    id: generateId(),
    postedToX: false,
    tweetId: null,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data: row, error } = await supabase
        .from(TABLE_NAME)
        .insert({
          id: accomplishment.id,
          type: accomplishment.type,
          title: accomplishment.title,
          value: accomplishment.value,
          unit: accomplishment.unit,
          media_url: accomplishment.mediaUrl,
          media_path: accomplishment.mediaPath,
          posted_to_x: false,
          tweet_id: null,
          created_at: accomplishment.createdAt,
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase insert failed, falling back to file store:", error.message);
      } else if (row) {
        return mapRow(row);
      }
    } catch (err) {
      console.error("Supabase error, falling back to file store:", err);
    }
  }

  // File-backed fallback
  const store = readFileStore();
  store.push(accomplishment);
  writeFileStore(store);
  return accomplishment;
}

export async function getAccomplishments(): Promise<Accomplishment[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data: rows, error } = await supabase
        .from(TABLE_NAME)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase select failed, falling back to file store:", error.message);
      } else if (rows) {
        return rows.map(mapRow);
      }
    } catch (err) {
      console.error("Supabase error, falling back to file store:", err);
    }
  }

  // File-backed fallback — return reverse chronological
  return readFileStore().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function markPosted(id: string, tweetId: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from(TABLE_NAME)
        .update({ posted_to_x: true, tweet_id: tweetId })
        .eq("id", id);

      if (error) {
        console.error("Supabase update failed, falling back to file store:", error.message);
      } else {
        return;
      }
    } catch (err) {
      console.error("Supabase error, falling back to file store:", err);
    }
  }

  // File-backed fallback
  const store = readFileStore();
  const index = store.findIndex((a) => a.id === id);
  if (index !== -1) {
    store[index].postedToX = true;
    store[index].tweetId = tweetId;
    writeFileStore(store);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapRow(row: any): Accomplishment {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    value: row.value,
    unit: row.unit,
    mediaUrl: row.media_url ?? null,
    mediaPath: row.media_path ?? null,
    postedToX: row.posted_to_x ?? false,
    tweetId: row.tweet_id ?? null,
    createdAt: row.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

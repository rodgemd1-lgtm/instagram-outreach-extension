import { createAdminClient, isSupabaseConfigured } from "./admin";

const MEDIA_BUCKET = "media";
const DOCUMENTS_BUCKET = "documents";

/**
 * Ensure required storage buckets exist.
 * Creates "media" (public, 100MB, images + video) and "documents" (private, 50MB).
 * No-op if Supabase is not configured.
 */
export async function ensureBuckets() {
  if (!isSupabaseConfigured()) return;

  const supabase = createAdminClient();

  const { data: buckets } = await supabase.storage.listBuckets();
  const existing = new Set((buckets ?? []).map((b) => b.name));

  if (!existing.has(MEDIA_BUCKET)) {
    const { error } = await supabase.storage.createBucket(MEDIA_BUCKET, {
      public: true,
      fileSizeLimit: 100 * 1024 * 1024, // 100MB
      allowedMimeTypes: ["image/*", "video/*"],
    });
    if (error) console.error("Failed to create media bucket:", error.message);
  }

  if (!existing.has(DOCUMENTS_BUCKET)) {
    const { error } = await supabase.storage.createBucket(DOCUMENTS_BUCKET, {
      public: false,
      fileSizeLimit: 50 * 1024 * 1024, // 50MB
    });
    if (error)
      console.error("Failed to create documents bucket:", error.message);
  }
}

/**
 * Upload a file to the media bucket.
 * Returns { url, path } on success, or null on failure.
 */
export async function uploadMedia(
  file: Buffer | Uint8Array,
  fileName: string,
  contentType: string,
  folder?: string
): Promise<{ url: string; path: string } | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createAdminClient();
  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = folder
    ? `${folder}/${timestamp}-${safeName}`
    : `${timestamp}-${safeName}`;

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { contentType, upsert: false });

  if (error) {
    console.error("Upload failed:", error.message);
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);

  return { url: publicUrl, path };
}

/**
 * Delete a file from the media bucket.
 * Returns true on success, false on failure.
 */
export async function deleteMedia(path: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);

  if (error) {
    console.error("Delete failed:", error.message);
    return false;
  }

  return true;
}

/**
 * List files in a folder within the media bucket.
 * Returns an array of file metadata, or an empty array on failure.
 */
export async function listMedia(
  folder?: string
): Promise<{ name: string; url: string; size: number; createdAt: string }[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .list(folder ?? "", { sortBy: { column: "created_at", order: "desc" } });

  if (error) {
    console.error("List failed:", error.message);
    return [];
  }

  return (data ?? [])
    .filter((f) => f.name !== ".emptyFolderPlaceholder")
    .map((f) => {
      const filePath = folder ? `${folder}/${f.name}` : f.name;
      const {
        data: { publicUrl },
      } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(filePath);

      return {
        name: f.name,
        url: publicUrl,
        size: f.metadata?.size ?? 0,
        createdAt: f.created_at ?? "",
      };
    });
}

/**
 * Get the public URL for a file path in the media bucket.
 */
export function getPublicUrl(path: string): string | null {
  if (!isSupabaseConfigured()) return null;

  const supabase = createAdminClient();
  const {
    data: { publicUrl },
  } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);

  return publicUrl;
}

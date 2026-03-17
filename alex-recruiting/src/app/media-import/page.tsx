"use client";

import { useState, useCallback, useRef, type DragEvent, type ChangeEvent } from "react";
import { SCPageHeader } from "@/components/sc/sc-page-header";
import { SCGlassCard } from "@/components/sc/sc-glass-card";
import { SCStatCard } from "@/components/sc/sc-stat-card";
import { SCBadge } from "@/components/sc/sc-badge";
import { SCButton } from "@/components/sc/sc-button";

interface UploadFile {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  result?: { url: string; path: string };
  error?: string;
}

const CATEGORIES = [
  { value: "training", label: "Training" },
  { value: "game", label: "Game Film" },
  { value: "camp", label: "Camp" },
  { value: "portrait", label: "Portrait" },
  { value: "team", label: "Team" },
  { value: "other", label: "Other" },
];

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "video/webm",
];

const ACCEPT_STRING = ".jpg,.jpeg,.png,.heic,.webp,.mp4,.mov,.webm";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isVideo(type: string): boolean {
  return type.startsWith("video/");
}

const statusConfig: Record<string, { variant: "default" | "info" | "success" | "danger"; label: string }> = {
  pending: { variant: "default", label: "Pending" },
  uploading: { variant: "info", label: "Uploading" },
  done: { variant: "success", label: "Done" },
  error: { variant: "danger", label: "Failed" },
};

export default function MediaImportPage() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [category, setCategory] = useState("training");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const newFiles: UploadFile[] = [];
    for (const file of Array.from(incoming)) {
      if (!ACCEPTED_TYPES.includes(file.type)) continue;
      const preview = isVideo(file.type) ? "" : URL.createObjectURL(file);
      newFiles.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        preview,
        status: "pending",
        progress: 0,
      });
    }
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleFileSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
        e.target.value = "";
      }
    },
    [addFiles]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const uploadFile = useCallback(
    async (uploadFile: UploadFile): Promise<UploadFile> => {
      const formData = new FormData();
      formData.append("file", uploadFile.file);
      formData.append("category", category);
      try {
        const response = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error || `Upload failed (${response.status})`);
        }
        const result = await response.json();
        return { ...uploadFile, status: "done", progress: 100, result };
      } catch (err) {
        return {
          ...uploadFile,
          status: "error",
          error: err instanceof Error ? err.message : "Upload failed",
        };
      }
    },
    [category]
  );

  const uploadAll = useCallback(async () => {
    const pending = files.filter((f) => f.status === "pending");
    if (pending.length === 0) return;
    setIsUploading(true);
    for (const file of pending) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id ? { ...f, status: "uploading", progress: 0 } : f
        )
      );
      const updated = await uploadFile(file);
      setFiles((prev) => prev.map((f) => (f.id === file.id ? updated : f)));
    }
    setIsUploading(false);
  }, [files, uploadFile]);

  const clearCompleted = useCallback(() => {
    setFiles((prev) => {
      for (const f of prev) {
        if (f.status === "done" && f.preview) URL.revokeObjectURL(f.preview);
      }
      return prev.filter((f) => f.status !== "done");
    });
  }, []);

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const doneCount = files.filter((f) => f.status === "done").length;
  const errorCount = files.filter((f) => f.status === "error").length;

  return (
    <div className="space-y-6">
      <SCPageHeader
        title="MEDIA IMPORT"
        subtitle="Upload photos and videos to Supabase storage"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {pendingCount > 0 && (
              <SCButton onClick={uploadAll} disabled={isUploading}>
                {isUploading ? (
                  <span className="material-symbols-outlined text-[16px] animate-spin mr-1">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[16px] mr-1">cloud_upload</span>
                )}
                {isUploading
                  ? "Uploading..."
                  : `Upload ${pendingCount} file${pendingCount !== 1 ? "s" : ""}`}
              </SCButton>
            )}
            {doneCount > 0 && (
              <SCButton variant="secondary" onClick={clearCompleted}>
                Clear completed ({doneCount})
              </SCButton>
            )}
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SCStatCard label="Total Files" value={String(files.length)} icon="folder" />
        <SCStatCard label="Pending" value={String(pendingCount)} icon="hourglass_top" />
        <SCStatCard label="Uploaded" value={String(doneCount)} icon="check_circle" />
        <SCStatCard label="Failed" value={String(errorCount)} icon="error" />
      </div>

      {/* Category selector */}
      <SCGlassCard className="p-4">
        <div className="flex items-center gap-3">
          <label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Category:
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-sc-border bg-white/5 px-3 py-2 text-sm text-white focus:border-sc-primary/50 focus:outline-none focus:ring-1 focus:ring-sc-primary/50"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value} className="bg-sc-bg text-white">
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </SCGlassCard>

      {errorCount > 0 && (
        <p className="text-sm text-red-400">{errorCount} failed</p>
      )}

      {/* Drag-and-drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
          isDragging
            ? "border-sc-primary bg-sc-primary/10"
            : "border-sc-border bg-sc-surface/30 hover:border-slate-500 hover:bg-sc-surface/50"
        }`}
      >
        <div className="pointer-events-none flex flex-col items-center gap-3 text-center px-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sc-surface">
            <span className={`material-symbols-outlined text-[32px] ${isDragging ? "text-sc-primary" : "text-slate-400"}`}>
              cloud_upload
            </span>
          </div>
          <div>
            <p className="text-lg font-medium text-white">
              {isDragging ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="mt-1 text-sm text-slate-400">or click to browse</p>
          </div>
          <p className="text-xs text-slate-500">
            JPG, PNG, HEIC, WEBP, MP4, MOV, WEBM -- up to 100MB each
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT_STRING}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Upload queue */}
      {files.length > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
            Upload Queue ({files.length})
          </p>
          <div className="space-y-3">
            {files.map((f) => (
              <SCGlassCard key={f.id} className="flex items-center gap-4 p-3">
                {/* Thumbnail */}
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-sc-surface">
                  {f.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={f.preview}
                      alt={f.file.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="material-symbols-outlined text-[24px] text-slate-500">
                        {isVideo(f.file.type) ? "play_circle" : "image"}
                      </span>
                    </div>
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{f.file.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(f.file.size)}
                    {f.file.type && ` -- ${f.file.type.split("/")[1].toUpperCase()}`}
                  </p>

                  {f.status === "uploading" && (
                    <div className="mt-2 h-1.5 w-full rounded-full bg-white/5">
                      <div
                        className="h-1.5 rounded-full bg-sc-primary shadow-[0_0_8px_rgba(197,5,12,0.5)] transition-all duration-300"
                        style={{ width: `${f.progress}%` }}
                      />
                    </div>
                  )}

                  {f.status === "error" && (
                    <p className="mt-1 text-xs text-red-400">{f.error}</p>
                  )}

                  {f.status === "done" && f.result && (
                    <p className="mt-1 text-xs text-emerald-400 truncate">
                      Uploaded to {f.result.path}
                    </p>
                  )}
                </div>

                {/* Status badge */}
                <SCBadge variant={statusConfig[f.status].variant}>
                  {statusConfig[f.status].label}
                </SCBadge>

                {/* Remove button */}
                {(f.status === "pending" || f.status === "error") && (
                  <button
                    onClick={() => removeFile(f.id)}
                    className="flex-shrink-0 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label={`Remove ${f.file.name}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}
              </SCGlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Results grid -- completed uploads */}
      {doneCount > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
            Uploaded Media ({doneCount})
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {files
              .filter((f) => f.status === "done" && f.result)
              .map((f) => (
                <SCGlassCard
                  key={f.id}
                  className="group relative overflow-hidden"
                >
                  <div className="aspect-square overflow-hidden bg-sc-surface">
                    {isVideo(f.file.type) ? (
                      <video
                        src={f.result!.url}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                        onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                        onMouseOut={(e) => {
                          const v = e.target as HTMLVideoElement;
                          v.pause();
                          v.currentTime = 0;
                        }}
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={f.result!.url}
                        alt={f.file.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-slate-300 truncate">{f.file.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {formatFileSize(f.file.size)}
                    </p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        if (f.result?.url) navigator.clipboard.writeText(f.result.url);
                      }}
                      className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-white/30 transition-colors"
                    >
                      Copy URL
                    </button>
                  </div>
                </SCGlassCard>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

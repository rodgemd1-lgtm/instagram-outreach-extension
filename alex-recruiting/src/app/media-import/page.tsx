"use client";

import { useState, useCallback, useRef, type DragEvent, type ChangeEvent } from "react";

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

      const preview = isVideo(file.type)
        ? ""
        : URL.createObjectURL(file);

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
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
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
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
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
          f.id === file.id ? { ...f, status: "uploading", progress: 50 } : f
        )
      );

      const updated = await uploadFile(file);

      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? updated : f))
      );
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
    <div className="md:ml-64 min-h-screen bg-black p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Media Import</h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload photos and videos to Supabase storage
        </p>
      </div>

      {/* Category selector + actions */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label htmlFor="category" className="text-sm text-slate-300">
            Category:
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {pendingCount > 0 && (
          <button
            onClick={uploadAll}
            disabled={isUploading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading
              ? "Uploading..."
              : `Upload ${pendingCount} file${pendingCount !== 1 ? "s" : ""}`}
          </button>
        )}

        {doneCount > 0 && (
          <button
            onClick={clearCompleted}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Clear completed ({doneCount})
          </button>
        )}

        {errorCount > 0 && (
          <span className="text-sm text-red-400">
            {errorCount} failed
          </span>
        )}
      </div>

      {/* Drag-and-drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-500/10"
            : "border-slate-700 bg-slate-900/50 hover:border-slate-500 hover:bg-slate-900"
        }`}
      >
        <div className="pointer-events-none flex flex-col items-center gap-3 text-center px-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
            <svg
              className={`h-8 w-8 ${isDragging ? "text-blue-400" : "text-slate-400"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-white">
              {isDragging ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              or click to browse
            </p>
          </div>
          <p className="text-xs text-slate-500">
            JPG, PNG, HEIC, WEBP, MP4, MOV, WEBM — up to 100MB each
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
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4">
            Upload Queue ({files.length})
          </h2>

          <div className="space-y-3">
            {files.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-4 rounded-lg border border-slate-800 bg-slate-900 p-3"
              >
                {/* Thumbnail */}
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-slate-800">
                  {f.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={f.preview}
                      alt={f.file.name}
                      className="h-full w-full object-cover"
                    />
                  ) : isVideo(f.file.type) ? (
                    <div className="flex h-full w-full items-center justify-center">
                      <svg
                        className="h-6 w-6 text-slate-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <svg
                        className="h-6 w-6 text-slate-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {f.file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(f.file.size)}
                    {f.file.type && ` — ${f.file.type.split("/")[1].toUpperCase()}`}
                  </p>

                  {/* Progress bar */}
                  {f.status === "uploading" && (
                    <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800">
                      <div
                        className="h-1.5 rounded-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${f.progress}%` }}
                      />
                    </div>
                  )}

                  {f.status === "error" && (
                    <p className="mt-1 text-xs text-red-400">{f.error}</p>
                  )}

                  {f.status === "done" && f.result && (
                    <p className="mt-1 text-xs text-green-400 truncate">
                      Uploaded to {f.result.path}
                    </p>
                  )}
                </div>

                {/* Status badge */}
                <div className="flex-shrink-0">
                  {f.status === "pending" && (
                    <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
                      Pending
                    </span>
                  )}
                  {f.status === "uploading" && (
                    <span className="inline-flex items-center rounded-full bg-blue-900/50 px-2.5 py-0.5 text-xs text-blue-400">
                      Uploading
                    </span>
                  )}
                  {f.status === "done" && (
                    <span className="inline-flex items-center rounded-full bg-green-900/50 px-2.5 py-0.5 text-xs text-green-400">
                      Done
                    </span>
                  )}
                  {f.status === "error" && (
                    <span className="inline-flex items-center rounded-full bg-red-900/50 px-2.5 py-0.5 text-xs text-red-400">
                      Failed
                    </span>
                  )}
                </div>

                {/* Remove button */}
                {(f.status === "pending" || f.status === "error") && (
                  <button
                    onClick={() => removeFile(f.id)}
                    className="flex-shrink-0 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label={`Remove ${f.file.name}`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results grid — completed uploads */}
      {doneCount > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4">
            Uploaded Media ({doneCount})
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {files
              .filter((f) => f.status === "done" && f.result)
              .map((f) => (
                <div
                  key={f.id}
                  className="group relative overflow-hidden rounded-lg border border-slate-800 bg-slate-900"
                >
                  <div className="aspect-square overflow-hidden bg-slate-800">
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
                    <p className="text-xs text-slate-300 truncate">
                      {f.file.name}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {formatFileSize(f.file.size)}
                    </p>
                  </div>
                  {/* Copy URL overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        if (f.result?.url) {
                          navigator.clipboard.writeText(f.result.url);
                        }
                      }}
                      className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-white/30 transition-colors"
                    >
                      Copy URL
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

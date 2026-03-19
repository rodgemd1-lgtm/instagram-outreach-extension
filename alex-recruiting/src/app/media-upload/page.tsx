"use client";

import { useState } from "react";
import { SCPageHeader } from "@/components/sc/sc-page-header";
import { SCGlassCard } from "@/components/sc/sc-glass-card";
import { SCStatCard } from "@/components/sc/sc-stat-card";
import { SCBadge } from "@/components/sc/sc-badge";
import { SCButton } from "@/components/sc/sc-button";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

export default function MediaUploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  function handleFiles(incoming: FileList | null) {
    if (!incoming) return;
    const newFiles = Array.from(incoming).map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }

  return (
    <div className="space-y-6">
      <SCPageHeader
        title="MEDIA UPLOAD CENTER"
        subtitle="Upload, process, and manage recruiting media assets"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SCStatCard label="Uploaded" value={String(files.length)} icon="cloud_upload" />
        <SCStatCard label="Processing" value="0" icon="hourglass_top" />
        <SCStatCard label="Ready" value="0" icon="check_circle" />
        <SCStatCard label="Storage" value="0 MB" icon="hard_drive" />
      </div>

      {/* Upload Zone */}
      <SCGlassCard className="p-8">
        <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-sc-border hover:border-sc-primary/50 transition-colors">
          <span className="material-symbols-outlined text-[48px] text-slate-500 mb-3">
            cloud_upload
          </span>
          <p className="text-sm font-semibold text-white">Drag and drop files here</p>
          <p className="text-xs text-slate-500 mt-1">or click to browse</p>
          <p className="text-[10px] text-slate-600 mt-3">
            JPG, PNG, HEIC, WEBP, MP4, MOV, WEBM
          </p>
          <input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.heic,.webp,.mp4,.mov,.webm"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </SCGlassCard>

      {/* AI Metadata Processing */}
      <SCGlassCard className="p-5">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
          AI Metadata Processing
        </p>
        <p className="text-sm text-slate-500">
          Upload media above. AI will automatically tag content type, extract key moments,
          and generate metadata for recruiting use.
        </p>
      </SCGlassCard>

      {/* Recent Uploads */}
      {files.length > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
            Recent Uploads
          </p>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {files.map((file, idx) => (
              <SCGlassCard key={idx} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{file.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <SCBadge variant={file.type.startsWith("video") ? "info" : "default"}>
                    {file.type.startsWith("video") ? "Video" : "Image"}
                  </SCBadge>
                </div>
              </SCGlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

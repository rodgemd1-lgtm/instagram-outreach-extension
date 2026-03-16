"use client";

import { useState } from "react";
import {
  StitchPageHeader,
  GlassCard,
  StatCard,
  StitchBadge,
  MediaDropZone,
} from "@/components/stitch";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

export default function MediaUploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  function handleFiles(newFiles: File[]) {
    setFiles((prev) => [
      ...prev,
      ...newFiles.map((f) => ({ name: f.name, size: f.size, type: f.type })),
    ]);
  }

  return (
    <div className="space-y-6">
      <StitchPageHeader
        title="Media Lab"
        subtitle="Upload, process, and manage recruiting media assets"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Uploaded" value={files.length} />
        <StatCard label="Processing" value={0} />
        <StatCard label="Ready" value={0} />
        <StatCard label="Storage" value="0 MB" />
      </div>

      {/* Upload Zone */}
      <MediaDropZone onFiles={handleFiles} />

      {/* AI Metadata Processing */}
      <GlassCard className="p-5">
        <h3 className="stitch-label mb-3">AI Metadata Processing</h3>
        <p className="text-sm text-white/40">
          Upload media above. AI will automatically tag content type, extract key moments,
          and generate metadata for recruiting use.
        </p>
      </GlassCard>

      {/* Recent Uploads */}
      {files.length > 0 && (
        <div>
          <h2 className="stitch-label mb-4">Recent Uploads</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {files.map((file, idx) => (
              <GlassCard key={idx} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{file.name}</p>
                    <p className="text-[11px] text-white/30">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <StitchBadge variant={file.type.startsWith("video") ? "blue" : "default"}>
                    {file.type.startsWith("video") ? "Video" : "Image"}
                  </StitchBadge>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";

interface MediaDropZoneProps {
  onFiles?: (files: File[]) => void;
  accept?: string;
  className?: string;
}

export function MediaDropZone({
  onFiles,
  accept = "image/*,video/*",
  className,
}: MediaDropZoneProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) onFiles?.(files);
    },
    [onFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) onFiles?.(files);
    },
    [onFiles]
  );

  return (
    <label
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] p-12 text-center transition-all cursor-pointer",
        dragOver && "border-[#C5050C]/40 bg-[#C5050C]/5",
        className
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <Upload className="h-10 w-10 text-white/20 mb-4" />
      <p className="text-sm font-semibold text-white/50">
        Drop files here or click to upload
      </p>
      <p className="mt-1 text-xs text-white/30">
        Video, images, and media files
      </p>
      <input
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={handleChange}
      />
    </label>
  );
}

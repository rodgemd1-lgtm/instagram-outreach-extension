"use client";

import { useState, useEffect } from "react";
import { Film, Image, X, Play, Scissors, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { VideoCategory } from "@/lib/types";

interface MediaAsset {
  id: string;
  name: string;
  filePath: string | null;
  fileSize: number | null;
  duration: number | null;
  category: string | null;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  optimizedFilePath: string | null;
}

interface MediaPickerProps {
  selectedMedia: MediaAsset | null;
  onSelect: (asset: MediaAsset | null) => void;
}

const CATEGORY_LABELS: Record<VideoCategory, string> = {
  highlight_reel: "Highlight Reel",
  game_film: "Game Film",
  clip: "Clip",
  micro_clip: "Micro Clip",
};

const CATEGORY_COLORS: Record<VideoCategory, string> = {
  highlight_reel: "bg-purple-100 text-purple-700",
  game_film: "bg-blue-100 text-blue-700",
  clip: "bg-green-100 text-green-700",
  micro_clip: "bg-orange-100 text-orange-700",
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export function MediaPicker({ selectedMedia, onSelect }: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [optimizing, setOptimizing] = useState<string | null>(null);

  useEffect(() => {
    if (open && assets.length === 0) {
      loadAssets();
    }
  }, [open, assets.length]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/videos");
      const data = await res.json();
      setAssets(data.assets || []);
    } catch (err) {
      console.error("Failed to load media:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async (asset: MediaAsset) => {
    setOptimizing(asset.id);
    try {
      const res = await fetch("/api/videos/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId: asset.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setAssets((prev) =>
          prev.map((a) =>
            a.id === asset.id
              ? { ...a, optimizedFilePath: data.optimizedFilePath }
              : a
          )
        );
      }
    } catch (err) {
      console.error("Optimize failed:", err);
    } finally {
      setOptimizing(null);
    }
  };

  const filtered = assets.filter((a) =>
    !search || a.name.toLowerCase().includes(search.toLowerCase())
  );

  // Group by category
  const clips = filtered.filter((a) => a.category === "clip" || a.category === "micro_clip");
  const longer = filtered.filter((a) => a.category === "highlight_reel" || a.category === "game_film");

  return (
    <div>
      {/* Selected media preview */}
      {selectedMedia ? (
        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="relative h-16 w-24 flex-shrink-0 rounded overflow-hidden bg-slate-200">
            {selectedMedia.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedMedia.thumbnailUrl}
                alt={selectedMedia.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Film className="h-5 w-5 text-slate-400" />
              </div>
            )}
            {selectedMedia.duration != null && selectedMedia.duration > 0 && (
              <div className="absolute bottom-0.5 right-0.5 rounded bg-black/75 px-1 py-0.5 text-[9px] font-medium text-white">
                {formatDuration(selectedMedia.duration)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {selectedMedia.name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {selectedMedia.category && (
                <Badge
                  variant="secondary"
                  className={`text-[10px] ${CATEGORY_COLORS[selectedMedia.category as VideoCategory] || ""}`}
                >
                  {CATEGORY_LABELS[selectedMedia.category as VideoCategory] || selectedMedia.category}
                </Badge>
              )}
              {selectedMedia.optimizedFilePath ? (
                <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700">
                  X-Ready
                </Badge>
              ) : (
                <span className="text-[10px] text-amber-600">Not optimized</span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelect(null)}
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => setOpen(true)}
          >
            <Film className="h-3.5 w-3.5" />
            Attach Video
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => setOpen(true)}
          >
            <Image className="h-3.5 w-3.5" />
            Attach Image
          </Button>
        </div>
      )}

      {/* Media picker dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Media</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-2"
          />

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Film className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p>No videos in library. Import from the Video Library page first.</p>
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              {/* Best for X: clips and micro clips */}
              {clips.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Best for X Posts ({clips.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {clips.map((asset) => (
                      <MediaCard
                        key={asset.id}
                        asset={asset}
                        isSelected={selectedMedia?.id === asset.id}
                        optimizing={optimizing === asset.id}
                        onSelect={() => {
                          onSelect(asset);
                          setOpen(false);
                        }}
                        onOptimize={() => handleOptimize(asset)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Longer videos */}
              {longer.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Highlight Reels & Game Film ({longer.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {longer.map((asset) => (
                      <MediaCard
                        key={asset.id}
                        asset={asset}
                        isSelected={selectedMedia?.id === asset.id}
                        optimizing={optimizing === asset.id}
                        onSelect={() => {
                          onSelect(asset);
                          setOpen(false);
                        }}
                        onOptimize={() => handleOptimize(asset)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MediaCard({
  asset,
  isSelected,
  optimizing,
  onSelect,
  onOptimize,
}: {
  asset: MediaAsset;
  isSelected: boolean;
  optimizing: boolean;
  onSelect: () => void;
  onOptimize: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`relative rounded-lg border overflow-hidden text-left transition-all hover:ring-2 hover:ring-blue-300 ${
        isSelected ? "ring-2 ring-blue-500 border-blue-500" : "border-slate-200"
      }`}
    >
      <div className="relative aspect-video bg-slate-100">
        {asset.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset.thumbnailUrl}
            alt={asset.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Film className="h-5 w-5 text-slate-300" />
          </div>
        )}
        {asset.duration != null && asset.duration > 0 && (
          <div className="absolute bottom-1 right-1 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-medium text-white">
            {formatDuration(asset.duration)}
          </div>
        )}
        {isSelected && (
          <div className="absolute top-1 right-1 rounded-full bg-blue-500 p-0.5">
            <Check className="h-3 w-3 text-white" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
          <Play className="h-6 w-6 text-white drop-shadow" />
        </div>
      </div>
      <div className="p-2">
        <p className="text-xs font-medium text-slate-900 truncate">{asset.name}</p>
        <div className="flex items-center gap-1.5 mt-1">
          {asset.category && (
            <Badge
              variant="secondary"
              className={`text-[9px] px-1.5 py-0 ${CATEGORY_COLORS[asset.category as VideoCategory] || ""}`}
            >
              {CATEGORY_LABELS[asset.category as VideoCategory] || asset.category}
            </Badge>
          )}
          {asset.fileSize && (
            <span className="text-[9px] text-slate-400">
              {formatFileSize(asset.fileSize)}
            </span>
          )}
        </div>
        {!asset.optimizedFilePath && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOptimize();
            }}
            disabled={optimizing}
            className="mt-1.5 flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            {optimizing ? (
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
            ) : (
              <Scissors className="h-2.5 w-2.5" />
            )}
            Optimize for X
          </button>
        )}
        {asset.optimizedFilePath && (
          <span className="mt-1.5 flex items-center gap-1 text-[10px] text-green-600">
            <Check className="h-2.5 w-2.5" />
            X-Ready
          </span>
        )}
      </div>
    </button>
  );
}

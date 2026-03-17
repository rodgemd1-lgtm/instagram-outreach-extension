"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Film,
  Play,
  Scissors,
  FolderOpen,
  Loader2,
  CheckSquare,
  Square,
  Download,
} from "lucide-react";
import type { ScannedVideoFileWithMeta, VideoCategory } from "@/lib/types";

interface VideoAssetRow {
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

export function VideoGallery() {
  const [assets, setAssets] = useState<VideoAssetRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [previewAsset, setPreviewAsset] = useState<VideoAssetRow | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [scannedFiles, setScannedFiles] = useState<ScannedVideoFileWithMeta[]>([]);
  const [scanning, setScanning] = useState(false);
  const [importing, setImporting] = useState(false);
  const [optimizing, setOptimizing] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState("");
  const [scanSummary, setScanSummary] = useState<Record<string, number> | null>(null);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/videos");
      const data = await res.json();
      setAssets(data.assets || []);
    } catch (err) {
      console.error("Failed to load assets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const handleScan = async () => {
    setScanning(true);
    setScanSummary(null);
    try {
      const res = await fetch("/api/videos/scan/local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderPath: folderPath || undefined }),
      });
      const data = await res.json();
      if (data.available) {
        setScannedFiles(data.files.map((f: ScannedVideoFileWithMeta) => ({ ...f, selected: true })));
        setScanSummary(data.summary);
      } else {
        alert(data.message || "Folder not accessible");
      }
    } catch (err) {
      console.error("Scan failed:", err);
    } finally {
      setScanning(false);
    }
  };

  const handleImport = async () => {
    const selected = scannedFiles.filter((f) => f.selected);
    if (selected.length === 0) return;

    setImporting(true);
    try {
      const res = await fetch("/api/videos/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: selected }),
      });
      const data = await res.json();
      if (data.imported > 0) {
        setImportOpen(false);
        setScannedFiles([]);
        setScanSummary(null);
        await loadAssets();
      }
    } catch (err) {
      console.error("Import failed:", err);
    } finally {
      setImporting(false);
    }
  };

  const handleOptimize = async (assetId: string) => {
    setOptimizing(assetId);
    try {
      const res = await fetch("/api/videos/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId }),
      });
      if (res.ok) {
        await loadAssets();
      }
    } catch (err) {
      console.error("Optimize failed:", err);
    } finally {
      setOptimizing(null);
    }
  };

  const toggleFile = (index: number) => {
    setScannedFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, selected: !f.selected } : f))
    );
  };

  const toggleAll = () => {
    const allSelected = scannedFiles.every((f) => f.selected);
    setScannedFiles((prev) => prev.map((f) => ({ ...f, selected: !allSelected })));
  };

  const filtered = assets.filter((a) => {
    if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const categoryCounts = {
    highlight_reel: assets.filter((a) => a.category === "highlight_reel").length,
    game_film: assets.filter((a) => a.category === "game_film").length,
    clip: assets.filter((a) => a.category === "clip").length,
    micro_clip: assets.filter((a) => a.category === "micro_clip").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Video Library</h1>
          <p className="text-sm text-slate-500 mt-1">
            {assets.length} videos cataloged
          </p>
        </div>
        <Button onClick={() => setImportOpen(true)} className="gap-2">
          <FolderOpen className="h-4 w-4" />
          Import from Folder
        </Button>
      </div>

      {/* Stat Cards */}
      {assets.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(Object.entries(categoryCounts) as [VideoCategory, number][]).map(
            ([cat, count]) => (
              <Card key={cat}>
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-slate-500">
                    {CATEGORY_LABELS[cat]}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{count}</p>
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="highlight_reel">Highlight Reels</SelectItem>
            <SelectItem value="game_film">Game Film</SelectItem>
            <SelectItem value="clip">Clips</SelectItem>
            <SelectItem value="micro_clip">Micro Clips</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Search videos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Video Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Film className="h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-medium text-slate-700">
            {assets.length === 0 ? "No videos yet" : "No matches"}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {assets.length === 0
              ? "Import videos from your local folder to get started"
              : "Try adjusting your filters"}
          </p>
          {assets.length === 0 && (
            <Button
              variant="outline"
              className="mt-4 gap-2"
              onClick={() => setImportOpen(true)}
            >
              <FolderOpen className="h-4 w-4" />
              Import Videos
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((asset) => (
            <Card
              key={asset.id}
              className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-slate-300 transition-all"
              onClick={() => setPreviewAsset(asset)}
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
                    <Film className="h-8 w-8 text-slate-300" />
                  </div>
                )}
                {asset.duration != null && asset.duration > 0 && (
                  <div className="absolute bottom-2 right-2 rounded bg-black/75 px-2 py-0.5 text-xs font-medium text-white">
                    {formatDuration(asset.duration)}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                  <Play className="h-10 w-10 text-white drop-shadow-lg" />
                </div>
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {asset.name}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {asset.category && (
                    <Badge
                      variant="secondary"
                      className={
                        CATEGORY_COLORS[asset.category as VideoCategory] || ""
                      }
                    >
                      {CATEGORY_LABELS[asset.category as VideoCategory] || asset.category}
                    </Badge>
                  )}
                  {asset.fileSize && (
                    <span className="text-xs text-slate-400">
                      {formatFileSize(asset.fileSize)}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  {asset.optimizedFilePath ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                      <Download className="h-3 w-3 mr-1" />
                      X-Ready
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 gap-1"
                      disabled={optimizing === asset.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOptimize(asset.id);
                      }}
                    >
                      {optimizing === asset.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Scissors className="h-3 w-3" />
                      )}
                      Optimize for X
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewAsset} onOpenChange={() => setPreviewAsset(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewAsset?.name}</DialogTitle>
          </DialogHeader>
          {previewAsset?.filePath && (
            <div className="mt-2">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                controls
                className="w-full rounded-lg bg-black"
                src={`/api/videos/serve?path=${encodeURIComponent(previewAsset.filePath)}`}
              />
              <div className="flex items-center gap-3 mt-3 text-sm text-slate-500">
                {previewAsset.duration != null && previewAsset.duration > 0 && (
                  <span>{formatDuration(previewAsset.duration)}</span>
                )}
                {previewAsset.width != null && previewAsset.height != null && previewAsset.width > 0 && (
                  <span>
                    {previewAsset.width}x{previewAsset.height}
                  </span>
                )}
                {previewAsset.fileSize && (
                  <span>{formatFileSize(previewAsset.fileSize)}</span>
                )}
                {previewAsset.category && (
                  <Badge
                    variant="secondary"
                    className={
                      CATEGORY_COLORS[previewAsset.category as VideoCategory] || ""
                    }
                  >
                    {CATEGORY_LABELS[previewAsset.category as VideoCategory]}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Videos from Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="flex gap-2">
              <Input
                placeholder="Folder path (leave empty for default)"
                value={folderPath}
                onChange={(e) => setFolderPath(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleScan} disabled={scanning} className="gap-2">
                {scanning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FolderOpen className="h-4 w-4" />
                )}
                Scan
              </Button>
            </div>

            {scanSummary && (
              <div className="grid grid-cols-4 gap-2">
                {(Object.entries(scanSummary) as [VideoCategory, number][]).map(
                  ([cat, count]) => (
                    <div
                      key={cat}
                      className="rounded-lg bg-slate-50 p-2 text-center"
                    >
                      <p className="text-lg font-bold text-slate-900">{count}</p>
                      <p className="text-[10px] text-slate-500">
                        {CATEGORY_LABELS[cat]}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}

            {scannedFiles.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <button
                    onClick={toggleAll}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                  >
                    {scannedFiles.every((f) => f.selected) ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                    Select All ({scannedFiles.filter((f) => f.selected).length}/
                    {scannedFiles.length})
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto border rounded-lg divide-y">
                  {scannedFiles.map((file, i) => (
                    <button
                      key={file.filePath}
                      onClick={() => toggleFile(i)}
                      className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors"
                    >
                      {file.selected ? (
                        <CheckSquare className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-300 flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {file.filename}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-400">
                            {formatDuration(file.duration)}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatFileSize(file.fileSize)}
                          </span>
                          <Badge
                            variant="secondary"
                            className={`text-[10px] ${CATEGORY_COLORS[file.category]}`}
                          >
                            {CATEGORY_LABELS[file.category]}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handleImport}
                  disabled={importing || scannedFiles.filter((f) => f.selected).length === 0}
                  className="w-full gap-2"
                >
                  {importing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Import {scannedFiles.filter((f) => f.selected).length} Selected
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

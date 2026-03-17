"use client";

import { useState, useCallback, useEffect } from "react";
import { SCPageHeader } from "@/components/sc/sc-page-header";
import { SCGlassCard } from "@/components/sc/sc-glass-card";
import { SCStatCard } from "@/components/sc/sc-stat-card";
import { SCBadge } from "@/components/sc/sc-badge";
import { SCButton } from "@/components/sc/sc-button";
import { SCInput } from "@/components/sc/sc-input";
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

export default function VideosPage() {
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

  useEffect(() => { loadAssets(); }, [loadAssets]);

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
      if (res.ok) await loadAssets();
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
      <SCPageHeader
        title="VIDEO VAULT"
        subtitle={`${assets.length} videos cataloged`}
        actions={
          <SCButton onClick={() => setImportOpen(true)}>
            <span className="material-symbols-outlined text-[16px] mr-1">folder_open</span>
            Import from Folder
          </SCButton>
        }
      />

      {/* Stat Cards */}
      {assets.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(Object.entries(categoryCounts) as [VideoCategory, number][]).map(([cat, count]) => (
            <SCStatCard key={cat} label={CATEGORY_LABELS[cat]} value={String(count)} icon="videocam" />
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-48 rounded-lg border border-sc-border bg-white/5 px-3 py-2 text-sm text-white focus:border-sc-primary/50 focus:outline-none"
        >
          <option value="all" className="bg-sc-bg">All Categories</option>
          <option value="highlight_reel" className="bg-sc-bg">Highlight Reels</option>
          <option value="game_film" className="bg-sc-bg">Game Film</option>
          <option value="clip" className="bg-sc-bg">Clips</option>
          <option value="micro_clip" className="bg-sc-bg">Micro Clips</option>
        </select>
        <SCInput
          icon="search"
          placeholder="Search videos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Video Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="material-symbols-outlined text-[32px] animate-spin text-slate-400">progress_activity</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="material-symbols-outlined text-[48px] text-slate-600">movie</span>
          <h3 className="text-lg font-black text-white mt-3">
            {assets.length === 0 ? "No videos yet" : "No matches"}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {assets.length === 0 ? "Import videos from your local folder to get started" : "Try adjusting your filters"}
          </p>
          {assets.length === 0 && (
            <SCButton variant="secondary" className="mt-4" onClick={() => setImportOpen(true)}>
              <span className="material-symbols-outlined text-[16px] mr-1">folder_open</span>
              Import Videos
            </SCButton>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((asset) => (
            <SCGlassCard
              key={asset.id}
              className="overflow-hidden cursor-pointer hover:border-sc-primary/50 transition-all"
              onClick={() => setPreviewAsset(asset)}
            >
              <div className="relative aspect-video bg-sc-surface">
                {asset.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={asset.thumbnailUrl} alt={asset.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="material-symbols-outlined text-[32px] text-slate-600">movie</span>
                  </div>
                )}
                {asset.duration != null && asset.duration > 0 && (
                  <div className="absolute bottom-2 right-2 rounded bg-black/75 px-2 py-0.5 text-xs font-bold text-white">
                    {formatDuration(asset.duration)}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                  <span className="material-symbols-outlined text-[40px] text-white drop-shadow-lg">play_circle</span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-bold text-white truncate">{asset.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  {asset.category && (
                    <SCBadge>{CATEGORY_LABELS[asset.category as VideoCategory] || asset.category}</SCBadge>
                  )}
                  {asset.fileSize && (
                    <span className="text-xs text-slate-500">{formatFileSize(asset.fileSize)}</span>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  {asset.optimizedFilePath ? (
                    <SCBadge variant="success">X-Ready</SCBadge>
                  ) : (
                    <SCButton
                      size="sm"
                      variant="secondary"
                      disabled={optimizing === asset.id}
                      onClick={(e) => { e.stopPropagation(); handleOptimize(asset.id); }}
                    >
                      {optimizing === asset.id ? (
                        <span className="material-symbols-outlined text-[14px] animate-spin mr-1">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-[14px] mr-1">content_cut</span>
                      )}
                      Optimize for X
                    </SCButton>
                  )}
                </div>
              </div>
            </SCGlassCard>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewAsset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewAsset(null)}
        >
          <div
            className="relative bg-sc-bg border border-sc-border rounded-xl max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-sc-border">
              <p className="text-sm font-black text-white">{previewAsset.name}</p>
              <button onClick={() => setPreviewAsset(null)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            {previewAsset.filePath && (
              <div className="p-4">
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
                    <span>{previewAsset.width}x{previewAsset.height}</span>
                  )}
                  {previewAsset.fileSize && (
                    <span>{formatFileSize(previewAsset.fileSize)}</span>
                  )}
                  {previewAsset.category && (
                    <SCBadge>{CATEGORY_LABELS[previewAsset.category as VideoCategory]}</SCBadge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Import Modal */}
      {importOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setImportOpen(false)}
        >
          <div
            className="relative bg-sc-bg border border-sc-border rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-sc-border">
              <p className="text-sm font-black text-white">Import Videos from Folder</p>
              <button onClick={() => setImportOpen(false)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex gap-2">
                <SCInput
                  placeholder="Folder path (leave empty for default)"
                  value={folderPath}
                  onChange={(e) => setFolderPath(e.target.value)}
                  className="flex-1"
                />
                <SCButton onClick={handleScan} disabled={scanning}>
                  {scanning ? (
                    <span className="material-symbols-outlined text-[16px] animate-spin mr-1">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px] mr-1">folder_open</span>
                  )}
                  Scan
                </SCButton>
              </div>

              {scanSummary && (
                <div className="grid grid-cols-4 gap-2">
                  {(Object.entries(scanSummary) as [VideoCategory, number][]).map(([cat, count]) => (
                    <div key={cat} className="rounded-lg bg-white/5 border border-sc-border p-2 text-center">
                      <p className="text-lg font-black text-white">{count}</p>
                      <p className="text-[10px] text-slate-500">{CATEGORY_LABELS[cat]}</p>
                    </div>
                  ))}
                </div>
              )}

              {scannedFiles.length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <button onClick={toggleAll} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white">
                      <span className="material-symbols-outlined text-[18px]">
                        {scannedFiles.every((f) => f.selected) ? "check_box" : "check_box_outline_blank"}
                      </span>
                      Select All ({scannedFiles.filter((f) => f.selected).length}/{scannedFiles.length})
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto border border-sc-border rounded-lg divide-y divide-sc-border">
                    {scannedFiles.map((file, i) => (
                      <button
                        key={file.filePath}
                        onClick={() => toggleFile(i)}
                        className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-white/5 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px] flex-shrink-0 text-slate-400">
                          {file.selected ? "check_box" : "check_box_outline_blank"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white truncate">{file.filename}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-500">{formatDuration(file.duration)}</span>
                            <span className="text-xs text-slate-500">{formatFileSize(file.fileSize)}</span>
                            <SCBadge>{CATEGORY_LABELS[file.category]}</SCBadge>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <SCButton
                    onClick={handleImport}
                    disabled={importing || scannedFiles.filter((f) => f.selected).length === 0}
                    className="w-full"
                  >
                    {importing ? (
                      <span className="material-symbols-outlined text-[16px] animate-spin mr-1">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-[16px] mr-1">download</span>
                    )}
                    Import {scannedFiles.filter((f) => f.selected).length} Selected
                  </SCButton>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

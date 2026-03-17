"use client";

import { useState, useEffect } from "react";
import { SCPageHeader } from "@/components/sc/sc-page-header";
import { SCGlassCard } from "@/components/sc/sc-glass-card";
import { SCBadge } from "@/components/sc/sc-badge";
import { SCButton } from "@/components/sc/sc-button";
import { SCInput } from "@/components/sc/sc-input";
import { SCTabs } from "@/components/sc/sc-tabs";
import type { ScannedVideoFile, PhotosAlbumInfo, VideoAsset } from "@/lib/types";

interface ScrapeResult {
  source: string;
  results: { url: string; title: string; snippet: string }[];
  total: number;
}

export default function ScrapePage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<ScrapeResult | null>(null);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("scraping");

  // Video Sources state
  const [albums, setAlbums] = useState<PhotosAlbumInfo[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const [photosFiles, setPhotosFiles] = useState<ScannedVideoFile[]>([]);
  const [driveFolder, setDriveFolder] = useState("");
  const [driveFiles, setDriveFiles] = useState<ScannedVideoFile[]>([]);
  const [driveAvailable, setDriveAvailable] = useState<boolean | null>(null);
  const [uploadedAssets, setUploadedAssets] = useState<VideoAsset[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/videos")
      .then((res) => res.json())
      .then((data) => setUploadedAssets(data.assets || []))
      .catch(() => {});
  }, []);

  async function runCoachDiscovery() {
    setLoading("coaches");
    try {
      const res = await fetch("/api/coaches/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query || "D1 D2 OL recruiting coordinator Twitter X handle 2025" }),
      });
      const data = await res.json();
      setResults({ source: "Coach Discovery (Exa)", results: data.results || [], total: data.total || 0 });
    } catch (error) {
      console.error("Scrape failed:", error);
    } finally {
      setLoading(null);
    }
  }

  async function runCompetitorSearch() {
    setLoading("competitors");
    try {
      const res = await fetch("/api/scrape/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setResults({ source: "Competitor Search (Exa)", results: data.results || [], total: data.total || 0 });
    } catch (error) {
      console.error("Scrape failed:", error);
    } finally {
      setLoading(null);
    }
  }

  async function scanPhotosAlbums() {
    setLoading("photos-scan");
    try {
      const res = await fetch("/api/videos/scan/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.albums) setAlbums(data.albums);
    } catch (error) {
      console.error("Photos scan failed:", error);
    } finally {
      setLoading(null);
    }
  }

  async function scanPhotosAlbum(albumName: string) {
    setLoading("photos-export");
    try {
      const res = await fetch("/api/videos/scan/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ albumName }),
      });
      const data = await res.json();
      if (data.files) {
        setPhotosFiles(data.files.map((f: ScannedVideoFile) => ({ ...f, selected: true })));
      }
    } catch (error) {
      console.error("Album export failed:", error);
    } finally {
      setLoading(null);
    }
  }

  async function scanDrive() {
    setLoading("drive-scan");
    try {
      const res = await fetch("/api/videos/scan/drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderPath: driveFolder || undefined }),
      });
      const data = await res.json();
      setDriveAvailable(data.available);
      if (data.files) {
        setDriveFiles(data.files.map((f: ScannedVideoFile) => ({ ...f, selected: true })));
      }
    } catch (error) {
      console.error("Drive scan failed:", error);
    } finally {
      setLoading(null);
    }
  }

  function toggleFileSelection(files: ScannedVideoFile[], setFiles: (f: ScannedVideoFile[]) => void, index: number) {
    const copy = [...files];
    copy[index] = { ...copy[index], selected: !copy[index].selected };
    setFiles(copy);
  }

  async function uploadSelectedFiles(files: ScannedVideoFile[], source: "photos" | "gdrive") {
    const selected = files.filter((f) => f.selected);
    setLoading("uploading");
    for (const file of selected) {
      setUploadProgress((prev) => ({ ...prev, [file.filePath]: "uploading" }));
      try {
        const res = await fetch("/api/videos/upload-local", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filePath: file.filePath,
            source,
            sourceAlbum: source === "photos" ? selectedAlbum : undefined,
            tags: ["football"],
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setUploadProgress((prev) => ({ ...prev, [file.filePath]: "uploaded" }));
          setUploadedAssets((prev) => [data.asset, ...prev]);
        } else {
          setUploadProgress((prev) => ({ ...prev, [file.filePath]: "failed" }));
        }
      } catch {
        setUploadProgress((prev) => ({ ...prev, [file.filePath]: "failed" }));
      }
    }
    setLoading(null);
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-6">
      <SCPageHeader
        title="WEB SCRAPER"
        subtitle="Run coach discovery, manage video imports, and test Hudl integration"
      />

      <SCTabs
        tabs={[
          { label: "Scraping Tools", value: "scraping" },
          { label: "Video Sources", value: "videos" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "scraping" && (
        <div className="space-y-4">
          <SCInput
            icon="search"
            placeholder="Custom search query (optional)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Coach Discovery */}
            <SCGlassCard className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-blue-400">search</span>
                <p className="text-sm font-bold text-white">Coach Discovery</p>
              </div>
              <p className="text-xs text-slate-500">
                Exa semantic search for D1/D2 OL coaching staff X handles, recruiting coordinators, and program contacts.
              </p>
              <SCBadge variant="info">Source: Exa AI</SCBadge>
              <SCButton
                size="sm"
                className="w-full"
                onClick={runCoachDiscovery}
                disabled={loading !== null}
              >
                {loading === "coaches" ? (
                  <span className="material-symbols-outlined text-[16px] animate-spin mr-1">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[16px] mr-1">search</span>
                )}
                Run Discovery
              </SCButton>
            </SCGlassCard>

            {/* Roster Analysis */}
            <SCGlassCard className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-emerald-400">language</span>
                <p className="text-sm font-bold text-white">Roster Analysis</p>
              </div>
              <p className="text-xs text-slate-500">
                Firecrawl scrapes target school rosters to identify OL graduation gaps -- schools with seniors leaving = higher recruiting priority.
              </p>
              <SCBadge variant="success">Source: Firecrawl</SCBadge>
              <SCButton size="sm" className="w-full" disabled={loading !== null} variant="secondary">
                <span className="material-symbols-outlined text-[16px] mr-1">storage</span>
                Analyze Rosters
              </SCButton>
            </SCGlassCard>

            {/* Competitor Mapping */}
            <SCGlassCard className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-purple-400">group</span>
                <p className="text-sm font-bold text-white">Competitor Mapping</p>
              </div>
              <p className="text-xs text-slate-500">
                Exa + Brave search for 2029 OL recruits in Wisconsin/Midwest -- analyze posting cadence, engagement, and school interest signals.
              </p>
              <SCBadge variant="info">Source: Exa + Brave</SCBadge>
              <SCButton
                size="sm"
                className="w-full"
                onClick={runCompetitorSearch}
                disabled={loading !== null}
              >
                {loading === "competitors" ? (
                  <span className="material-symbols-outlined text-[16px] animate-spin mr-1">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[16px] mr-1">group</span>
                )}
                Find Competitors
              </SCButton>
            </SCGlassCard>
          </div>

          {/* Results */}
          {results && (
            <SCGlassCard variant="strong" className="p-5">
              <p className="text-sm font-bold text-white mb-3">
                {results.source} -- {results.total} results
              </p>
              <div className="space-y-3">
                {results.results.length === 0 ? (
                  <p className="text-sm text-slate-500">No results found. Try a different query or check API key configuration.</p>
                ) : (
                  results.results.map((r, i) => (
                    <div key={i} className="border-b border-sc-border pb-3 last:border-b-0 last:pb-0">
                      <p className="text-sm font-medium text-sc-primary">{r.title}</p>
                      <p className="text-xs text-slate-600 truncate">{r.url}</p>
                      <p className="text-xs text-slate-400 mt-1">{r.snippet}</p>
                    </div>
                  ))
                )}
              </div>
            </SCGlassCard>
          )}
        </div>
      )}

      {activeTab === "videos" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Photos App Scanner */}
            <SCGlassCard className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-pink-400">photo_library</span>
                <p className="text-sm font-bold text-white">Photos App Scanner</p>
              </div>
              <p className="text-xs text-slate-500">Import football videos from macOS Photos app albums into Supabase Storage.</p>

              {albums.length > 0 && (
                <select
                  value={selectedAlbum}
                  onChange={(e) => setSelectedAlbum(e.target.value)}
                  className="w-full rounded-lg border border-sc-border bg-white/5 px-3 py-2 text-sm text-white focus:border-sc-primary/50 focus:outline-none"
                >
                  <option value="" className="bg-sc-bg">Select album...</option>
                  {albums.map((a) => (
                    <option key={a.name} value={a.name} className="bg-sc-bg">
                      {a.name} ({a.itemCount} items)
                    </option>
                  ))}
                </select>
              )}

              <div className="flex gap-2">
                <SCButton size="sm" variant="secondary" className="flex-1" onClick={scanPhotosAlbums} disabled={loading !== null}>
                  {loading === "photos-scan" ? (
                    <span className="material-symbols-outlined text-[14px] animate-spin mr-1">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[14px] mr-1">folder_open</span>
                  )}
                  Scan Albums
                </SCButton>
                {selectedAlbum && (
                  <SCButton size="sm" className="flex-1" onClick={() => scanPhotosAlbum(selectedAlbum)} disabled={loading !== null}>
                    {loading === "photos-export" ? (
                      <span className="material-symbols-outlined text-[14px] animate-spin mr-1">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-[14px] mr-1">desktop_windows</span>
                    )}
                    Export Videos
                  </SCButton>
                )}
              </div>

              {photosFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-white">{photosFiles.length} videos found</p>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {photosFiles.map((f, i) => (
                      <label key={f.filePath} className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-white/5 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={f.selected}
                          onChange={() => toggleFileSelection(photosFiles, setPhotosFiles, i)}
                          className="rounded"
                        />
                        <span className="truncate flex-1">{f.filename}</span>
                        <span className="text-slate-500 flex-shrink-0">{formatFileSize(f.fileSize)}</span>
                        {uploadProgress[f.filePath] === "uploaded" && (
                          <span className="material-symbols-outlined text-[14px] text-emerald-400">check_circle</span>
                        )}
                        {uploadProgress[f.filePath] === "uploading" && (
                          <span className="material-symbols-outlined text-[14px] text-blue-400 animate-spin">progress_activity</span>
                        )}
                      </label>
                    ))}
                  </div>
                  <SCButton
                    size="sm"
                    className="w-full"
                    onClick={() => uploadSelectedFiles(photosFiles, "photos")}
                    disabled={loading === "uploading" || photosFiles.filter((f) => f.selected).length === 0}
                  >
                    {loading === "uploading" ? (
                      <span className="material-symbols-outlined text-[14px] animate-spin mr-1">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-[14px] mr-1">cloud_upload</span>
                    )}
                    Upload Selected ({photosFiles.filter((f) => f.selected).length})
                  </SCButton>
                </div>
              )}
            </SCGlassCard>

            {/* Google Drive Scanner */}
            <SCGlassCard className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-blue-400">hard_drive</span>
                <p className="text-sm font-bold text-white">Google Drive Scanner</p>
              </div>
              <p className="text-xs text-slate-500">Scan Google Drive for football videos via CloudStorage mount.</p>
              <SCInput
                placeholder="Folder path (optional)"
                value={driveFolder}
                onChange={(e) => setDriveFolder(e.target.value)}
              />
              <SCButton size="sm" className="w-full" onClick={scanDrive} disabled={loading !== null}>
                {loading === "drive-scan" ? (
                  <span className="material-symbols-outlined text-[14px] animate-spin mr-1">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[14px] mr-1">search</span>
                )}
                Scan for Videos
              </SCButton>

              {driveAvailable === false && (
                <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3">
                  <p className="text-xs text-yellow-400">
                    Google Drive is not mounted or the folder is inaccessible.
                  </p>
                </div>
              )}

              {driveFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-white">{driveFiles.length} videos found</p>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {driveFiles.map((f, i) => (
                      <label key={f.filePath} className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-white/5 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={f.selected}
                          onChange={() => toggleFileSelection(driveFiles, setDriveFiles, i)}
                          className="rounded"
                        />
                        <span className="truncate flex-1">{f.filename}</span>
                        <span className="text-slate-500 flex-shrink-0">{formatFileSize(f.fileSize)}</span>
                        {uploadProgress[f.filePath] === "uploaded" && (
                          <span className="material-symbols-outlined text-[14px] text-emerald-400">check_circle</span>
                        )}
                        {uploadProgress[f.filePath] === "uploading" && (
                          <span className="material-symbols-outlined text-[14px] text-blue-400 animate-spin">progress_activity</span>
                        )}
                      </label>
                    ))}
                  </div>
                  <SCButton
                    size="sm"
                    className="w-full"
                    onClick={() => uploadSelectedFiles(driveFiles, "gdrive")}
                    disabled={loading === "uploading" || driveFiles.filter((f) => f.selected).length === 0}
                  >
                    {loading === "uploading" ? (
                      <span className="material-symbols-outlined text-[14px] animate-spin mr-1">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-[14px] mr-1">cloud_upload</span>
                    )}
                    Upload Selected ({driveFiles.filter((f) => f.selected).length})
                  </SCButton>
                </div>
              )}
            </SCGlassCard>

            {/* Hudl Status */}
            <SCGlassCard className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-orange-400">videocam</span>
                <p className="text-sm font-bold text-white">Hudl Integration</p>
              </div>
              <p className="text-xs text-slate-500">
                Connect to Hudl for game film import. Set up your Hudl credentials in the environment variables to enable this integration.
              </p>
              <SCBadge variant="warning">Setup Required</SCBadge>
            </SCGlassCard>
          </div>

          {/* Uploaded Videos */}
          {uploadedAssets.length > 0 && (
            <SCGlassCard variant="strong" className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[20px] text-emerald-400">check_circle</span>
                <p className="text-sm font-bold text-white">Uploaded Videos ({uploadedAssets.length})</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {uploadedAssets.map((asset) => (
                  <div key={asset.id} className="rounded-lg border border-sc-border bg-white/5 p-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-slate-400">videocam</span>
                      <p className="text-sm font-medium text-white truncate">{asset.name}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <SCBadge>{asset.source}</SCBadge>
                      {asset.fileSize && <span>{formatFileSize(asset.fileSize)}</span>}
                    </div>
                    {asset.supabaseUrl && (
                      <p className="text-xs text-sc-primary truncate">{asset.supabaseUrl}</p>
                    )}
                  </div>
                ))}
              </div>
            </SCGlassCard>
          )}
        </div>
      )}
    </div>
  );
}

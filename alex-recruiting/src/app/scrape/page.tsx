"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HudlSetupGuide } from "@/components/hudl-setup-guide";
import {
  Search,
  Globe,
  Database,
  Users,
  Loader2,
  Video,
  Monitor,
  HardDrive,
  Upload,
  CheckCircle2,
  FolderOpen,
  Image as ImageIcon,
} from "lucide-react";
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

  // Video Sources state
  const [albums, setAlbums] = useState<PhotosAlbumInfo[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const [photosFiles, setPhotosFiles] = useState<ScannedVideoFile[]>([]);
  const [driveFolder, setDriveFolder] = useState("");
  const [driveFiles, setDriveFiles] = useState<ScannedVideoFile[]>([]);
  const [driveAvailable, setDriveAvailable] = useState<boolean | null>(null);
  const [uploadedAssets, setUploadedAssets] = useState<VideoAsset[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, string>>({});

  // Load uploaded assets on mount
  useEffect(() => {
    fetch("/api/videos")
      .then((res) => res.json())
      .then((data) => setUploadedAssets(data.assets || []))
      .catch(() => {});
  }, []);

  // ─── Scraping Functions ──────────────────────────────────────────────────────

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

  // ─── Video Source Functions ──────────────────────────────────────────────────

  async function scanPhotosAlbums() {
    setLoading("photos-scan");
    try {
      const res = await fetch("/api/videos/scan/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.albums) {
        setAlbums(data.albums);
      }
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
      <div>
        <h1 className="text-2xl font-bold">Scraping Tools & Video Sources</h1>
        <p className="text-sm text-slate-500">
          Run coach discovery, manage video imports, and test Hudl integration
        </p>
      </div>

      <Tabs defaultValue="scraping" className="space-y-4">
        <TabsList className="w-full flex overflow-x-auto h-auto gap-1 bg-slate-100 p-1 rounded-lg">
          <TabsTrigger value="scraping" className="flex items-center gap-1.5 text-xs sm:text-sm py-2 flex-shrink-0">
            <Search className="h-3.5 w-3.5" />
            Scraping Tools
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-1.5 text-xs sm:text-sm py-2 flex-shrink-0">
            <Video className="h-3.5 w-3.5" />
            Video Sources
          </TabsTrigger>
        </TabsList>

        {/* ─── Tab 1: Scraping Tools (existing) ─────────────────────────────── */}
        <TabsContent value="scraping">
          {/* Search Input */}
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Custom search query (optional)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Scraping Workflows */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Search className="h-4 w-4 text-blue-500" />
                  Coach Discovery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500 mb-3">
                  Exa semantic search for D1/D2 OL coaching staff X handles, recruiting coordinators, and program contacts.
                </p>
                <Badge variant="secondary" className="mb-3 text-[10px]">Source: Exa AI</Badge>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={runCoachDiscovery}
                  disabled={loading !== null}
                >
                  {loading === "coaches" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                  Run Discovery
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Globe className="h-4 w-4 text-green-500" />
                  Roster Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500 mb-3">
                  Firecrawl scrapes target school rosters to identify OL graduation gaps — schools with seniors leaving = higher recruiting priority.
                </p>
                <Badge variant="secondary" className="mb-3 text-[10px]">Source: Firecrawl</Badge>
                <Button size="sm" className="w-full" disabled={loading !== null}>
                  <Database className="h-4 w-4 mr-2" />
                  Analyze Rosters
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  Competitor Mapping
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500 mb-3">
                  Exa + Brave search for 2029 OL recruits in Wisconsin/Midwest — analyze posting cadence, engagement, and school interest signals.
                </p>
                <Badge variant="secondary" className="mb-3 text-[10px]">Source: Exa + Brave</Badge>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={runCompetitorSearch}
                  disabled={loading !== null}
                >
                  {loading === "competitors" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Users className="h-4 w-4 mr-2" />}
                  Find Competitors
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          {results && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">
                  {results.source} — {results.total} results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.results.length === 0 ? (
                    <p className="text-sm text-slate-500">No results found. Try a different query or check API key configuration.</p>
                  ) : (
                    results.results.map((r, i) => (
                      <div key={i} className="border-b pb-3 last:border-b-0 last:pb-0">
                        <p className="text-sm font-medium text-blue-600">{r.title}</p>
                        <p className="text-xs text-slate-400 truncate">{r.url}</p>
                        <p className="text-xs text-slate-600 mt-1">{r.snippet}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ─── Tab 2: Video Sources ─────────────────────────────────────────── */}
        <TabsContent value="videos">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Photos App Scanner */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-pink-500" />
                  Photos App Scanner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-500">
                  Import football videos from macOS Photos app albums into Supabase Storage.
                </p>

                {/* Album select */}
                {albums.length > 0 && (
                  <select
                    value={selectedAlbum}
                    onChange={(e) => setSelectedAlbum(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Select album...</option>
                    {albums.map((a) => (
                      <option key={a.name} value={a.name}>
                        {a.name} ({a.itemCount} items)
                      </option>
                    ))}
                  </select>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={scanPhotosAlbums}
                    disabled={loading !== null}
                  >
                    {loading === "photos-scan" ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <FolderOpen className="h-4 w-4 mr-1" />
                    )}
                    Scan Albums
                  </Button>
                  {selectedAlbum && (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => scanPhotosAlbum(selectedAlbum)}
                      disabled={loading !== null}
                    >
                      {loading === "photos-export" ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Monitor className="h-4 w-4 mr-1" />
                      )}
                      Export Videos
                    </Button>
                  )}
                </div>

                {/* Photos video results */}
                {photosFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-700">{photosFiles.length} videos found</p>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {photosFiles.map((f, i) => (
                        <label
                          key={f.filePath}
                          className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-slate-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={f.selected}
                            onChange={() => toggleFileSelection(photosFiles, setPhotosFiles, i)}
                            className="rounded"
                          />
                          <span className="truncate flex-1">{f.filename}</span>
                          <span className="text-slate-400 flex-shrink-0">{formatFileSize(f.fileSize)}</span>
                          {uploadProgress[f.filePath] === "uploaded" && (
                            <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                          )}
                          {uploadProgress[f.filePath] === "uploading" && (
                            <Loader2 className="h-3 w-3 animate-spin text-blue-500 flex-shrink-0" />
                          )}
                        </label>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => uploadSelectedFiles(photosFiles, "photos")}
                      disabled={loading === "uploading" || photosFiles.filter((f) => f.selected).length === 0}
                    >
                      {loading === "uploading" ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Upload className="h-4 w-4 mr-1" />
                      )}
                      Upload Selected ({photosFiles.filter((f) => f.selected).length})
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Google Drive Scanner */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-blue-500" />
                  Google Drive Scanner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-500">
                  Scan Google Drive for football videos via CloudStorage mount.
                </p>
                <Input
                  placeholder="Folder path (optional, defaults to Google Drive mount)"
                  value={driveFolder}
                  onChange={(e) => setDriveFolder(e.target.value)}
                  className="text-xs"
                />
                <Button
                  size="sm"
                  className="w-full"
                  onClick={scanDrive}
                  disabled={loading !== null}
                >
                  {loading === "drive-scan" ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Search className="h-4 w-4 mr-1" />
                  )}
                  Scan for Videos
                </Button>

                {driveAvailable === false && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                    <p className="text-xs text-amber-700">
                      Google Drive is not mounted or the folder is inaccessible. Make sure Google Drive for Desktop is installed and running.
                    </p>
                  </div>
                )}

                {/* Drive video results */}
                {driveFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-700">{driveFiles.length} videos found</p>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {driveFiles.map((f, i) => (
                        <label
                          key={f.filePath}
                          className="flex items-center gap-2 text-xs p-1.5 rounded hover:bg-slate-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={f.selected}
                            onChange={() => toggleFileSelection(driveFiles, setDriveFiles, i)}
                            className="rounded"
                          />
                          <span className="truncate flex-1">{f.filename}</span>
                          <span className="text-slate-400 flex-shrink-0">{formatFileSize(f.fileSize)}</span>
                          {uploadProgress[f.filePath] === "uploaded" && (
                            <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                          )}
                          {uploadProgress[f.filePath] === "uploading" && (
                            <Loader2 className="h-3 w-3 animate-spin text-blue-500 flex-shrink-0" />
                          )}
                        </label>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => uploadSelectedFiles(driveFiles, "gdrive")}
                      disabled={loading === "uploading" || driveFiles.filter((f) => f.selected).length === 0}
                    >
                      {loading === "uploading" ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Upload className="h-4 w-4 mr-1" />
                      )}
                      Upload Selected ({driveFiles.filter((f) => f.selected).length})
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hudl Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Video className="h-4 w-4 text-orange-500" />
                  Hudl Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HudlSetupGuide compact />
              </CardContent>
            </Card>
          </div>

          {/* Uploaded Videos */}
          {uploadedAssets.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Uploaded Videos ({uploadedAssets.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {uploadedAssets.map((asset) => (
                    <div key={asset.id} className="rounded-lg border border-slate-200 p-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <p className="text-sm font-medium truncate">{asset.name}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Badge variant="secondary" className="text-[10px]">{asset.source}</Badge>
                        {asset.fileSize && <span>{formatFileSize(asset.fileSize)}</span>}
                      </div>
                      {asset.supabaseUrl && (
                        <p className="text-xs text-blue-500 truncate">{asset.supabaseUrl}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

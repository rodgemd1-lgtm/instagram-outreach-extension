"use client";

import { useState, useEffect, useCallback } from "react";
import { SCPageHeader } from "@/components/sc/sc-page-header";
import { SCGlassCard } from "@/components/sc/sc-glass-card";
import { SCStatCard } from "@/components/sc/sc-stat-card";
import { SCBadge } from "@/components/sc/sc-badge";
import { SCButton } from "@/components/sc/sc-button";

interface PhotoAsset {
  id: string;
  name: string;
  source: string;
  sourceFolder: string | null;
  filePath: string;
  fileSize: number | null;
  mimeType: string | null;
  tags: string[];
  category: string;
  description: string | null;
  favorite: boolean;
  createdAt: string;
}

const CATEGORIES = [
  { value: "", label: "All Photos" },
  { value: "action", label: "Action Shots" },
  { value: "training", label: "Training" },
  { value: "portrait", label: "Portraits" },
  { value: "profile", label: "Profile" },
  { value: "team", label: "Team" },
  { value: "event", label: "Events" },
  { value: "generated", label: "AI Generated" },
  { value: "other", label: "Other" },
];

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "--";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function MediaPage() {
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [category, setCategory] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoAsset | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    byCategory: Record<string, number>;
    favorites: number;
  } | null>(null);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const url = category ? `/api/photos?category=${category}` : "/api/photos";
      const res = await fetch(url);
      const data = await res.json();
      setPhotos(data.photos || []);
    } catch {
      console.error("Failed to fetch photos");
    } finally {
      setLoading(false);
    }
  }, [category]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/photos?stats=true");
      const data = await res.json();
      setStats(data);
    } catch {
      console.error("Failed to fetch stats");
    }
  };

  useEffect(() => {
    fetchPhotos();
    fetchStats();
  }, [fetchPhotos]);

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await fetch("/api/photos", { method: "POST" });
      const data = await res.json();
      alert(`${data.message}\nTotal photos: ${data.total}`);
      fetchPhotos();
      fetchStats();
    } catch {
      alert("Import failed");
    } finally {
      setImporting(false);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      const res = await fetch(`/api/photos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toggleFavorite: true }),
      });
      const updated = await res.json();
      setPhotos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, favorite: updated.favorite } : p))
      );
      if (selectedPhoto?.id === id) {
        setSelectedPhoto({ ...selectedPhoto, favorite: updated.favorite });
      }
    } catch {
      console.error("Failed to toggle favorite");
    }
  };

  return (
    <div className="space-y-6">
      <SCPageHeader
        title="MEDIA VAULT"
        subtitle={stats ? `${stats.total} photos | ${stats.favorites} favorites` : "Loading..."}
        actions={
          <SCButton onClick={handleImport} disabled={importing}>
            <span className="material-symbols-outlined text-[16px] mr-1">
              {importing ? "progress_activity" : "download"}
            </span>
            {importing ? "Importing..." : "Import Photos"}
          </SCButton>
        }
      />

      {/* Stats Cards */}
      {stats && stats.total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.filter((c) => c.value && stats.byCategory[c.value]).map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value === category ? "" : cat.value)}
              className={`rounded-xl border p-3 text-center transition-colors ${
                cat.value === category
                  ? "border-sc-primary bg-sc-primary/10 text-white"
                  : "border-sc-border bg-sc-surface-glass text-slate-400 hover:border-slate-500"
              }`}
            >
              <p className="text-lg font-black">{stats.byCategory[cat.value] || 0}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider">{cat.label}</p>
            </button>
          ))}
        </div>
      )}

      {/* Filter Bar */}
      <SCGlassCard className="p-3 flex items-center gap-3">
        <span className="material-symbols-outlined text-[18px] text-slate-400">filter_list</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-sc-border bg-white/5 px-3 py-1.5 text-sm text-white focus:border-sc-primary/50 focus:outline-none"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value} className="bg-sc-bg text-white">
              {cat.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => setCategory("")}
          className="text-xs text-slate-500 hover:text-white transition-colors"
        >
          Clear filter
        </button>
      </SCGlassCard>

      {/* Photo Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-sc-surface animate-pulse" />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="material-symbols-outlined text-[64px] text-slate-600 mb-4">image</span>
          <h3 className="text-lg font-bold text-white">No photos yet</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md">
            Click &quot;Import Photos&quot; to scan your Mac for Jacob&apos;s photos and import them into the library.
          </p>
          <SCButton onClick={handleImport} className="mt-4" disabled={importing}>
            {importing ? "Importing..." : "Import Photos Now"}
          </SCButton>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square rounded-xl overflow-hidden bg-sc-surface cursor-pointer border border-sc-border hover:border-sc-primary/50 transition-all hover:shadow-lg hover:shadow-sc-primary/10"
              onClick={() => setSelectedPhoto(photo)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/photos/${photo.id}/file`}
                alt={photo.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                }}
              />
              <div className="hidden flex-col items-center justify-center w-full h-full text-slate-500">
                <span className="material-symbols-outlined text-[32px]">image</span>
                <span className="text-xs mt-1">{photo.mimeType?.split("/")[1]?.toUpperCase()}</span>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-white font-medium truncate">{photo.name}</p>
                <p className="text-xs text-white/70">{formatFileSize(photo.fileSize)} | {photo.category}</p>
              </div>

              {photo.favorite && (
                <div className="absolute top-2 right-2">
                  <span className="material-symbols-outlined text-[18px] text-yellow-400">star</span>
                </div>
              )}

              <div className="absolute top-2 left-2">
                <span className="text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded-full">
                  {photo.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative bg-sc-bg border border-sc-border rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-white">close</span>
            </button>

            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-2/3 bg-sc-surface flex items-center justify-center min-h-[300px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/photos/${selectedPhoto.id}/file`}
                  alt={selectedPhoto.name}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>

              <div className="lg:w-1/3 p-6 space-y-4">
                <h3 className="text-lg font-black text-white">{selectedPhoto.name}</h3>

                <div className="space-y-2 text-sm">
                  {[
                    ["Category", selectedPhoto.category],
                    ["Size", formatFileSize(selectedPhoto.fileSize)],
                    ["Type", selectedPhoto.mimeType],
                    ["Source", selectedPhoto.source],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-slate-500">{label}</span>
                      <span className="text-white font-medium capitalize">{val}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedPhoto.tags.map((tag) => (
                      <SCBadge key={tag}>{tag}</SCBadge>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-sc-border">
                  <SCButton
                    variant={selectedPhoto.favorite ? "primary" : "secondary"}
                    size="sm"
                    className="w-full"
                    onClick={() => handleToggleFavorite(selectedPhoto.id)}
                  >
                    <span className="material-symbols-outlined text-[16px] mr-1">
                      {selectedPhoto.favorite ? "star" : "star_border"}
                    </span>
                    {selectedPhoto.favorite ? "Favorited" : "Favorite"}
                  </SCButton>
                </div>

                <div className="pt-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">File Path</p>
                  <p className="text-xs text-slate-600 break-all font-mono">{selectedPhoto.filePath}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

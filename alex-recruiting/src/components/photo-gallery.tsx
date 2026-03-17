"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Download,
  Heart,
  Filter,
  RefreshCw,
  Star,
  Image as ImageIcon,
  X,
} from "lucide-react";

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
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function PhotoGallery() {
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Camera className="h-6 w-6" />
            Photo Library
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {stats
              ? `${stats.total} photos | ${stats.favorites} favorites`
              : "Loading..."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleImport}
            disabled={importing}
            className="bg-slate-900 text-white hover:bg-slate-800"
          >
            {importing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {importing ? "Importing..." : "Import Photos"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && stats.total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.filter((c) => c.value && stats.byCategory[c.value]).map(
            (cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value === category ? "" : cat.value)}
                className={`rounded-lg border p-3 text-center transition-colors ${
                  cat.value === category
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <p className="text-lg font-bold">
                  {stats.byCategory[cat.value] || 0}
                </p>
                <p className="text-xs">{cat.label}</p>
              </button>
            )
          )}
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-400" />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => setCategory("")}
          className="text-xs text-slate-500 hover:text-slate-900"
        >
          Clear filter
        </button>
      </div>

      {/* Photo Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ImageIcon className="h-16 w-16 text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700">No photos yet</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md">
            Click &quot;Import Photos&quot; to scan your Mac for Jacob&apos;s photos and
            import them into the library.
          </p>
          <Button onClick={handleImport} className="mt-4" disabled={importing}>
            {importing ? "Importing..." : "Import Photos Now"}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square rounded-lg overflow-hidden bg-slate-100 cursor-pointer border border-slate-200 hover:border-slate-400 transition-all hover:shadow-md"
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
              <div className="hidden flex-col items-center justify-center w-full h-full text-slate-400">
                <ImageIcon className="h-8 w-8" />
                <span className="text-xs mt-1">{photo.mimeType?.split("/")[1]?.toUpperCase()}</span>
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-white font-medium truncate">
                  {photo.name}
                </p>
                <p className="text-xs text-white/70">
                  {formatFileSize(photo.fileSize)} | {photo.category}
                </p>
              </div>

              {/* Favorite badge */}
              {photo.favorite && (
                <div className="absolute top-2 right-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                </div>
              )}

              {/* Category badge */}
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
            className="relative bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col lg:flex-row">
              {/* Image */}
              <div className="lg:w-2/3 bg-slate-100 flex items-center justify-center min-h-[300px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/photos/${selectedPhoto.id}/file`}
                  alt={selectedPhoto.name}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>

              {/* Details */}
              <div className="lg:w-1/3 p-6 space-y-4">
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedPhoto.name}
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Category</span>
                    <span className="font-medium capitalize">
                      {selectedPhoto.category}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Size</span>
                    <span className="font-medium">
                      {formatFileSize(selectedPhoto.fileSize)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Type</span>
                    <span className="font-medium">{selectedPhoto.mimeType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Source</span>
                    <span className="font-medium">{selectedPhoto.source}</span>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedPhoto.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant={selectedPhoto.favorite ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToggleFavorite(selectedPhoto.id)}
                    className="flex-1"
                  >
                    <Heart
                      className={`h-4 w-4 mr-1 ${
                        selectedPhoto.favorite ? "fill-white" : ""
                      }`}
                    />
                    {selectedPhoto.favorite ? "Favorited" : "Favorite"}
                  </Button>
                </div>

                {/* File Path */}
                <div className="pt-2">
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    File Path
                  </p>
                  <p className="text-xs text-slate-400 break-all font-mono">
                    {selectedPhoto.filePath}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

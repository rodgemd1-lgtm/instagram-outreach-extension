"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Sparkles,
  ImageIcon,
  Film,
  Loader2,
  Download,
  ChevronRight,
  X,
} from "lucide-react";
import imagePrompts from "@/lib/recruit/image-prompts.json";

interface ImagePrompt {
  id: string;
  section: string;
  prompt: string;
  aspect_ratio: string;
  type: string;
  notes: string;
}

interface GeneratedImage {
  url: string;
  width: number;
  height: number;
  generatedAt: string;
}

export default function PromptStudioPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video">("all");
  const [selectedPrompt, setSelectedPrompt] = useState<ImagePrompt | null>(null);
  const [generating, setGenerating] = useState(false);
  const [history, setHistory] = useState<Record<string, GeneratedImage[]>>({});
  const [error, setError] = useState<string | null>(null);

  const prompts = imagePrompts as ImagePrompt[];

  const filtered = useMemo(() => {
    return prompts.filter((p) => {
      const matchesSearch =
        !search ||
        p.section.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        p.prompt.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || p.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [prompts, search, typeFilter]);

  async function handleGenerate(prompt: ImagePrompt) {
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/media/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.prompt,
          promptId: prompt.id,
          section: prompt.section,
          aspectRatio: prompt.aspect_ratio,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      const newImages: GeneratedImage[] = data.images.map((img: any) => ({
        url: img.url,
        width: img.width,
        height: img.height,
        generatedAt: data.generatedAt,
      }));

      setHistory((prev) => ({
        ...prev,
        [prompt.id]: [...(prev[prompt.id] || []), ...newImages],
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  const totalGenerated = Object.values(history).reduce((sum, imgs) => sum + imgs.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--app-navy-strong)]">Prompt Studio</h1>
        <p className="mt-1 text-sm text-[var(--app-muted)]">
          Browse, test, and generate from {prompts.length} recruiting image prompts.
          {totalGenerated > 0 && ` ${totalGenerated} images generated this session.`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompts..."
            className="w-full rounded-lg border border-[rgba(15,40,75,0.12)] bg-white py-2 pl-9 pr-3 text-sm text-[var(--app-navy-strong)] placeholder:text-[var(--app-muted)] focus:border-[var(--app-navy)] focus:outline-none focus:ring-1 focus:ring-[var(--app-navy)]"
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-[rgba(15,40,75,0.04)] p-1">
          {(["all", "image", "video"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                typeFilter === type
                  ? "bg-white text-[var(--app-navy-strong)] shadow-sm"
                  : "text-[var(--app-muted)] hover:text-[var(--app-navy)]"
              }`}
            >
              {type === "image" && <ImageIcon className="h-3 w-3" />}
              {type === "video" && <Film className="h-3 w-3" />}
              {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Prompt List */}
        <div className="space-y-2">
          {filtered.map((prompt) => {
            const images = history[prompt.id] || [];
            const isSelected = selectedPrompt?.id === prompt.id;

            return (
              <button
                key={prompt.id}
                onClick={() => setSelectedPrompt(prompt)}
                className={`w-full rounded-xl border p-4 text-left transition-all ${
                  isSelected
                    ? "border-[var(--app-navy)] bg-[rgba(15,40,75,0.04)] shadow-sm"
                    : "border-[rgba(15,40,75,0.08)] bg-white/74 hover:border-[rgba(15,40,75,0.16)]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[var(--app-navy-strong)]">
                        {prompt.section}
                      </p>
                      <Badge variant="secondary" className="text-[10px]">
                        {prompt.type}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {prompt.aspect_ratio}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-[var(--app-muted)] line-clamp-2">
                      {prompt.prompt.slice(0, 120)}...
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {images.length > 0 && (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                        {images.length}
                      </Badge>
                    )}
                    <ChevronRight className="h-4 w-4 text-[var(--app-muted)]" />
                  </div>
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <Search className="mx-auto h-8 w-8 text-[#D1D5DB]" />
              <p className="mt-2 text-sm text-[var(--app-muted)]">No prompts match your search</p>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="sticky top-6">
          {selectedPrompt ? (
            <Card>
              <CardHeader className="border-b border-[rgba(15,40,75,0.08)] bg-[rgba(15,40,75,0.03)]">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-[var(--app-navy-strong)]">
                      {selectedPrompt.section}
                    </CardTitle>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary">{selectedPrompt.type}</Badge>
                      <Badge variant="outline">{selectedPrompt.aspect_ratio}</Badge>
                      <Badge variant="outline">{selectedPrompt.id}</Badge>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPrompt(null)}
                    className="rounded-md p-1 text-[var(--app-muted)] hover:bg-[rgba(15,40,75,0.05)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* Prompt Text */}
                <div className="rounded-lg bg-[rgba(15,40,75,0.03)] p-3">
                  <p className="text-xs font-medium text-[var(--app-muted)]">PROMPT</p>
                  <p className="mt-2 text-xs leading-5 text-[var(--app-navy-strong)]">
                    {selectedPrompt.prompt}
                  </p>
                </div>

                {/* Notes */}
                {selectedPrompt.notes && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                    <p className="text-xs font-medium text-amber-700">NOTES</p>
                    <p className="mt-1 text-xs leading-5 text-amber-900">
                      {selectedPrompt.notes}
                    </p>
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={() => handleGenerate(selectedPrompt)}
                  disabled={generating || selectedPrompt.type === "video"}
                  className="w-full bg-[var(--app-navy-strong)] text-white hover:bg-[var(--app-navy)]"
                >
                  {generating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {selectedPrompt.type === "video"
                    ? "Video prompts use the Video Generator"
                    : "Generate Now"}
                </Button>

                {/* History */}
                {(history[selectedPrompt.id] || []).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-[var(--app-muted)]">
                      GENERATION HISTORY ({history[selectedPrompt.id].length})
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {history[selectedPrompt.id].map((img, i) => (
                        <div
                          key={i}
                          className="group relative overflow-hidden rounded-xl border border-[rgba(15,40,75,0.08)]"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.url}
                            alt={`Generated ${selectedPrompt.section} #${i + 1}`}
                            className="w-full object-cover"
                            style={{
                              aspectRatio: selectedPrompt.aspect_ratio.replace(":", "/"),
                            }}
                          />
                          <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <span className="text-[10px] text-white/80">
                              {new Date(img.generatedAt).toLocaleString()}
                            </span>
                            <a
                              href={img.url}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg bg-white/90 p-1.5 text-[var(--app-navy-strong)]"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex min-h-[400px] flex-col items-center justify-center py-12">
                <Sparkles className="h-12 w-12 text-[#D1D5DB]" />
                <p className="mt-3 text-sm font-medium text-[var(--app-navy-strong)]">
                  Select a prompt
                </p>
                <p className="mt-1 text-xs text-[var(--app-muted)]">
                  Choose a prompt from the list to view details and generate images
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { SCPageHeader } from "@/components/sc/sc-page-header";
import { SCGlassCard } from "@/components/sc/sc-glass-card";
import { SCBadge } from "@/components/sc/sc-badge";
import { SCButton } from "@/components/sc/sc-button";
import { SCInput } from "@/components/sc/sc-input";
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      <SCPageHeader
        title="PROMPT STUDIO"
        subtitle={`Browse, test, and generate from ${prompts.length} recruiting image prompts.${totalGenerated > 0 ? ` ${totalGenerated} images generated this session.` : ""}`}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <SCInput
            icon="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompts..."
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-white/5 p-1 border border-sc-border">
          {(["all", "image", "video"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                typeFilter === type
                  ? "bg-sc-primary/20 text-sc-primary"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              {type === "image" && <span className="material-symbols-outlined text-[14px]">image</span>}
              {type === "video" && <span className="material-symbols-outlined text-[14px]">videocam</span>}
              {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <SCGlassCard className="p-3 border-l-4 border-l-red-500">
          <p className="text-sm text-red-400">{error}</p>
        </SCGlassCard>
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
                    ? "border-sc-primary bg-sc-primary/5"
                    : "border-sc-border bg-sc-surface-glass hover:border-slate-500"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">{prompt.section}</p>
                      <SCBadge>{prompt.type}</SCBadge>
                      <SCBadge variant="default">{prompt.aspect_ratio}</SCBadge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                      {prompt.prompt.slice(0, 120)}...
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {images.length > 0 && (
                      <SCBadge variant="success">{images.length}</SCBadge>
                    )}
                    <span className="material-symbols-outlined text-[18px] text-slate-500">chevron_right</span>
                  </div>
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <span className="material-symbols-outlined text-[32px] text-slate-600">search</span>
              <p className="mt-2 text-sm text-slate-500">No prompts match your search</p>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="sticky top-6">
          {selectedPrompt ? (
            <SCGlassCard variant="strong" className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-black text-white">{selectedPrompt.section}</h2>
                  <div className="mt-2 flex items-center gap-2">
                    <SCBadge variant="primary">{selectedPrompt.type}</SCBadge>
                    <SCBadge>{selectedPrompt.aspect_ratio}</SCBadge>
                    <SCBadge>{selectedPrompt.id}</SCBadge>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPrompt(null)}
                  className="rounded-md p-1 text-slate-500 hover:bg-white/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Prompt Text */}
              <div className="rounded-lg bg-white/5 border border-sc-border p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">PROMPT</p>
                <p className="mt-2 text-xs leading-5 text-slate-300">{selectedPrompt.prompt}</p>
              </div>

              {/* Notes */}
              {selectedPrompt.notes && (
                <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-yellow-500">NOTES</p>
                  <p className="mt-1 text-xs leading-5 text-yellow-400/80">{selectedPrompt.notes}</p>
                </div>
              )}

              {/* Generate Button */}
              <SCButton
                onClick={() => handleGenerate(selectedPrompt)}
                disabled={generating || selectedPrompt.type === "video"}
                className="w-full"
              >
                {generating ? (
                  <span className="material-symbols-outlined text-[16px] animate-spin mr-2">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[16px] mr-2">auto_awesome</span>
                )}
                {selectedPrompt.type === "video"
                  ? "Video prompts use the Video Generator"
                  : "Generate Now"}
              </SCButton>

              {/* History */}
              {(history[selectedPrompt.id] || []).length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    GENERATION HISTORY ({history[selectedPrompt.id].length})
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {history[selectedPrompt.id].map((img, i) => (
                      <div
                        key={i}
                        className="group relative overflow-hidden rounded-xl border border-sc-border"
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
                            className="rounded-lg bg-white/90 p-1.5 text-sc-bg"
                          >
                            <span className="material-symbols-outlined text-[14px]">download</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </SCGlassCard>
          ) : (
            <SCGlassCard className="flex min-h-[400px] flex-col items-center justify-center py-12">
              <span className="material-symbols-outlined text-[48px] text-slate-600">auto_awesome</span>
              <p className="mt-3 text-sm font-bold text-white">Select a prompt</p>
              <p className="mt-1 text-xs text-slate-500">
                Choose a prompt from the list to view details and generate images
              </p>
            </SCGlassCard>
          )}
        </div>
      </div>
    </div>
  );
}

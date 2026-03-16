"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Download, Loader2, ImageIcon, ChevronDown, ChevronUp } from "lucide-react";

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
  promptId: string;
  generatedAt: string;
}

export function AIImageGenerator({ prompts }: { prompts: ImagePrompt[] }) {
  const [generating, setGenerating] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<string, GeneratedImage[]>>({});
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const imagePrompts = prompts.filter((p) => p.type === "image");

  async function handleGenerate(prompt: ImagePrompt) {
    setGenerating(prompt.id);
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

      if (!res.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setGeneratedImages((prev) => ({
        ...prev,
        [prompt.id]: [
          ...(prev[prompt.id] || []),
          ...data.images.map((img: any) => ({
            url: img.url,
            width: img.width,
            height: img.height,
            promptId: prompt.id,
            generatedAt: data.generatedAt,
          })),
        ],
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(null);
    }
  }

  return (
    <Card>
      <CardHeader className="border-b border-[rgba(15,40,75,0.08)] bg-[rgba(15,40,75,0.03)]">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-[var(--app-navy-strong)]">
            <Sparkles className="h-4 w-4" />
            AI Image Generation
          </CardTitle>
          <Badge variant="outline">{imagePrompts.length} prompts</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {imagePrompts.map((prompt) => {
          const images = generatedImages[prompt.id] || [];
          const isExpanded = expandedPrompt === prompt.id;
          const isGenerating = generating === prompt.id;

          return (
            <div
              key={prompt.id}
              className="rounded-[22px] border border-[rgba(15,40,75,0.08)] bg-white/74 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[var(--app-navy-strong)]">
                      {prompt.section}
                    </p>
                    <Badge variant="secondary">{prompt.aspect_ratio}</Badge>
                    {images.length > 0 && (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        {images.length} generated
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={() => setExpandedPrompt(isExpanded ? null : prompt.id)}
                    className="mt-1 flex items-center gap-1 text-xs text-[var(--app-muted)] hover:text-[var(--app-navy)]"
                  >
                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {isExpanded ? "Hide prompt" : "View prompt"}
                  </button>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleGenerate(prompt)}
                  disabled={isGenerating}
                  className="bg-[var(--app-navy-strong)] text-white hover:bg-[var(--app-navy)]"
                >
                  {isGenerating ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="mr-1 h-3 w-3" />
                  )}
                  Generate
                </Button>
              </div>

              {isExpanded && (
                <div className="mt-3 rounded-lg bg-[rgba(15,40,75,0.03)] p-3">
                  <p className="text-xs leading-5 text-[var(--app-muted)] line-clamp-4">{prompt.prompt}</p>
                  {prompt.notes && (
                    <p className="mt-2 text-xs leading-5 text-[var(--app-navy)] italic">{prompt.notes}</p>
                  )}
                </div>
              )}

              {images.length > 0 && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {images.map((img, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-xl border border-[rgba(15,40,75,0.08)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={`Generated ${prompt.section}`}
                        className="w-full object-cover"
                        style={{ aspectRatio: prompt.aspect_ratio.replace(":", "/") }}
                      />
                      <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/40 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <a
                          href={img.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg bg-white/90 p-1.5 text-[var(--app-navy-strong)] hover:bg-white"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {imagePrompts.length === 0 && (
          <div className="py-12 text-center">
            <ImageIcon className="mx-auto h-8 w-8 text-[#D1D5DB]" />
            <p className="mt-2 text-sm text-[var(--app-muted)]">No image prompts available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

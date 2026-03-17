"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Film, Loader2, Sparkles } from "lucide-react";

interface VideoPrompt {
  id: string;
  section: string;
  prompt: string;
  aspect_ratio: string;
  type: string;
  notes: string;
}

interface GeneratedVideo {
  url: string;
  promptId: string;
  generatedAt: string;
}

export function AIVideoGenerator({ prompts }: { prompts: VideoPrompt[] }) {
  const [generating, setGenerating] = useState(false);
  const [sourceImageUrl, setSourceImageUrl] = useState("");
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const videoPrompts = prompts.filter((p) => p.type === "video");

  async function handleGenerate(prompt: VideoPrompt) {
    if (!sourceImageUrl.trim()) {
      setError("Enter a source image URL first. Generate a still image, then use its URL here.");
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/media/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: sourceImageUrl.trim(),
          prompt: prompt.prompt,
          duration: "5",
          aspectRatio: prompt.aspect_ratio,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Video generation failed");
      }

      setGeneratedVideos((prev) => [
        ...prev,
        {
          url: data.video.url,
          promptId: prompt.id,
          generatedAt: data.generatedAt,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video generation failed");
    } finally {
      setGenerating(false);
    }
  }

  if (videoPrompts.length === 0) return null;

  return (
    <Card>
      <CardHeader className="border-b border-[rgba(15,40,75,0.08)] bg-[rgba(15,40,75,0.03)]">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-[var(--app-navy-strong)]">
            <Film className="h-4 w-4" />
            AI Video Generation (Kling 3.0)
          </CardTitle>
          <Badge variant="outline">{videoPrompts.length} prompts</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--app-muted)]">
            Source Image URL (generate a still first, then paste URL here)
          </label>
          <input
            type="url"
            value={sourceImageUrl}
            onChange={(e) => setSourceImageUrl(e.target.value)}
            placeholder="https://fal.media/files/..."
            className="w-full rounded-lg border border-[rgba(15,40,75,0.12)] bg-white px-3 py-2 text-sm text-[var(--app-navy-strong)] placeholder:text-[var(--app-muted)] focus:border-[var(--app-navy)] focus:outline-none focus:ring-1 focus:ring-[var(--app-navy)]"
          />
        </div>

        {videoPrompts.map((prompt) => {
          const videos = generatedVideos.filter((v) => v.promptId === prompt.id);

          return (
            <div
              key={prompt.id}
              className="rounded-[22px] border border-[rgba(15,40,75,0.08)] bg-white/74 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[var(--app-navy-strong)]">
                      {prompt.section}
                    </p>
                    <Badge variant="secondary">{prompt.aspect_ratio}</Badge>
                    <Badge variant="outline">Video</Badge>
                  </div>
                  <p className="mt-1 text-xs text-[var(--app-muted)] line-clamp-2">{prompt.notes}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleGenerate(prompt)}
                  disabled={generating || !sourceImageUrl.trim()}
                  className="bg-[var(--app-navy-strong)] text-white hover:bg-[var(--app-navy)]"
                >
                  {generating ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="mr-1 h-3 w-3" />
                  )}
                  Animate
                </Button>
              </div>

              {videos.length > 0 && (
                <div className="mt-3 space-y-2">
                  {videos.map((vid, i) => (
                    <div key={i} className="overflow-hidden rounded-xl border border-[rgba(15,40,75,0.08)]">
                      <video
                        src={vid.url}
                        controls
                        loop
                        muted
                        className="w-full"
                        style={{ aspectRatio: prompt.aspect_ratio.replace(":", "/") }}
                      />
                      <div className="flex items-center justify-between p-2">
                        <span className="text-xs text-[var(--app-muted)]">
                          Generated {new Date(vid.generatedAt).toLocaleString()}
                        </span>
                        <a
                          href={vid.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-medium text-[var(--app-navy)] hover:text-[var(--app-navy-strong)]"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

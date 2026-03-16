"use client";

import { useState } from "react";
import { GlassCard } from "./glass-card";
import { StitchButton } from "./stitch-button";
import { cn } from "@/lib/utils";

interface DMConsoleProps {
  schoolId: string;
  schoolName: string;
  onSend?: (message: string, tone: string) => void;
  className?: string;
}

const TONES = ["Professional", "Casual", "Enthusiastic", "Grateful"];

export function DMConsole({ schoolId, schoolName, onSend, className }: DMConsoleProps) {
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("Professional");
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/dms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId, tone: tone.toLowerCase() }),
      });
      const data = await res.json();
      if (data.dm?.message) {
        setMessage(data.dm.message);
      }
    } catch (err) {
      console.error("DM generation failed:", err);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <GlassCard className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="stitch-label">DM Console</h3>
        <span className="text-[10px] font-mono text-[#0bda7d]">
          TARGET: {schoolName}
        </span>
      </div>

      {/* Tone selector */}
      <div className="flex gap-1 mb-3">
        {TONES.map((t) => (
          <button
            key={t}
            onClick={() => setTone(t)}
            className={cn(
              "rounded-md px-2 py-1 text-[10px] font-semibold transition-all",
              tone === t
                ? "bg-[#C5050C]/20 text-[#C5050C]"
                : "text-white/30 hover:text-white/50"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Terminal area */}
      <div className="rounded-lg border border-white/5 bg-black/40 p-3 font-mono">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="DM message will appear here..."
          className="min-h-[120px] w-full resize-none bg-transparent text-xs text-[#0bda7d] placeholder:text-white/15 outline-none"
        />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <StitchButton
          variant="terminal"
          size="sm"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? "GENERATING..." : "GENERATE"}
        </StitchButton>
        <StitchButton
          variant="pirate"
          size="sm"
          onClick={() => {
            if (message.trim()) onSend?.(message, tone);
          }}
          disabled={!message.trim()}
        >
          TRANSMIT
        </StitchButton>
      </div>
    </GlassCard>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface MusicToggleProps {
  /** Path to audio file in /public */
  src: string;
  /** Volume 0-1. Default 0.15 */
  volume?: number;
}

export function MusicToggle({ src, volume = 0.15 }: MusicToggleProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = volume;
    audio.preload = "none";
    audioRef.current = audio;

    try {
      const pref = localStorage.getItem("recruit-music-muted");
      if (pref === "false") {
        setMuted(false);
        audio.play().catch(() => {});
      }
    } catch {
      // localStorage not available
    }

    setLoaded(true);

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [src, volume]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (muted) {
      audio.play().catch(() => {});
      setMuted(false);
      try { localStorage.setItem("recruit-music-muted", "false"); } catch {}
    } else {
      audio.pause();
      setMuted(true);
      try { localStorage.setItem("recruit-music-muted", "true"); } catch {}
    }
  }, [muted]);

  if (!loaded) return null;

  return (
    <button
      onClick={toggle}
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-[#ff000c]/20 bg-[#000000]/80 backdrop-blur-xl transition-all duration-300 hover:border-[#ff000c]/40 hover:scale-105 md:bottom-auto md:top-6 md:right-20"
      aria-label={muted ? "Unmute background music" : "Mute background music"}
      title={muted ? "Play music" : "Mute music"}
    >
      {muted ? (
        <VolumeX className="h-5 w-5 text-[#9CA3AF]" />
      ) : (
        <Volume2 className="h-5 w-5 text-[#ff000c]" />
      )}
    </button>
  );
}

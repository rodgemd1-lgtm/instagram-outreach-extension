"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react";

/**
 * RecruitVideoPlayer — Three playback modes for the recruit page.
 *
 * Modes:
 *  - "inline": Thumbnail poster + play button, expands on tap
 *  - "background": Auto-play muted loop (desktop only), static image on mobile
 *  - "reel": Auto-play on scroll via IntersectionObserver, muted with controls on tap
 */

export type VideoMode = "inline" | "background" | "reel";

interface RecruitVideoPlayerProps {
  /** Video source URL (e.g., /api/videos/serve?path=...) */
  src: string;
  /** Thumbnail poster image URL */
  poster?: string;
  /** Playback mode */
  mode: VideoMode;
  /** Callback when user clicks fullscreen */
  onFullscreen?: () => void;
  /** Additional className */
  className?: string;
  /** How the poster/video should fit inside frame */
  objectFit?: "cover" | "contain";
}

export function RecruitVideoPlayer({
  src,
  poster,
  mode,
  onFullscreen,
  className = "",
  objectFit = "cover",
}: RecruitVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [showPoster, setShowPoster] = useState(mode === "inline");

  // IntersectionObserver for reel mode — auto-play/pause on scroll
  useEffect(() => {
    if (mode !== "reel") return;
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
          setPlaying(true);
        } else {
          video.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [mode]);

  // Background mode — auto-play muted loop on desktop
  useEffect(() => {
    if (mode !== "background") return;
    const video = videoRef.current;
    if (!video) return;

    // Only autoplay on desktop (> 768px)
    const mq = window.matchMedia("(min-width: 768px)");
    if (mq.matches) {
      video.play().catch(() => {});
      setPlaying(true);
    }
  }, [mode]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (showPoster) {
      setShowPoster(false);
      video.play().catch(() => {});
      setPlaying(true);
      return;
    }

    if (video.paused) {
      video.play().catch(() => {});
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }, [showPoster]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const handleContainerClick = useCallback(() => {
    if (mode === "reel") {
      setShowControls((prev) => !prev);
    } else if (mode === "inline") {
      togglePlay();
    }
  }, [mode, togglePlay]);

  const mediaFitClass =
    objectFit === "contain" ? "object-contain bg-black" : "object-cover";

  // Background mode on mobile: just show poster image
  if (mode === "background") {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        {/* Desktop: video, Mobile: poster */}
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          className={`hidden md:block absolute inset-0 w-full h-full ${mediaFitClass}`}
        />
        {poster && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={poster}
            alt=""
            className={`md:hidden absolute inset-0 w-full h-full ${mediaFitClass}`}
          />
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-xl group cursor-pointer ${className}`}
      onClick={handleContainerClick}
    >
      {/* Poster overlay for inline mode */}
      {showPoster && poster && (
        <div className="absolute inset-0 z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={poster}
            alt=""
            className={`absolute inset-0 w-full h-full ${mediaFitClass}`}
          />
          <div className="absolute inset-0 bg-black/30" />
          {/* Large play button */}
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-amber-600/90 flex items-center justify-center backdrop-blur-sm hover:bg-amber-500 transition-colors">
              <Play className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" />
            </div>
          </button>
        </div>
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted={muted}
        loop={mode === "reel"}
        playsInline
        className={`w-full h-full ${mediaFitClass}`}
        onEnded={() => setPlaying(false)}
      />

      {/* Controls overlay — reel mode (show on tap) or inline (show on hover) */}
      {(mode === "reel" ? showControls : !showPoster) && (
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent transition-opacity ${
            mode === "inline"
              ? "opacity-0 group-hover:opacity-100"
              : "opacity-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="text-white hover:text-amber-400 transition-colors"
            >
              {playing ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="text-white hover:text-amber-400 transition-colors"
            >
              {muted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>

            <div className="flex-1" />

            {onFullscreen && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFullscreen();
                }}
                className="text-white hover:text-amber-400 transition-colors"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

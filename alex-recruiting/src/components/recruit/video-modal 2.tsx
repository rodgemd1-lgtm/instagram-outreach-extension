"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, VolumeX, Volume2 } from "lucide-react";

/**
 * Fullscreen video overlay modal.
 *
 * Rendered via React Portal to document.body so GSAP ScrollTrigger pin
 * re-parenting doesn't break React's DOM reconciliation (insertBefore crash).
 *
 * Sound strategy: Starts muted so autoplay always succeeds (browser policy).
 * A "Tap for sound" button lets the user unmute within a direct gesture.
 */

interface VideoModalProps {
  /** Video source URL */
  src: string;
  /** Poster image URL */
  poster?: string;
  /** Whether the modal is open */
  open: boolean;
  /** Callback to close the modal */
  onClose: () => void;
}

export function VideoModal({ src, poster, open, onClose }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);
  const [muted, setMuted] = useState(true);

  // Wait for client mount before portal rendering
  useEffect(() => setMounted(true), []);

  // Autoplay muted when opened, pause + reset when closed
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (open) {
      // Always start muted — unmuted autoplay is blocked on mobile
      video.muted = true;
      setMuted(true);
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [open]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Handle escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl"
      onClick={handleBackdropClick}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 text-white/60 hover:text-white transition-colors"
        aria-label="Close video"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Video */}
      <div className="relative w-full max-w-5xl mx-4">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted={muted}
          controls
          playsInline
          className="w-full rounded-lg"
        />

        {/* Mute/unmute overlay — prominent "Tap for sound" when muted */}
        {muted ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-sm transition-all hover:bg-black/90"
          >
            <VolumeX className="w-4 h-4" />
            <span>Tap for sound</span>
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full bg-black/50 px-3 py-2 text-white/70 backdrop-blur-sm transition-all hover:bg-black/70 hover:text-white"
            aria-label="Mute"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}

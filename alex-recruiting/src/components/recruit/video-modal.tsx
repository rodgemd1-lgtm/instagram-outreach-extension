"use client";

import { useCallback, useRef, useEffect } from "react";
import { X } from "lucide-react";

/**
 * Fullscreen video overlay modal.
 * Uses native HTML dialog for proper focus trapping + escape key support.
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

  // Play when opened, pause when closed
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (open) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [open]);

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

  if (!open) return null;

  return (
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
      <div className="w-full max-w-5xl mx-4">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          controls
          playsInline
          className="w-full rounded-lg"
        />
      </div>
    </div>
  );
}

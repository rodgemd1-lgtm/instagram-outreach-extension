"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Camera,
  RotateCcw,
  Download,
  X,
  SwitchCamera,
  Square,
  Circle,
} from "lucide-react";

type CaptureMode = "photo" | "video";

interface CapturedMedia {
  type: "photo" | "video";
  blob: Blob;
  url: string;
}

export function CameraCapture({
  onCapture,
  onClose,
}: {
  onCapture?: (media: CapturedMedia) => void;
  onClose?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const [mode, setMode] = useState<CaptureMode>("photo");
  const [isRecording, setIsRecording] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [captured, setCaptured] = useState<CapturedMedia | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: mode === "video",
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
      setError(null);
    } catch {
      setError("Camera access denied. Please enable camera permissions.");
      setHasPermission(false);
    }
  }, [facingMode, mode]);

  useEffect(() => {
    void startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [startCamera]);

  function takePhoto() {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        setCaptured({ type: "photo", blob, url });
      },
      "image/jpeg",
      0.92
    );
  }

  function startRecording() {
    if (!streamRef.current) return;

    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm",
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setCaptured({ type: "video", blob, url });
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  function retake() {
    if (captured?.url) URL.revokeObjectURL(captured.url);
    setCaptured(null);
  }

  function handleSave() {
    if (captured && onCapture) {
      onCapture(captured);
    }
  }

  function toggleCamera() {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-6 text-center">
        <Camera className="h-12 w-12 text-[#D1D5DB]" />
        <p className="text-sm text-[var(--app-muted)]">{error}</p>
        <Button onClick={() => void startCamera()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col bg-black">
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute left-4 top-4 z-20 rounded-full bg-black/50 p-2 text-white"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {/* Preview / Captured */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-black sm:aspect-video">
        {captured ? (
          captured.type === "photo" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={captured.url} alt="Captured" className="h-full w-full object-contain" />
          ) : (
            <video src={captured.url} controls className="h-full w-full object-contain" />
          )
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />

        {isRecording && (
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1">
            <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
            <span className="text-xs font-medium text-white">REC</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 bg-black p-6">
        {captured ? (
          <>
            <Button onClick={retake} variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <RotateCcw className="mr-2 h-4 w-4" />
              Retake
            </Button>
            <Button onClick={handleSave} className="bg-white text-black hover:bg-white/90">
              <Download className="mr-2 h-4 w-4" />
              Save
            </Button>
          </>
        ) : (
          <>
            {/* Mode toggle */}
            <div className="flex rounded-full bg-white/10 p-1">
              <button
                onClick={() => setMode("photo")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${mode === "photo" ? "bg-white text-black" : "text-white"}`}
              >
                Photo
              </button>
              <button
                onClick={() => setMode("video")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${mode === "video" ? "bg-white text-black" : "text-white"}`}
              >
                Video
              </button>
            </div>

            {/* Capture button */}
            {mode === "photo" ? (
              <button
                onClick={takePhoto}
                disabled={!hasPermission}
                className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20 transition-transform active:scale-90"
              >
                <Circle className="h-8 w-8 text-white" fill="white" />
              </button>
            ) : isRecording ? (
              <button
                onClick={stopRecording}
                className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-red-500 bg-red-500/20 transition-transform active:scale-90"
              >
                <Square className="h-6 w-6 text-white" fill="white" />
              </button>
            ) : (
              <button
                onClick={startRecording}
                disabled={!hasPermission}
                className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-red-500 bg-red-500/20 transition-transform active:scale-90"
              >
                <Circle className="h-8 w-8 text-red-500" fill="currentColor" />
              </button>
            )}

            {/* Flip camera */}
            <button
              onClick={toggleCamera}
              className="rounded-full bg-white/10 p-3 text-white"
            >
              <SwitchCamera className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

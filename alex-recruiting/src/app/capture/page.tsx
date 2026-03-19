"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type CaptureMode = "photo" | "video";

interface CapturedMedia {
  type: "photo" | "video";
  blob: Blob;
  url: string;
}

export default function CapturePage() {
  const router = useRouter();
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  async function handleSave() {
    if (!captured) return;
    const formData = new FormData();
    formData.append(
      "file",
      captured.blob,
      captured.type === "photo" ? "capture.jpg" : "capture.webm"
    );
    formData.append("source", "camera");

    try {
      const endpoint =
        captured.type === "photo" ? "/api/media/upload" : "/api/videos/upload-local";
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        router.push("/media-lab");
      } else {
        const data = await res.json().catch(() => ({}));
        setUploadError(data.error || `Upload failed (${res.status})`);
      }
    } catch {
      setUploadError("Upload failed — network error. Please try again.");
    }
  }

  function toggleCamera() {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-sc-bg flex flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="material-symbols-outlined text-[48px] text-white/20">photo_camera</span>
        <p className="text-sm text-slate-400">{error}</p>
        <button
          onClick={() => void startCamera()}
          className="rounded-lg border border-sc-border bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-sc-bg flex flex-col">
      {uploadError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-red-600 px-4 py-2 text-sm text-white shadow-lg">
          {uploadError}
          <button
            onClick={() => {
              setUploadError(null);
              router.push("/media-lab");
            }}
            className="ml-3 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Close button */}
      <button
        onClick={() => router.back()}
        className="absolute left-4 top-4 z-20 rounded-full bg-black/50 p-2 text-white"
      >
        <span className="material-symbols-outlined text-[20px]">close</span>
      </button>

      {/* Preview / Captured */}
      <div className="relative flex-1 overflow-hidden bg-black">
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
      <div className="flex items-center justify-center gap-6 bg-sc-bg border-t border-sc-border p-6">
        {captured ? (
          <>
            <button
              onClick={retake}
              className="flex items-center gap-2 rounded-lg border border-sc-border bg-white/5 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">replay</span>
              Retake
            </button>
            <button
              onClick={() => void handleSave()}
              className="flex items-center gap-2 rounded-lg bg-sc-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-sc-primary/90 transition-colors shadow-xl shadow-sc-primary-glow"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save
            </button>
          </>
        ) : (
          <>
            {/* Mode toggle */}
            <div className="flex rounded-full bg-white/10 p-1">
              <button
                onClick={() => setMode("photo")}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${mode === "photo" ? "bg-white text-black" : "text-white"}`}
              >
                Photo
              </button>
              <button
                onClick={() => setMode("video")}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${mode === "video" ? "bg-white text-black" : "text-white"}`}
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
                <span className="material-symbols-outlined text-[32px] text-white">circle</span>
              </button>
            ) : isRecording ? (
              <button
                onClick={stopRecording}
                className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-red-500 bg-red-500/20 transition-transform active:scale-90"
              >
                <span className="material-symbols-outlined text-[24px] text-white">stop</span>
              </button>
            ) : (
              <button
                onClick={startRecording}
                disabled={!hasPermission}
                className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-red-500 bg-red-500/20 transition-transform active:scale-90"
              >
                <span className="material-symbols-outlined text-[32px] text-red-500">circle</span>
              </button>
            )}

            {/* Flip camera */}
            <button
              onClick={toggleCamera}
              className="rounded-full bg-white/10 p-3 text-white"
            >
              <span className="material-symbols-outlined text-[20px]">cameraswitch</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

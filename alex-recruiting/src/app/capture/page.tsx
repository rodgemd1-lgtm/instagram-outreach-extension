"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CameraCapture } from "@/components/camera-capture";

export default function CapturePage() {
  const router = useRouter();
  const [uploadError, setUploadError] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {uploadError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-red-600 px-4 py-2 text-sm text-white shadow-lg">
          {uploadError}
          <button
            onClick={() => { setUploadError(null); router.push("/media-lab"); }}
            className="ml-3 underline"
          >
            Dismiss
          </button>
        </div>
      )}
      <CameraCapture
        onCapture={async (media) => {
          const formData = new FormData();
          formData.append(
            "file",
            media.blob,
            media.type === "photo" ? "capture.jpg" : "capture.webm"
          );
          formData.append("source", "camera");

          try {
            const endpoint = media.type === "photo" ? "/api/media/upload" : "/api/videos/upload-local";
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
        }}
        onClose={() => router.back()}
      />
    </div>
  );
}

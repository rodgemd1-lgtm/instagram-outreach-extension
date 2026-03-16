"use client";

import { useRouter } from "next/navigation";
import { CameraCapture } from "@/components/camera-capture";

export default function CapturePage() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <CameraCapture
        onCapture={async (media) => {
          // Upload the captured media
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
            }
          } catch {
            // Upload failed, still navigate back
            router.push("/media-lab");
          }
        }}
        onClose={() => router.back()}
      />
    </div>
  );
}

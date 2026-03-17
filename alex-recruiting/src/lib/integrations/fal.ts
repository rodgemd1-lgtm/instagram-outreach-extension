import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY,
});

export interface FalImageResult {
  url: string;
  width: number;
  height: number;
  contentType: string;
}

export async function generateImage(
  prompt: string,
  options: {
    aspectRatio?: string;
    imageSize?: { width: number; height: number };
    numImages?: number;
  } = {}
): Promise<FalImageResult[]> {
  const result = await fal.subscribe("fal-ai/flux-pro/v1.1", {
    input: {
      prompt,
      image_size: options.imageSize ?? { width: 1792, height: 1024 },
      num_images: options.numImages ?? 1,
      enable_safety_checker: true,
    },
  });

  return (result.data as any).images.map((img: any) => ({
    url: img.url,
    width: img.width,
    height: img.height,
    contentType: img.content_type ?? "image/jpeg",
  }));
}

export interface FalVideoResult {
  url: string;
  contentType: string;
}

export async function generateVideo(
  imageUrl: string,
  prompt: string,
  options: {
    duration?: "5" | "10";
    aspectRatio?: "16:9" | "9:16" | "1:1";
  } = {}
): Promise<FalVideoResult> {
  const result = await fal.subscribe("fal-ai/kling-video/v2/master/image-to-video", {
    input: {
      prompt,
      image_url: imageUrl,
      duration: options.duration ?? "5",
      aspect_ratio: options.aspectRatio ?? "16:9",
    } as any,
    pollInterval: 5000,
    logs: true,
  });

  const video = (result.data as any).video;
  return {
    url: video.url,
    contentType: video.content_type ?? "video/mp4",
  };
}

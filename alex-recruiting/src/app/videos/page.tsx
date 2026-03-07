import { VideoGallery } from "@/components/video-gallery";

export const metadata = {
  title: "Video Library | Alex Recruiting",
};

export default function VideosPage() {
  return (
    <div className="p-6">
      <VideoGallery />
    </div>
  );
}

import { PhotoGallery } from "@/components/photo-gallery";

export const metadata = {
  title: "Photo Library | Alex Recruiting",
};

export default function MediaPage() {
  return (
    <div className="p-6">
      <PhotoGallery />
    </div>
  );
}

/**
 * Section-to-photo mapping for the recruit page.
 * Maps each section to a preferred photo category and optional specific photo IDs.
 */

export interface SectionPhotoConfig {
  /** Photo category from the photo store */
  category: "action" | "portrait" | "training" | "team" | "event" | "generated" | "profile";
  /** Optional specific photo ID to use */
  photoId?: string;
  /** Position hint: where in the section the background appears */
  position: "cover" | "top" | "center" | "bottom";
  /** Overlay darkness (0-1). Higher = darker overlay over the photo */
  overlayOpacity: number;
}

export const SECTION_PHOTOS: Record<string, SectionPhotoConfig> = {
  hero: {
    category: "action",
    photoId: "photo-1772938520084-15",
    position: "cover",
    overlayOpacity: 0.7,
  },
  "film-reel": {
    category: "action",
    photoId: "photo-1772939449944-10",
    position: "cover",
    overlayOpacity: 0.8,
  },
  origin: {
    category: "training",
    photoId: "photo-1772938520083-7",
    position: "center",
    overlayOpacity: 0.85,
  },
  character: {
    category: "profile",
    photoId: "photo-1772938520087-20",
    position: "top",
    overlayOpacity: 0.9,
  },
  film: {
    category: "action",
    position: "center",
    overlayOpacity: 0.85,
  },
  academics: {
    category: "profile",
    position: "top",
    overlayOpacity: 0.92,
  },
  fit: {
    category: "action",
    photoId: "photo-1772938520085-18",
    position: "center",
    overlayOpacity: 0.88,
  },
  contact: {
    category: "portrait",
    position: "bottom",
    overlayOpacity: 0.9,
  },
};

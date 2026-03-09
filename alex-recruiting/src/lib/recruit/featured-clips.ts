export interface FeaturedRecruitClip {
  rank: string;
  title: string;
  subtitle: string;
  sourceName: string;
  src: string;
  poster: string;
  durationLabel: string;
  analysisNotes: string;
}

export const FEATURED_RECRUIT_REEL = {
  src: "/recruit/featured-clips/jacob-impact-reel.mp4",
  poster: "/recruit/photos/film-action.jpg",
  title: "Coach-first impact reel",
};

export const FEATURED_RECRUIT_CLIPS: FeaturedRecruitClip[] = [
  {
    rank: "01",
    title: "Interior finish",
    subtitle: "Best first-frame clarity and trench finish.",
    sourceName: "IMG_0642.MOV",
    src: "/recruit/featured-clips/impact-1.mp4",
    poster: "/thumbnails/thumb_6e01770f3794.jpg",
    durationLabel: "11s",
    analysisNotes:
      "Strong center-frame positioning, clean leverage picture, and immediate coach readability.",
  },
  {
    rank: "02",
    title: "Leverage and reset",
    subtitle: "Best combination of body control and contact window.",
    sourceName: "IMG_0640.MOV",
    src: "/recruit/featured-clips/impact-2.mp4",
    poster: "/thumbnails/thumb_cbeccab94cb4.jpg",
    durationLabel: "13s",
    analysisNotes:
      "Good field contrast, easy player pickup, and a usable frame for both web and X cuts.",
  },
  {
    rank: "03",
    title: "Second-effort pursuit",
    subtitle: "Best chase-energy clip from the message batch.",
    sourceName: "IMG_0647.MOV",
    src: "/recruit/featured-clips/impact-3.mp4",
    poster: "/thumbnails/thumb_3487b801502e.jpg",
    durationLabel: "18s",
    analysisNotes:
      "Carries effort longer than the others and gives more room for coaches to track the rep.",
  },
  {
    rank: "04",
    title: "Quick strike rep",
    subtitle: "Shortest path from snap to usable recruiting moment.",
    sourceName: "IMG_0630.MOV",
    src: "/recruit/featured-clips/impact-4.mp4",
    poster: "/thumbnails/thumb_87f720400e22.jpg",
    durationLabel: "10s",
    analysisNotes:
      "Compact play length, clean thumbnail, and strong fit for short-form coach review.",
  },
];

export const FULL_FILM_LINKS = [
  {
    label: "Full highlight reel",
    href: "https://youtu.be/wkYGNZTN8Xc",
    description: "Longer compiled cut with broader season context.",
  },
  {
    label: "Additional film",
    href: "https://youtu.be/03w9hRlXTzU",
    description: "Secondary reel for coaches who want more reps after the impact cut.",
  },
];

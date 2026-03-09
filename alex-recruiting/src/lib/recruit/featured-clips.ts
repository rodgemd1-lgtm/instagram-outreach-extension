export interface FeaturedRecruitClip {
  rank: string;
  title: string;
  subtitle: string;
  sourceName: string;
  src: string;
  poster: string;
  durationLabel: string;
  moments: string[];
  analysisNotes: string;
}

export interface SupportingRecruitReel {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  poster: string;
  durationLabel: string;
  lens: string;
  analysisNotes: string;
}

export const FEATURED_RECRUIT_REEL = {
  src: "/recruit/featured-clips/jacob-impact-reel.mp4",
  poster: "/recruit/photos/hero-79.jpg",
  title: "Coach-first impact reel",
  subtitle:
    "A faster first watch built to help a coach find #79 quickly, evaluate the trench moments, and decide whether to keep going.",
};

export const FEATURED_RECRUIT_CLIPS: FeaturedRecruitClip[] = [
  {
    rank: "01",
    title: "Backfield disruption",
    subtitle: "Best first-step urgency from the new football batch.",
    sourceName: "IMG_4674.MOV",
    src: "/recruit/featured-clips/impact-1.mp4",
    poster: "/recruit/featured-clips/posters/impact-1.jpg",
    durationLabel: "11s",
    moments: ["Get-off", "Disruption", "Finish"],
    analysisNotes:
      "Easy to identify #79 quickly, clean frame before contact, and the rep shows why defensive-line upside is real.",
  },
  {
    rank: "02",
    title: "Finish through contact",
    subtitle: "Strongest chase-and-finish clip from the late-season batch.",
    sourceName: "IMG_4678.MOV",
    src: "/recruit/featured-clips/impact-2.mp4",
    poster: "/recruit/featured-clips/posters/impact-2.jpg",
    durationLabel: "14s",
    moments: ["Pursuit", "Range", "Finish"],
    analysisNotes:
      "Carries effort longer than most single-play clips and gives coaches time to see pursuit, contact, and finish.",
  },
  {
    rank: "03",
    title: "Interior reset",
    subtitle: "Most coach-readable trench rep for hand use and body control.",
    sourceName: "IMG_4682.MOV",
    src: "/recruit/featured-clips/impact-3.mp4",
    poster: "/recruit/featured-clips/posters/impact-3.jpg",
    durationLabel: "9s",
    moments: ["Hands", "Balance", "Reset"],
    analysisNotes:
      "Frame clarity is strong, the action stays centered, and the rep shows balance after first contact instead of drifting out of view.",
  },
  {
    rank: "04",
    title: "Pad level and finish",
    subtitle: "Best black-uniform rep for leverage and knock-back.",
    sourceName: "IMG_3895.MOV",
    src: "/recruit/featured-clips/impact-4.mp4",
    poster: "/recruit/featured-clips/posters/impact-4.jpg",
    durationLabel: "8s",
    moments: ["Pad Level", "Leverage", "Knock-Back"],
    analysisNotes:
      "The rep starts cleanly, shows body position immediately, and fits what line coaches want from a quick website clip.",
  },
  {
    rank: "05",
    title: "Hands first",
    subtitle: "Most balanced full-play view from the black-uniform set.",
    sourceName: "IMG_3902.MOV",
    src: "/recruit/featured-clips/impact-5.mp4",
    poster: "/recruit/featured-clips/posters/impact-5.jpg",
    durationLabel: "10s",
    moments: ["Identification", "Strike", "Finish"],
    analysisNotes:
      "Shows enough pre-snap context for coaches to find him and enough post-contact context to evaluate the finish.",
  },
  {
    rank: "06",
    title: "Violence to the whistle",
    subtitle: "Longest clean impact window from the new intake.",
    sourceName: "IMG_4728.MOV",
    src: "/recruit/featured-clips/impact-6.mp4",
    poster: "/recruit/featured-clips/posters/impact-6.jpg",
    durationLabel: "25s",
    moments: ["Motor", "Violence", "Whistle"],
    analysisNotes:
      "Useful as the deeper look after the main reel because it gives a fuller picture of effort, range, and how the rep ends.",
  },
];

export const SUPPORTING_RECRUIT_REELS: SupportingRecruitReel[] = [
  {
    id: "social-cut",
    title: "CapCut-style football cut",
    subtitle:
      "A vertical football edit rebuilt to live cleanly inside a widescreen recruit page.",
    src: "/recruit/supporting-reels/social-cut.mp4",
    poster: "/recruit/supporting-reels/social-cut.jpg",
    durationLabel: "18s",
    lens: "Tempo",
    analysisNotes:
      "Fast, high-energy pacing works well after the main coach reel when you want a second pass with more tempo.",
  },
  {
    id: "training-cut",
    title: "Power-development reel",
    subtitle:
      "Weight-room footage that supports the size, force-production, and body-transformation story.",
    src: "/recruit/supporting-reels/training-cut.mp4",
    poster: "/recruit/supporting-reels/training-cut.jpg",
    durationLabel: "16s",
    lens: "Development",
    analysisNotes:
      "Shows transferable force production and reinforces that the development habits are already in place before college staff input.",
  },
  {
    id: "snowboard-cut",
    title: "Balance and body-control reel",
    subtitle: "Snowboarding footage used to show movement skill outside football.",
    src: "/recruit/supporting-reels/snowboard-cut.mp4",
    poster: "/recruit/supporting-reels/snowboard-cut.jpg",
    durationLabel: "10s",
    lens: "Athlete",
    analysisNotes:
      "Useful for the well-rounded-athlete story because it shows coordination, balance, and athletic confidence outside the field.",
  },
];

export const FULL_FILM_LINKS = [
  {
    label: "Full YouTube highlight reel",
    href: "https://youtu.be/wkYGNZTN8Xc",
    description: "Longer compiled cut for coaches who want more total rep volume after the impact reel.",
  },
  {
    label: "Additional film library",
    href: "https://youtu.be/03w9hRlXTzU",
    description: "Secondary reel for staff who want a broader context pass before reaching out.",
  },
];

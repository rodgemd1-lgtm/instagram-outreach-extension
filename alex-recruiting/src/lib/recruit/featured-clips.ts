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
  src: "/recruit/featured-clips/jacob-capcut-highlight.mp4",
  poster: "/recruit/featured-clips/posters/jacob-capcut-highlight.jpg",
  title: "Highlight Reel",
  subtitle:
    "Jacob's 30-second highlight cut — every rep, every snap.",
};

export const LEGACY_FEATURED_CLIPS: FeaturedRecruitClip[] = [
  {
    rank: "L1",
    title: "Interior finish",
    subtitle: "Original site clip with the cleanest first-frame read.",
    sourceName: "IMG_0642.MOV",
    src: "/recruit/legacy-clips/legacy-1.mp4",
    poster: "/recruit/legacy-clips/posters/legacy-1.jpg",
    durationLabel: "11s",
    moments: ["Leverage", "Contact", "Finish"],
    analysisNotes:
      "This was one of the strongest earlier clips because coaches can find Jacob immediately and judge the rep without waiting for the angle to settle.",
  },
  {
    rank: "L2",
    title: "Leverage and reset",
    subtitle: "Earlier film set with better body-control visibility.",
    sourceName: "IMG_0640.MOV",
    src: "/recruit/legacy-clips/legacy-2.mp4",
    poster: "/recruit/legacy-clips/posters/legacy-2.jpg",
    durationLabel: "13s",
    moments: ["Hands", "Reset", "Anchor"],
    analysisNotes:
      "The old site kept this because the contact window stays readable and the trench mechanics show up clearly on replay.",
  },
  {
    rank: "L3",
    title: "Second-effort pursuit",
    subtitle: "Legacy chase clip with more rep development.",
    sourceName: "IMG_0647.MOV",
    src: "/recruit/legacy-clips/legacy-3.mp4",
    poster: "/recruit/legacy-clips/posters/legacy-3.jpg",
    durationLabel: "18s",
    moments: ["Pursuit", "Motor", "Finish"],
    analysisNotes:
      "This clip was worth restoring because it gives coaches a longer window to evaluate effort and what happens after the initial collision.",
  },
  {
    rank: "L4",
    title: "Quick strike rep",
    subtitle: "Compact legacy clip that gets to the point fast.",
    sourceName: "IMG_0630.MOV",
    src: "/recruit/legacy-clips/legacy-4.mp4",
    poster: "/recruit/legacy-clips/posters/legacy-4.jpg",
    durationLabel: "10s",
    moments: ["Strike", "Pad Level", "Finish"],
    analysisNotes:
      "Useful because the snap-to-contact path is short and the rep works well for a quick coach scan on phone or desktop.",
  },
];

export const CURRENT_FEATURED_CLIPS: FeaturedRecruitClip[] = [
  {
    rank: "01",
    title: "Backfield disruption",
    subtitle: "Best first-step urgency from the newer football batch.",
    sourceName: "IMG_4674.MOV",
    src: "/recruit/featured-clips/impact-1.mp4",
    poster: "/recruit/featured-clips/posters/impact-1.jpg",
    durationLabel: "11s",
    moments: ["Get-off", "Disruption", "Finish"],
    analysisNotes:
      "Still worth featuring because the get-off is easy to spot and the rep sells defensive-line upside immediately.",
  },
  {
    rank: "02",
    title: "Finish through contact",
    subtitle: "Chase-and-finish rep from the later batch.",
    sourceName: "IMG_4678.MOV",
    src: "/recruit/featured-clips/impact-2.mp4",
    poster: "/recruit/featured-clips/posters/impact-2.jpg",
    durationLabel: "14s",
    moments: ["Pursuit", "Range", "Finish"],
    analysisNotes:
      "Carries effort longer than most one-play clips and gives coaches a cleaner pursuit picture after first contact.",
  },
  {
    rank: "03",
    title: "Interior reset",
    subtitle: "Best newer rep for hand use and body control.",
    sourceName: "IMG_4682.MOV",
    src: "/recruit/featured-clips/impact-3.mp4",
    poster: "/recruit/featured-clips/posters/impact-3.jpg",
    durationLabel: "9s",
    moments: ["Hands", "Balance", "Reset"],
    analysisNotes:
      "Useful because the action stays centered and the rep shows Jacob staying under control after the first strike.",
  },
  {
    rank: "04",
    title: "Pad level and finish",
    subtitle: "Black-uniform rep for leverage and knock-back.",
    sourceName: "IMG_3895.MOV",
    src: "/recruit/featured-clips/impact-4.mp4",
    poster: "/recruit/featured-clips/posters/impact-4.jpg",
    durationLabel: "8s",
    moments: ["Pad Level", "Leverage", "Knock-Back"],
    analysisNotes:
      "The body position shows up early, which makes it valuable even as a short website clip.",
  },
  {
    rank: "05",
    title: "Hands first",
    subtitle: "Balanced newer view with enough pre-snap context.",
    sourceName: "IMG_3902.MOV",
    src: "/recruit/featured-clips/impact-5.mp4",
    poster: "/recruit/featured-clips/posters/impact-5.jpg",
    durationLabel: "10s",
    moments: ["Identification", "Strike", "Finish"],
    analysisNotes:
      "Works well because a coach can find Jacob before the snap and still see how the rep finishes.",
  },
  {
    rank: "06",
    title: "Violence to the whistle",
    subtitle: "Longer clean impact window from the newer intake.",
    sourceName: "IMG_4728.MOV",
    src: "/recruit/featured-clips/impact-6.mp4",
    poster: "/recruit/featured-clips/posters/impact-6.jpg",
    durationLabel: "25s",
    moments: ["Motor", "Violence", "Whistle"],
    analysisNotes:
      "Useful deeper in the stack because it shows a fuller effort profile instead of only a fast first contact moment.",
  },
];

export const SUPPORTING_RECRUIT_REELS: SupportingRecruitReel[] = [
  {
    id: "coach-reel",
    title: "Coach-first trench reel",
    subtitle:
      "The rebuilt reel from this pass, now with a centered intro and outro that stay inside the video frame.",
    src: "/recruit/featured-clips/jacob-impact-reel.mp4",
    poster: "/recruit/featured-clips/posters/jacob-impact-reel.jpg",
    durationLabel: "43s",
    lens: "Evaluation",
    analysisNotes:
      "Use this when you want the strongest trench moments stitched together without the faster social pacing of the highlight reel.",
  },
  {
    id: "legacy-reel",
    title: "Legacy trench reel",
    subtitle:
      "Restored from the earlier site clips for coaches who preferred the old featured-film set.",
    src: "/recruit/featured-clips/jacob-legacy-trench-reel.mp4",
    poster: "/recruit/featured-clips/posters/jacob-legacy-trench-reel.jpg",
    durationLabel: "1m 47s",
    lens: "Legacy",
    analysisNotes:
      "This brings the prior featured film back into the page instead of burying it behind old commits or outside links.",
  },
  {
    id: "extended-highlight",
    title: "Extended highlight reel",
    subtitle:
      "Longer compiled site reel kept available for anyone who wants a bigger sample before reaching out.",
    src: "/recruit/media-lab/reels/jacob-highlight-reel.mp4",
    poster: "/recruit/featured-clips/posters/jacob-extended-highlight.jpg",
    durationLabel: "1m 41s",
    lens: "Archive",
    analysisNotes:
      "This is the broader film-library pass for coaches who want more than the short stacks and want to compare eras.",
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
    title: "Winter athlete reel",
    subtitle:
      "Freshly uploaded snowboard footage showing edge control, confidence at speed, and balance outside football.",
    src: "/recruit/winter/reels/snowboard-run-1.mp4",
    poster: "/recruit/winter/posters/snowboard-run-1.jpg",
    durationLabel: "15s",
    lens: "Athlete",
    analysisNotes:
      "Useful for the well-rounded-athlete story because it shows confidence and body control in a completely different movement context using the new uploaded winter footage.",
  },
];

/* YouTube links removed — replaced by on-site scrollable film bar */

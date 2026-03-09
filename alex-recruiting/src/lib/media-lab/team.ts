import type { MediaLabCapability, MediaLabTeamMember } from "./types";

export const SUSAN_MEDIA_TEAM: MediaLabTeamMember[] = [
  {
    id: "susan",
    name: "Susan",
    role: "Orchestrator and approval gate",
    background: "Owns final quality control, family context, and execution sequencing across the recruiting stack.",
    owns: [
      "Approval workflow",
      "Asset priority decisions",
      "Website narrative alignment",
      "Release cadence",
    ],
  },
  {
    id: "marcus",
    name: "Marcus",
    role: "UX systems and interaction lead",
    background: "Shapes the product shell, interaction quality, motion restraint, and task flow across the recruiting app.",
    owns: [
      "Shell architecture",
      "Interaction hierarchy",
      "Motion judgment",
      "Product usability",
    ],
  },
  {
    id: "prism",
    name: "Prism",
    role: "Brand and visual identity director",
    background: "Owns the visual code: palette tension, typography emphasis, page rhythm, and what the app should feel like at first glance.",
    owns: [
      "Visual identity",
      "Color system",
      "Tone consistency",
      "Distinctive polish",
    ],
  },
  {
    id: "lens",
    name: "Lens",
    role: "Accessibility and clarity lead",
    background: "Protects contrast, motion restraint, hierarchy clarity, and reduced-friction use across desktop and mobile.",
    owns: [
      "Accessibility review",
      "Contrast control",
      "Reduced-motion logic",
      "Inclusive usability",
    ],
  },
  {
    id: "dashboard",
    name: "Recruiting Dashboard Studio",
    role: "Operating-console architect",
    background: "Designs the board state, next-action hierarchy, and recruiting workflow logic that make the dashboard useful every day.",
    owns: [
      "Next-action design",
      "Board states",
      "Signal hierarchy",
      "Console clarity",
    ],
  },
  {
    id: "trey",
    name: "Trey Jackson",
    role: "Post analyzer and X editorial lead",
    background: "Former college football social lead focused on recruit-facing storytelling and X-ready packaging.",
    owns: [
      "Post scoring",
      "Caption formulas",
      "Hashtag stack",
      "Queue creation",
    ],
  },
  {
    id: "jordan",
    name: "Jordan Reeves",
    role: "Image and video analyzer",
    background: "Hudl-style film producer with recruiting-specific standards for thumbnails, composition, trims, and reel structure.",
    owns: [
      "Photo ranking",
      "Clip ranking",
      "Highlight trims",
      "Reel package assembly",
    ],
  },
  {
    id: "sophie",
    name: "Sophie Chen",
    role: "Scoring and selection intelligence",
    background: "Analytics lead translating file quality, recruiting value, and platform fit into ranked selections.",
    owns: [
      "Scoring weights",
      "Selection logic",
      "Confidence notes",
      "Coverage balance",
    ],
  },
  {
    id: "devin",
    name: "Devin",
    role: "Technical delivery",
    background: "Builds the pipelines, local persistence, FFmpeg flows, and page/API surfaces that turn analysis into usable output.",
    owns: [
      "Pipeline code",
      "FFmpeg integration",
      "CapCut workflow package",
      "Persistence and QA",
    ],
  },
];

export const SUSAN_INNOVATION_STUDIO: MediaLabTeamMember[] = [
  {
    id: "innovation",
    name: "Susan Innovation Studio",
    role: "Future-back orchestration",
    background: "Runs long-range strategy, option design, and product bets so the recruiting system compounds over years instead of reacting week to week.",
    owns: [
      "Future-back framing",
      "Strategic architecture",
      "Bet sequencing",
      "Decision quality",
    ],
  },
  {
    id: "strategos",
    name: "Strategos Cell",
    role: "Future-back and option portfolio lead",
    background: "Uses a Strategos-style lens to define the 2031 destination first, then reverse-engineer the capability path from today back from that future.",
    owns: [
      "2031 vision",
      "Option portfolio",
      "Reverse milestones",
      "Strategic choices",
    ],
  },
  {
    id: "nova",
    name: "Nova",
    role: "AI systems and automation architect",
    background: "Designs the next generation of agentic workflows, copilots, memory layers, and AI operations that make the recruiting platform more autonomous over time.",
    owns: [
      "Embedded operator roadmap",
      "AI automation",
      "Decision copilots",
      "Memory systems",
    ],
  },
  {
    id: "atlas",
    name: "Atlas",
    role: "Recruiting ecosystem strategist",
    background: "Maps how coaches, camps, media, families, and recruiting services fit together so the product grows from a content tool into a recruiting operating system.",
    owns: [
      "Coach network strategy",
      "Market map",
      "Exposure loops",
      "Ecosystem leverage",
    ],
  },
  {
    id: "forge",
    name: "Forge",
    role: "Operating model and platform economics",
    background: "Translates product ambition into durable systems, workflows, and unit-economics logic for a long-horizon recruiting company.",
    owns: [
      "Operating model",
      "Platform economics",
      "System durability",
      "Scale readiness",
    ],
  },
];

export const SUSAN_FULL_STUDIO: MediaLabTeamMember[] = [
  ...SUSAN_MEDIA_TEAM,
  ...SUSAN_INNOVATION_STUDIO,
];

export const MEDIA_LAB_CAPABILITIES: MediaLabCapability[] = [
  {
    id: "post_analyzer",
    name: "Post Analyzer",
    owner: "Trey Jackson",
    summary: "Scores X drafts for coach relevance, authenticity, specificity, and platform fit.",
    tools: ["Posting rhythm", "Content psychology", "Hashtag stack", "Post store"],
  },
  {
    id: "image_analyzer",
    name: "Image Analyzer",
    owner: "Jordan Reeves",
    summary: "Ranks photos using technical quality, lighting/composition heuristics, recruiting value, and X crop safety.",
    tools: ["Sharp", "Photo store", "Image optimizer"],
  },
  {
    id: "video_analyzer",
    name: "Video Analyzer",
    owner: "Jordan Reeves",
    summary: "Ranks clips using technical quality, thumbnail clarity, duration fitness, recruiting value, and trim readiness.",
    tools: ["FFprobe", "FFmpeg thumbnails", "Video store"],
  },
  {
    id: "highlight_reel_builder",
    name: "Highlight Reel Builder",
    owner: "Devin + Jordan",
    summary: "Creates a CapCut-friendly shot list plus a rendered FFmpeg highlight reel from selected clips.",
    tools: ["FFmpeg", "CSV shot list", "Manifest JSON"],
  },
  {
    id: "x_draft_generator",
    name: "X Draft Generator",
    owner: "Trey + Susan",
    summary: "Turns selected media into coach-facing X drafts aligned to Jacob's existing tone and cadence.",
    tools: ["Posting rhythm", "Hashtags", "Local post queue"],
  },
];

export const MEDIA_LAB_RESEARCH_NOTES = [
  {
    title: "NCSA football recruiting video guide",
    url: "https://www.ncsasports.org/football/recruiting-video",
    takeaway:
      "Lead with full-speed padded game film, identify the player before the snap, open with the best plays, and keep the core recruiting reel concise.",
  },
  {
    title: "NCSA getting recruited guide",
    url: "https://www.ncsasports.org/football/how-to-get-recruited",
    takeaway:
      "Five-star style momentum comes from verified measurables, updated film, camp exposure, and consistent coach-facing distribution, not one viral post.",
  },
  {
    title: "ARRI lighting handbook",
    url: "https://www.arri.com/en/learn-help/lighting/lighting-handbook",
    takeaway:
      "Prioritize clean subject separation, controlled highlights, and readable detail over aggressive grading or stylized effects.",
  },
  {
    title: "Adobe composition guidance",
    url: "https://www.adobe.com/creativecloud/photography/technique/rule-of-thirds.html",
    takeaway:
      "Strong recruit visuals need immediate subject clarity and crops that still hold up after reframing for platform-safe compositions.",
  },
  {
    title: "Adobe natural-light guidance",
    url: "https://www.adobe.com/creativecloud/photography/technique/golden-hour",
    takeaway:
      "Soft directional light produces cleaner skin, jersey, and helmet detail, which translates into stronger social thumbnails and hero photos.",
  },
  {
    title: "CapCut workflow reality",
    url: "https://www.capcut.com/",
    takeaway:
      "CapCut is suitable as a finishing editor, but it does not expose a reliable third-party project-import workflow; use curated clip bins plus a shot-list package.",
  },
  {
    title: "X media upload workflow",
    url: "https://developer.x.com/en/docs/twitter-api/v1/media/upload-media/uploading-media/chunked-media-upload",
    takeaway:
      "Real image/video publishing to X needs media upload before tweet creation; images can use simple upload, but video requires INIT/APPEND/FINALIZE chunking.",
  },
];

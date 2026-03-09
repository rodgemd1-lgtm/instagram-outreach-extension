export type MediaCapabilityId =
  | "post_analyzer"
  | "image_analyzer"
  | "video_analyzer"
  | "highlight_reel_builder"
  | "x_draft_generator";

export interface MediaLabCapability {
  id: MediaCapabilityId;
  name: string;
  owner: string;
  summary: string;
  tools: string[];
}

export interface MediaLabTeamMember {
  id: string;
  name: string;
  role: string;
  background: string;
  owns: string[];
}

export interface ImageAnalysis {
  id: string;
  name: string;
  category: string;
  source: string;
  filePath: string;
  width: number;
  height: number;
  score: number;
  technicalScore: number;
  lightingScore: number;
  compositionScore: number;
  recruitingScore: number;
  xFitScore: number;
  tags: string[];
  notes: string[];
  recommendedUse: "hero" | "x_post" | "training_update" | "profile" | "recruit_page";
  optimizedPath: string | null;
}

export interface VideoTrim {
  startTime: number;
  endTime: number;
  clipDuration: number;
}

export interface VideoAnalysis {
  id: string;
  name: string;
  category: string;
  filePath: string;
  thumbnailUrl: string | null;
  score: number;
  technicalScore: number;
  frameScore: number;
  actionScore: number;
  recruitingScore: number;
  xFitScore: number;
  tags: string[];
  notes: string[];
  recommendedUse: "highlight_reel" | "x_clip" | "film_room" | "training_clip";
  trim: VideoTrim;
}

export interface DraftAnalysis {
  content: string;
  pillar: "performance" | "work_ethic" | "character";
  formula: string;
  mechanism: string;
  hashtags: string[];
  mediaUrl: string | null;
  mediaType: "photo" | "video";
  bestTime: string;
  scheduledFor: string;
  score: number;
  strengths: string[];
  risks: string[];
}

export interface ReelPackage {
  renderedReelPath: string | null;
  capCutShotListPath: string;
  manifestPath: string;
  selectedClipCount: number;
  notes: string[];
}

export interface MediaLabSnapshot {
  generatedAt: string;
  sources: string[];
  researchNotes: Array<{ title: string; url: string; takeaway: string }>;
  team: MediaLabTeamMember[];
  capabilities: MediaLabCapability[];
  topPhotos: ImageAnalysis[];
  topVideos: VideoAnalysis[];
  drafts: DraftAnalysis[];
  reelPackage: ReelPackage | null;
}

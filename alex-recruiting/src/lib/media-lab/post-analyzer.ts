import { getHashtagsForPost } from "@/lib/data/hashtags";
import { POST_FORMULAS, spotlightShiftCheck } from "@/lib/data/content-psychology";
import { jacobProfile } from "@/lib/data/jacob-profile";
import type { ImageAnalysis, VideoAnalysis, DraftAnalysis } from "./types";

const BANNED_PHRASES = [
  "DMs are open",
  "check out my highlights",
  "who's watching",
  "built different",
  "rise and grind",
  "come get me",
];

function describePhoto(photo: ImageAnalysis | undefined): {
  scene: string;
  coachingFocus: string;
  progressLine: string;
} {
  if (!photo) {
    return {
      scene: "work before the next stack of reps",
      coachingFocus: "pad level and first-step efficiency",
      progressLine: "still turning training into cleaner football movement",
    };
  }

  if (photo.tags.includes("game-finish") || photo.tags.includes("on-field-finish")) {
    return {
      scene: "a finish rep that shows up clean on film",
      coachingFocus: "finishing through contact and staying square through the rep",
      progressLine: "the goal is to make violent finishes look routine",
    };
  }

  if (photo.category === "training") {
    return {
      scene: "early training work before school",
      coachingFocus: "footwork, bend, and body control for a bigger frame",
      progressLine: "the goal is turning strength gains into cleaner football movement",
    };
  }

  return {
    scene: "Friday-night work with our group",
    coachingFocus: "hands, leverage, and finish",
    progressLine: "the standard is cleaner technique with the same effort",
  };
}

function describeVideo(video: VideoAnalysis | undefined): {
  rep: string;
  coachQuestion: string;
  growthPoint: string;
} {
  if (!video) {
    return {
      rep: "one of our recent film-room reps",
      coachQuestion: "what gets corrected first for a young lineman here, feet or hands?",
      growthPoint: "I still want the rep to look cleaner after first contact",
    };
  }

  if (video.tags.includes("defensive-finish")) {
    return {
      rep: "a defensive finish rep where the get-off actually turned into disruption",
      coachQuestion: "after the get-off, what matters more to you on a rep like this, winning with hands or staying clean through the hips?",
      growthPoint: "the next step is making the close and finish happen even faster",
    };
  }

  if (video.tags.includes("impact-rep")) {
    return {
      rep: "an impact rep that shows what happens when the finish stays violent",
      coachQuestion: "what tells you fastest that a rep like this is technically sound and not just effort?",
      growthPoint: "I still want more consistency rep to rep",
    };
  }

  if (video.category === "micro_clip") {
    return {
      rep: "a short rep that gets to the point fast",
      coachQuestion: "on a clip this short, what detail do you look at first to judge the rep?",
      growthPoint: "I want each rep to tell the full story even in a small window",
    };
  }

  return {
    rep: "a game rep from our recent cutup",
    coachQuestion: "what detail would you coach first off this rep?",
    growthPoint: "I want the rep to look cleaner after first contact",
  };
}

function nextPostingSlots(count: number): Array<{ bestTime: string; scheduledFor: string }> {
  const schedule = [
    { weekday: 1, label: "Monday 7:30 PM CT" },
    { weekday: 3, label: "Wednesday 7:30 PM CT" },
    { weekday: 5, label: "Friday 7:30 PM CT" },
  ];
  const slots: Array<{ bestTime: string; scheduledFor: string }> = [];
  const current = new Date();
  current.setHours(19, 30, 0, 0);

  while (slots.length < count) {
    current.setDate(current.getDate() + 1);
    const match = schedule.find((entry) => entry.weekday === current.getDay());
    if (!match) continue;
    const scheduled = new Date(current);
    slots.push({
      bestTime: match.label,
      scheduledFor: scheduled.toISOString(),
    });
  }

  return slots;
}

function mediaUrlFromPhoto(photo: ImageAnalysis): string {
  return photo.optimizedPath ?? `/api/photos/${photo.id}/file`;
}

function mediaUrlFromVideo(video: VideoAnalysis): string {
  return `/api/videos/serve?path=${encodeURIComponent(video.filePath)}`;
}

function scoreDraft(content: string, hashtags: string[]): { score: number; strengths: string[]; risks: string[] } {
  let score = 72;
  const strengths: string[] = [];
  const risks: string[] = [];
  const lower = content.toLowerCase();

  const spotlight = spotlightShiftCheck(content);
  if (spotlight.passes) {
    score += 12;
    strengths.push("Passes the spotlight-shift check.");
  } else {
    score -= 10;
    risks.push(spotlight.reason);
  }

  if (content.length <= 240) {
    score += 8;
    strengths.push("Fits X cleanly without pushing character limits.");
  } else {
    score -= 12;
    risks.push("Too long for a clean X post.");
  }

  if (hashtags.length >= 3 && hashtags.length <= 5) {
    score += 6;
    strengths.push("Uses a disciplined recruiting hashtag stack.");
  } else {
    score -= 4;
    risks.push("Hashtag stack is outside the ideal 3-5 range.");
  }

  if (/\b(we|our)\b/i.test(content)) {
    score += 6;
    strengths.push("Uses team-first language.");
  }

  if (/\bcoach\b|\bfilm\b|\btechnique\b|\brep\b|\bhands\b|\bhips\b/i.test(content)) {
    score += 6;
    strengths.push("Speaks to coach-relevant detail instead of generic hype.");
  }

  const banned = BANNED_PHRASES.filter((phrase) => lower.includes(phrase.toLowerCase()));
  if (banned.length > 0) {
    score -= banned.length * 10;
    risks.push(`Contains banned recruiting language: ${banned.join(", ")}`);
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    strengths,
    risks,
  };
}

export function buildXDrafts(
  topPhotos: ImageAnalysis[],
  topVideos: VideoAnalysis[]
): DraftAnalysis[] {
  const slots = nextPostingSlots(12);
  const trainingPhotos = topPhotos.filter((photo) => photo.category === "training").slice(0, 4);
  const actionPhotos = topPhotos.filter((photo) => photo.category === "action").slice(0, 4);
  const actionVideos = topVideos.filter((video) => video.category === "clip" || video.category === "micro_clip").slice(0, 4);
  const training1 = describePhoto(trainingPhotos[0]);
  const training2 = describePhoto(trainingPhotos[1]);
  const training3 = describePhoto(trainingPhotos[2]);
  const training4 = describePhoto(trainingPhotos[3]);
  const action1 = describePhoto(actionPhotos[0]);
  const action3 = describePhoto(actionPhotos[2]);
  const action4 = describePhoto(actionPhotos[3]);
  const video1 = describeVideo(actionVideos[0]);
  const video2 = describeVideo(actionVideos[1]);
  const video3 = describeVideo(actionVideos[2]);
  const video4 = describeVideo(actionVideos[3]);

  const rawDrafts = [
    {
      pillar: "work_ethic" as const,
      formula: POST_FORMULAS[1].name,
      mechanism: POST_FORMULAS[1].mechanisms.join(", "),
      content:
        `${training1.scene}. Coach-led details like ${training1.coachingFocus} are what turn a big frame into a better player.\n\nFor OL coaches: when you are teaching young linemen, what gets corrected first in this kind of drill, eyes or hips?`,
      mediaUrl: trainingPhotos[0] ? mediaUrlFromPhoto(trainingPhotos[0]) : null,
      mediaType: "photo" as const,
    },
    {
      pillar: "performance" as const,
      formula: POST_FORMULAS[0].name,
      mechanism: POST_FORMULAS[0].mechanisms.join(", "),
      content:
        `Friday-night cutup. ${video1.rep} looks like the standard our coaches have been pushing from film room to practice.\n\nStill chasing cleaner hands every snap, but the finish showed up here.`,
      mediaUrl: actionVideos[0] ? mediaUrlFromVideo(actionVideos[0]) : null,
      mediaType: "video" as const,
    },
    {
      pillar: "character" as const,
      formula: POST_FORMULAS[3].name,
      mechanism: POST_FORMULAS[3].mechanisms.join(", "),
      content:
        `State-champ habits are usually quiet. ${action1.scene}, sideline communication, then the next rep.\n\nThat part of football matters to me just as much as the clip everybody sees.`,
      mediaUrl: actionPhotos[0] ? mediaUrlFromPhoto(actionPhotos[0]) : null,
      mediaType: "photo" as const,
    },
    {
      pillar: "work_ethic" as const,
      formula: POST_FORMULAS[2].name,
      mechanism: POST_FORMULAS[2].mechanisms.join(", "),
      content:
        `Honest progress report: stronger than last year, moving better than last year, still nowhere near finished.\n\nThe goal right now is ${training2.progressLine}. More balance. Better bend. Better finish.`,
      mediaUrl: trainingPhotos[1] ? mediaUrlFromPhoto(trainingPhotos[1]) : null,
      mediaType: "photo" as const,
    },
    {
      pillar: "performance" as const,
      formula: POST_FORMULAS[4].name,
      mechanism: POST_FORMULAS[4].mechanisms.join(", "),
      content:
        `Setting a film goal for this stretch of clips: win the rep cleaner and finish stronger at the point of contact.\n\n${video2.growthPoint}. Documenting it here so I can come back to it after the next game block.`,
      mediaUrl: actionVideos[1] ? mediaUrlFromVideo(actionVideos[1]) : null,
      mediaType: "video" as const,
    },
    {
      pillar: "work_ethic" as const,
      formula: POST_FORMULAS[0].name,
      mechanism: POST_FORMULAS[0].mechanisms.join(", "),
      content:
        `${training3.scene} is easier to skip when nobody is watching. That is why our group leans on each other for those reps.\n\nA lot of credit goes to the coaches who keep making big guys move like football players instead of just lifters.`,
      mediaUrl: trainingPhotos[2] ? mediaUrlFromPhoto(trainingPhotos[2]) : null,
      mediaType: "photo" as const,
    },
    {
      pillar: "performance" as const,
      formula: POST_FORMULAS[1].name,
      mechanism: POST_FORMULAS[1].mechanisms.join(", "),
      content:
        `DL question for coaches and trainers: ${video3.coachQuestion}\n\nAlways trying to learn what separates disruption from almost-disruption.`,
      mediaUrl: actionVideos[2] ? mediaUrlFromVideo(actionVideos[2]) : null,
      mediaType: "video" as const,
    },
    {
      pillar: "character" as const,
      formula: POST_FORMULAS[0].name,
      mechanism: POST_FORMULAS[0].mechanisms.join(", "),
      content:
        "The best part of playing both ways is learning how much the whole group matters. Our linebackers, our backs, our line, our sideline energy.\n\nFootball gets better when everybody does their job on the same rep.",
      mediaUrl: actionPhotos[1] ? mediaUrlFromPhoto(actionPhotos[1]) : null,
      mediaType: "photo" as const,
    },
    {
      pillar: "work_ethic" as const,
      formula: POST_FORMULAS[3].name,
      mechanism: POST_FORMULAS[3].mechanisms.join(", "),
      content:
        `Weight room, then film, then back to class. ${training4.scene}. Quiet day, good work.`,
      mediaUrl: trainingPhotos[3] ? mediaUrlFromPhoto(trainingPhotos[3]) : null,
      mediaType: "photo" as const,
    },
    {
      pillar: "performance" as const,
      formula: POST_FORMULAS[2].name,
      mechanism: POST_FORMULAS[2].mechanisms.join(", "),
      content:
        `Where I have improved most on film: finishing the rep instead of just getting in position.\n\nWhere I still need to grow: ${video4.growthPoint.replace(/^I /, "").toLowerCase()}.\n\nThat is the standard for the next round of clips.`,
      mediaUrl: actionVideos[3] ? mediaUrlFromVideo(actionVideos[3]) : null,
      mediaType: "video" as const,
    },
    {
      pillar: "character" as const,
      formula: POST_FORMULAS[4].name,
      mechanism: POST_FORMULAS[4].mechanisms.join(", "),
      content:
        `${jacobProfile.school} taught me early that big goals only matter if the daily work matches them. Keeping the loop open this offseason: stronger habits, cleaner film, better teammate.\n\n${action3.progressLine}. I will report back with the next stack of reps.`,
      mediaUrl: actionPhotos[2] ? mediaUrlFromPhoto(actionPhotos[2]) : null,
      mediaType: "photo" as const,
    },
    {
      pillar: "performance" as const,
      formula: POST_FORMULAS[0].name,
      mechanism: POST_FORMULAS[0].mechanisms.join(", "),
      content:
        `A lot of the best clips start before the snap with communication. Our front and our line have worked hard on that piece.\n\n${action4.coachingFocus} is what shows up on video, but the setup is usually what makes the rep work.`,
      mediaUrl: actionPhotos[3] ? mediaUrlFromPhoto(actionPhotos[3]) : null,
      mediaType: "photo" as const,
    },
  ];

  return rawDrafts.map((draft, index) => {
    const hashtags = getHashtagsForPost(draft.pillar);
    const analysis = scoreDraft(draft.content, hashtags);

    return {
      ...draft,
      hashtags,
      bestTime: slots[index]?.bestTime ?? "Wednesday 7:30 PM CT",
      scheduledFor: slots[index]?.scheduledFor ?? new Date().toISOString(),
      score: analysis.score,
      strengths: analysis.strengths,
      risks: analysis.risks,
    };
  });
}

import type { HashtagCategory } from "../types";

export const hashtagStack: HashtagCategory[] = [
  {
    category: "Core Recruiting",
    hashtags: ["#2028Recruit", "#FootballRecruiting", "#CFBRecruiting", "#CollegeFootballRecruiting"],
    priority: "every_post",
    notes: "Searched by coaches and recruiting analysts daily",
  },
  {
    category: "Position-Specific",
    hashtags: ["#OL", "#OffensiveLine", "#OTRecruiting", "#OGRecruiting", "#BigManOnCampus"],
    priority: "film_training",
    notes: "Position coaches search these; OL-specific hashtags stand out",
  },
  {
    category: "National Football",
    hashtags: ["#CollegeFootball", "#CFB", "#NCAAFB", "#FootballTwitter"],
    priority: "broad",
    notes: "Increases general visibility; rotate 1-2 per post",
  },
  {
    category: "Division-Specific",
    hashtags: ["#BigTenFootball", "#B1G", "#MACFootball", "#FCSFootball", "#D2Football"],
    priority: "school_targeted",
    notes: "Use the division hashtag of the school you're targeting",
  },
  {
    category: "Training/Work Ethic",
    hashtags: ["#PutInTheWork", "#OffSeason", "#Grind", "#GetAfterIt", "#FootballTraining"],
    priority: "training",
    notes: "Shows work ethic; coaches see these in training content feeds",
  },
  {
    category: "Wisconsin-Local",
    hashtags: ["#WisconsinFootball", "#WIHSFootball", "#Pewaukee", "#WiscHSFB"],
    priority: "local",
    notes: "Local discovery; Wisconsin-area coaches and media search these",
  },
  {
    category: "IMG/NCSA",
    hashtags: ["#IMGAcademy", "#NCSARecruiting", "#GetRecruited", "#BeRecruited"],
    priority: "camp_event",
    notes: "Tags both organizations; increases organic reach",
  },
  {
    category: "Specific Programs",
    hashtags: ["#OnWisconsin", "#MarchingOn", "#RiseAndGrind"],
    priority: "targeted",
    notes: "Research each target school's hashtag; use when posting about interest",
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getHashtagsForPost(pillar: string, targetSchool?: string): string[] {
  const tags: string[] = [];

  // Always include 2 core recruiting tags
  const core = hashtagStack.find((h) => h.category === "Core Recruiting");
  if (core) tags.push(core.hashtags[0], core.hashtags[1]);

  // Add position tag for film/training
  if (pillar === "performance" || pillar === "work_ethic") {
    const position = hashtagStack.find((h) => h.category === "Position-Specific");
    if (position) tags.push(position.hashtags[0]);
  }

  // Add training tag for work ethic posts
  if (pillar === "work_ethic") {
    const training = hashtagStack.find((h) => h.category === "Training/Work Ethic");
    if (training) tags.push(training.hashtags[0]);
  }

  // Always include 1 local tag
  const local = hashtagStack.find((h) => h.category === "Wisconsin-Local");
  if (local) tags.push(local.hashtags[0]);

  return tags.slice(0, 5); // Max 5 hashtags per post
}

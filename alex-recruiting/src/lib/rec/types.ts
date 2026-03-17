export type TeamMemberId = "devin" | "marcus" | "nina" | "trey" | "jordan" | "sophie" | "casey";

export interface TeamMember {
  id: TeamMemberId;
  name: string;
  title: string;
  specialty: string;
  background: string;
  owns: string[];
  color: string;
  iconInitials: string;
}

export interface NCSALead {
  id: string;
  coachName: string;
  schoolName: string;
  division: string;
  conference: string;
  source: "profile_view" | "camp_invite" | "message" | "manual";
  sourceDetail: string;
  detectedAt: string;
  xHandle: string | null;
  outreachStatus: "new" | "researched" | "followed" | "dm_drafted" | "dm_sent" | "responded";
  assignedTo: TeamMemberId;
  notes: string;
}

export interface RecTask {
  id: string;
  assignedTo: TeamMemberId;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "blocked";
  priority: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
  completedAt: string | null;
  output: string | null;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "devin",
    name: "Devin",
    title: "Technical Director & Orchestrator",
    specialty: "System architecture, code, integrations, data pipelines, team coordination",
    background: "Full-stack engineer specializing in AI-powered recruiting systems. Coordinates the entire operation.",
    owns: ["Architecture", "Code", "Integrations", "Data enrichment", "Team coordination"],
    color: "slate",
    iconInitials: "DV",
  },
  {
    id: "marcus",
    name: "Marcus Cole",
    title: "Head of Recruiting Strategy",
    specialty: "NCAA rules, school targeting, recruiting timelines, milestone management",
    background: "Former D1 recruiting coordinator with 15 years placing OL at Power 5 and FCS programs.",
    owns: ["School targeting", "Tier assignments", "Recruiting calendar", "NCAA compliance", "Milestone tracking"],
    color: "amber",
    iconInitials: "MC",
  },
  {
    id: "nina",
    name: "Nina Banks",
    title: "Coach Intelligence & Outreach Director",
    specialty: "Coach research, DM campaigns, relationship building, NCSA lead processing",
    background: "Former college admissions counselor turned recruiting consultant, expert in cold outreach that converts.",
    owns: ["Coach database", "DM campaigns", "Follow strategy", "NCSA leads", "Camp invite responses"],
    color: "purple",
    iconInitials: "NB",
  },
  {
    id: "trey",
    name: "Trey Jackson",
    title: "Content Strategist & X Manager",
    specialty: "X/Twitter content strategy, posting cadence, visual storytelling for recruits",
    background: "Former social media director for a top-25 college football program. Built multiple recruit profiles from zero to coach-noticed.",
    owns: ["Content calendar", "Post drafting", "Hashtag strategy", "Profile optimization", "Engagement tracking"],
    color: "blue",
    iconInitials: "TJ",
  },
  {
    id: "jordan",
    name: "Jordan Reeves",
    title: "Film & Media Producer",
    specialty: "Video editing, highlight reels, thumbnail design, AI-enhanced content production",
    background: "Hudl certified film analyst who produces recruiting highlight packages for D1 prospects.",
    owns: ["Video library", "Clip optimization", "Highlight reels", "Training clip selection", "AI-enhanced graphics"],
    color: "green",
    iconInitials: "JR",
  },
  {
    id: "sophie",
    name: "Sophie Chen",
    title: "Analytics & Intelligence Lead",
    specialty: "Recruiting data analysis, competitor tracking, engagement metrics, school fit scoring",
    background: "Data scientist who built recruiting analytics tools for a major scouting service.",
    owns: ["Intelligence dashboard", "Scoring engine", "Competitor analysis", "Engagement metrics", "NCSA analytics"],
    color: "rose",
    iconInitials: "SC",
  },
  {
    id: "casey",
    name: "Casey Ward",
    title: "Network Growth & Community Manager",
    specialty: "Strategic follower networks, recruit peer connections, community engagement",
    background: "Growth marketing specialist who managed social presence for 50+ college athletes.",
    owns: ["Follow strategy", "Recruit peer connections", "Coach follow campaigns", "Engagement pods", "Comment strategy"],
    color: "cyan",
    iconInitials: "CW",
  },
];

export function getTeamMember(id: string): TeamMember | undefined {
  return TEAM_MEMBERS.find((m) => m.id === id);
}

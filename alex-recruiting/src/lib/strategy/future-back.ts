export interface FutureBackShift {
  id: string;
  title: string;
  from: string;
  to: string;
  reason: string;
}

export interface FutureBackHorizon {
  id: string;
  horizon: string;
  headline: string;
  outcome: string;
  signals: string[];
}

export interface FutureBackCapabilityBet {
  id: string;
  title: string;
  outcome: string;
  now: string;
  next: string;
  later: string;
}

export interface FutureBackMilestone {
  year: string;
  objective: string;
  moves: string[];
}

export interface FutureBackLens {
  targetYear: number;
  title: string;
  premise: string;
  northStar: string;
  strategicQuestion: string;
  shifts: FutureBackShift[];
  horizons: FutureBackHorizon[];
  capabilityBets: FutureBackCapabilityBet[];
  reverseMilestones: FutureBackMilestone[];
  next90Days: string[];
}

export const FIVE_YEAR_FUTURE_BACK: FutureBackLens = {
  targetYear: 2031,
  title: "Susan Innovation Studio Future-Back Lens",
  premise:
    "Using a Strategos-style approach, define the 2031 recruiting company first, then work backwards to the capabilities, workflows, and product bets required now.",
  northStar:
    "By 2031 this product should function as an AI-powered recruiting operating system that continuously turns athlete media, coach intelligence, outreach, scheduling, and family decisions into guided next actions with measurable recruiting outcomes.",
  strategicQuestion:
    "What would have to be true by 2031 for this system to become the trusted operating layer a serious high school athlete and family use every week from first exposure through commitment?",
  shifts: [
    {
      id: "shift-1",
      title: "From dashboard to operating system",
      from: "Static analytics and disconnected tools",
      to: "A command surface that recommends, executes, and tracks the next best move",
      reason: "Families do not need more tabs; they need fewer decisions and clearer action.",
    },
    {
      id: "shift-2",
      title: "From content engine to recruiting graph",
      from: "Posts, media, and DMs treated as separate workflows",
      to: "A unified graph connecting athletes, schools, coaches, camps, media, and outcomes",
      reason: "Real recruiting leverage comes from relationships and signal chains, not isolated posts.",
    },
    {
      id: "shift-3",
      title: "From manual ops to supervised autonomy",
      from: "The user has to remember what to do next",
      to: "Agents prepare work, suggest tradeoffs, and execute inside family-approved guardrails",
      reason: "The biggest value unlock is reducing cognitive load while improving decision quality.",
    },
    {
      id: "shift-4",
      title: "From athlete website to evidence vault",
      from: "A brochure-style recruiting page",
      to: "A live, trusted proof layer with film, measurables, character signals, schedule, and verified updates",
      reason: "Coaches respond to clarity, proof, and freshness more than design alone.",
    },
  ],
  horizons: [
    {
      id: "h1",
      horizon: "Horizon 1 | 2026-2027",
      headline: "Make the system indispensable to one family every week",
      outcome:
        "The app becomes the daily operating layer for publishing, outreach, tasks, media selection, and recruiting readiness.",
      signals: [
        "Operator-first home and room design adopted across the product",
        "Reminder texts, DM workflows, follow workflows, and publishing cadence working end to end",
        "All high-frequency actions routable through the embedded operator",
      ],
    },
    {
      id: "h2",
      horizon: "Horizon 2 | 2027-2029",
      headline: "Turn the single-athlete stack into a repeatable recruiting company product",
      outcome:
        "The platform supports multiple athletes, reusable playbooks, shared research, school graphs, and family-facing automation with role-based views.",
      signals: [
        "Multi-athlete workspace architecture",
        "Coach graph enrichment and school intelligence at scale",
        "Reusable operating templates for different sports and recruiting tiers",
      ],
    },
    {
      id: "h3",
      horizon: "Horizon 3 | 2029-2031",
      headline: "Become the AI recruiting copilot category leader",
      outcome:
        "Families, trainers, and recruiting advisors rely on the platform for future-back planning, execution, and measured recruiting ROI.",
      signals: [
        "Outcome dashboards linked to real contacts, visits, camps, and commitments",
        "Agent network handling research, media ops, outreach drafting, and schedule orchestration",
        "Product recognized as the operating layer rather than just another recruiting profile",
      ],
    },
  ],
  capabilityBets: [
    {
      id: "bet-1",
      title: "Embedded recruiting operator",
      outcome: "Every major workflow can be routed through chat + action cards instead of hunting through UI.",
      now: "Finish operator coverage for publishing, outreach, growth, reminders, and website tasks.",
      next: "Add memory, approvals, and multi-step execution chains.",
      later: "Support delegated agent runs with auditable history and family-level controls.",
    },
    {
      id: "bet-2",
      title: "Recruiting graph intelligence",
      outcome: "The system understands which schools, coaches, camps, and media assets matter most and why.",
      now: "Populate coach/school data and score follow + DM targets with live relevance.",
      next: "Track engagement history, roster needs, visit timing, and school-fit patterns.",
      later: "Predict the next-best school and outreach sequence from historical outcomes.",
    },
    {
      id: "bet-3",
      title: "Verified evidence layer",
      outcome: "The website and outbound surfaces become trusted proof of the athlete, not just marketing.",
      now: "Keep media, stats, measurables, and links live and current.",
      next: "Add verification, provenance, and freshness scoring to every major asset.",
      later: "Turn the athlete profile into a living evidence vault for coaches and advisors.",
    },
    {
      id: "bet-4",
      title: "AI-assisted family operations",
      outcome: "Parents and athletes are guided through recruiting without dropping context or missing deadlines.",
      now: "Surface daily priorities, reminders, and room-level next actions.",
      next: "Layer in plan tracking, decision journaling, and scenario comparisons.",
      later: "Provide longitudinal planning across academics, camps, travel, NIL, and commitment strategy.",
    },
  ],
  reverseMilestones: [
    {
      year: "2031",
      objective: "Category-defining AI recruiting operating system",
      moves: [
        "Multi-athlete platform with agentic execution and measurable recruiting outcomes",
        "Trusted evidence vault and coach graph intelligence",
        "Strategic planning, execution, and reporting in one product",
      ],
    },
    {
      year: "2030",
      objective: "Outcome-based platform",
      moves: [
        "Link activity to visits, coach conversations, camp traction, and commitment movement",
        "Add longitudinal analytics and outcome benchmarks by athlete archetype",
      ],
    },
    {
      year: "2029",
      objective: "Repeatable recruiting company engine",
      moves: [
        "Template the system across sports and recruiting tiers",
        "Operationalize the graph of schools, coaches, events, and media signals",
      ],
    },
    {
      year: "2028",
      objective: "Multi-athlete, multi-role expansion",
      moves: [
        "Support parents, trainers, advisors, and athletes with role-specific views",
        "Upgrade tasking, reminders, and approvals into shared operating workflows",
      ],
    },
    {
      year: "2027",
      objective: "Reliable single-athlete operating system",
      moves: [
        "Complete operator-first UX across all primary rooms",
        "Close all real workflow gaps in outreach, posting, media, reminders, and website updates",
      ],
    },
    {
      year: "2026",
      objective: "Foundation year",
      moves: [
        "Populate real coach and media data",
        "Stabilize core integrations and no-dummy-data workflows",
        "Ship guided UX so the user always knows the next move",
      ],
    },
  ],
  next90Days: [
    "Finish operator coverage across DMs, Media Lab, reminders, and website tasks.",
    "Complete real coach enrichment and growth target scoring so follow/DM systems are trustworthy.",
    "Add reminder texts and daily operating recaps so the product reaches out first.",
    "Replace remaining passive pages with guided room patterns and live next-action cards.",
    "Create a live strategy board in Intelligence that ties future-back bets to current execution work.",
  ],
};

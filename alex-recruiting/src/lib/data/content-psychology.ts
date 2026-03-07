// ---------------------------------------------------------------------------
// Content Psychology Framework — Behavioral Economics + Interaction Design
// ---------------------------------------------------------------------------
// Every post Jacob makes should be engineered to make others feel seen,
// trigger reciprocity, and build identity resonance — NOT to brag.
// ---------------------------------------------------------------------------

// ─── Psychology Mechanisms ──────────────────────────────────────────────────

export type PsychologyMechanism =
  | "identity_resonance"
  | "reciprocity"
  | "commitment_consistency"
  | "scarcity"
  | "loss_aversion"
  | "narrative_transportation"
  | "curiosity_gap"
  | "autonomy_bias";

export const PSYCHOLOGY_MECHANISMS: Record<PsychologyMechanism, { name: string; description: string; example: string }> = {
  identity_resonance: {
    name: "Identity Resonance",
    description: "People engage with content that reflects how they see themselves. Coaches see themselves as developers of talent — show them that.",
    example: "Credit a coach's teaching in your improvement. They share it because it validates their identity as a great coach.",
  },
  reciprocity: {
    name: "Reciprocity",
    description: "When you make someone look good publicly, they feel compelled to return the favor. Spotlight others first.",
    example: "Tag a coach or teammate when crediting them. They're far more likely to engage, repost, or follow back.",
  },
  commitment_consistency: {
    name: "Commitment & Consistency",
    description: "People who publicly state a position feel compelled to act consistently with it. Document your journey so people invest in your story.",
    example: "Regular progress updates make followers feel invested. They committed attention — now they want to see the outcome.",
  },
  scarcity: {
    name: "Scarcity",
    description: "Rarity increases perceived value. Don't post constantly. Let silence build anticipation.",
    example: "4-5 quality posts per week > daily filler. Each post should feel like it earned its spot on the timeline.",
  },
  loss_aversion: {
    name: "Loss Aversion",
    description: "People fear missing out more than they desire gaining. Create content coaches would regret not seeing.",
    example: "Film clips that showcase coachable technique — a coach scrolling past might miss their next recruit.",
  },
  narrative_transportation: {
    name: "Narrative Transportation",
    description: "Stories move people into a mental state where they're less critical and more emotionally engaged.",
    example: "Don't list accomplishments. Tell the story of how you got there — the struggle, the doubt, the breakthrough.",
  },
  curiosity_gap: {
    name: "Curiosity Gap",
    description: "Open a loop that the reader's brain needs to close. Ask questions. Pose dilemmas. Invite responses.",
    example: "Ask coaches a technique question. Their expertise compels them to answer — and now you have a conversation.",
  },
  autonomy_bias: {
    name: "Autonomy Bias",
    description: "People engage more when they feel they chose to, not when they're told to. Never demand attention — earn it.",
    example: "Replace 'Check out my highlights!' with a question about technique that naturally leads people to your film.",
  },
};

// ─── 8 Interaction Design Principles ────────────────────────────────────────

export const INTERACTION_DESIGN_PRINCIPLES = [
  {
    id: 1,
    principle: "Make Others the Hero",
    rule: "Every post should make someone other than Jacob look good. Coaches, teammates, trainers — they're the stars.",
    mechanism: "reciprocity" as PsychologyMechanism,
  },
  {
    id: 2,
    principle: "Ask, Don't Tell",
    rule: "Questions invite engagement. Statements invite scrolling. Lead with curiosity, not declarations.",
    mechanism: "curiosity_gap" as PsychologyMechanism,
  },
  {
    id: 3,
    principle: "Show Vulnerability Strategically",
    rule: "Admitting what you don't know yet makes people root for you. Honest weakness builds trust.",
    mechanism: "narrative_transportation" as PsychologyMechanism,
  },
  {
    id: 4,
    principle: "Document, Don't Announce",
    rule: "Show the work in progress, not the polished result. People connect with process, not perfection.",
    mechanism: "commitment_consistency" as PsychologyMechanism,
  },
  {
    id: 5,
    principle: "Use Specific Names Over Generic Praise",
    rule: "Say 'Coach Henderson pushed us' not 'My coaches are great.' Specificity creates authenticity.",
    mechanism: "identity_resonance" as PsychologyMechanism,
  },
  {
    id: 6,
    principle: "Silence as Confidence",
    rule: "Don't post for the sake of posting. Let quality speak. A quiet timeline with great content > daily noise.",
    mechanism: "scarcity" as PsychologyMechanism,
  },
  {
    id: 7,
    principle: "Use 'We' Over 'I'",
    rule: "Team language builds community. 'We improved' > 'I improved.' Even individual achievements credit the group.",
    mechanism: "identity_resonance" as PsychologyMechanism,
  },
  {
    id: 8,
    principle: "Earn Attention, Don't Demand It",
    rule: "Never say 'coaches DMs are open' or 'check me out.' Let content quality pull people in organically.",
    mechanism: "autonomy_bias" as PsychologyMechanism,
  },
];

// ─── Content Tone Bible ─────────────────────────────────────────────────────

export const CONTENT_TONE_BIBLE = {
  voice: "Confident student, not confident salesman. Curious and coachable, never desperate or bragging.",
  rules: [
    "Use specific names over generic praise (Coach Henderson, not 'my coaches')",
    "Use 'we' and 'our' more than 'I' and 'my' — team language builds community",
    "Questions over CTAs — 'What do you think about this technique?' not 'Check out my film!'",
    "Silence is confidence — only post when you have something worth saying",
    "Admit weaknesses honestly — 'Still figuring out balance' builds more trust than 'Grinding every day'",
    "Credit the teacher, not just the lesson — tag people, name names, be specific",
    "No motivational speaker tone — no 'Rise and grind' or 'Can't stop won't stop'",
    "No salesman tone — no 'DMs open' or 'Coaches, come get me' or 'Who's watching?'",
    "No braggart tone — no 'Dominated today' or 'Nobody can stop me' or trophy emoji walls",
    "No empty hustle language — no 'Outwork everyone' or 'Different breed' or 'Built different'",
  ],
  doNotUse: [
    "DMs are open",
    "Check out my highlights",
    "Who's watching?",
    "Coaches, come get me",
    "Can't stop won't stop",
    "Rise and grind",
    "Built different",
    "Different breed",
    "Outwork everyone",
    "Let's go!",
    "Dominated",
    "Destroyed",
    "Pancaked everyone",
  ],
};

// ─── Post Formulas ──────────────────────────────────────────────────────────

export type PostFormulaType =
  | "spotlight_shift"
  | "curious_student"
  | "honest_progress"
  | "ambient_update"
  | "narrative_loop";

export interface PostFormula {
  type: PostFormulaType;
  name: string;
  description: string;
  structure: string;
  mechanisms: PsychologyMechanism[];
  example: string;
}

export const POST_FORMULAS: PostFormula[] = [
  {
    type: "spotlight_shift",
    name: "Spotlight Shift",
    description: "Brief personal context, then redirect all credit to someone else. You're the narrator, they're the hero.",
    structure: "[Brief personal context] + [Redirect credit to someone else] + [Quiet confidence]",
    mechanisms: ["reciprocity", "identity_resonance"],
    example: `Film study Thursday. Watching last season's playoff game back and realizing how much our whole line improved from Week 1 to Week 12.

Our center Ryan went from hesitating on combo calls to reading the linebacker before the snap. That's 12 weeks of Coach Henderson pushing us.

The O-line doesn't get highlights. We'll make our own.`,
  },
  {
    type: "curious_student",
    name: "Curious Student",
    description: "Show you're learning, credit the teacher, ask a genuine question. Coaches can't resist answering.",
    structure: "[Something learned] + [Credit the teacher] + [Open question]",
    mechanisms: ["autonomy_bias", "reciprocity", "curiosity_gap"],
    example: `Question for any OL coaches on here.

When you're teaching a young lineman to anchor against a bull rush, do you start with the hips or the hands?

I've been taught hands first — strike, then sink the hips. But I watched some college film this week where guys were dropping hips before the punch even landed.

Trying to figure out which approach works better for a bigger body type. Any input is welcome. I'm a student of this position.

#OffensiveLine #OLTechnique`,
  },
  {
    type: "honest_progress",
    name: "Honest Progress Report",
    description: "Where you were, where you are, what's still hard. Radical honesty makes people invest in your story.",
    structure: "[Where I was] + [Where I am] + [Honest weakness] + [Forward look]",
    mechanisms: ["commitment_consistency", "narrative_transportation"],
    example: `Honest check-in. 6 months into the recruiting journey.

What's working:
- Training is the best it's ever been
- Film study is becoming a habit, not a chore
- Met some great people in the Class of 2029

What I'm still figuring out:
- How to balance school, training, and rest
- How to put myself out there without it feeling like bragging
- How to be patient when the process feels slow

Not where I want to be yet. But not where I started either.

Grateful for everyone following along. The best is still ahead.`,
  },
  {
    type: "ambient_update",
    name: "Ambient Update",
    description: "Low-key, in-the-moment content that feels natural, not staged. A window into the daily grind without narration.",
    structure: "[Scene setting] + [One specific detail] + [No CTA, no ask]",
    mechanisms: ["scarcity", "narrative_transportation"],
    example: `5:30 AM. Weight room is empty except for our line group.

Just us and the bar.`,
  },
  {
    type: "narrative_loop",
    name: "Narrative Loop",
    description: "Open a story loop that makes people want to follow for the resolution. Create ongoing arcs.",
    structure: "[Setup a challenge/goal] + [Current status] + [Open loop — 'I'll report back']",
    mechanisms: ["curiosity_gap", "commitment_consistency", "loss_aversion"],
    example: `Setting a goal for spring ball: I want to not give up a single sack in 7-on-7.

Zero. For the whole spring.

I know that's ambitious. Our defensive line is nasty this year. But I want to see if the offseason work actually transferred.

I'll keep you posted.`,
  },
];

// ─── Spotlight Shift Check ──────────────────────────────────────────────────

/**
 * Returns true if the post passes the spotlight shift check — i.e., it
 * mentions or credits someone other than Jacob, or asks a genuine question.
 */
export function spotlightShiftCheck(content: string): {
  passes: boolean;
  reason: string;
} {
  const lower = content.toLowerCase();

  // Check for mentions of other people (names, roles, team references)
  const mentionsOthers =
    /coach\s+\w+|our\s+(center|guard|tackle|line|team|o-line|squad)|teammate|@\w+/i.test(content);

  // Check for genuine questions
  const asksQuestion = /\?/.test(content) && /(question|curious|wondering|anyone|thoughts|input|advice|help)/i.test(content);

  // Check for "we/our" vs "I/my" ratio
  const weCount = (lower.match(/\b(we|our|us)\b/g) || []).length;
  const iCount = (lower.match(/\b(i|my|me)\b/g) || []).length;
  const teamLanguage = weCount >= iCount;

  // Check for self-promotion red flags
  const selfPromo = /\b(dms?\s+(are\s+)?open|check\s+(out|me)|who'?s\s+watching|come\s+get\s+me|coaches.*open)\b/i.test(content);

  if (selfPromo) {
    return { passes: false, reason: "Contains self-promotional language. Rewrite to earn attention, not demand it." };
  }

  if (mentionsOthers || asksQuestion) {
    return { passes: true, reason: "Post credits others or asks a genuine question." };
  }

  if (teamLanguage && weCount > 0) {
    return { passes: true, reason: "Post uses team language effectively." };
  }

  return {
    passes: false,
    reason: "Post doesn't make anyone else the hero. Add a credit, tag someone, or ask a question.",
  };
}

// ─── System Prompt Injection ────────────────────────────────────────────────

export function getContentPsychologyPrompt(): string {
  const principles = INTERACTION_DESIGN_PRINCIPLES.map(
    (p) => `${p.id}. ${p.principle}: ${p.rule} (${PSYCHOLOGY_MECHANISMS[p.mechanism].name})`
  ).join("\n");

  const toneRules = CONTENT_TONE_BIBLE.rules.map((r) => `- ${r}`).join("\n");
  const doNotUse = CONTENT_TONE_BIBLE.doNotUse.map((p) => `- "${p}"`).join("\n");

  const formulas = POST_FORMULAS.map(
    (f) => `${f.name}: ${f.structure}\n  Mechanisms: ${f.mechanisms.join(", ")}\n  ${f.description}`
  ).join("\n\n");

  return `
CONTENT PSYCHOLOGY FRAMEWORK — Behavioral Economics + Interaction Design
========================================================================

CORE PHILOSOPHY: Make Others Feel Seen
Every post Jacob makes must answer: "Who else does this post make look good?"
If the answer is "nobody" — rewrite it.

8 INTERACTION DESIGN PRINCIPLES:
${principles}

CONTENT TONE BIBLE:
Voice: ${CONTENT_TONE_BIBLE.voice}

Rules:
${toneRules}

NEVER use these phrases:
${doNotUse}

POST FORMULAS (use these as templates for every draft):

${formulas}

SPOTLIGHT SHIFT CHECK — run on every draft:
Before finalizing any post, verify:
1. Does this post make someone other than Jacob the hero? (credits, tags, names)
2. Does it ask a genuine question or invite authentic engagement?
3. Does it use "we/our" more than "I/my"?
4. Is it free of self-promotional language?
If any check fails, rewrite using one of the 5 post formulas above.

PSYCHOLOGY TAGGING:
Tag every draft with the primary behavioral economics mechanism it leverages:
identity_resonance | reciprocity | commitment_consistency | scarcity | loss_aversion | narrative_transportation | curiosity_gap | autonomy_bias
`;
}

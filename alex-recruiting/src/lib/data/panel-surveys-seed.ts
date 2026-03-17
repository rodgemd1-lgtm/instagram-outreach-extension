/**
 * Coach Panel — Survey Seed Data
 *
 * Each panel coach reviews 2-4 posts from the content calendar (post-001 through post-017).
 * Feedback is honest and critical — coaches flag cliches, bravado, and generic content.
 * References post IDs from content-calendar-30d.ts.
 */

export interface PanelSurveyResponse {
  coach_name: string;
  post_id: string;
  would_recruit: "yes" | "maybe" | "no";
  what_convinced: string;
  what_almost_made_leave: string;
  comparison_score: number; // 1-10
  specific_feedback: string;
}

export const panelSurveysSeed: PanelSurveyResponse[] = [
  // ---- Coach Dave Keel (UW-Whitewater, D3 OL) ----
  {
    coach_name: "Coach Dave Keel",
    post_id: "post-001",
    would_recruit: "yes",
    what_convinced:
      "Film study initiative — showing he breaks down our specific scheme tells me he's serious about UW-Whitewater",
    what_almost_made_leave:
      "The hashtag #FilmDontLie feels cliche. Let the content speak for itself.",
    comparison_score: 8,
    specific_feedback:
      "Love that he's studying our gap blocking system specifically. Would be even better if he asked a question about it — shows curiosity.",
  },
  {
    coach_name: "Coach Dave Keel",
    post_id: "post-002",
    would_recruit: "maybe",
    what_convinced: "315 bench is a good number for his age",
    what_almost_made_leave:
      "'Nobody outworks me' is a red flag. Every recruit says this. It's self-promotional and sounds like bragging.",
    comparison_score: 4,
    specific_feedback:
      "Lose the 'nobody outworks me' line. Instead, credit the strength coach or a training partner. Show me coachability, not bravado.",
  },
  {
    coach_name: "Coach Dave Keel",
    post_id: "post-006",
    would_recruit: "yes",
    what_convinced:
      "Team captain and humble about it — 'it's about showing up every day' is the right message",
    what_almost_made_leave:
      "Nothing — this is exactly what I want to see from a recruit.",
    comparison_score: 9,
    specific_feedback:
      "This is the kind of post that makes me pick up the phone. Character + leadership + humility.",
  },

  // ---- Coach Brian Raehl (UW-Oshkosh, D3 OL) ----
  {
    coach_name: "Coach Brian Raehl",
    post_id: "post-002",
    would_recruit: "no",
    what_convinced: "The PR number is impressive",
    what_almost_made_leave:
      "'4:45 AM alarm' and 'nobody outworks me' — this is motivational speaker tone. Real grinders don't announce it.",
    comparison_score: 3,
    specific_feedback:
      "Rewrite completely. Drop the humble-brag. Just post the lift video with the weight and a thank-you to whoever spotted you.",
  },
  {
    coach_name: "Coach Brian Raehl",
    post_id: "post-007",
    would_recruit: "yes",
    what_convinced:
      "405 squat for a double is excellent. And he connects it to on-field application — 'legs are the engine for everything on the line'",
    what_almost_made_leave:
      "'Keep building the base' is filler. End with something specific.",
    comparison_score: 7,
    specific_feedback:
      "Strong post. The connection between squat strength and OL play shows football IQ. Cut the last sentence and end on the technique connection.",
  },
  {
    coach_name: "Coach Brian Raehl",
    post_id: "post-011",
    would_recruit: "yes",
    what_convinced:
      "Tracking measurable progress (shaved 0.1 off forty) shows discipline and self-awareness",
    what_almost_made_leave: "Nothing major — this is a clean post",
    comparison_score: 8,
    specific_feedback:
      "Progress tracking is exactly what I want to see. Shows the kid is measuring and improving, not just posting for likes.",
  },

  // ---- Coach Matt Janus (UW-Eau Claire, D3 OC) ----
  {
    coach_name: "Coach Matt Janus",
    post_id: "post-005",
    would_recruit: "yes",
    what_convinced:
      "Studying our specific DL techniques and connecting to his own skill work — this kid does homework",
    what_almost_made_leave:
      "Would love to see him ask a question about our scheme instead of just stating what he found.",
    comparison_score: 8,
    specific_feedback:
      "Add a question at the end like 'Curious how you handle the 3-tech slant against zone blocking?' — shows genuine curiosity and invites conversation.",
  },
  {
    coach_name: "Coach Matt Janus",
    post_id: "post-010",
    would_recruit: "yes",
    what_convinced:
      "'Love the chess match' — this kid sees football as intellectual, not just physical. That's my kind of player.",
    what_almost_made_leave: "Nothing — genuinely good post",
    comparison_score: 9,
    specific_feedback:
      "The chess match metaphor is perfect. This is the kind of post that gets a coach to click through to the profile.",
  },
  {
    coach_name: "Coach Matt Janus",
    post_id: "post-012",
    would_recruit: "yes",
    what_convinced:
      "Community involvement and giving back to youth football — character matters",
    what_almost_made_leave:
      "'Giving back feels good' is a bit performative. Let the action speak.",
    comparison_score: 7,
    specific_feedback:
      "Cut the last sentence. The volunteering speaks for itself. Maybe mention a specific kid who had a breakthrough.",
  },

  // ---- Coach Andy Nerat (UW-Stevens Point, D3 OL) ----
  {
    coach_name: "Coach Andy Nerat",
    post_id: "post-003",
    would_recruit: "maybe",
    what_convinced: "Tracking weekly work — 4 lifts, 2 film sessions, 1 PR",
    what_almost_made_leave:
      "'Stacking days' is generic motivational language. And the whole post feels like a checklist, not a story.",
    comparison_score: 5,
    specific_feedback:
      "Instead of listing what you did, tell me about one specific moment from the week that taught you something. Story > stats.",
  },
  {
    coach_name: "Coach Andy Nerat",
    post_id: "post-004",
    would_recruit: "no",
    what_convinced:
      "Nothing specific — this is pure motivational poster content",
    what_almost_made_leave:
      "'Outwork yesterday every single day. No shortcuts, just reps.' — this could be posted by literally anyone. Zero personality.",
    comparison_score: 2,
    specific_feedback:
      "Delete this post entirely. It says nothing about Jacob as a player, person, or prospect. Fill this slot with something specific and real.",
  },
  {
    coach_name: "Coach Andy Nerat",
    post_id: "post-015",
    would_recruit: "yes",
    what_convinced:
      "Self-scouting and finding weaknesses — 'gotta fix my hand placement on reach blocks' — this is honest and coachable",
    what_almost_made_leave: "Nothing — this is authenticity",
    comparison_score: 9,
    specific_feedback:
      "This is the best post in the calendar. Admitting a weakness and working on it? That's what gets recruits noticed.",
  },

  // ---- Coach Rick Cebulski (Winona State, D2 OL) ----
  {
    coach_name: "Coach Rick Cebulski",
    post_id: "post-008",
    would_recruit: "yes",
    what_convinced:
      "Staying after to work with younger players — leadership and brotherhood",
    what_almost_made_leave:
      "'Iron sharpens iron' is overused but forgivable here because the action backs it up",
    comparison_score: 8,
    specific_feedback:
      "Mention a specific younger player by name (with permission). 'Worked with sophomore guard Tyler on his pull technique' is 10x more powerful.",
  },
  {
    coach_name: "Coach Rick Cebulski",
    post_id: "post-013",
    would_recruit: "yes",
    what_convinced:
      "Connecting film study to practice reps — 'bringing that film study to the field'",
    what_almost_made_leave: "Nothing significant",
    comparison_score: 7,
    specific_feedback:
      "Good connection between preparation and execution. Would be stronger with a specific example of a play that worked because of film study.",
  },

  // ---- Coach Tyler Arens (Minnesota State-Mankato, D2 OC) ----
  {
    coach_name: "Coach Tyler Arens",
    post_id: "post-009",
    would_recruit: "maybe",
    what_convinced: "Early morning work shows dedication",
    what_almost_made_leave:
      "'Every rep counts' is filler. What specific footwork drill? What was he working on?",
    comparison_score: 5,
    specific_feedback:
      "Be specific. '6 AM ladder drills — working on my lateral shuffle speed for pass pro sets' tells me 10x more than generic motivation.",
  },
  {
    coach_name: "Coach Tyler Arens",
    post_id: "post-014",
    would_recruit: "yes",
    what_convinced:
      "255 power clean PR with direct connection to OL skills — explosive hips for pulling and trapping",
    what_almost_made_leave:
      "'Building that next-level power' is unnecessary — the numbers speak",
    comparison_score: 8,
    specific_feedback:
      "Strong post. The connection between power clean and pulling/trapping technique shows understanding. Cut the last sentence.",
  },

  // ---- Coach Jake Nordin (North Dakota State, FCS OL) ----
  {
    coach_name: "Coach Jake Nordin",
    post_id: "post-016",
    would_recruit: "maybe",
    what_convinced: "Two-a-day commitment is impressive",
    what_almost_made_leave:
      "'Two-a-days build champions' — heard it a million times. And '#GrindSZN' doesn't fly at an FCS program. We want mature competitors.",
    comparison_score: 4,
    specific_feedback:
      "Drop the hashtag slang and motivational cliches. Tell me what you worked on specifically in each session. Details matter at this level.",
  },
  {
    coach_name: "Coach Jake Nordin",
    post_id: "post-017",
    would_recruit: "maybe",
    what_convinced:
      "Highlight reel is good to show, and tagging coaches shows intent",
    what_almost_made_leave:
      "'DL hates seeing me pull' — this is trash talk territory. Confident is good. Cocky is not.",
    comparison_score: 5,
    specific_feedback:
      "Rewrite without the bravado. 'Best reps from spring practice week 2 — pull blocks and finishing through the whistle' is cleaner and more mature.",
  },

  // ---- Coach Mike Schmidt (South Dakota State, FCS OL) ----
  {
    coach_name: "Coach Mike Schmidt",
    post_id: "post-001",
    would_recruit: "yes",
    what_convinced:
      "Specific film study of a real team's scheme — shows genuine interest and football IQ",
    what_almost_made_leave:
      "Nothing — this feels authentic and specific",
    comparison_score: 8,
    specific_feedback:
      "Authenticity score is high on this one. He's doing the work and it shows. This is what separates serious recruits from the noise.",
  },
  {
    coach_name: "Coach Mike Schmidt",
    post_id: "post-004",
    would_recruit: "no",
    what_convinced: "Nothing — zero personality or specificity",
    what_almost_made_leave:
      "The entire post. 'New week, new goals. Outwork yesterday.' This is Instagram motivation page content, not a real person.",
    comparison_score: 1,
    specific_feedback:
      "This is the opposite of authentic. Kill it. Replace with literally anything real — what he ate for breakfast would be more interesting than this.",
  },
];

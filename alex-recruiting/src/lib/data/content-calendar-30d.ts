/**
 * 30-Day Content Calendar for Jacob Rodgers (@JacobRodge52987)
 * March 17 – April 16, 2026
 *
 * Schedule: Mon/Wed/Fri at 6 PM CT (23:00 UTC) + select weekend posts
 * Pillar distribution: Performance (7), Work Ethic (7), Character (3)
 *
 * Coach Panel reviewed — all posts use Trey's 5 Post Formulas
 * and pass the Spotlight Shift Check.
 */

export interface ScheduledPost {
  id: string;
  draft_text: string;
  pillar: 'performance' | 'work_ethic' | 'character';
  post_type: string;
  scheduled_time: string;
  suggested_media: string;
  hashtags: string[];
  target_coaches_to_tag: string[];
  approval_status: 'pending' | 'approved' | 'posted';
  panel_status: 'pending_panel' | 'panel_approved' | 'panel_rejected';
  post_formula:
    | 'spotlight_shift'
    | 'curious_student'
    | 'honest_progress'
    | 'ambient_update'
    | 'narrative_loop';
  psychology_mechanism: string;
}

export const contentCalendar30d: ScheduledPost[] = [
  // ─── Week 1 ─────────────────────────────────────────────

  // post-001: Curious Student — coaches loved film study specificity, added question
  {
    id: 'post-001',
    draft_text:
      'Watched 3 UW-Whitewater games after school today — their gap blocking scheme is sharp. Coach Rindahl, do you run more inside or outside zone on early downs? Trying to understand the system. #WIAC #D3Football #RecruitJacob',
    pillar: 'performance',
    post_type: 'film_clip',
    scheduled_time: '2026-03-18T23:00:00Z', // Wed
    suggested_media:
      'Screen recording of film study iPad with play diagrams highlighted',
    hashtags: ['#WIAC', '#D3Football', '#RecruitJacob', '#FilmStudy'],
    target_coaches_to_tag: ['@CoachRindahl'],
    approval_status: 'pending',
    panel_status: 'panel_approved',
    post_formula: 'curious_student',
    psychology_mechanism: 'demonstrates football IQ and coachability through genuine inquiry',
  },

  // post-002: Spotlight Shift — credit spotter/strength coach, drop "nobody outworks me"
  {
    id: 'post-002',
    draft_text:
      'Hit a 315 bench today. Couldn\'t have done it without Coach Meyers spotting and fixing my grip width last month. Our whole O-line group moved up this cycle. Team effort. #RecruitJacob #OLLife',
    pillar: 'work_ethic',
    post_type: 'training',
    scheduled_time: '2026-03-20T23:00:00Z', // Fri
    suggested_media:
      'Video clip of bench press PR with spotter and gym background',
    hashtags: ['#RecruitJacob', '#OLLife', '#StrengthTraining'],
    target_coaches_to_tag: [],
    approval_status: 'pending',
    panel_status: 'panel_approved',
    post_formula: 'spotlight_shift',
    psychology_mechanism: 'credits coach for technique correction, highlights team gains over individual',
  },

  // post-003: Narrative Loop — tell a story from the week, open loop
  {
    id: 'post-003',
    draft_text:
      'Watched film Tuesday and noticed I was lunging on combo blocks. Spent Thursday drilling first step with Coach Davis. Spring ball starts next week — I\'ll report back on whether the fix holds live. #PewaukeeFootball #ClassOf2029',
    pillar: 'work_ethic',
    post_type: 'recap',
    scheduled_time: '2026-03-21T23:00:00Z', // Sat
    suggested_media: 'Collage of weekly training highlights',
    hashtags: ['#PewaukeeFootball', '#ClassOf2029', '#RecruitJacob'],
    target_coaches_to_tag: [],
    approval_status: 'pending',
    panel_status: 'panel_approved',
    post_formula: 'narrative_loop',
    psychology_mechanism: 'creates anticipation with open loop, shows self-diagnosis and coachability',
  },

  // post-004: Ambient Update — replace motivational poster with real scene
  {
    id: 'post-004',
    draft_text:
      'Sunday afternoon. Playbook open on the kitchen table, dad quizzing me on blocking assignments while mom makes dinner. Our center Marcus texted his snap counts — we\'re syncing up before spring. #RecruitJacob',
    pillar: 'work_ethic',
    post_type: 'ambient',
    scheduled_time: '2026-03-22T23:00:00Z', // Sun
    suggested_media:
      'Casual photo of playbook on kitchen table, Sunday afternoon vibe',
    hashtags: ['#RecruitJacob', '#ClassOf2029', '#OLLife'],
    target_coaches_to_tag: [],
    approval_status: 'pending',
    panel_status: 'panel_approved',
    post_formula: 'ambient_update',
    psychology_mechanism: 'scene-setting reveals character naturally, no ask or CTA needed',
  },

  // ─── Week 2 ─────────────────────────────────────────────

  // post-005: Curious Student — add genuine question about scheme
  {
    id: 'post-005',
    draft_text:
      'Pulled up UW-Eau Claire film. Their DL runs a lot of slant techniques — I\'ve been working my kick slide to counter. Coach Edwards, do your OL practice slant pickup drills often? Curious how you teach it. #WIAC #FilmStudy',
    pillar: 'performance',
    post_type: 'film_clip',
    scheduled_time: '2026-03-23T23:00:00Z', // Mon
    suggested_media:
      'Photo of notebook with hand-drawn blocking assignments',
    hashtags: ['#WIAC', '#FilmStudy', '#RecruitJacob', '#D3Football'],
    target_coaches_to_tag: ['@CoachE_Blugolds'],
    approval_status: 'pending',
    panel_status: 'panel_approved',
    post_formula: 'curious_student',
    psychology_mechanism: 'asks specific technical question showing film work translates to genuine curiosity',
  },

  // post-006: Spotlight Shift — coaches loved it, minor polish
  {
    id: 'post-006',
    draft_text:
      'Teammates voted me spring captain today. Means a lot — but it\'s really about the work our whole O-line room has put in. Coach Davis built the culture; we just carry it forward. #TeamFirst #PewaukeeFootball #RecruitJacob',
    pillar: 'character',
    post_type: 'leadership',
    scheduled_time: '2026-03-25T23:00:00Z', // Wed
    suggested_media:
      'Photo with teammates at practice, captain patch visible',
    hashtags: ['#TeamFirst', '#PewaukeeFootball', '#RecruitJacob'],
    target_coaches_to_tag: [],
    approval_status: 'pending',
    panel_status: 'panel_approved',
    post_formula: 'spotlight_shift',
    psychology_mechanism: 'deflects personal honor to team and coaching staff, signals humility',
  },

  // post-007: Honest Progress — cut filler, end on technique connection
  {
    id: 'post-007',
    draft_text:
      'Squat day: 405 for a double. Two months ago I couldn\'t hit 385 clean. Still need to fix depth on my second rep — Coach Meyers won\'t let me cheat it. Hip drive connects directly to pulling on the line. #OLLife #RecruitJacob',
    pillar: 'performance',
    post_type: 'measurables',
    scheduled_time: '2026-03-27T23:00:00Z', // Fri
    suggested_media:
      'Video of squat set with weight clearly visible on bar',
    hashtags: ['#OLLife', '#RecruitJacob', '#StrengthTraining'],
    target_coaches_to_tag: [],
    approval_status: 'pending',
    panel_status: 'panel_approved',
    post_formula: 'honest_progress',
    psychology_mechanism: 'shows real numbers with honest weakness admission, connects lifting to position skill',
  },

  // post-008: Spotlight Shift — mention a specific teammate by first name
  {
    id: 'post-008',
    draft_text:
      'Stayed after practice with Ethan, our sophomore guard. Worked on his hand placement for 30 minutes. He got it on his last five reps — coach said he looked like a different player. That\'s what our room does. #TeamFirst #PewaukeeFootball',
    pillar: 'character',
    post_type: 'mentorship',
    scheduled_time: '2026-03-28T23:00:00Z', // Sat
    suggested_media:
      'Photo of post-practice huddle with younger players',
    hashtags: ['#TeamFirst', '#PewaukeeFootball', '#RecruitJacob'],
    target_coaches_to_tag: [],
    approval_status: 'pending',
    panel_status: 'panel_approved',
    post_formula: 'spotlight_shift',
    psychology_mechanism: 'makes teammate the hero, specific detail shows genuine investment in others',
  },

  // ─── Week 3 ─────────────────────────────────────────────

  // post-009: Honest Progress — specific drill and why, cut generic filler
  {
    id: 'post-009',
    draft_text:
      'Been doing Icky Shuffle ladders at 6 AM before school. My lateral movement at 265 lbs was a weakness on film — feet looked heavy on reach blocks. Three weeks in, our OL coach says the first step is noticeably quicker. Still work to do. #OLLife #RecruitJacob',
    pillar: 'work_ethic',
    post_type: 'training',
    scheduled_time: '2026-03-30T23:00:00Z', // Mon
    suggested_media:
      'Video of agility ladder footwork drills at school field',
    hashtags: ['#OLLife', '#RecruitJacob', '#ClassOf2029'],
    target_coaches_to_tag: [],
    approval_status: 'pending',
    panel_status: 'panel_approved',
    post_formula: 'honest_progress',
    psychology_mechanism: 'names specific weakness from film, shows targeted fix with honest assessment',
  },

  // post-010: Curious Student — "chess match" was loved, polish with question
  {
    id: 'post-010',
    draft_text:
      'UW-Oshkosh film tonight. Their LBs blitz off the edge on 60% of passing downs — our pass pro sets have to adjust. Love the chess match. Coach Venne, how do you teach your OL to read edge pressure? #WIAC #D3Football #RecruitJacob',
    pillar: 'performance',
    post_type: 'film_clip',
    scheduled_time: '2026-04-01T23:00:00Z', // Wed
    suggested_media:
      'Screenshot of game film with arrows showing blitz paths',
    hashtags: ['#WIAC', '#D3Football', '#RecruitJacob', '#FilmStudy'],
    target_coaches_to_tag: ['@CoachVenne'],
    approval_status: 'pending',
    panel_status: 'panel_approved',
    post_formula: 'curious_student',
    psychology_mechanism: 'specific stat from film study plus genuine question invites coach conversation',
  },

  // post-011: Honest Progress — progress tracking praised, clean and specific
  {
    id: 'post-011',
    draft_text:
      'Ran a 5.08 forty today — down from 5.18 last month. At 265 lbs, our speed coach says the next target is sub-5.0 by June. Honest truth: my start is still slow. Working on first-step explosion every session. #RecruitJacob #OLLife',
    pillar: 'performance',
    post_type: 'measurables',
    scheduled_time: '2026-04-03T23:00:00Z', // Fri
    suggested_media:
      'Photo of stopwatch or timing system showing 5.08',
    hashtags: ['#RecruitJacob', '#OLLife', '#ClassOf2029', '#D3Football'],
    target_coaches_to_tag: [],
    approval_status: 'pending',
    panel_status: 'panel_approved',
    post_formula: 'honest_progress',
    psychology_mechanism: 'real numbers with honest weakness and forward target, credits speed coach',
  },

  // post-012: Spotlight Shift — mention a specific kid's breakthrough, cut "giving back feels good"
  {
    id: 'post-012',
    draft_text:
      'Volunteered at Pewaukee youth camp this morning. A 5th grader named Tyler couldn\'t get his three-point stance right — we worked on it for 20 minutes and he nailed his last rep. His dad was grinning. Days like this remind us why we play. #TeamFirst #PewaukeeFootball',
    pillar: 'character',
    post_type: 'community',
    scheduled_time: '2026-04-05T23:00:00Z', // Sun
    suggested_media:
      'Photo coaching youth players at community football camp',
    hashtags: ['#TeamFirst', '#PewaukeeFootball', '#RecruitJacob'],
    target_coaches_to_tag: [],
    approval_status: 'pending',
    panel_status: 'panel_approved',
    post_formula: 'spotlight_shift',
    psychology_mechanism: 'makes a young player the hero of the story, specific detail shows authenticity',
  },

  // ─── Week 4 ─────────────────────────────────────────────

  // post-013: Curious Student — add a specific play that worked because of film
  {
    id: 'post-013',
    draft_text:
      'Spring practice day 1. Ran a combo block to the second level that Coach Davis drew up from our UW-Whitewater film. It worked clean. Curious — do most college OL coaches install combos from film or from the playbook first? #PewaukeeFootball #RecruitJacob',
    pillar: 'work_ethic',
    post_type: 'training',
    scheduled_time: '2026-04-06T23:00:00Z', // Mon
    suggested_media: 'Action photo from spring practice, OL drill work',
    hashtags: ['#PewaukeeFootball', '#RecruitJacob', '#OLLife'],
    target_coaches_to_tag: [],
    approval_status: 'pending',
    panel_status: 'panel_approved',
    post_formula: 'curious_student',
    psychology_mechanism: 'connects film study to on-field result, open question invites coach engagement',
  },

  // post-014: Honest Progress — cut "building that next-level power", end on technique
  {
    id: 'post-014',
    draft_text:
      'Power clean: 255 lbs, new PR. Was stuck at 235 for six weeks — Coach Meyers changed my pull timing and it clicked. Still catching too far forward. The hip extension is what makes pulling and trapping work on the line. #StrengthTraining #RecruitJacob',
    pillar: 'performance',
    post_type: 'measurables',
    scheduled_time: '2026-04-08T23:00:00Z', // Wed
    suggested_media: 'Video of power clean PR with coach feedback',
    hashtags: ['#StrengthTraining', '#RecruitJacob', '#OLLife'],
    target_coaches_to_tag: [],
    approval_status: 'pending',
    panel_status: 'panel_approved',
    post_formula: 'honest_progress',
    psychology_mechanism: 'credits coach for breakthrough, admits remaining flaw, connects to position skill',
  },

  // post-015: Honest Progress — coaches called it "the best post", polish only
  {
    id: 'post-015',
    draft_text:
      'Watched my own spring reps tonight. Honest self-scout: hand placement on reach blocks is still outside — should be inside chest. Asked Coach Davis to drill it tomorrow. Film doesn\'t lie and neither should I. #FilmStudy #RecruitJacob',
    pillar: 'work_ethic',
    post_type: 'film_clip',
    scheduled_time: '2026-04-10T23:00:00Z', // Fri
    suggested_media:
      'Photo of laptop with game film paused on blocking technique',
    hashtags: ['#FilmStudy', '#RecruitJacob', '#ClassOf2029'],
    target_coaches_to_tag: [],
    approval_status: 'pending',
    panel_status: 'panel_approved',
    post_formula: 'honest_progress',
    psychology_mechanism: 'radical self-honesty about technique flaw, proactive ask to coach signals coachability',
  },

  // post-016: Ambient Update — drop cliches and "#GrindSZN", be specific
  {
    id: 'post-016',
    draft_text:
      '5 AM. Resistance bands on the field, nobody else out here yet. Working hip flexor mobility — our trainer said it\'s the reason my pull steps are short. Cold morning, quiet reps. Spring practice in three hours. #RecruitJacob #OLLife',
    pillar: 'work_ethic',
    post_type: 'training',
    scheduled_time: '2026-04-13T23:00:00Z', // Mon
    suggested_media:
      'Early morning photo of band work on empty field, dawn light',
    hashtags: ['#RecruitJacob', '#OLLife', '#ClassOf2029'],
    target_coaches_to_tag: [],
    approval_status: 'pending',
    panel_status: 'panel_approved',
    post_formula: 'ambient_update',
    psychology_mechanism: 'scene-setting reveals work ethic naturally without claiming it, specific detail shows purpose',
  },

  // post-017: Narrative Loop — remove bravado, set up open loop
  {
    id: 'post-017',
    draft_text:
      'Spring practice week 2 highlight: finished 8 of 10 blocks through the whistle. Coach Davis challenged our OL room to hit 9 of 10 by week 4. We\'re tracking it on the board. I\'ll report back. #RecruitJacob #PewaukeeFootball #D3Football',
    pillar: 'performance',
    post_type: 'film_clip',
    scheduled_time: '2026-04-15T23:00:00Z', // Wed
    suggested_media:
      'Edited highlight clip of best finished blocks from spring practice',
    hashtags: ['#RecruitJacob', '#PewaukeeFootball', '#D3Football', '#OLLife'],
    target_coaches_to_tag: ['@CoachRindahl', '@CoachE_Blugolds', '@CoachVenne'],
    approval_status: 'pending',
    panel_status: 'panel_approved',
    post_formula: 'narrative_loop',
    psychology_mechanism: 'sets measurable team challenge with open loop, invites follow-up and accountability',
  },
];

/**
 * Filter posts by content pillar
 */
export function getPostsByPillar(pillar: string): ScheduledPost[] {
  return contentCalendar30d.filter((p) => p.pillar === pillar);
}

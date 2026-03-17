/**
 * 30-Day Content Calendar for Jacob Rodgers (@JacobRodge52987)
 * March 17 – April 16, 2026
 *
 * Schedule: Mon/Wed/Fri at 6 PM CT (23:00 UTC) + select weekend posts
 * Pillar distribution: Performance (7), Work Ethic (7), Character (3)
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
}

export const contentCalendar30d: ScheduledPost[] = [
  // Week 1
  {
    id: 'post-001',
    draft_text:
      'After-school film breakdown today. Watched 3 games of UW-Whitewater OL scheme. Learning their gap blocking system. The film never lies. #RecruitJacob #WIAC #D3Football',
    pillar: 'performance',
    post_type: 'film_clip',
    scheduled_time: '2026-03-18T23:00:00Z', // Wed
    suggested_media: 'Screen recording of film study iPad with play diagrams highlighted',
    hashtags: ['#RecruitJacob', '#WIAC', '#D3Football', '#FilmDontLie'],
    target_coaches_to_tag: ['@CoachRindahl'],
    approval_status: 'pending',
  },
  {
    id: 'post-002',
    draft_text:
      '4:45 AM alarm. First one in the weight room. 315 bench PR this week. Nobody outworks me. #GrindSZN #RecruitJacob #OLLife',
    pillar: 'work_ethic',
    post_type: 'training',
    scheduled_time: '2026-03-20T23:00:00Z', // Fri
    suggested_media: 'Video clip of bench press PR with spotter and gym background',
    hashtags: ['#GrindSZN', '#RecruitJacob', '#OLLife', '#StrengthTraining'],
    target_coaches_to_tag: [],
    approval_status: 'pending',
  },
  {
    id: 'post-003',
    draft_text:
      'Week 1 recap: 4 lifts, 2 film sessions, 1 new bench PR. Stacking days. Spring ball is right around the corner. #PewaukeeFootball #ClassOf2029',
    pillar: 'work_ethic',
    post_type: 'recap',
    scheduled_time: '2026-03-21T23:00:00Z', // Sat
    suggested_media: 'Collage of weekly training highlights',
    hashtags: ['#PewaukeeFootball', '#ClassOf2029', '#RecruitJacob'],
    target_coaches_to_tag: [],
    approval_status: 'pending',
  },
  {
    id: 'post-004',
    draft_text:
      'New week, new goals. Outwork yesterday every single day. No shortcuts, just reps. #RecruitJacob #GrindSZN',
    pillar: 'work_ethic',
    post_type: 'motivation',
    scheduled_time: '2026-03-22T23:00:00Z', // Sun
    suggested_media: 'Photo of handwritten weekly goals on whiteboard',
    hashtags: ['#RecruitJacob', '#GrindSZN', '#ClassOf2029'],
    target_coaches_to_tag: [],
    approval_status: 'pending',
  },
  // Week 2
  {
    id: 'post-005',
    draft_text:
      'Pulled up UW-Eau Claire film from last season. Their DL runs a lot of slant techniques — perfect for working my kick slide. Notes in the playbook. #FilmDontLie #WIAC',
    pillar: 'performance',
    post_type: 'film_clip',
    scheduled_time: '2026-03-23T23:00:00Z', // Mon
    suggested_media: 'Photo of notebook with hand-drawn blocking assignments',
    hashtags: ['#FilmDontLie', '#WIAC', '#RecruitJacob', '#D3Football'],
    target_coaches_to_tag: ['@CoachE_Blugolds'],
    approval_status: 'pending',
  },
  {
    id: 'post-006',
    draft_text:
      'Honored to be named team captain for spring practice. Leadership isn\'t about the title — it\'s about showing up every day. #TeamFirst #RecruitJacob',
    pillar: 'character',
    post_type: 'motivation',
    scheduled_time: '2026-03-25T23:00:00Z', // Wed
    suggested_media: 'Photo with teammates at practice, captain patch visible',
    hashtags: ['#TeamFirst', '#RecruitJacob', '#PewaukeeFootball'],
    target_coaches_to_tag: [],
    approval_status: 'pending',
  },
  {
    id: 'post-007',
    draft_text:
      'Squat day. Hit 405 for a double. Legs are the engine for everything on the line. Keep building the base. #StrengthTraining #OLLife #RecruitJacob',
    pillar: 'performance',
    post_type: 'measurables',
    scheduled_time: '2026-03-27T23:00:00Z', // Fri
    suggested_media: 'Video of squat set with weight clearly visible on bar',
    hashtags: ['#StrengthTraining', '#OLLife', '#RecruitJacob', '#GrindSZN'],
    target_coaches_to_tag: [],
    approval_status: 'pending',
  },
  {
    id: 'post-008',
    draft_text:
      'Stayed after practice to work extra reps with the younger guys. Iron sharpens iron. We all get better together. #TeamFirst #PewaukeeFootball',
    pillar: 'character',
    post_type: 'motivation',
    scheduled_time: '2026-03-28T23:00:00Z', // Sat
    suggested_media: 'Photo of post-practice huddle with younger players',
    hashtags: ['#TeamFirst', '#PewaukeeFootball', '#RecruitJacob'],
    target_coaches_to_tag: [],
    approval_status: 'pending',
  },
  // Week 3
  {
    id: 'post-009',
    draft_text:
      '6 AM footwork ladder before school. Quick feet win battles in the trenches. Every rep counts. #OLLife #RecruitJacob #ClassOf2029',
    pillar: 'work_ethic',
    post_type: 'training',
    scheduled_time: '2026-03-30T23:00:00Z', // Mon
    suggested_media: 'Video of agility ladder footwork drills at school field',
    hashtags: ['#OLLife', '#RecruitJacob', '#ClassOf2029', '#GrindSZN'],
    target_coaches_to_tag: [],
    approval_status: 'pending',
  },
  {
    id: 'post-010',
    draft_text:
      'Broke down UW-Oshkosh film tonight. Their LBs blitz a lot from the edge — gotta be ready with my pass pro sets. Love the chess match. #WIAC #D3Football',
    pillar: 'performance',
    post_type: 'film_clip',
    scheduled_time: '2026-04-01T23:00:00Z', // Wed
    suggested_media: 'Screenshot of game film with arrows showing blitz paths',
    hashtags: ['#WIAC', '#D3Football', '#RecruitJacob', '#FilmDontLie'],
    target_coaches_to_tag: ['@CoachVenne'],
    approval_status: 'pending',
  },
  {
    id: 'post-011',
    draft_text:
      'Friday speed work. Ran a 5.08 forty today — shaved 0.1 off last month. For a 265 lb lineman, speed matters. #RecruitJacob #OLLife #ClassOf2029',
    pillar: 'performance',
    post_type: 'measurables',
    scheduled_time: '2026-04-03T23:00:00Z', // Fri
    suggested_media: 'Photo of stopwatch or timing system showing 5.08',
    hashtags: ['#RecruitJacob', '#OLLife', '#ClassOf2029', '#D3Football'],
    target_coaches_to_tag: [],
    approval_status: 'pending',
  },
  {
    id: 'post-012',
    draft_text:
      'Spent Saturday morning volunteering at the Pewaukee youth football camp. Teaching the next generation how to fire off the line. Giving back feels good. #TeamFirst',
    pillar: 'character',
    post_type: 'motivation',
    scheduled_time: '2026-04-05T23:00:00Z', // Sun
    suggested_media: 'Photo coaching youth players at community football camp',
    hashtags: ['#TeamFirst', '#PewaukeeFootball', '#RecruitJacob'],
    target_coaches_to_tag: [],
    approval_status: 'pending',
  },
  // Week 4
  {
    id: 'post-013',
    draft_text:
      'Spring practice day 1 in the books. Worked double teams and combo blocks all afternoon. Bringing that film study to the field. #PewaukeeFootball #RecruitJacob',
    pillar: 'work_ethic',
    post_type: 'training',
    scheduled_time: '2026-04-06T23:00:00Z', // Mon
    suggested_media: 'Action photo from spring practice, OL drill work',
    hashtags: ['#PewaukeeFootball', '#RecruitJacob', '#OLLife'],
    target_coaches_to_tag: [],
    approval_status: 'pending',
  },
  {
    id: 'post-014',
    draft_text:
      'Power clean PR today — 255 lbs. Explosive hips are everything for pulling and trapping on the line. Building that next-level power. #StrengthTraining #RecruitJacob',
    pillar: 'performance',
    post_type: 'measurables',
    scheduled_time: '2026-04-08T23:00:00Z', // Wed
    suggested_media: 'Video of power clean PR with celebration',
    hashtags: ['#StrengthTraining', '#RecruitJacob', '#GrindSZN', '#OLLife'],
    target_coaches_to_tag: [],
    approval_status: 'pending',
  },
  {
    id: 'post-015',
    draft_text:
      'Extra film session after dinner. Watching my own spring practice reps. Gotta fix my hand placement on reach blocks. Always finding ways to improve. #FilmDontLie',
    pillar: 'work_ethic',
    post_type: 'film_clip',
    scheduled_time: '2026-04-10T23:00:00Z', // Fri
    suggested_media: 'Photo of laptop with game film paused on blocking technique',
    hashtags: ['#FilmDontLie', '#RecruitJacob', '#ClassOf2029'],
    target_coaches_to_tag: [],
    approval_status: 'pending',
  },
  {
    id: 'post-016',
    draft_text:
      'Monday grind. 5 AM band work before school then full spring practice after. Two-a-days build champions. #GrindSZN #RecruitJacob #OLLife',
    pillar: 'work_ethic',
    post_type: 'training',
    scheduled_time: '2026-04-13T23:00:00Z', // Mon
    suggested_media: 'Split image: early morning band work and afternoon practice',
    hashtags: ['#GrindSZN', '#RecruitJacob', '#OLLife', '#ClassOf2029'],
    target_coaches_to_tag: [],
    approval_status: 'pending',
  },
  {
    id: 'post-017',
    draft_text:
      'Pancake highlight reel from spring practice week 2. Finishing blocks through the whistle. DL hates seeing me pull. #RecruitJacob #PewaukeeFootball #D3Football',
    pillar: 'performance',
    post_type: 'film_clip',
    scheduled_time: '2026-04-15T23:00:00Z', // Wed
    suggested_media: 'Edited highlight clip of best pancake blocks from spring practice',
    hashtags: ['#RecruitJacob', '#PewaukeeFootball', '#D3Football', '#OLLife'],
    target_coaches_to_tag: ['@CoachRindahl', '@CoachE_Blugolds', '@CoachVenne'],
    approval_status: 'pending',
  },
];

/**
 * Filter posts by content pillar
 */
export function getPostsByPillar(pillar: string): ScheduledPost[] {
  return contentCalendar30d.filter((p) => p.pillar === pillar);
}

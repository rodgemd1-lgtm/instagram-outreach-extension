// 60-Day Outreach Schedule — 8-Step Cadence for 40 Coaches
// Start date: March 17, 2026. Window ends May 16, 2026.

export interface OutreachAction {
  id: string;
  coach_slug: string;
  coach_name: string;
  school: string;
  action_type: 'follow' | 'like' | 'reply' | 'mention' | 'dm' | 'email' | 'followup' | 'status_check';
  step_number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  wave: 0 | 1 | 2 | 3;
  scheduled_date: string;
  status: 'pending' | 'approved' | 'executed' | 'skipped';
  template: string | null;
  follow_back_check_date: string | null;
  notes: string;
}

// ── Coach rosters per wave ──────────────────────────────────────────

interface CoachDef {
  slug: string;
  name: string;
  school: string;
  detail: string; // used in DM/email personalization
}

const wave0Coaches: CoachDef[] = [
  { slug: 'uw-whitewater-rindahl', name: 'Jace Rindahl', school: 'UW-Whitewater', detail: 'dominant WIAC run game' },
  { slug: 'uw-oshkosh-jennings', name: 'Peter Jennings', school: 'UW-Oshkosh', detail: 'strong OL development pipeline' },
  { slug: 'uw-eau-claire-erickson', name: 'Rob Erickson', school: 'UW-Eau Claire', detail: 'physical brand of football' },
  { slug: 'uw-la-crosse-zweifel', name: 'Michael Zweifel', school: 'UW-La Crosse', detail: 'competitive WIAC program' },
  { slug: 'uw-stevens-point-venne', name: 'Luke Venne', school: 'UW-Stevens Point', detail: 'up-and-coming program culture' },
  { slug: 'uw-platteville-munz', name: 'Ryan Munz', school: 'UW-Platteville', detail: 'blue-collar work ethic' },
  { slug: 'uw-stout-birmingham', name: 'Clayt Birmingham', school: 'UW-Stout', detail: 'player-first development approach' },
  { slug: 'uw-river-falls-tbd', name: 'TBD', school: 'UW-River Falls', detail: 'growing program in the WIAC' },
];

const wave1Coaches: CoachDef[] = [
  { slug: 'north-central-il-kacz', name: 'Jeff Thorne', school: 'North Central (IL)', detail: 'back-to-back Stagg Bowl contender' },
  { slug: 'wittenberg-ohara', name: "Zach O'Hara", school: 'Wittenberg', detail: 'strong NCAC tradition' },
  { slug: 'mount-union-vince', name: 'Vince Kehres', school: 'Mount Union', detail: 'winning tradition in the OAC' },
  { slug: 'wheaton-il-swider', name: 'Mike Swider', school: 'Wheaton (IL)', detail: 'excellent academics and football' },
  { slug: 'augustana-il-ostien', name: 'Steve Ostien', school: 'Augustana (IL)', detail: 'CCIW powerhouse' },
  { slug: 'wabash-raeburn', name: 'Don Raeburn', school: 'Wabash', detail: 'physical Midwest D3 style' },
  { slug: 'hope-mi-stuursma', name: 'Peter Stuursma', school: 'Hope (MI)', detail: 'balanced offensive system' },
  { slug: 'st-norbert-brock', name: 'Dan Brock', school: "St. Norbert", detail: 'strong Wisconsin pipeline' },
  { slug: 'carthage-nettles', name: 'Dustin Nettles', school: 'Carthage', detail: 'local Kenosha program with OL focus' },
  { slug: 'millikin-hahn', name: 'Dan Hahn', school: 'Millikin', detail: 'CCIW competitor building momentum' },
  { slug: 'carroll-univ-meyer', name: 'Mike Meyer', school: 'Carroll University', detail: 'Waukesha-based with WI ties' },
  { slug: 'lakeland-wagner', name: 'Keith Wagner', school: 'Lakeland', detail: 'NAC program developing fast' },
];

const wave2Coaches: CoachDef[] = [
  { slug: 'minnesota-duluth-schlafke', name: 'Curt Wiese', school: 'Minnesota Duluth', detail: 'perennial D2 playoff team' },
  { slug: 'wayne-state-ne-mclennan', name: 'Logan Masters', school: 'Wayne State (NE)', detail: 'NSIC OL tradition' },
  { slug: 'grand-valley-st-mitchell', name: 'Matt Mitchell', school: 'Grand Valley State', detail: 'elite D2 program nationally' },
  { slug: 'ferris-state-annese', name: 'Tony Annese', school: 'Ferris State', detail: 'recent national championship success' },
  { slug: 'ashland-fine', name: 'Lee Owens', school: 'Ashland', detail: 'GLIAC contender with OL need' },
  { slug: 'indianapolis-moore', name: 'Chris Moore', school: 'Indianapolis', detail: 'GLVC program recruiting WI' },
  { slug: 'truman-state-wren', name: 'Gregg Nesbitt', school: 'Truman State', detail: 'GLVC academic-athletic program' },
  { slug: 'northwest-mo-lippert', name: 'Rich Wright', school: 'Northwest Missouri State', detail: 'D2 dynasty culture' },
  { slug: 'sioux-falls-aldrich', name: 'Jon Anderson', school: 'Sioux Falls', detail: 'NSIC program on the rise' },
  { slug: 'winona-state-sawyer', name: 'Brian Bergstrom', school: 'Winona State', detail: 'NSIC with Wisconsin recruiting ties' },
  { slug: 'pittsburg-state-beck', name: 'Brian Wright', school: 'Pittsburg State', detail: 'MIAA powerhouse' },
  { slug: 'bemidji-state-beil', name: 'Brent Bolte', school: 'Bemidji State', detail: 'NSIC program recruiting upper Midwest' },
];

const wave3Coaches: CoachDef[] = [
  { slug: 'north-dakota-st-entz', name: 'Tim Polasek', school: 'North Dakota State', detail: 'FCS dynasty and OL factory' },
  { slug: 'south-dakota-st-stiegelmeier', name: 'Jimmy Rogers', school: 'South Dakota State', detail: 'reigning FCS champion' },
  { slug: 'northern-iowa-farley', name: 'Mark Farley', school: 'Northern Iowa', detail: 'MVFC stalwart program' },
  { slug: 'illinois-state-hendrick', name: 'Brock Spack', school: 'Illinois State', detail: 'MVFC contender with WI ties' },
  { slug: 'western-illinois-nix', name: 'Myers Hendrickson', school: 'Western Illinois', detail: 'rebuilding MVFC program' },
  { slug: 'southern-illinois-hill', name: 'Nick Hill', school: 'Southern Illinois', detail: 'MVFC program investing in OL' },
  { slug: 'youngstown-state-heacock', name: 'Doug Phillips', school: 'Youngstown State', detail: 'FCS program with Midwest recruiting' },
  { slug: 'missouri-state-petrino', name: 'Ryan Beard', school: 'Missouri State', detail: 'MVFC program building culture' },
];

// ── Date helpers ────────────────────────────────────────────────────

const START_DATE = new Date('2026-03-17T00:00:00');

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function toISO(d: Date): string {
  return d.toISOString().split('T')[0] + 'T09:00:00';
}

// Wave start offsets (days from START_DATE)
const WAVE_OFFSETS: Record<number, number> = {
  0: 0,   // March 17
  1: 14,  // March 31
  2: 28,  // April 14
  3: 42,  // April 28
};

// 8-step cadence: [stepNumber, dayOffset, actionType]
const CADENCE: Array<[1|2|3|4|5|6|7|8, number, OutreachAction['action_type']]> = [
  [1, 0,  'follow'],
  [2, 2,  'like'],
  [3, 4,  'reply'],
  [4, 6,  'mention'],
  [5, 9,  'dm'],
  [6, 13, 'email'],
  [7, 20, 'followup'],
  [8, 29, 'status_check'],
];

// ── Template generators ─────────────────────────────────────────────

function dmTemplate(coach: CoachDef): string {
  return `Coach ${coach.name}, I'm Jacob Rodgers — Class of 2029 OL/DL from Pewaukee HS (WI). 6'1", 285 lbs. I've been following ${coach.school}'s program and love the ${coach.detail}. Would love to learn more about your program. Here's my film: [hudl link]. #RecruitJacob`;
}

function emailTemplate(coach: CoachDef): string {
  return `Dear Coach ${coach.name},\n\nMy name is Jacob Rodgers, a Class of 2029 OL/DL from Pewaukee High School in Wisconsin (6'1", 285 lbs). I've been following ${coach.school}'s program closely and I'm impressed by the ${coach.detail}.\n\nI would welcome the opportunity to learn more about ${coach.school} and how I might contribute to your team. I've attached my highlight film link below.\n\nFilm: [hudl link]\nTwitter: @JacobRodgers2029\n\nThank you for your time, Coach.\n\nSincerely,\nJacob Rodgers\n#RecruitJacob`;
}

function followupTemplate(coach: CoachDef): string {
  return `Coach ${coach.name}, just following up — I'm Jacob Rodgers (2029 OL/DL, Pewaukee HS, WI). Wanted to make sure you saw my film. Would love to connect about ${coach.school}. [hudl link] #RecruitJacob`;
}

// ── Schedule generation ─────────────────────────────────────────────

function generateSchedule(): OutreachAction[] {
  const allWaves: Array<{ wave: 0|1|2|3; coaches: CoachDef[] }> = [
    { wave: 0, coaches: wave0Coaches },
    { wave: 1, coaches: wave1Coaches },
    { wave: 2, coaches: wave2Coaches },
    { wave: 3, coaches: wave3Coaches },
  ];

  const actions: OutreachAction[] = [];
  let actionId = 1;

  // Track actions per calendar date for the 7-per-day cap
  const dateCount: Record<string, number> = {};

  for (const { wave, coaches } of allWaves) {
    const waveStart = addDays(START_DATE, WAVE_OFFSETS[wave]);

    for (let ci = 0; ci < coaches.length; ci++) {
      const coach = coaches[ci];

      for (const [stepNumber, dayOffset, actionType] of CADENCE) {
        // Stagger coaches within a wave: spread by adding coach index offset
        // Each coach in the wave starts 1 day apart for steps that land on the same day
        const rawDate = addDays(waveStart, dayOffset);

        // Apply per-coach stagger to avoid exceeding 7 actions/day
        let finalDate = rawDate;
        const staggerDays = ci; // coach 0 = +0, coach 1 = +1, etc.
        let candidateDate = addDays(rawDate, staggerDays);
        let dateKey = candidateDate.toISOString().split('T')[0];

        // If this date already has 7 actions, push to next available day
        while ((dateCount[dateKey] || 0) >= 7) {
          candidateDate = addDays(candidateDate, 1);
          dateKey = candidateDate.toISOString().split('T')[0];
        }
        finalDate = candidateDate;

        dateCount[dateKey] = (dateCount[dateKey] || 0) + 1;

        let template: string | null = null;
        let followBackCheckDate: string | null = null;
        let notes = '';

        switch (actionType) {
          case 'follow':
            followBackCheckDate = toISO(addDays(finalDate, 3));
            notes = `Follow ${coach.name}'s personal X account`;
            break;
          case 'like':
            notes = `Like 2-3 recent posts from ${coach.name}`;
            break;
          case 'reply':
            notes = `Reply to a recruiting tweet from ${coach.name}`;
            break;
          case 'mention':
            notes = `@mention ${coach.name} in a training/film post`;
            break;
          case 'dm':
            template = dmTemplate(coach);
            notes = `DM ${coach.name} if followed back — check follow status first`;
            break;
          case 'email':
            template = emailTemplate(coach);
            notes = `Email outreach to ${coach.name} if no X response`;
            break;
          case 'followup':
            template = followupTemplate(coach);
            notes = `Follow-up DM or email to ${coach.name}`;
            break;
          case 'status_check':
            notes = `Status check on ${coach.name} — escalate or archive based on engagement`;
            break;
        }

        actions.push({
          id: `action-${String(actionId).padStart(3, '0')}`,
          coach_slug: coach.slug,
          coach_name: coach.name,
          school: coach.school,
          action_type: actionType,
          step_number: stepNumber,
          wave,
          scheduled_date: toISO(finalDate),
          status: 'pending',
          template,
          follow_back_check_date: followBackCheckDate,
          notes,
        });

        actionId++;
      }
    }
  }

  return actions;
}

export const outreachSchedule60d: OutreachAction[] = generateSchedule();

// ── Query helpers ───────────────────────────────────────────────────

export function getActionsByWeek(weekNum: number): OutreachAction[] {
  const weekStart = addDays(START_DATE, (weekNum - 1) * 7);
  const weekEnd = addDays(weekStart, 7);
  return outreachSchedule60d.filter(a => {
    const d = new Date(a.scheduled_date);
    return d >= weekStart && d < weekEnd;
  });
}

export function getActionsByCoach(slug: string): OutreachAction[] {
  return outreachSchedule60d.filter(a => a.coach_slug === slug);
}

export function getActionsByType(type: string): OutreachAction[] {
  return outreachSchedule60d.filter(a => a.action_type === type);
}

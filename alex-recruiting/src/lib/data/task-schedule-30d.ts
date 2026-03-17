/**
 * 30-Day Task Schedule for Jacob Rodgers' recruiting campaign
 * March 17, 2026 (Tuesday) through April 15, 2026 (Wednesday)
 */

export interface ScheduledTask {
  id: string;
  title: string;
  description: string;
  date: string;     // YYYY-MM-DD
  time: string;     // HH:MM (24h)
  type: 'engagement' | 'content_post' | 'outreach_action' | 'film_study' | 'weekly_review' | 'metric_check' | 'strategy_adjust';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  priority: 1 | 2 | 3;
  related_coach_slug?: string;
  related_post_id?: string;
  notes?: string;
}

// Varied engagement descriptions (morning check)
const engagementDescriptions: string[] = [
  'Check if Coach Rindahl liked your latest post',
  'Respond to any DMs from coaches or recruiting accounts',
  'Check notifications — reply to any coach interactions within 30 min',
  'Review overnight engagement — any new coach follows or likes?',
  'Check if any WIAC coaches commented on your highlight reel',
  'Respond to Coach Dressen if he engaged with your content',
  'Review notifications — prioritize D3 coach interactions',
  'Check for new follower requests from coaching staff accounts',
  'Look for coach engagement on your film breakdown post',
  'Check if any Pewaukee teammates tagged you — engage back quickly',
  'Review if UW-Whitewater staff liked your latest training clip',
  'Check notifications and reply to any recruiting-related mentions',
  'See if Coach Bullis from UW-Oshkosh engaged with your content',
  'Review morning notifications — coaches often check X before practice',
  'Check if any new D3 programs followed you overnight',
  'Look for engagement from UW-Platteville coaching staff',
  'Review DMs — any coaches reaching out after your last post?',
  'Check if Carroll University coaches interacted with your content',
  'Scan notifications for any recruit camp invite DMs',
  'Check if North Central College staff engaged with your highlight',
  'Review overnight activity — any new CCIW coach follows?',
  'Check notifications and engage with any coach replies promptly',
];

// Varied outreach descriptions (afternoon)
const outreachDescriptions: string[] = [
  'Like 3 coach posts, reply to 1 peer recruit thread',
  'Engage with Coach Rindahl\'s latest team post — thoughtful comment',
  'Like recent posts from 3 WIAC position coaches',
  'Reply to @PrepRedzone\'s latest ranking thread with your stats',
  'Engage with 2 D3 football program posts, follow 1 new coach',
  'Comment on a peer recruit\'s highlight — build the network',
  'Like Coach Dressen\'s practice update, reply to a recruit\'s question',
  'Engage with WisSports content, reply to 1 recruiting discussion',
  'Like 3 UW-Whitewater football posts, comment on 1',
  'Reply to a WIAC coach\'s recruiting day announcement',
  'Engage with Pewaukee football\'s latest post, tag position coaches',
  'Like posts from 3 D3 OL/DL coaches, reply to 1 recruiting tip thread',
  'Comment on a CCIW program\'s spring practice post',
  'Engage with @D3football content, like 2 coach posts',
  'Reply to a film breakdown thread with your own technique insight',
  'Like UW-Oshkosh football posts, engage with a peer recruit',
  'Comment on a strength coach\'s training post with your own PR',
  'Engage with 3 target school posts, follow 1 new position coach',
  'Reply to a D3 recruiting coordinator\'s Q&A thread',
  'Like Carroll University football content, comment on their spring game post',
  'Engage with MWC program posts, expand beyond WIAC targets',
  'Comment thoughtfully on a coach\'s player development post',
];

// Varied content post descriptions (Mon/Wed/Fri)
const contentPostDescriptions: string[] = [
  'Post bench press PR video — 315 lbs with clean form',
  'Share OL pass-pro drill clip from today\'s practice',
  'Post squat day highlights — 455 lbs for reps',
  'Share DL swim move technique breakdown from film study',
  'Post game film highlight — pancake block on 3rd & short',
  'Share morning workout clip — explosive med ball throws',
  'Post 40-yard dash improvement update with split times',
  'Share OL pull technique drill from practice',
  'Post clean & jerk PR — 245 lbs, recruiting-ready caption',
  'Share practice film — double team block springing a TD run',
  'Post agility ladder footwork drill clip',
  'Share DL bull rush technique from 1-on-1 drills',
  'Post deadlift PR — 500 lbs, tag strength coach',
  'Share film breakdown: reading defensive fronts pre-snap',
  'Post combine-style workout highlights',
  'Share OL combo block to linebacker execution clip',
  'Post vertical jump test results with improvement stats',
  'Share game film — 4th quarter drive with key blocks highlighted',
  'Post power clean technique video — coaches love explosiveness',
  'Share practice rep: pass-pro against speed rush',
];

// Varied metric check descriptions (evening)
const metricCheckDescriptions: string[] = [
  'Review today\'s follower growth and engagement rate',
  'Check which posts got the most coach impressions today',
  'Review this week\'s follower growth and engagement rate',
  'Analyze which content type performed best today',
  'Check DM response rates and new coach connections',
  'Review post reach — are coaches seeing your content?',
  'Check engagement metrics — comments matter more than likes',
  'Review follower quality — how many new coach/program follows?',
  'Analyze best posting time based on today\'s engagement data',
  'Check if your highlight reel post outperformed training clips',
  'Review weekly engagement trends — adjust strategy if needed',
  'Check which hashtags drove the most profile visits',
  'Review impressions on your latest film breakdown post',
  'Analyze follower growth rate — on track for monthly goal?',
  'Check engagement from target school accounts specifically',
  'Review content performance — film clips vs. training content',
  'Check profile visit trends after today\'s outreach actions',
  'Review DM open rates and response times',
  'Analyze which coaches are consistently engaging',
  'Check if engagement rate is above 5% benchmark',
  'Review this week\'s best-performing post and note why',
  'Check follower growth against weekly target of 15-20 new follows',
];

// Saturday tasks
const saturdayTaskSets: { title: string; description: string; type: ScheduledTask['type']; time: string; priority: 1 | 2 | 3 }[][] = [
  [
    { title: 'Game Recap Post', description: 'Post game recap with key stats and highlights from this week\'s film', type: 'content_post', time: '10:00', priority: 1 },
    { title: 'Film Study Session', description: 'Watch 30 min of game film — focus on OL technique and identify 2 coaching points', type: 'film_study', time: '14:00', priority: 2 },
    { title: 'Weekend Engagement', description: 'Engage with Saturday game day posts from target programs', type: 'outreach_action', time: '18:00', priority: 2 },
  ],
  [
    { title: 'Highlight Reel Update', description: 'Cut and post updated highlight reel with best plays from recent games', type: 'content_post', time: '11:00', priority: 1 },
    { title: 'DL Film Breakdown', description: 'Study DL pass rush moves from college film — 3 techniques to practice', type: 'film_study', time: '15:00', priority: 2 },
  ],
  [
    { title: 'Training Day Recap', description: 'Post Saturday morning workout recap — heavy squats and cleans', type: 'content_post', time: '10:00', priority: 1 },
    { title: 'OL Film Study', description: 'Break down 3 plays from D3 film — combo blocks and zone scheme', type: 'film_study', time: '13:00', priority: 2 },
    { title: 'Peer Recruit Engagement', description: 'Engage with 5 peer recruit posts — build relationships in Class of 2029', type: 'outreach_action', time: '17:00', priority: 3 },
  ],
  [
    { title: 'Weekly Highlight Post', description: 'Post best training clip of the week with recruiting hashtags', type: 'content_post', time: '10:00', priority: 1 },
    { title: 'Film Study: Opponent Breakdown', description: 'Watch opponent film to identify tendencies — post a takeaway thread', type: 'film_study', time: '14:00', priority: 2 },
  ],
  [
    { title: 'Game Day Content', description: 'Post pre-game routine and mental prep — coaches value this mindset', type: 'content_post', time: '09:00', priority: 1 },
    { title: 'Post-Game Film Notes', description: 'Jot down 3 things you did well and 2 areas to improve from today\'s game', type: 'film_study', time: '20:00', priority: 2 },
    { title: 'Saturday Night Engagement', description: 'Like and comment on game results from target WIAC programs', type: 'outreach_action', time: '21:00', priority: 3 },
  ],
];

// Sunday tasks with weekly milestones
const weeklyMilestones: string[] = [
  'W1: Complete WIAC follow wave, post intro content. Follow all WIAC OL/DL coaches and post introductory recruiting content.',
  'W2: First DM attempts to coaches who followed back. Send personalized DMs to coaches who engaged this week.',
  'W3: Expand to CCIW/MWC, review content performance. Broaden target list and analyze what content resonates.',
  'W4: Monthly retrospective, adjust strategy. Full review of 30-day campaign — what worked, what to change.',
];

const sundayTaskSets: { title: string; description: string; type: ScheduledTask['type']; time: string; priority: 1 | 2 | 3; notes?: string }[][] = [
  [
    { title: 'Weekly Review: WIAC Follow Wave', description: 'Review Week 1 progress — how many WIAC coaches followed back? Engagement rate?', type: 'weekly_review', time: '10:00', priority: 1, notes: weeklyMilestones[0] },
    { title: 'Plan Next Week\'s Content', description: 'Outline Mon/Wed/Fri posts for next week — mix training, film, and personality content', type: 'strategy_adjust', time: '14:00', priority: 2 },
    { title: 'Update Recruiting Journal', description: 'Log this week\'s wins, new connections, and lessons learned', type: 'weekly_review', time: '19:00', priority: 2 },
  ],
  [
    { title: 'Weekly Review: DM Campaign', description: 'Review Week 2 — DM response rates, new conversations started, engagement trends', type: 'weekly_review', time: '10:00', priority: 1, notes: weeklyMilestones[1] },
    { title: 'Content Strategy Adjustment', description: 'Analyze which content types got the most coach engagement — double down on winners', type: 'strategy_adjust', time: '14:00', priority: 2 },
    { title: 'Weekly Journal Update', description: 'Document new coach connections, DM conversations, and strategy pivots', type: 'weekly_review', time: '19:00', priority: 2 },
  ],
  [
    { title: 'Weekly Review: Conference Expansion', description: 'Review Week 3 — CCIW/MWC outreach results, content performance analysis', type: 'weekly_review', time: '10:00', priority: 1, notes: weeklyMilestones[2] },
    { title: 'Plan Expanded Outreach', description: 'Identify 5 new programs to target based on this week\'s engagement data', type: 'strategy_adjust', time: '14:00', priority: 2 },
    { title: 'Weekly Journal & Metrics', description: 'Log follower growth curve, best posts, and coach engagement quality', type: 'weekly_review', time: '19:00', priority: 2 },
  ],
  [
    { title: 'Monthly Retrospective', description: 'Full 30-day review — follower growth, coach connections, DM success rate, content wins', type: 'weekly_review', time: '10:00', priority: 1, notes: weeklyMilestones[3] },
    { title: 'Strategy Overhaul Planning', description: 'Based on 30-day data, plan next month\'s approach — what to keep, drop, and try new', type: 'strategy_adjust', time: '14:00', priority: 1 },
    { title: 'Final Journal Entry', description: 'Write comprehensive month-end journal — top 3 wins, biggest lesson, next month goals', type: 'weekly_review', time: '19:00', priority: 2 },
  ],
];

/**
 * Helper: add days to a YYYY-MM-DD string and return a new YYYY-MM-DD string.
 * Uses pure arithmetic to avoid timezone issues with Date parsing.
 */
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00'); // noon UTC avoids DST edge cases
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

function getDayOfWeek(dateStr: string): number {
  // Match the behavior of new Date('YYYY-MM-DD').getDay() used in tests
  return new Date(dateStr).getDay();
}

function generateTasks(): ScheduledTask[] {
  const tasks: ScheduledTask[] = [];
  const startDateStr = '2026-03-17'; // March 17, 2026 (Tuesday)
  let taskId = 1;
  let saturdayIndex = 0;
  let sundayIndex = 0;

  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const dateStr = addDays(startDateStr, dayOffset);
    const dayOfWeek = getDayOfWeek(dateStr); // 0=Sun, 1=Mon, ..., 6=Sat

    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // Weekday tasks
      const engIdx = dayOffset % engagementDescriptions.length;
      const outIdx = dayOffset % outreachDescriptions.length;
      const metIdx = dayOffset % metricCheckDescriptions.length;

      // 07:00 — Engagement check
      tasks.push({
        id: `task-${String(taskId++).padStart(3, '0')}`,
        title: 'Morning Engagement Check',
        description: engagementDescriptions[engIdx],
        date: dateStr,
        time: '07:00',
        type: 'engagement',
        status: 'pending',
        priority: 1,
      });

      // 15:00 — Outreach action
      tasks.push({
        id: `task-${String(taskId++).padStart(3, '0')}`,
        title: 'Afternoon Outreach',
        description: outreachDescriptions[outIdx],
        date: dateStr,
        time: '15:00',
        type: 'outreach_action',
        status: 'pending',
        priority: 2,
      });

      // 18:00 — Content post (Mon/Wed/Fri only)
      if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
        const contentIdx = dayOffset % contentPostDescriptions.length;
        tasks.push({
          id: `task-${String(taskId++).padStart(3, '0')}`,
          title: 'Scheduled Content Post',
          description: contentPostDescriptions[contentIdx],
          date: dateStr,
          time: '18:00',
          type: 'content_post',
          status: 'pending',
          priority: 1,
        });
      }

      // 21:00 — Metric check
      tasks.push({
        id: `task-${String(taskId++).padStart(3, '0')}`,
        title: 'Evening Metrics Review',
        description: metricCheckDescriptions[metIdx],
        date: dateStr,
        time: '21:00',
        type: 'metric_check',
        status: 'pending',
        priority: 3,
      });

      // On Tue/Thu, add a film study or strategy task to ensure at least 4 tasks
      if (dayOfWeek === 2 || dayOfWeek === 4) {
        tasks.push({
          id: `task-${String(taskId++).padStart(3, '0')}`,
          title: dayOfWeek === 2 ? 'Midweek Film Review' : 'Pre-Weekend Strategy Check',
          description: dayOfWeek === 2
            ? 'Watch 15 min of practice film — identify 1 OL and 1 DL improvement area'
            : 'Review this week\'s engagement data and prep weekend content ideas',
          date: dateStr,
          time: '18:00',
          type: dayOfWeek === 2 ? 'film_study' : 'strategy_adjust',
          status: 'pending',
          priority: 2,
        });
      }

    } else if (dayOfWeek === 6) {
      // Saturday
      const satTasks = saturdayTaskSets[saturdayIndex % saturdayTaskSets.length];
      saturdayIndex++;
      for (const st of satTasks) {
        tasks.push({
          id: `task-${String(taskId++).padStart(3, '0')}`,
          title: st.title,
          description: st.description,
          date: dateStr,
          time: st.time,
          type: st.type,
          status: 'pending',
          priority: st.priority,
        });
      }
    } else {
      // Sunday
      const sunTasks = sundayTaskSets[sundayIndex % sundayTaskSets.length];
      sundayIndex++;
      for (const st of sunTasks) {
        tasks.push({
          id: `task-${String(taskId++).padStart(3, '0')}`,
          title: st.title,
          description: st.description,
          date: dateStr,
          time: st.time,
          type: st.type,
          status: 'pending',
          priority: st.priority,
          notes: st.notes,
        });
      }
    }
  }

  return tasks;
}

export const taskSchedule30d: ScheduledTask[] = generateTasks();

export function getTasksByDate(date: string): ScheduledTask[] {
  return taskSchedule30d.filter(t => t.date === date);
}

export function getTasksByType(type: string): ScheduledTask[] {
  return taskSchedule30d.filter(t => t.type === type);
}

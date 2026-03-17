/**
 * Peer Follow Targets — Comprehensive X/Twitter follow database for Jacob's recruiting visibility.
 *
 * Architecture:
 * 1. Pulls program + coach handles from target-schools and expanded-schools data
 * 2. Adds curated lists of recruiting media, HS community, strength/training, and peer recruits
 * 3. Assigns each target a scheduled_week (1-26) for systematic 6-month follow cadence
 *
 * Schedule cadence: 7-8 follows per week → ~200 high-priority follows over 6 months
 * Remaining targets queue for months 7-12+
 */

import { targetSchools } from './target-schools';
import { expandedTargetSchools } from './target-schools-expanded';
import { getActiveCompetitors } from '@/lib/rec/knowledge/competitor-intel';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FollowCategory =
  | 'college_program'
  | 'college_coach'
  | 'peer_recruit'
  | 'recruiting_media'
  | 'wi_hs_community'
  | 'midwest_hs_community'
  | 'strength_training'
  | 'recruiting_camp';

export interface PeerFollowTarget {
  id: string;
  name: string;
  handle: string;
  category: FollowCategory;
  subcategory?: string;
  follow_priority: 1 | 2 | 3;
  engagement_strategy: 'like' | 'reply' | 'quote' | 'follow_only';
  bio_snippet: string;
  estimated_followers: number;
  followed_date: string | null;
  follow_back_status: 'not_followed' | 'followed' | 'followed_back' | 'blocked';
  scheduled_week: number | null;
}

// ---------------------------------------------------------------------------
// 1. College Programs — from target-schools.ts (17 schools)
// ---------------------------------------------------------------------------

const programsFromTargetSchools: PeerFollowTarget[] = targetSchools.map((s, i) => ({
  id: `ts-prog-${String(i + 1).padStart(3, '0')}`,
  name: `${s.name} Football`,
  handle: s.officialXHandle,
  category: 'college_program' as FollowCategory,
  subcategory: `${s.division}_${s.conference}`,
  follow_priority: s.priorityTier === 'Tier 3' ? 1 : s.priorityTier === 'Tier 2' ? 2 : 3 as 1 | 2 | 3,
  engagement_strategy: s.priorityTier === 'Tier 3' ? 'reply' : 'like' as 'like' | 'reply' | 'quote' | 'follow_only',
  bio_snippet: `${s.division} ${s.conference} — ${s.whyJacob.slice(0, 60)}`,
  estimated_followers: s.division === 'D1 FBS' ? 150000 : s.division === 'D1 FCS' ? 25000 : 5000,
  followed_date: null,
  follow_back_status: 'not_followed' as const,
  scheduled_week: s.priorityTier === 'Tier 3' ? Math.ceil((i + 1) / 8) : s.priorityTier === 'Tier 2' ? 5 + Math.ceil((i + 1) / 8) : 9 + Math.ceil((i + 1) / 8),
}));

// ---------------------------------------------------------------------------
// 2. College Programs + Coaches — from expanded-schools (40 schools, ~80 coaches)
// ---------------------------------------------------------------------------

const fromExpanded: PeerFollowTarget[] = [];
let exIdx = 0;

for (const school of expandedTargetSchools) {
  // Program account
  if (school.xHandle) {
    exIdx++;
    fromExpanded.push({
      id: `ex-prog-${String(exIdx).padStart(3, '0')}`,
      name: `${school.name} Football`,
      handle: school.xHandle,
      category: 'college_program',
      subcategory: `${school.division}_${school.conference}`,
      follow_priority: school.tier <= 2 ? 1 : 2,
      engagement_strategy: school.tier === 1 ? 'reply' : 'like',
      bio_snippet: `${school.division} ${school.conference} — ${school.city}, ${school.state}`,
      estimated_followers: school.division === 'D3' ? 2000 : school.division === 'D2' ? 5000 : 15000,
      followed_date: null,
      follow_back_status: 'not_followed',
      scheduled_week: school.tier === 1 ? Math.ceil(exIdx / 8) : school.tier === 2 ? 4 + Math.ceil(exIdx / 10) : school.tier === 3 ? 8 + Math.ceil(exIdx / 10) : 14 + Math.ceil(exIdx / 10),
    });
  }

  // Coach accounts
  for (const coach of school.coaches) {
    if (coach.xHandle) {
      exIdx++;
      fromExpanded.push({
        id: `ex-coach-${String(exIdx).padStart(3, '0')}`,
        name: `${coach.name} (${coach.title}, ${school.name})`,
        handle: coach.xHandle,
        category: 'college_coach',
        subcategory: `${school.division}_${school.conference}`,
        follow_priority: school.tier <= 2 ? 1 : 2,
        engagement_strategy: 'reply',
        bio_snippet: `${coach.title} at ${school.name} (${school.division} ${school.conference})`,
        estimated_followers: school.division === 'D3' ? 800 : school.division === 'D2' ? 2000 : 8000,
        followed_date: null,
        follow_back_status: 'not_followed',
        scheduled_week: school.tier === 1 ? Math.ceil(exIdx / 8) : school.tier === 2 ? 4 + Math.ceil(exIdx / 10) : school.tier === 3 ? 8 + Math.ceil(exIdx / 10) : 14 + Math.ceil(exIdx / 10),
      });
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Peer Recruits — from competitor-intel + additional curated
// ---------------------------------------------------------------------------

const competitorTargets: PeerFollowTarget[] = getActiveCompetitors().map((c, i) => ({
  id: `pr-comp-${String(i + 1).padStart(3, '0')}`,
  name: `${c.name} (${c.position}, ${c.school})`,
  handle: c.xHandle!,
  category: 'peer_recruit' as FollowCategory,
  subcategory: `class_${c.classYear}`,
  follow_priority: 2 as 1 | 2 | 3,
  engagement_strategy: 'like' as const,
  bio_snippet: `Class of ${c.classYear} ${c.position} | ${c.height} ${c.weight} | ${c.school} (${c.state})`,
  estimated_followers: c.estimatedFollowers,
  followed_date: null,
  follow_back_status: 'not_followed' as const,
  scheduled_week: 3 + Math.ceil((i + 1) / 4), // Sprinkle peer recruits starting week 3
}));

// ---------------------------------------------------------------------------
// 4. Additional College Programs — FBS/FCS/D2/D3 NOT already in target-schools
// ---------------------------------------------------------------------------

const additionalPrograms: PeerFollowTarget[] = [
  // Big Ten programs not in target-schools
  { id: 'ap-001', name: 'Minnesota Football', handle: '@GopherFootball', category: 'college_program', subcategory: 'FBS_Big_Ten', follow_priority: 3, engagement_strategy: 'like', bio_snippet: 'Big Ten — close proximity to WI, recruit WI players', estimated_followers: 180000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 10 },
  { id: 'ap-002', name: 'Nebraska Football', handle: '@HuskerFootball', category: 'college_program', subcategory: 'FBS_Big_Ten', follow_priority: 3, engagement_strategy: 'like', bio_snippet: 'Big Ten — historic OL tradition, Midwest recruiting', estimated_followers: 500000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 10 },
  { id: 'ap-003', name: 'Illinois Football', handle: '@IlliniFootball', category: 'college_program', subcategory: 'FBS_Big_Ten', follow_priority: 3, engagement_strategy: 'like', bio_snippet: 'Big Ten — active Midwest recruiting, border state', estimated_followers: 120000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 11 },
  { id: 'ap-004', name: 'Purdue Football', handle: '@BoilerFootball', category: 'college_program', subcategory: 'FBS_Big_Ten', follow_priority: 3, engagement_strategy: 'like', bio_snippet: 'Big Ten — academic focus, Midwest recruiting territory', estimated_followers: 110000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 11 },
  { id: 'ap-005', name: 'Indiana Football', handle: '@IndianaFootball', category: 'college_program', subcategory: 'FBS_Big_Ten', follow_priority: 3, engagement_strategy: 'like', bio_snippet: 'Big Ten — growing program under new staff', estimated_followers: 95000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 11 },
  { id: 'ap-006', name: 'Michigan State Football', handle: '@MSU_Football', category: 'college_program', subcategory: 'FBS_Big_Ten', follow_priority: 3, engagement_strategy: 'like', bio_snippet: 'Big Ten — historically recruits Wisconsin OL', estimated_followers: 300000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 12 },
  { id: 'ap-007', name: 'Michigan Football', handle: '@UMichFootball', category: 'college_program', subcategory: 'FBS_Big_Ten', follow_priority: 3, engagement_strategy: 'follow_only', bio_snippet: 'Big Ten — national champion, elite OL tradition', estimated_followers: 600000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 12 },
  { id: 'ap-008', name: 'Ohio State Football', handle: '@OhioStateFB', category: 'college_program', subcategory: 'FBS_Big_Ten', follow_priority: 3, engagement_strategy: 'follow_only', bio_snippet: 'Big Ten — elite program, national recruiting scope', estimated_followers: 800000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 12 },
  { id: 'ap-009', name: 'Penn State Football', handle: '@PennStateFball', category: 'college_program', subcategory: 'FBS_Big_Ten', follow_priority: 3, engagement_strategy: 'follow_only', bio_snippet: 'Big Ten — strong OL development tradition', estimated_followers: 400000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 12 },

  // MAC programs not in target-schools
  { id: 'ap-010', name: 'Eastern Michigan Football', handle: '@ABOREMUFB', category: 'college_program', subcategory: 'FBS_MAC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'MAC — active X recruiting, WI pipeline', estimated_followers: 20000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 7 },
  { id: 'ap-011', name: 'Toledo Football', handle: '@ToledoFB', category: 'college_program', subcategory: 'FBS_MAC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'MAC — consistent winner, active recruiting', estimated_followers: 30000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 7 },
  { id: 'ap-012', name: 'Bowling Green Football', handle: '@BG_Football', category: 'college_program', subcategory: 'FBS_MAC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'MAC — rebuilding, actively seeking OL', estimated_followers: 18000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 7 },
  { id: 'ap-013', name: 'Ohio Bobcats Football', handle: '@OhioFootball', category: 'college_program', subcategory: 'FBS_MAC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'MAC — strong recent seasons, Midwest recruiting', estimated_followers: 22000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 8 },
  { id: 'ap-014', name: 'Miami OH Football', handle: '@MiamiOHFootball', category: 'college_program', subcategory: 'FBS_MAC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'MAC — Cradle of Coaches, strong development', estimated_followers: 25000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 8 },
  { id: 'ap-015', name: 'Kent State Football', handle: '@KentStFB', category: 'college_program', subcategory: 'FBS_MAC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'MAC — actively rebuilding, need OL', estimated_followers: 12000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 8 },
  { id: 'ap-016', name: 'Akron Football', handle: '@ZipsFB', category: 'college_program', subcategory: 'FBS_MAC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'MAC — need OL depth, active X recruiting', estimated_followers: 10000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 8 },
  { id: 'ap-017', name: 'Buffalo Football', handle: '@UBFootball', category: 'college_program', subcategory: 'FBS_MAC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'MAC — Lance Leipold legacy, recruit nationwide', estimated_followers: 15000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 9 },

  // MVFC FCS programs not in target-schools
  { id: 'ap-018', name: 'Northern Iowa Football', handle: '@UNI_Football', category: 'college_program', subcategory: 'FCS_MVFC', follow_priority: 2, engagement_strategy: 'reply', bio_snippet: 'MVFC FCS — strong WI recruiting pipeline', estimated_followers: 20000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 5 },
  { id: 'ap-019', name: 'Indiana State Football', handle: '@IndStFB', category: 'college_program', subcategory: 'FCS_MVFC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'MVFC FCS — active X recruiting staff', estimated_followers: 12000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 6 },
  { id: 'ap-020', name: 'Missouri State Football', handle: '@MOStateFB', category: 'college_program', subcategory: 'FCS_MVFC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'MVFC FCS — Bobby Petrino era, active recruiting', estimated_followers: 15000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 6 },
  { id: 'ap-021', name: 'Western Illinois Football', handle: '@WIUfootball', category: 'college_program', subcategory: 'FCS_MVFC', follow_priority: 2, engagement_strategy: 'reply', bio_snippet: 'MVFC FCS — border state, WI recruiting ties', estimated_followers: 8000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 5 },
  { id: 'ap-022', name: 'Southern Illinois Football', handle: '@SIU_Football', category: 'college_program', subcategory: 'FCS_MVFC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'MVFC FCS — active Midwest recruiting', estimated_followers: 15000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 6 },

  // Additional D2 programs
  { id: 'ap-023', name: 'Grand Valley State Football', handle: '@GVSUFootball', category: 'college_program', subcategory: 'D2_GLIAC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'D2 GLIAC powerhouse — elite D2 program', estimated_followers: 15000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 2 },
  { id: 'ap-024', name: 'Northwest Missouri State FB', handle: '@NWBearcatsFB', category: 'college_program', subcategory: 'D2_MIAA', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'D2 MIAA — historically dominant D2 program', estimated_followers: 12000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 3 },
  { id: 'ap-025', name: 'Pittsburg State Football', handle: '@GorillaNation', category: 'college_program', subcategory: 'D2_MIAA', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'D2 MIAA — strong football tradition', estimated_followers: 8000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 3 },
  { id: 'ap-026', name: 'Minnesota Duluth Football', handle: '@UMDBulldogFB', category: 'college_program', subcategory: 'D2_NSIC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'D2 NSIC — close to WI, recruit WI heavily', estimated_followers: 5000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 2 },
  { id: 'ap-027', name: 'Upper Iowa Football', handle: '@UIUPeacocks', category: 'college_program', subcategory: 'D2_NSIC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'D2 NSIC — border school, WI recruiting ties', estimated_followers: 3000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 2 },
  { id: 'ap-028', name: 'Concordia St Paul Football', handle: '@CSPFootball', category: 'college_program', subcategory: 'D2_NSIC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'D2 NSIC — Twin Cities, active WI recruiting', estimated_followers: 3000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 2 },
  { id: 'ap-029', name: 'Davenport Football', handle: '@DUFootball', category: 'college_program', subcategory: 'D2_GLIAC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'D2 GLIAC — growing program, need OL', estimated_followers: 3000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 3 },
  { id: 'ap-030', name: 'Wayne State NE Football', handle: '@WSCFootball', category: 'college_program', subcategory: 'D2_NSIC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'D2 NSIC — active recruiting, need big OL', estimated_followers: 2500, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 3 },

  // Additional D3 programs — Ohio Athletic Conference
  { id: 'ap-031', name: 'Mount Union Football', handle: '@MountUnionFB', category: 'college_program', subcategory: 'D3_OAC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'D3 OAC dynasty — most D3 titles ever', estimated_followers: 12000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 4 },
  { id: 'ap-032', name: 'John Carroll Football', handle: '@JCUFootball', category: 'college_program', subcategory: 'D3_OAC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'D3 OAC — strong recruiting, academic focus', estimated_followers: 4000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 4 },

  // Additional CCIW D3 programs
  { id: 'ap-033', name: 'Augustana IL Football', handle: '@AugieFB_IL', category: 'college_program', subcategory: 'D3_CCIW', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'D3 CCIW — Rock Island IL, strong program', estimated_followers: 3000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 3 },
  { id: 'ap-034', name: 'Elmhurst Football', handle: '@ElmhurstFB', category: 'college_program', subcategory: 'D3_CCIW', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'D3 CCIW — Chicagoland D3 program', estimated_followers: 2000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 4 },

  // MIAC D3 programs not in expanded
  { id: 'ap-035', name: 'St. Olaf Football', handle: '@OleFootball', category: 'college_program', subcategory: 'D3_MIAC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'D3 MIAC — Northfield MN, academic focus', estimated_followers: 2000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 4 },
  { id: 'ap-036', name: 'Augsburg Football', handle: '@AugsburgFB', category: 'college_program', subcategory: 'D3_MIAC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'D3 MIAC — Minneapolis, urban D3 program', estimated_followers: 1500, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 4 },
  { id: 'ap-037', name: 'Hamline Football', handle: '@HamlineFootball', category: 'college_program', subcategory: 'D3_MIAC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'D3 MIAC — St. Paul MN', estimated_followers: 1000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 4 },

  // MWC D3 programs not in expanded
  { id: 'ap-038', name: 'Ripon Football', handle: '@RiponRedHawks', category: 'college_program', subcategory: 'D3_MWC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'D3 MWC — Ripon WI, local D3 program', estimated_followers: 1500, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 2 },
  { id: 'ap-039', name: 'Beloit Football', handle: '@BeloitBucs', category: 'college_program', subcategory: 'D3_MWC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'D3 MWC — Beloit WI, southern WI D3', estimated_followers: 800, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 2 },
  { id: 'ap-040', name: 'Lake Forest Football', handle: '@ForesterFB', category: 'college_program', subcategory: 'D3_MWC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'D3 MWC — Lake Forest IL, academic focus', estimated_followers: 1000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 4 },
  { id: 'ap-041', name: 'Grinnell Football', handle: '@GrinnellFB', category: 'college_program', subcategory: 'D3_MWC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'D3 MWC — Grinnell IA, academic prestige', estimated_followers: 800, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 4 },
  { id: 'ap-042', name: 'Cornell College Football', handle: '@CornellRamsFB', category: 'college_program', subcategory: 'D3_MWC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'D3 MWC — Mount Vernon IA', estimated_followers: 700, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 4 },

  // Sun Belt / Other FBS
  { id: 'ap-043', name: 'Appalachian State Football', handle: '@AppState_FB', category: 'college_program', subcategory: 'FBS_Sun_Belt', follow_priority: 3, engagement_strategy: 'follow_only', bio_snippet: 'Sun Belt — FCS-to-FBS success story, strong program', estimated_followers: 60000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 13 },
  { id: 'ap-044', name: 'James Madison Football', handle: '@JMUFootball', category: 'college_program', subcategory: 'FBS_Sun_Belt', follow_priority: 3, engagement_strategy: 'follow_only', bio_snippet: 'Sun Belt — recent FCS-to-FBS move, growing', estimated_followers: 40000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 13 },
  { id: 'ap-045', name: 'Marshall Football', handle: '@HerdFB', category: 'college_program', subcategory: 'FBS_Sun_Belt', follow_priority: 3, engagement_strategy: 'follow_only', bio_snippet: 'Sun Belt — storied program, Midwest-adjacent', estimated_followers: 50000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 13 },

  // Pioneer/PFL FCS (not in expanded)
  { id: 'ap-046', name: 'Dayton Football', handle: '@DaytonFootball', category: 'college_program', subcategory: 'FCS_Pioneer', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Pioneer FCS — strong academic-athletic balance', estimated_followers: 12000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 6 },
  { id: 'ap-047', name: 'Drake Football', handle: '@DrakeBulldogFB', category: 'college_program', subcategory: 'FCS_Pioneer', follow_priority: 2, engagement_strategy: 'reply', bio_snippet: 'Pioneer FCS — Des Moines IA, close to WI', estimated_followers: 8000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 5 },
  { id: 'ap-048', name: 'Valparaiso Football', handle: '@ValpoFootball', category: 'college_program', subcategory: 'FCS_PFL', follow_priority: 2, engagement_strategy: 'reply', bio_snippet: 'PFL FCS — NW Indiana, close to WI', estimated_followers: 5000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 5 },
  { id: 'ap-049', name: 'Butler Football', handle: '@ButlerUFootball', category: 'college_program', subcategory: 'FCS_PFL', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'PFL FCS — Indianapolis, academic focus', estimated_followers: 8000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 6 },

  // Big Sky FCS
  { id: 'ap-050', name: 'Montana Football', handle: '@MontanaGrizFB', category: 'college_program', subcategory: 'FCS_Big_Sky', follow_priority: 3, engagement_strategy: 'follow_only', bio_snippet: 'Big Sky FCS — elite FCS program, national brand', estimated_followers: 35000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 13 },
  { id: 'ap-051', name: 'Montana State Football', handle: '@MSUBobcats_FB', category: 'college_program', subcategory: 'FCS_Big_Sky', follow_priority: 3, engagement_strategy: 'follow_only', bio_snippet: 'Big Sky FCS — perennial contender', estimated_followers: 25000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 13 },
  { id: 'ap-052', name: 'Eastern Washington Football', handle: '@EWUFootball', category: 'college_program', subcategory: 'FCS_Big_Sky', follow_priority: 3, engagement_strategy: 'follow_only', bio_snippet: 'Big Sky FCS — red turf, national exposure', estimated_followers: 20000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 14 },
  { id: 'ap-053', name: 'Weber State Football', handle: '@WildcatFB', category: 'college_program', subcategory: 'FCS_Big_Sky', follow_priority: 3, engagement_strategy: 'follow_only', bio_snippet: 'Big Sky FCS — consistent contender', estimated_followers: 12000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 14 },
  { id: 'ap-054', name: 'Sacramento State Football', handle: '@SacHornetsFB', category: 'college_program', subcategory: 'FCS_Big_Sky', follow_priority: 3, engagement_strategy: 'follow_only', bio_snippet: 'Big Sky FCS — West Coast FCS power', estimated_followers: 10000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 14 },

  // Additional NSIC/GLIAC D2
  { id: 'ap-055', name: 'Truman State Football', handle: '@TrumanFootball', category: 'college_program', subcategory: 'D2_GLVC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'D2 GLVC — strong academic D2 program', estimated_followers: 3000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 3 },
  { id: 'ap-056', name: 'Indianapolis Football', handle: '@UIndyFB', category: 'college_program', subcategory: 'D2_GLVC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'D2 GLVC — Indianapolis, Midwest D2', estimated_followers: 4000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 3 },

  // Additional verified FCS programs
  { id: 'ap-057', name: 'MVFC Football', handle: '@ValleyFootball', category: 'college_program', subcategory: 'FCS_MVFC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Missouri Valley Football Conference', estimated_followers: 15000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 5 },
  { id: 'ap-058', name: 'YSU Football', handle: '@ysufootball', category: 'college_program', subcategory: 'FCS_MVFC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Youngstown State Penguins Football', estimated_followers: 15000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 6 },
  { id: 'ap-059', name: 'UNI Football', handle: '@UNIFootball', category: 'college_program', subcategory: 'FCS_MVFC', follow_priority: 2, engagement_strategy: 'reply', bio_snippet: 'Northern Iowa Panthers Football', estimated_followers: 12000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 5 },
  { id: 'ap-060', name: 'MO State Football', handle: '@MoStateFootball', category: 'college_program', subcategory: 'FCS_MVFC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Missouri State Bears Football', estimated_followers: 12000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 6 },
  { id: 'ap-061', name: 'WIU Football', handle: '@WIUFootball', category: 'college_program', subcategory: 'FCS_MVFC', follow_priority: 2, engagement_strategy: 'reply', bio_snippet: 'Western Illinois Leathernecks Football', estimated_followers: 6000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 5 },
  { id: 'ap-062', name: 'Redbird Recruiting', handle: '@RedbirdRecruits', category: 'college_program', subcategory: 'FCS_MVFC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'Illinois State Redbird recruiting account', estimated_followers: 3000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 5 },
  { id: 'ap-063', name: 'EWU FB Recruiting', handle: '@EWUFBRecruiting', category: 'college_program', subcategory: 'FCS_Big_Sky', follow_priority: 2, engagement_strategy: 'reply', bio_snippet: 'Eastern Washington FB recruiting', estimated_followers: 3000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 14 },
  { id: 'ap-064', name: 'Weber State Football', handle: '@weberstatefb', category: 'college_program', subcategory: 'FCS_Big_Sky', follow_priority: 3, engagement_strategy: 'follow_only', bio_snippet: 'Weber State Wildcats Football', estimated_followers: 10000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 14 },
  { id: 'ap-065', name: 'UNC Bears Football', handle: '@UNC_BearsFB', category: 'college_program', subcategory: 'FCS_Big_Sky', follow_priority: 3, engagement_strategy: 'follow_only', bio_snippet: 'Northern Colorado Bears Football', estimated_followers: 5000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 14 },
  { id: 'ap-066', name: 'Idaho State Football', handle: '@BengalGridiron', category: 'college_program', subcategory: 'FCS_Big_Sky', follow_priority: 3, engagement_strategy: 'follow_only', bio_snippet: 'Idaho State Bengals Football', estimated_followers: 4000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 14 },
  { id: 'ap-067', name: 'Marist Football', handle: '@Marist_Fball', category: 'college_program', subcategory: 'FCS_Pioneer', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Marist Red Foxes Football', estimated_followers: 3000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 6 },
  { id: 'ap-068', name: 'Drake Bulldogs FB', handle: '@DrakeBulldogsFB', category: 'college_program', subcategory: 'FCS_Pioneer', follow_priority: 2, engagement_strategy: 'reply', bio_snippet: 'Drake Bulldogs Football — Des Moines IA', estimated_followers: 5000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 5 },
  { id: 'ap-069', name: 'Valpo Football', handle: '@valpoufootball', category: 'college_program', subcategory: 'FCS_PFL', follow_priority: 2, engagement_strategy: 'reply', bio_snippet: 'Valparaiso Beacons Football', estimated_followers: 4000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 5 },

  // Additional verified D2 programs
  { id: 'ap-070', name: 'SVSU Football', handle: '@svsu_football', category: 'college_program', subcategory: 'D2_GLIAC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'Saginaw Valley State Football', estimated_followers: 4000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 2 },
  { id: 'ap-071', name: 'Michigan Tech FB', handle: '@MTUFB', category: 'college_program', subcategory: 'D2_GLIAC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'Michigan Tech Huskies Football', estimated_followers: 3000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 2 },
  { id: 'ap-072', name: 'Wayne State MI FB', handle: '@WSUWarriorFB', category: 'college_program', subcategory: 'D2_GLIAC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'Wayne State Warriors Football', estimated_followers: 2500, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 3 },
];

// ---------------------------------------------------------------------------
// 4b. Verified College Coaches — from research agents
// ---------------------------------------------------------------------------

const verifiedCoaches: PeerFollowTarget[] = [
  // Big Ten Head Coaches
  { id: 'vc-001', name: 'Luke Fickell (HC, Wisconsin)', handle: '@CoachFick', category: 'college_coach', subcategory: 'FBS_Big_Ten', follow_priority: 3, engagement_strategy: 'follow_only', bio_snippet: 'Wisconsin Badgers Head Coach', estimated_followers: 150000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 10 },
  { id: 'vc-002', name: 'Eric Mateos (OL, Wisconsin)', handle: '@CoachMateos', category: 'college_coach', subcategory: 'FBS_Big_Ten', follow_priority: 2, engagement_strategy: 'reply', bio_snippet: 'Wisconsin OL Coach — key follow for Jacob', estimated_followers: 15000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 9 },
  { id: 'vc-003', name: 'George Barnett (OL, Iowa)', handle: '@CoachBarnett_OL', category: 'college_coach', subcategory: 'FBS_Big_Ten', follow_priority: 2, engagement_strategy: 'reply', bio_snippet: 'Iowa Hawkeyes OL Coach — Iowa OL tradition', estimated_followers: 10000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 9 },
  { id: 'vc-004', name: 'P.J. Fleck (HC, Minnesota)', handle: '@Coach_Fleck', category: 'college_coach', subcategory: 'FBS_Big_Ten', follow_priority: 3, engagement_strategy: 'like', bio_snippet: 'Minnesota Golden Gophers Head Coach', estimated_followers: 200000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 10 },
  { id: 'vc-005', name: 'Brian Callahan (OL, Minnesota)', handle: '@Callybrian', category: 'college_coach', subcategory: 'FBS_Big_Ten', follow_priority: 2, engagement_strategy: 'reply', bio_snippet: 'Minnesota OL Coach', estimated_followers: 5000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 9 },
  { id: 'vc-006', name: 'David Braun (HC, Northwestern)', handle: '@DavidBraunFB', category: 'college_coach', subcategory: 'FBS_Big_Ten', follow_priority: 3, engagement_strategy: 'like', bio_snippet: 'Northwestern Head Coach', estimated_followers: 30000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 10 },
  { id: 'vc-007', name: 'Matt Rhule (HC, Nebraska)', handle: '@CoachMattRhule', category: 'college_coach', subcategory: 'FBS_Big_Ten', follow_priority: 3, engagement_strategy: 'follow_only', bio_snippet: 'Nebraska Cornhuskers Head Coach', estimated_followers: 100000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 11 },
  { id: 'vc-008', name: 'Geep Wade (OL, Nebraska)', handle: '@GeepWade', category: 'college_coach', subcategory: 'FBS_Big_Ten', follow_priority: 2, engagement_strategy: 'reply', bio_snippet: 'Nebraska OL Coach', estimated_followers: 5000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 10 },
  { id: 'vc-009', name: 'Bret Bielema (HC, Illinois)', handle: '@BretBielema', category: 'college_coach', subcategory: 'FBS_Big_Ten', follow_priority: 3, engagement_strategy: 'like', bio_snippet: 'Illinois HC — former Wisconsin HC, knows WI players', estimated_followers: 80000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 11 },
  { id: 'vc-010', name: 'Barry Odom (HC, Purdue)', handle: '@Coach_Odom', category: 'college_coach', subcategory: 'FBS_Big_Ten', follow_priority: 3, engagement_strategy: 'like', bio_snippet: 'Purdue Boilermakers Head Coach', estimated_followers: 20000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 11 },
  { id: 'vc-011', name: 'Curt Cignetti (HC, Indiana)', handle: '@CCignettiIU', category: 'college_coach', subcategory: 'FBS_Big_Ten', follow_priority: 3, engagement_strategy: 'like', bio_snippet: 'Indiana Hoosiers Head Coach', estimated_followers: 25000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 11 },
  { id: 'vc-012', name: 'Bob Bostad (OL, Indiana)', handle: '@Coach_Bostad', category: 'college_coach', subcategory: 'FBS_Big_Ten', follow_priority: 2, engagement_strategy: 'reply', bio_snippet: 'Indiana OL Coach — former Wisconsin OL coach', estimated_followers: 5000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 9 },
  { id: 'vc-013', name: 'Ryan Day (HC, Ohio State)', handle: '@ryandaytime', category: 'college_coach', subcategory: 'FBS_Big_Ten', follow_priority: 3, engagement_strategy: 'follow_only', bio_snippet: 'Ohio State Buckeyes Head Coach', estimated_followers: 200000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 12 },
  { id: 'vc-014', name: 'Greg Schiano (HC, Rutgers)', handle: '@GregSchiano', category: 'college_coach', subcategory: 'FBS_Big_Ten', follow_priority: 3, engagement_strategy: 'follow_only', bio_snippet: 'Rutgers Scarlet Knights Head Coach', estimated_followers: 50000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 12 },
  { id: 'vc-015', name: 'WI FB Recruiting', handle: '@WisFBRecruiting', category: 'college_coach', subcategory: 'FBS_Big_Ten', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'Wisconsin Badgers recruiting account', estimated_followers: 20000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 9 },

  // MAC Head Coaches (verified)
  { id: 'vc-016', name: 'Lance Taylor (HC, WMU)', handle: '@CoachLT39', category: 'college_coach', subcategory: 'FBS_MAC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Western Michigan Head Coach', estimated_followers: 8000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 7 },
  { id: 'vc-017', name: 'Mike Uremovich (HC, Ball State)', handle: '@CoachU_BSU', category: 'college_coach', subcategory: 'FBS_MAC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Ball State Head Coach', estimated_followers: 5000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 7 },
  { id: 'vc-018', name: 'Matt Drinkall (HC, CMU)', handle: '@DrinkallCoach', category: 'college_coach', subcategory: 'FBS_MAC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Central Michigan Head Coach', estimated_followers: 5000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 7 },
  { id: 'vc-019', name: 'Chris Creighton (HC, EMU)', handle: '@Coach_Creighton', category: 'college_coach', subcategory: 'FBS_MAC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Eastern Michigan Head Coach', estimated_followers: 8000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 8 },
  { id: 'vc-020', name: 'Chuck Martin (HC, Miami OH)', handle: '@Martin_Miami_HC', category: 'college_coach', subcategory: 'FBS_MAC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Miami OH Head Coach — Cradle of Coaches', estimated_followers: 10000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 8 },
  { id: 'vc-021', name: 'Joe Moorhead (HC, Akron)', handle: '@BallCoachJoeMo', category: 'college_coach', subcategory: 'FBS_MAC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Akron Zips Head Coach', estimated_followers: 15000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 8 },
  { id: 'vc-022', name: 'Pete Lembo (HC, Buffalo)', handle: '@Pete_Lembo', category: 'college_coach', subcategory: 'FBS_MAC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Buffalo Bulls Head Coach', estimated_followers: 6000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 9 },
  { id: 'vc-023', name: 'Eddie George (HC, BGSU)', handle: '@EddieGeorge2727', category: 'college_coach', subcategory: 'FBS_MAC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Bowling Green HC — Heisman winner coaching', estimated_followers: 100000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 7 },

  // MVFC FCS Head Coaches (verified)
  { id: 'vc-024', name: 'Tim Polasek (HC, NDSU)', handle: '@CoachTimNDSU', category: 'college_coach', subcategory: 'FCS_MVFC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'NDSU Bison HC — FCS dynasty', estimated_followers: 10000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 5 },
  { id: 'vc-025', name: 'Dylan Chmura (OL, NDSU)', handle: '@CoachChewy80', category: 'college_coach', subcategory: 'FCS_MVFC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'NDSU OL Coach — WI connections (Chmura name)', estimated_followers: 3000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 5 },
  { id: 'vc-026', name: 'Dan Jackson (HC, SDSU)', handle: '@CoachDtjackson', category: 'college_coach', subcategory: 'FCS_MVFC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'SDSU Jackrabbits Head Coach', estimated_followers: 5000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 5 },
  { id: 'vc-027', name: 'Brock Spack (HC, Illinois State)', handle: '@Coach_Spack', category: 'college_coach', subcategory: 'FCS_MVFC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'Illinois State Redbirds Head Coach', estimated_followers: 5000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 5 },
  { id: 'vc-028', name: 'Doug Phillips (HC, YSU)', handle: '@fbcoachdp', category: 'college_coach', subcategory: 'FCS_MVFC', follow_priority: 2, engagement_strategy: 'reply', bio_snippet: 'Youngstown State Head Coach', estimated_followers: 3000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 6 },
  { id: 'vc-029', name: 'Nick Hill (HC, SIU)', handle: '@17NickHill', category: 'college_coach', subcategory: 'FCS_MVFC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Southern Illinois Head Coach', estimated_followers: 5000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 6 },
  { id: 'vc-030', name: 'Joe Davis (HC, WIU)', handle: '@CoachJoeDavis', category: 'college_coach', subcategory: 'FCS_MVFC', follow_priority: 2, engagement_strategy: 'reply', bio_snippet: 'Western Illinois HC — border state', estimated_followers: 2000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 5 },
  { id: 'vc-031', name: 'Casey Woods (HC, MO State)', handle: '@coachcaseywoods', category: 'college_coach', subcategory: 'FCS_MVFC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Missouri State Head Coach', estimated_followers: 3000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 6 },

  // Pioneer/PFL/Big Sky FCS coaches
  { id: 'vc-032', name: 'Trevor Andrews (HC, Dayton)', handle: '@TDAndrews4', category: 'college_coach', subcategory: 'FCS_Pioneer', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Dayton Flyers Head Coach', estimated_followers: 3000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 6 },
  { id: 'vc-033', name: 'Andy Waddle (HC, Valpo)', handle: '@CoachWaddle', category: 'college_coach', subcategory: 'FCS_PFL', follow_priority: 2, engagement_strategy: 'reply', bio_snippet: 'Valparaiso Beacons Head Coach', estimated_followers: 2000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 5 },
  { id: 'vc-034', name: 'Kevin Lynch (HC, Butler)', handle: '@coachklynch', category: 'college_coach', subcategory: 'FCS_PFL', follow_priority: 2, engagement_strategy: 'reply', bio_snippet: 'Butler Bulldogs Head Coach', estimated_followers: 2000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 6 },
  { id: 'vc-035', name: 'Aaron Best (HC, EWU)', handle: '@CoachBestEWU', category: 'college_coach', subcategory: 'FCS_Big_Sky', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Eastern Washington Head Coach', estimated_followers: 5000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 14 },
  { id: 'vc-036', name: 'Brent Vigen (HC, Montana St)', handle: '@bvigen', category: 'college_coach', subcategory: 'FCS_Big_Sky', follow_priority: 3, engagement_strategy: 'follow_only', bio_snippet: 'Montana State Head Coach', estimated_followers: 8000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 13 },
  { id: 'vc-037', name: 'Cody Hawkins (HC, Idaho St)', handle: '@CodyHawkins', category: 'college_coach', subcategory: 'FCS_Big_Sky', follow_priority: 3, engagement_strategy: 'follow_only', bio_snippet: 'Idaho State Head Coach', estimated_followers: 3000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 14 },

  // D2 Head Coaches (verified)
  { id: 'vc-038', name: 'Tony Annese (HC, Ferris State)', handle: '@CoachAnnese', category: 'college_coach', subcategory: 'D2_GLIAC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'Ferris State HC — D2 national champion coach', estimated_followers: 8000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 1 },
  { id: 'vc-039', name: 'Scott Wooster (HC, GVSU)', handle: '@CoachWooster', category: 'college_coach', subcategory: 'D2_GLIAC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'Grand Valley State Head Coach', estimated_followers: 5000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 1 },

  // D3 Head Coaches (verified from research)
  { id: 'vc-040', name: 'Peter Jennings (HC, UW-Oshkosh)', handle: '@PeteyBananas', category: 'college_coach', subcategory: 'D3_WIAC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'UW-Oshkosh Titans Head Coach', estimated_followers: 2000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 1 },
  { id: 'vc-041', name: 'Luke Venne (HC, UW-Stevens Point)', handle: '@CoachVenne', category: 'college_coach', subcategory: 'D3_WIAC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'UW-Stevens Point Head Coach', estimated_followers: 1500, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 1 },
  { id: 'vc-042', name: 'Clayt Birmingham (HC, UW-Stout)', handle: '@BlueDevil_HC', category: 'college_coach', subcategory: 'D3_WIAC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'UW-Stout Blue Devils Head Coach', estimated_followers: 1000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 1 },
  { id: 'vc-043', name: 'Rob Erickson (HC, UW-Eau Claire)', handle: '@CoachE_Blugolds', category: 'college_coach', subcategory: 'D3_WIAC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'UW-Eau Claire Blugolds Head Coach', estimated_followers: 1000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 1 },
  { id: 'vc-044', name: 'Rich Worsell (OL, UW-Oshkosh)', handle: '@coach_worsell', category: 'college_coach', subcategory: 'D3_WIAC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'UW-Oshkosh OL Coach — key WI D3 target', estimated_followers: 500, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 1 },
  { id: 'vc-045', name: 'Austin Archer (OL, UW-Stevens Point)', handle: '@CoachAArcher', category: 'college_coach', subcategory: 'D3_WIAC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'UW-Stevens Point OL Coach', estimated_followers: 500, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 1 },
  { id: 'vc-046', name: 'Jake Schiff (DL, UW-Stout)', handle: '@CoachJRSchiff', category: 'college_coach', subcategory: 'D3_WIAC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'UW-Stout DL Coach', estimated_followers: 500, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 1 },

  // CCIW/MWC D3 Coaches (verified)
  { id: 'vc-047', name: 'Brad Spencer (HC, North Central)', handle: '@CoachSpence_NCC', category: 'college_coach', subcategory: 'D3_CCIW', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'North Central College HC — D3 powerhouse', estimated_followers: 3000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 2 },
  { id: 'vc-048', name: 'Eric Stuedemann (OL, North Central)', handle: '@CoachStuedemann', category: 'college_coach', subcategory: 'D3_CCIW', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'North Central OL Coach', estimated_followers: 1000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 2 },
  { id: 'vc-049', name: 'DJ Warkenthien (DL, North Central)', handle: '@CoachWark', category: 'college_coach', subcategory: 'D3_CCIW', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'North Central DL Coach', estimated_followers: 800, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 2 },
  { id: 'vc-050', name: 'Jesse Scott (HC, Wheaton)', handle: '@Coach_JScott', category: 'college_coach', subcategory: 'D3_CCIW', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'Wheaton College HC — academic D3 power', estimated_followers: 2000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 2 },
  { id: 'vc-051', name: 'Mike Budziszewski (HC, Carroll)', handle: '@CoachBuddah', category: 'college_coach', subcategory: 'D3_MWC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'Carroll University HC — Waukesha WI (local!)', estimated_followers: 1000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 1 },
  { id: 'vc-052', name: 'Ken Ackerman (OL, Carroll)', handle: '@OLCoach_Ack', category: 'college_coach', subcategory: 'D3_MWC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'Carroll OL Coach — LOCAL D3 in Waukesha', estimated_followers: 500, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 1 },
  { id: 'vc-053', name: 'Mike Heffernan (HC, Elmhurst)', handle: '@Coach_Heffernan', category: 'college_coach', subcategory: 'D3_CCIW', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'Elmhurst University Head Coach', estimated_followers: 1000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 2 },
  { id: 'vc-054', name: 'Jacob Dopsovic (OL, Elmhurst)', handle: '@CoachDops', category: 'college_coach', subcategory: 'D3_CCIW', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'Elmhurst OL Coach', estimated_followers: 500, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 2 },
  { id: 'vc-055', name: 'Jake Marshall (HC, Ripon)', handle: '@Jmar56', category: 'college_coach', subcategory: 'D3_MWC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'Ripon College HC — Ripon WI', estimated_followers: 800, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 2 },
  { id: 'vc-056', name: 'Rick Coles (OL, Ripon)', handle: '@coach_rc', category: 'college_coach', subcategory: 'D3_MWC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'Ripon OL Coach', estimated_followers: 300, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 2 },
  { id: 'vc-057', name: 'Geoff Dartt (HC, Mount Union)', handle: '@CoachGeoffDartt', category: 'college_coach', subcategory: 'D3_OAC', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Mount Union HC — D3 dynasty coach', estimated_followers: 5000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 4 },
  { id: 'vc-058', name: 'John Cisneros (OL, Mount Union)', handle: '@CoachCisneros_', category: 'college_coach', subcategory: 'D3_OAC', follow_priority: 2, engagement_strategy: 'reply', bio_snippet: 'Mount Union OL Coach', estimated_followers: 1000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 4 },
  { id: 'vc-059', name: 'Damien Dumonceaux (DL/RC, St Johns)', handle: '@SJUFBCoachDumo', category: 'college_coach', subcategory: 'D3_MIAC', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'St Johns MN DL Coach & Recruiting Coordinator', estimated_followers: 800, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 3 },
];

// ---------------------------------------------------------------------------
// 5. Recruiting Media — national + state-specific + D3/D2/FCS outlets
// ---------------------------------------------------------------------------

const recruitingMedia: PeerFollowTarget[] = [
  // National recruiting platforms
  { id: 'rm-001', name: 'Rivals', handle: '@Rivals', category: 'recruiting_media', subcategory: 'national', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'The leader in college football & basketball recruiting', estimated_followers: 450000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 15 },
  { id: 'rm-002', name: '247Sports', handle: '@247Sports', category: 'recruiting_media', subcategory: 'national', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'College sports recruiting, news and community', estimated_followers: 380000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 15 },
  { id: 'rm-003', name: 'On3 Sports', handle: '@On3sports', category: 'recruiting_media', subcategory: 'national', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Recruiting coverage, NIL, and college sports', estimated_followers: 200000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 15 },
  { id: 'rm-004', name: 'MaxPreps', handle: '@MaxPreps', category: 'recruiting_media', subcategory: 'national', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Americas source for high school sports', estimated_followers: 210000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 15 },
  { id: 'rm-005', name: 'Hudl', handle: '@Hudl', category: 'recruiting_media', subcategory: 'national', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Video review and recruiting tools for athletes and coaches', estimated_followers: 120000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 15 },
  { id: 'rm-006', name: 'NCSA Sports', handle: '@NCSASports', category: 'recruiting_media', subcategory: 'national', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Athletic recruiting network connecting athletes with college coaches', estimated_followers: 65000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 15 },
  { id: 'rm-007', name: 'ESPN College Football', handle: '@ABORESPNCFB', category: 'recruiting_media', subcategory: 'national', follow_priority: 3, engagement_strategy: 'follow_only', bio_snippet: 'ESPN college football coverage', estimated_followers: 2000000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 16 },
  { id: 'rm-008', name: 'CFB Playoff', handle: '@CFBPlayoff', category: 'recruiting_media', subcategory: 'national', follow_priority: 3, engagement_strategy: 'follow_only', bio_snippet: 'Official College Football Playoff', estimated_followers: 1500000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 16 },
  { id: 'rm-009', name: 'NCAA Football', handle: '@NCAAFootball', category: 'recruiting_media', subcategory: 'national', follow_priority: 3, engagement_strategy: 'follow_only', bio_snippet: 'Official NCAA football account', estimated_followers: 800000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 16 },
  { id: 'rm-010', name: 'NFL Draft', handle: '@NFLDraft', category: 'recruiting_media', subcategory: 'national', follow_priority: 3, engagement_strategy: 'follow_only', bio_snippet: 'Official NFL Draft coverage — dream target', estimated_followers: 3000000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 16 },

  // Division-specific media
  { id: 'rm-011', name: 'D3football.com', handle: '@D3football', category: 'recruiting_media', subcategory: 'division', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'Your source for Division III football news', estimated_followers: 28000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 14 },
  { id: 'rm-012', name: 'D2Football', handle: '@D2Football', category: 'recruiting_media', subcategory: 'division', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'The source for Division II football', estimated_followers: 15000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 14 },
  { id: 'rm-013', name: 'The D3 Way', handle: '@TheD3Way', category: 'recruiting_media', subcategory: 'division', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'Celebrating Division III student-athletes', estimated_followers: 9500, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 14 },
  { id: 'rm-014', name: 'FCS Football', handle: '@FCS_STATS', category: 'recruiting_media', subcategory: 'division', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'FCS football news, stats, and coverage', estimated_followers: 20000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 14 },

  // Prep Redzone — state-specific recruiting
  { id: 'rm-015', name: 'Prep Redzone', handle: '@PrepRedzone', category: 'recruiting_media', subcategory: 'state_recruiting', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'National HS football recruiting coverage', estimated_followers: 85000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 14 },
  { id: 'rm-016', name: 'Prep Redzone WI', handle: '@PrepRedzoneWI', category: 'recruiting_media', subcategory: 'state_recruiting', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'Wisconsin HS football recruiting coverage', estimated_followers: 8000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 14 },
  { id: 'rm-017', name: 'Prep Redzone MN', handle: '@PrepRedzoneMN', category: 'recruiting_media', subcategory: 'state_recruiting', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'Minnesota HS football recruiting coverage', estimated_followers: 18000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 14 },
  { id: 'rm-018', name: 'Prep Redzone IL', handle: '@PrepRedzoneIL', category: 'recruiting_media', subcategory: 'state_recruiting', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Illinois HS football recruiting coverage', estimated_followers: 22000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 15 },
  { id: 'rm-019', name: 'Prep Redzone IA', handle: '@PrepRedzoneIA', category: 'recruiting_media', subcategory: 'state_recruiting', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Iowa HS football recruiting coverage', estimated_followers: 10000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 15 },
  { id: 'rm-020', name: 'Prep Redzone MI', handle: '@PrepRedzoneMI', category: 'recruiting_media', subcategory: 'state_recruiting', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Michigan HS football recruiting coverage', estimated_followers: 15000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 15 },
  { id: 'rm-021', name: 'Prep Redzone OH', handle: '@PrepRedzoneOH', category: 'recruiting_media', subcategory: 'state_recruiting', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Ohio HS football recruiting coverage', estimated_followers: 12000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 15 },

  // Wisconsin-specific recruiting media
  { id: 'rm-022', name: 'Badger Blitz', handle: '@BadgerBlitz', category: 'recruiting_media', subcategory: 'wi_recruiting', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'Wisconsin Badgers recruiting and football coverage on Rivals', estimated_followers: 42000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 14 },
  { id: 'rm-023', name: 'WisSports Heroics', handle: '@WisSportsHeroic', category: 'recruiting_media', subcategory: 'wi_recruiting', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'Wisconsin HS sports coverage and recruiting', estimated_followers: 12000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 14 },
  { id: 'rm-024', name: 'Badgers Wire', handle: '@BadgersWire', category: 'recruiting_media', subcategory: 'wi_recruiting', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'USA Today Wisconsin Badgers coverage', estimated_followers: 30000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 15 },

  // Verified recruiting analysts (from research)
  { id: 'rm-025', name: 'Allen Trieu (247 Midwest)', handle: '@AllenTrieu', category: 'recruiting_media', subcategory: 'analyst', follow_priority: 1, engagement_strategy: 'like', bio_snippet: '247Sports Midwest recruiting analyst', estimated_followers: 40000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 14 },
  { id: 'rm-026', name: 'Tom Loy (247)', handle: '@TomLoy247', category: 'recruiting_media', subcategory: 'analyst', follow_priority: 2, engagement_strategy: 'like', bio_snippet: '247Sports national recruiting analyst', estimated_followers: 60000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 15 },
  { id: 'rm-027', name: 'Steve Wiltfong (247)', handle: '@SWiltfong_', category: 'recruiting_media', subcategory: 'analyst', follow_priority: 2, engagement_strategy: 'like', bio_snippet: '247Sports recruiting director', estimated_followers: 100000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 15 },
  { id: 'rm-028', name: 'Adam Gorney (Rivals)', handle: '@adamgorney', category: 'recruiting_media', subcategory: 'analyst', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Rivals national recruiting analyst', estimated_followers: 80000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 15 },
  { id: 'rm-029', name: 'Chad Simmons (On3)', handle: '@ChadSimmons_', category: 'recruiting_media', subcategory: 'analyst', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'On3 national recruiting analyst', estimated_followers: 50000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 16 },
  { id: 'rm-030', name: 'Brandon Huffman (247)', handle: '@BrandonHuffman', category: 'recruiting_media', subcategory: 'analyst', follow_priority: 2, engagement_strategy: 'like', bio_snippet: '247Sports national recruiting editor', estimated_followers: 70000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 16 },
  { id: 'rm-031', name: 'Hayes Fawcett (On3)', handle: '@Hayesfawcett3', category: 'recruiting_media', subcategory: 'analyst', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'On3 recruiting analyst — commitment tracker', estimated_followers: 200000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 16 },
  { id: 'rm-032', name: 'Evan Flood (WI recruiting)', handle: '@Evan_Flood', category: 'recruiting_media', subcategory: 'wi_recruiting', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'Wisconsin recruiting insider', estimated_followers: 15000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 14 },
  { id: 'rm-033', name: 'Badger 247', handle: '@Badger247', category: 'recruiting_media', subcategory: 'wi_recruiting', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: '247Sports Wisconsin Badgers', estimated_followers: 25000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 14 },
  { id: 'rm-034', name: '247 Recruiting', handle: '@247recruiting', category: 'recruiting_media', subcategory: 'national', follow_priority: 2, engagement_strategy: 'like', bio_snippet: '247Sports recruiting coverage', estimated_followers: 150000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 15 },
  { id: 'rm-035', name: 'On3 Recruits', handle: '@On3Recruits', category: 'recruiting_media', subcategory: 'national', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'On3 recruiting coverage', estimated_followers: 95000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 15 },
  { id: 'rm-036', name: 'D3 Direct', handle: '@D3Direct', category: 'recruiting_media', subcategory: 'division', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'D3 football news and coverage', estimated_followers: 5000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 14 },
  { id: 'rm-037', name: 'Greg Smith (Rivals WI)', handle: '@GregSmithRivals', category: 'recruiting_media', subcategory: 'wi_recruiting', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'Rivals Wisconsin analyst', estimated_followers: 10000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 14 },
  { id: 'rm-038', name: 'Elite 11', handle: '@Elite11', category: 'recruiting_media', subcategory: 'camp', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Elite 11 QB competition', estimated_followers: 150000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 16 },
  { id: 'rm-039', name: 'PrepStar', handle: '@CSAPrepStar', category: 'recruiting_media', subcategory: 'national', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'PrepStar recruiting service', estimated_followers: 10000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 15 },
  { id: 'rm-040', name: 'FieldLevel', handle: '@FieldLevel', category: 'recruiting_media', subcategory: 'national', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Athletic recruiting and video platform', estimated_followers: 20000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 16 },
  { id: 'rm-041', name: 'NUC Sports', handle: '@nucsports', category: 'recruiting_media', subcategory: 'camp', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'NUC Sports camp and combine', estimated_followers: 15000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 16 },
  { id: 'rm-042', name: 'Prep Redzone IN', handle: '@PrepRedzoneIN', category: 'recruiting_media', subcategory: 'state_recruiting', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Indiana HS football recruiting coverage', estimated_followers: 8000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 15 },
  { id: 'rm-043', name: 'Travis Wilson (WSN)', handle: '@travisWSN', category: 'recruiting_media', subcategory: 'wi_recruiting', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'WisSports.net reporter', estimated_followers: 5000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 14 },
];

// ---------------------------------------------------------------------------
// 6. Wisconsin HS Football Community
// ---------------------------------------------------------------------------

const wiHsCommunity: PeerFollowTarget[] = [
  // State organizations
  { id: 'wh-001', name: 'WIAA Sports', handle: '@waboraiaawis', category: 'wi_hs_community', subcategory: 'state_org', follow_priority: 1, engagement_strategy: 'like', bio_snippet: 'Wisconsin Interscholastic Athletic Association', estimated_followers: 18000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 17 },
  { id: 'wh-002', name: 'WI Football Coaches Assoc', handle: '@WFCA_Football', category: 'wi_hs_community', subcategory: 'state_org', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'Wisconsin Football Coaches Association', estimated_followers: 5400, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 17 },

  // WI Sports media
  { id: 'wh-003', name: 'WisSports.net', handle: '@WisSports', category: 'wi_hs_community', subcategory: 'media', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'Wisconsin high school sports coverage', estimated_followers: 15000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 17 },
  { id: 'wh-004', name: 'WI Prep Sports', handle: '@WIPrepSports', category: 'wi_hs_community', subcategory: 'media', follow_priority: 1, engagement_strategy: 'like', bio_snippet: 'Wisconsin prep sports news and highlights', estimated_followers: 8700, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 17 },

  // Pewaukee and Classic 8 conference
  { id: 'wh-005', name: 'Pewaukee Football', handle: '@PewaukeePirates', category: 'wi_hs_community', subcategory: 'classic_8', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'Jacobs own team — Pewaukee Pirates Football', estimated_followers: 1200, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 17 },
  { id: 'wh-006', name: 'Muskego Warriors Football', handle: '@MuskegoFB', category: 'wi_hs_community', subcategory: 'classic_8', follow_priority: 1, engagement_strategy: 'like', bio_snippet: 'Muskego Warriors HS Football — Classic 8 rival', estimated_followers: 1800, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 17 },
  { id: 'wh-007', name: 'Waukesha West Football', handle: '@WaukWestFB', category: 'wi_hs_community', subcategory: 'classic_8', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Waukesha West Wolverines Football — Classic 8', estimated_followers: 950, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 18 },
  { id: 'wh-008', name: 'Brookfield Central Football', handle: '@BCLancersFB', category: 'wi_hs_community', subcategory: 'classic_8', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Brookfield Central Lancers Football — Classic 8', estimated_followers: 1100, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 18 },
  { id: 'wh-009', name: 'Oconomowoc Football', handle: '@OconFB', category: 'wi_hs_community', subcategory: 'classic_8', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Oconomowoc Raccoons Football — Classic 8', estimated_followers: 800, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 18 },
  { id: 'wh-010', name: 'Waukesha North Football', handle: '@WNorthstarsFB', category: 'wi_hs_community', subcategory: 'classic_8', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Waukesha North Northstars Football — Classic 8', estimated_followers: 600, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 18 },

  // Greater Metro & Big 8
  { id: 'wh-011', name: 'Arrowhead Football', handle: '@ArrowheadFB', category: 'wi_hs_community', subcategory: 'greater_metro', follow_priority: 1, engagement_strategy: 'like', bio_snippet: 'Arrowhead Warhawks Football — Hartland WI', estimated_followers: 2100, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 17 },
  { id: 'wh-012', name: 'Mukwonago Football', handle: '@MukwonagoFB', category: 'wi_hs_community', subcategory: 'greater_metro', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Mukwonago HS Football', estimated_followers: 870, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 18 },
  { id: 'wh-013', name: 'Kettle Moraine Football', handle: '@KMFootball', category: 'wi_hs_community', subcategory: 'greater_metro', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Kettle Moraine Lasers Football', estimated_followers: 1050, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 18 },
  { id: 'wh-014', name: 'Sun Prairie Football', handle: '@SPCardinalsFB', category: 'wi_hs_community', subcategory: 'big_8', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Sun Prairie Cardinals Football', estimated_followers: 1600, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 18 },
  { id: 'wh-015', name: 'Kimberly Papermakers FB', handle: '@KimberlyFB', category: 'wi_hs_community', subcategory: 'fox_valley', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Kimberly Papermakers Football — Fox Valley', estimated_followers: 2300, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 18 },

  // Milwaukee area powerhouses
  { id: 'wh-016', name: 'Waunakee Football', handle: '@WaunakeeFB', category: 'wi_hs_community', subcategory: 'badger_conf', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Waunakee Warriors Football', estimated_followers: 1200, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 19 },
  { id: 'wh-017', name: 'Brookfield East Football', handle: '@BEastSpartanFB', category: 'wi_hs_community', subcategory: 'greater_metro', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Brookfield East Spartans Football', estimated_followers: 700, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 19 },
  { id: 'wh-018', name: 'Catholic Memorial Football', handle: '@CMCrusaderFB', category: 'wi_hs_community', subcategory: 'metro_private', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Catholic Memorial Crusaders — Waukesha', estimated_followers: 1500, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 19 },
  { id: 'wh-019', name: 'Marquette HS Football', handle: '@MUHSFB', category: 'wi_hs_community', subcategory: 'metro_private', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Marquette University HS Football — Milwaukee', estimated_followers: 1800, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 19 },

  // Northern WI / state powers
  { id: 'wh-020', name: 'Bay Port Football', handle: '@BayPortFB', category: 'wi_hs_community', subcategory: 'fox_river', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Bay Port Pirates Football — recent state power', estimated_followers: 1500, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 19 },
  { id: 'wh-021', name: 'Franklin Football', handle: '@FranklinSaberFB', category: 'wi_hs_community', subcategory: 'se_wisconsin', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Franklin Sabers Football — SE Wisconsin', estimated_followers: 900, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 20 },
  { id: 'wh-022', name: 'Greendale Football', handle: '@GreendaleFB', category: 'wi_hs_community', subcategory: 'se_wisconsin', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Greendale Panthers Football', estimated_followers: 500, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 20 },
  { id: 'wh-023', name: 'New Berlin West Football', handle: '@NBWestFB', category: 'wi_hs_community', subcategory: 'se_wisconsin', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'New Berlin West Vikings Football', estimated_followers: 400, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 20 },
  { id: 'wh-024', name: 'Homestead Football', handle: '@HomesteadFB', category: 'wi_hs_community', subcategory: 'north_shore', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Homestead Highlanders Football — Mequon', estimated_followers: 800, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 20 },
  { id: 'wh-025', name: 'Germantown Football', handle: '@GtownFB', category: 'wi_hs_community', subcategory: 'north_shore', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Germantown Warhawks Football', estimated_followers: 700, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 20 },
];

// ---------------------------------------------------------------------------
// 7. Midwest HS Community (MN, IL, IA, MI)
// ---------------------------------------------------------------------------

const midwestHsCommunity: PeerFollowTarget[] = [
  // Minnesota
  { id: 'mw-001', name: 'MN Football Hub', handle: '@MNFootballHub', category: 'midwest_hs_community', subcategory: 'minnesota', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Minnesota HS football news and scores', estimated_followers: 12000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 19 },
  { id: 'mw-002', name: 'MSHSL', handle: '@MSHSL', category: 'midwest_hs_community', subcategory: 'minnesota', follow_priority: 2, engagement_strategy: 'follow_only', bio_snippet: 'Minnesota State HS League', estimated_followers: 15000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 19 },
  { id: 'mw-003', name: 'Eden Prairie Football', handle: '@EPEaglesFB', category: 'midwest_hs_community', subcategory: 'minnesota', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Eden Prairie Eagles — MN powerhouse', estimated_followers: 3000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 20 },
  { id: 'mw-004', name: 'Lakeville South Football', handle: '@LSCougarFB', category: 'midwest_hs_community', subcategory: 'minnesota', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Lakeville South Cougars Football', estimated_followers: 2000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 20 },
  { id: 'mw-005', name: 'Rosemount Football', handle: '@RosemountFB', category: 'midwest_hs_community', subcategory: 'minnesota', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Rosemount Irish Football', estimated_followers: 1500, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 20 },

  // Illinois
  { id: 'mw-006', name: 'IHSA', handle: '@IHSA_IL', category: 'midwest_hs_community', subcategory: 'illinois', follow_priority: 2, engagement_strategy: 'follow_only', bio_snippet: 'Illinois High School Association', estimated_followers: 25000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 19 },
  { id: 'mw-007', name: 'Naperville Central FB', handle: '@NCentralFB', category: 'midwest_hs_community', subcategory: 'illinois', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Naperville Central Redhawks Football', estimated_followers: 2000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 20 },

  // Iowa
  { id: 'mw-008', name: 'Iowa HS Athletic Assn', handle: '@IGHSAU', category: 'midwest_hs_community', subcategory: 'iowa', follow_priority: 2, engagement_strategy: 'follow_only', bio_snippet: 'Iowa HS Athletic Association', estimated_followers: 10000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 19 },

  // Michigan
  { id: 'mw-009', name: 'MHSAA', handle: '@MABORAHSAA', category: 'midwest_hs_community', subcategory: 'michigan', follow_priority: 2, engagement_strategy: 'follow_only', bio_snippet: 'Michigan HS Athletic Association', estimated_followers: 20000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 19 },
];

// ---------------------------------------------------------------------------
// 8. Strength & Training
// ---------------------------------------------------------------------------

const strengthTraining: PeerFollowTarget[] = [
  // OL-specific
  { id: 'st-001', name: 'OL Masterminds', handle: '@OLMasterminds', category: 'strength_training', subcategory: 'ol_specific', follow_priority: 1, engagement_strategy: 'like', bio_snippet: 'Offensive line technique, training, and development', estimated_followers: 34000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 21 },
  { id: 'st-002', name: 'The OL Room', handle: '@TheOLRoom', category: 'strength_training', subcategory: 'ol_specific', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'OL technique breakdowns and training tips', estimated_followers: 15000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 21 },
  { id: 'st-003', name: 'OLine Performance', handle: '@OLinePerform', category: 'strength_training', subcategory: 'ol_specific', follow_priority: 1, engagement_strategy: 'like', bio_snippet: 'Offensive line performance training and development', estimated_followers: 8000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 21 },

  // Football strength
  { id: 'st-004', name: 'D1 Bound', handle: '@D1Bound', category: 'strength_training', subcategory: 'football_training', follow_priority: 2, engagement_strategy: 'follow_only', bio_snippet: 'Training and development for aspiring college football players', estimated_followers: 56000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 22 },
  { id: 'st-005', name: 'Trench Training', handle: '@TrenchTraining', category: 'strength_training', subcategory: 'lineman_specific', follow_priority: 1, engagement_strategy: 'like', bio_snippet: 'OL/DL specific drills, film study, and strength programs', estimated_followers: 18000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 21 },
  { id: 'st-006', name: 'Lineman Life', handle: '@LinemanLifeFB', category: 'strength_training', subcategory: 'lineman_specific', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'For the big guys — OL/DL training, nutrition, and culture', estimated_followers: 38000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 22 },
  { id: 'st-007', name: 'NSCA', handle: '@NSCA', category: 'strength_training', subcategory: 'strength_org', follow_priority: 2, engagement_strategy: 'follow_only', bio_snippet: 'National Strength and Conditioning Association', estimated_followers: 80000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 23 },
  { id: 'st-008', name: 'Zach Even-Esh', handle: '@ZEvenEsh', category: 'strength_training', subcategory: 'strength_coach', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Underground strength coach, football performance', estimated_followers: 45000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 23 },
  { id: 'st-009', name: 'EliteFTS', handle: '@EliteFTS', category: 'strength_training', subcategory: 'strength_resource', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Strength training equipment and education', estimated_followers: 100000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 23 },
  { id: 'st-010', name: 'Joe DeFranco', handle: '@DeFranco', category: 'strength_training', subcategory: 'strength_coach', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'NFL combine prep and athlete performance', estimated_followers: 90000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 23 },

  // Verified OL-specific accounts from research
  { id: 'st-011', name: 'Duke Manyweather (OL Masterminds)', handle: '@BigDuke50', category: 'strength_training', subcategory: 'ol_specific', follow_priority: 1, engagement_strategy: 'like', bio_snippet: 'Premier OL training — Duke Manyweather', estimated_followers: 50000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 21 },
  { id: 'st-012', name: 'Joe Thomas (former NFL OL)', handle: '@joethomas73', category: 'strength_training', subcategory: 'ol_specific', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'HOF OL — great OL content and technique talk', estimated_followers: 200000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 22 },
  { id: 'st-013', name: 'LeCharles Bentley (OL coach)', handle: '@LeCharlesBent65', category: 'strength_training', subcategory: 'ol_specific', follow_priority: 1, engagement_strategy: 'like', bio_snippet: 'Former NFL OL — OL training and development', estimated_followers: 30000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 21 },
  { id: 'st-014', name: 'OL Coach Castillo', handle: '@olcoachcastillo', category: 'strength_training', subcategory: 'ol_specific', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'OL technique and training specialist', estimated_followers: 10000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 21 },
  { id: 'st-015', name: 'Oline Probz', handle: '@Oline_Probz', category: 'strength_training', subcategory: 'ol_specific', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'OL culture and memes — builds community', estimated_followers: 15000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 22 },

  // Verified DL-specific
  { id: 'st-016', name: 'D-Line Coach', handle: '@Dline_coach', category: 'strength_training', subcategory: 'dl_specific', follow_priority: 1, engagement_strategy: 'like', bio_snippet: 'DL technique and training', estimated_followers: 20000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 21 },
  { id: 'st-017', name: 'D-Line Club', handle: '@DLineclub', category: 'strength_training', subcategory: 'dl_specific', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'DL community and training content', estimated_followers: 8000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 22 },

  // Verified speed/agility
  { id: 'st-018', name: 'Zach Dechant (TCU S&C)', handle: '@ZachDechant', category: 'strength_training', subcategory: 'strength_coach', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'TCU strength coach — football S&C content', estimated_followers: 30000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 23 },
  { id: 'st-019', name: 'Tony Villani (speed)', handle: '@Tony_Villani_', category: 'strength_training', subcategory: 'speed_training', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Speed and agility training for football', estimated_followers: 15000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 23 },
  { id: 'st-020', name: 'The Speed Dr', handle: '@TheSpeedDr', category: 'strength_training', subcategory: 'speed_training', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Speed science and football agility', estimated_followers: 12000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 24 },
];

// ---------------------------------------------------------------------------
// 9. Recruiting Camps & Events
// ---------------------------------------------------------------------------

const recruitingCamps: PeerFollowTarget[] = [
  { id: 'rc-001', name: 'Under Armour All-America', handle: '@AllAmericaGame', category: 'recruiting_camp', subcategory: 'national_camp', follow_priority: 3, engagement_strategy: 'follow_only', bio_snippet: 'Under Armour All-America Game', estimated_followers: 80000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 24 },
  { id: 'rc-002', name: 'Rivals Camp Series', handle: '@RivalsCamp', category: 'recruiting_camp', subcategory: 'national_camp', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Rivals national camp series', estimated_followers: 30000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 24 },
  { id: 'rc-003', name: 'NFTC', handle: '@StudentSports', category: 'recruiting_camp', subcategory: 'national_camp', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Nike Football Training Camp', estimated_followers: 25000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 24 },
  { id: 'rc-004', name: 'FBU', handle: '@FBUcamp', category: 'recruiting_camp', subcategory: 'national_camp', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Football University camp and combine', estimated_followers: 40000, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 24 },
];

// ---------------------------------------------------------------------------
// 10. Verified Peer Recruits — Class of 2028/2029 OL/DL from research
// ---------------------------------------------------------------------------

const verifiedPeerRecruits: PeerFollowTarget[] = [
  // Class of 2028 — Wisconsin
  { id: 'vp-001', name: 'Jack Walter (OL/DL, West Bend East)', handle: '@JackWalter76', category: 'peer_recruit', subcategory: 'class_2028_WI', follow_priority: 1, engagement_strategy: 'like', bio_snippet: 'Class of 2028 OL/DL | West Bend East, WI', estimated_followers: 100, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 3 },
  { id: 'vp-002', name: 'Hendrix Dawson (DL/OL, WI Dells)', handle: '@HendrixDawson', category: 'peer_recruit', subcategory: 'class_2028_WI', follow_priority: 1, engagement_strategy: 'like', bio_snippet: 'Class of 2028 DL/OL | Wisconsin Dells HS', estimated_followers: 80, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 3 },
  { id: 'vp-003', name: 'Ty Meulemans (DL, Marquette HS)', handle: '@TyMeulemans2028', category: 'peer_recruit', subcategory: 'class_2028_WI', follow_priority: 1, engagement_strategy: 'like', bio_snippet: 'Class of 2028 DL | Marquette Univ HS, Milwaukee', estimated_followers: 120, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 4 },
  { id: 'vp-004', name: 'Noah Kiley (OL/DL, Menasha)', handle: '@NoahKiley367953', category: 'peer_recruit', subcategory: 'class_2028_WI', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Class of 2028 OL/DL | Menasha HS, WI', estimated_followers: 60, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 4 },
  { id: 'vp-005', name: 'Cooper Landrath (OL/DL, Neenah)', handle: '@CooperLandrath1', category: 'peer_recruit', subcategory: 'class_2028_WI', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Class of 2028 OL/DL | Neenah HS, WI', estimated_followers: 70, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 4 },
  { id: 'vp-006', name: 'Max Crimmings (OL/DL, WI)', handle: '@MaxCrimmings', category: 'peer_recruit', subcategory: 'class_2028_WI', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Class of 2028 OL/DL | Wisconsin', estimated_followers: 50, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 5 },
  { id: 'vp-007', name: 'Chris Ferrario (OL, WI)', handle: '@ChrisFerrario60', category: 'peer_recruit', subcategory: 'class_2028_WI', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Class of 2028 OL | Wisconsin', estimated_followers: 50, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 5 },
  { id: 'vp-008', name: 'Roman Holtz (OL/EDGE, WI)', handle: '@RomanHoltz', category: 'peer_recruit', subcategory: 'class_2028_WI', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Class of 2028 OL/EDGE | Wisconsin', estimated_followers: 60, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 5 },
  { id: 'vp-009', name: 'Jace Font (OL, WI)', handle: '@fontjace62', category: 'peer_recruit', subcategory: 'class_2028_WI', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Class of 2028 OL | Wisconsin', estimated_followers: 40, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 6 },

  // Class of 2028 — Illinois
  { id: 'vp-010', name: 'Wyatt VanBoening (OT, Carmel Catholic)', handle: '@WyattVanBoening', category: 'peer_recruit', subcategory: 'class_2028_IL', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'Class of 2028 OT | Carmel Catholic, Mundelein IL | 10 P4 offers', estimated_followers: 500, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 3 },
  { id: 'vp-011', name: 'Stephen Caxton-Idowu (OT, Carl Sandburg)', handle: '@StephenCaxton', category: 'peer_recruit', subcategory: 'class_2028_IL', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Class of 2028 OT | Carl Sandburg HS, Orland Park IL', estimated_followers: 200, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 4 },
  { id: 'vp-012', name: 'Benjamin Coleman (OT/TE, Providence Catholic)', handle: '@BenjaminCo38637', category: 'peer_recruit', subcategory: 'class_2028_IL', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Class of 2028 OT/TE | Providence Catholic, Chicago IL', estimated_followers: 100, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 5 },
  { id: 'vp-013', name: 'Sylas Rohl (OT, Fisher HS)', handle: '@SylasRohl2028', category: 'peer_recruit', subcategory: 'class_2028_IL', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Class of 2028 OT | Fisher HS, Fisher IL', estimated_followers: 60, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 5 },
  { id: 'vp-014', name: 'Jeffery Reyes (OL/DL, IL)', handle: '@jeffery_reyes28', category: 'peer_recruit', subcategory: 'class_2028_IL', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Class of 2028 OL/DL | Illinois', estimated_followers: 80, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 6 },
  { id: 'vp-015', name: 'Luke Zajicek (OL, IL)', handle: '@Luke_Zajicek', category: 'peer_recruit', subcategory: 'class_2028_IL', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Class of 2028 OL | Illinois', estimated_followers: 60, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 6 },
  { id: 'vp-016', name: 'Liam Barrett (OL, IL)', handle: '@Liam_barrett78', category: 'peer_recruit', subcategory: 'class_2028_IL', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Class of 2028 OL | Illinois', estimated_followers: 50, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 7 },
  { id: 'vp-017', name: 'Nathan German (OL, IL)', handle: '@NathanGerman77', category: 'peer_recruit', subcategory: 'class_2028_IL', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Class of 2028 OL | Illinois', estimated_followers: 50, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 7 },
  { id: 'vp-018', name: 'Joshua Larsen (OL/DL, IL)', handle: '@JoshuaLarsen72', category: 'peer_recruit', subcategory: 'class_2028_IL', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Class of 2028 OL/DL | Illinois', estimated_followers: 50, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 8 },

  // Class of 2029 — Ohio
  { id: 'vp-019', name: 'Noah Grimmett (IOL/DL, St Francis DeSales OH)', handle: '@NoahGrimmett29', category: 'peer_recruit', subcategory: 'class_2029_OH', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Class of 2029 IOL/DL | St Francis DeSales, Columbus OH', estimated_followers: 80, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 4 },
  { id: 'vp-020', name: 'Hayden Price (OL/DL, Dublin Coffman OH)', handle: '@HaydenPrice3711', category: 'peer_recruit', subcategory: 'class_2029_OH', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Class of 2029 OL/DL | Dublin Coffman HS, OH', estimated_followers: 60, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 5 },
  { id: 'vp-021', name: 'Myles Anderson (OG/C, Xenia OH)', handle: '@Myles61Anderson', category: 'peer_recruit', subcategory: 'class_2029_OH', follow_priority: 2, engagement_strategy: 'like', bio_snippet: 'Class of 2029 OG/C | Xenia HS, OH', estimated_followers: 50, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 6 },

  // Bonus — Class of 2026 WI recruit (networking target)
  { id: 'vp-022', name: 'James Thomas (IOL, Oak Creek WI)', handle: '@liljamearl', category: 'peer_recruit', subcategory: 'class_2026_WI', follow_priority: 1, engagement_strategy: 'reply', bio_snippet: 'Class of 2026 IOL | Oak Creek HS, WI — committed recruit, network connection', estimated_followers: 300, followed_date: null, follow_back_status: 'not_followed', scheduled_week: 3 },
];

// ---------------------------------------------------------------------------
// Combine all targets + deduplicate by handle
// ---------------------------------------------------------------------------

function deduplicateByHandle(targets: PeerFollowTarget[]): PeerFollowTarget[] {
  const seen = new Set<string>();
  return targets.filter((t) => {
    const normalized = t.handle.toLowerCase();
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

export const peerFollowTargets: PeerFollowTarget[] = deduplicateByHandle([
  ...programsFromTargetSchools,
  ...fromExpanded,
  ...competitorTargets,
  ...additionalPrograms,
  ...recruitingMedia,
  ...wiHsCommunity,
  ...midwestHsCommunity,
  ...strengthTraining,
  ...verifiedCoaches,
  ...recruitingCamps,
  ...verifiedPeerRecruits,
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getTargetsByCategory(category: string): PeerFollowTarget[] {
  return peerFollowTargets.filter((t) => t.category === category);
}

export function getTargetsForWeek(week: number): PeerFollowTarget[] {
  return peerFollowTargets.filter((t) => t.scheduled_week === week);
}

export function getScheduledTargets(): PeerFollowTarget[] {
  return peerFollowTargets
    .filter((t) => t.scheduled_week !== null)
    .sort((a, b) => (a.scheduled_week ?? 0) - (b.scheduled_week ?? 0));
}

export function getUnscheduledTargets(): PeerFollowTarget[] {
  return peerFollowTargets.filter((t) => t.scheduled_week === null);
}

// ---------------------------------------------------------------------------
// Follower growth targets (updated for expanded follow strategy)
// ---------------------------------------------------------------------------

export const followerGrowthTargets = {
  baseline: 47,
  week4: 120,
  week8: 200,
  week12: 290,
  week16: 380,
  week20: 460,
  week26: 600,
};

// ---------------------------------------------------------------------------
// Schedule summary
// ---------------------------------------------------------------------------

export const followScheduleSummary = {
  totalTargets: peerFollowTargets.length,
  weeksInPlan: 26,
  followsPerWeek: '7-8',
  phases: [
    { weeks: '1-4', focus: 'D2/D3 programs and coaches (highest follow-back probability)', targetCount: 0 },
    { weeks: '5-8', focus: 'FCS programs and coaches', targetCount: 0 },
    { weeks: '9-14', focus: 'FBS programs, Big Ten, division media', targetCount: 0 },
    { weeks: '15-16', focus: 'National recruiting media platforms', targetCount: 0 },
    { weeks: '17-20', focus: 'WI HS community + Midwest HS', targetCount: 0 },
    { weeks: '21-24', focus: 'Strength/training + recruiting camps', targetCount: 0 },
    { weeks: '25-26', focus: 'Overflow and catch-up', targetCount: 0 },
  ],
};

// Compute phase target counts
followScheduleSummary.phases[0].targetCount = peerFollowTargets.filter((t) => t.scheduled_week && t.scheduled_week >= 1 && t.scheduled_week <= 4).length;
followScheduleSummary.phases[1].targetCount = peerFollowTargets.filter((t) => t.scheduled_week && t.scheduled_week >= 5 && t.scheduled_week <= 8).length;
followScheduleSummary.phases[2].targetCount = peerFollowTargets.filter((t) => t.scheduled_week && t.scheduled_week >= 9 && t.scheduled_week <= 14).length;
followScheduleSummary.phases[3].targetCount = peerFollowTargets.filter((t) => t.scheduled_week && t.scheduled_week >= 15 && t.scheduled_week <= 16).length;
followScheduleSummary.phases[4].targetCount = peerFollowTargets.filter((t) => t.scheduled_week && t.scheduled_week >= 17 && t.scheduled_week <= 20).length;
followScheduleSummary.phases[5].targetCount = peerFollowTargets.filter((t) => t.scheduled_week && t.scheduled_week >= 21 && t.scheduled_week <= 24).length;
followScheduleSummary.phases[6].targetCount = peerFollowTargets.filter((t) => t.scheduled_week && t.scheduled_week >= 25 && t.scheduled_week <= 26).length;

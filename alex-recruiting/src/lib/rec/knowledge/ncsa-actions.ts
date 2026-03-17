import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { followUser, verifyHandle } from "@/lib/integrations/x-api";
import { jacobProfile } from "@/lib/data/jacob-profile";
import type { NCSALead } from "@/lib/rec/types";
import { getAllLeads, updateLeadStatus } from "@/lib/rec/knowledge/ncsa-leads";

interface CoachDirectoryRow {
  id: string;
  name: string;
  title: string | null;
  school_name: string | null;
  x_handle: string | null;
  follow_status: string | null;
  dm_status: string | null;
}

export interface NCSALeadSummary {
  totalLeads: number;
  bySource: Record<NCSALead["source"], number>;
  byStatus: Record<NCSALead["outreachStatus"], number>;
  uniqueSchools: number;
  schoolsThatSearched: number;
  schoolsThatViewedProfile: number;
  schoolsThatFollowed: number;
  schoolsThatReachedOut: number;
  searchesDetected: number;
  followsDetected: number;
  messagesReceived: number;
  campInvitesReceived: number;
  xReadyLeads: number;
  followReadyLeads: number;
  lastDetectedAt: string | null;
}

export interface LeadCoachMatch {
  leadId: string;
  matchConfidence: "high" | "medium" | "low";
  score: number;
  matchedCoachId: string | null;
  matchedCoachName: string | null;
  matchedCoachTitle: string | null;
  matchedCoachSchool: string | null;
  matchedCoachXHandle: string | null;
  matchedCoachFollowStatus: string | null;
  thankYouDraft: string;
}

export interface FollowLeadCoachResult {
  ok: boolean;
  leadId: string;
  matchedCoachId: string | null;
  matchedCoachName: string | null;
  matchedCoachXHandle: string | null;
  followed: boolean;
  message: string;
}

export function dedupeNcsaLeads(leads: NCSALead[]): NCSALead[] {
  const seen = new Set<string>();

  return [...leads]
    .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())
    .filter((lead) => {
      const key = getLeadKey(lead);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
}

function normalize(value: string | null | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getLeadKey(lead: NCSALead): string {
  const school = normalize(lead.schoolName);
  const coach = normalize(lead.coachName);

  if (lead.source === "message") {
    return `message|${school}|${coach}`;
  }

  if (lead.source === "camp_invite") {
    return `camp|${school}|${coach}|${normalize(
      lead.sourceDetail.replace(/^Camp invite:\s*/i, "")
    )}`;
  }

  if (lead.source === "manual") {
    if (lead.sourceDetail.startsWith("NCSA search:")) {
      return `search|${school}|${coach}`;
    }
    if (lead.sourceDetail.startsWith("NCSA follow:")) {
      return `follow|${school}|${coach}`;
    }
  }

  return `${lead.source}|${school}|${coach}`;
}

function getLastName(value: string | null | undefined): string {
  const parts = normalize(value).split(" ").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

function sanitizeXHandle(value: string | null | undefined): string | null {
  if (!value) return null;

  const cleaned = value
    .trim()
    .replace(/^@/, "")
    .replace(/[^A-Za-z0-9_].*$/, "")
    .replace(/(view|register|registration|reg|info|univ|uni)$/i, "")
    .slice(0, 15);

  return cleaned ? `@${cleaned}` : null;
}

function getSchoolTokens(value: string | null | undefined): string[] {
  const stopWords = new Set([
    "university",
    "college",
    "state",
    "of",
    "the",
    "at",
    "saint",
    "st",
  ]);

  return normalize(value)
    .split(" ")
    .filter((token) => token.length > 2 && !stopWords.has(token));
}

function scoreCoachMatch(lead: NCSALead, coach: CoachDirectoryRow): number {
  const leadSchool = normalize(lead.schoolName);
  const coachSchool = normalize(coach.school_name);
  if (!leadSchool || !coachSchool) return 0;

  let score = 0;
  const leadTokens = getSchoolTokens(lead.schoolName);
  const coachTokens = getSchoolTokens(coach.school_name);
  const overlappingTokens = leadTokens.filter((token) => coachTokens.includes(token));

  if (leadSchool === coachSchool) {
    score += 70;
  } else if (overlappingTokens.length >= 2) {
    score += 40;
  } else {
    return 0;
  }

  const leadCoach = normalize(lead.coachName);
  const coachName = normalize(coach.name);
  if (leadCoach && leadCoach !== "camp coordinator" && leadCoach !== "unknown coach") {
    if (leadCoach === coachName) {
      score += 40;
    } else {
      const leadLast = getLastName(lead.coachName);
      const coachLast = getLastName(coach.name);
      if (leadLast && leadLast === coachLast) {
        score += 18;
      }
    }
  }

  const title = normalize(coach.title);
  if (/(offensive line|defensive line|linebackers|run game|head coach|recruit)/.test(title)) {
    score += 10;
  }
  if (coach.x_handle) {
    score += 8;
  }

  return score;
}

function confidenceForScore(score: number): LeadCoachMatch["matchConfidence"] {
  if (score >= 100) return "high";
  if (score >= 78) return "medium";
  return "low";
}

function getRecruitingLink(): string {
  return (
    jacobProfile.ncsaProfileUrl ||
    jacobProfile.hudlUrl ||
    jacobProfile.websiteUrl ||
    "https://alex-recruiting.vercel.app/recruit"
  );
}

function buildThankYouDraft(
  lead: NCSALead,
  coach: CoachDirectoryRow | null
): string {
  const coachName = coach?.name || lead.coachName || "Coach";
  const schoolName = coach?.school_name || lead.schoolName;
  const link = getRecruitingLink();

  if (lead.source === "camp_invite") {
    return `Coach ${coachName}, thank you for the camp invite from ${schoolName}. I'm Jacob Rodgers, a 2029 OL/DL from Pewaukee HS in Wisconsin. I appreciate the opportunity and I'm excited to compete. Latest film: ${link}`;
  }

  if (lead.source === "message") {
    return `Coach ${coachName}, thank you for reaching out from ${schoolName}. I'm Jacob Rodgers, 2029 OL/DL from Pewaukee HS in Wisconsin. I appreciate the note and would love to stay in touch. Film and profile: ${link}`;
  }

  return `Coach ${coachName}, thank you for taking a look at my profile from ${schoolName}. I'm Jacob Rodgers, a 2029 OL/DL from Pewaukee HS in Wisconsin. I appreciate the time and would love to stay on your radar. Film and profile: ${link}`;
}

export function buildLeadSummary(
  leads: NCSALead[],
  matches: LeadCoachMatch[] = []
): NCSALeadSummary {
  const bySource = {
    profile_view: 0,
    camp_invite: 0,
    message: 0,
    manual: 0,
  } satisfies Record<NCSALead["source"], number>;

  const byStatus = {
    new: 0,
    researched: 0,
    followed: 0,
    dm_drafted: 0,
    dm_sent: 0,
    responded: 0,
  } satisfies Record<NCSALead["outreachStatus"], number>;

  const uniqueSchools = new Set<string>();
  const schoolsThatSearched = new Set<string>();
  const schoolsThatViewedProfile = new Set<string>();
  const schoolsThatFollowed = new Set<string>();
  const schoolsThatReachedOut = new Set<string>();
  let searchesDetected = 0;
  let followsDetected = 0;

  for (const lead of leads) {
    uniqueSchools.add(normalize(lead.schoolName));
    bySource[lead.source] += 1;
    byStatus[lead.outreachStatus] += 1;

    if (lead.source === "profile_view") {
      schoolsThatViewedProfile.add(normalize(lead.schoolName));
    }
    if (lead.source === "manual" && lead.sourceDetail.startsWith("NCSA search:")) {
      schoolsThatSearched.add(normalize(lead.schoolName));
      searchesDetected += 1;
    }
    if (lead.source === "manual" && lead.sourceDetail.startsWith("NCSA follow:")) {
      schoolsThatFollowed.add(normalize(lead.schoolName));
      followsDetected += 1;
    }
    if (lead.source === "message" || lead.source === "camp_invite") {
      schoolsThatReachedOut.add(normalize(lead.schoolName));
    }
  }

  const xReadyLeads = matches.filter((match) => Boolean(match.matchedCoachXHandle)).length;
  const followReadyLeads = matches.filter(
    (match) =>
      Boolean(match.matchedCoachXHandle) &&
      (match.matchedCoachFollowStatus ?? "not_followed") === "not_followed"
  ).length;

  return {
    totalLeads: leads.length,
    bySource,
    byStatus,
    uniqueSchools: Array.from(uniqueSchools).filter(Boolean).length,
    schoolsThatSearched: Array.from(schoolsThatSearched).filter(Boolean).length,
    schoolsThatViewedProfile: Array.from(schoolsThatViewedProfile).filter(Boolean).length,
    schoolsThatFollowed: Array.from(schoolsThatFollowed).filter(Boolean).length,
    schoolsThatReachedOut: Array.from(schoolsThatReachedOut).filter(Boolean).length,
    searchesDetected,
    followsDetected,
    messagesReceived: bySource.message,
    campInvitesReceived: bySource.camp_invite,
    xReadyLeads,
    followReadyLeads,
    lastDetectedAt: leads[0]?.detectedAt ?? null,
  };
}

export function buildLeadCoachMatchesFromRows(
  leads: NCSALead[],
  coaches: CoachDirectoryRow[]
): LeadCoachMatch[] {
  return leads
    .map((lead) => {
      const ranked = coaches
        .map((coach) => ({ coach, score: scoreCoachMatch(lead, coach) }))
        .filter((candidate) => candidate.score >= 40)
        .sort((a, b) => b.score - a.score);

      const best = ranked[0]?.coach ?? null;
      const score = ranked[0]?.score ?? 0;

      return {
        leadId: lead.id,
        matchConfidence: confidenceForScore(score),
        score,
        matchedCoachId: best?.id ?? null,
        matchedCoachName: best?.name ?? null,
        matchedCoachTitle: best?.title ?? null,
        matchedCoachSchool: best?.school_name ?? null,
        matchedCoachXHandle:
          sanitizeXHandle(lead.xHandle) || sanitizeXHandle(best?.x_handle) || null,
        matchedCoachFollowStatus: best?.follow_status ?? null,
        thankYouDraft: buildThankYouDraft(lead, best),
      } satisfies LeadCoachMatch;
    })
    .sort((a, b) => {
      if (Boolean(b.matchedCoachXHandle) !== Boolean(a.matchedCoachXHandle)) {
        return Number(Boolean(b.matchedCoachXHandle)) - Number(Boolean(a.matchedCoachXHandle));
      }
      return b.score - a.score;
    });
}

export async function getLeadCoachMatches(leads: NCSALead[]): Promise<LeadCoachMatch[]> {
  if (!isSupabaseConfigured() || leads.length === 0) {
    return leads.map((lead) => ({
      leadId: lead.id,
      matchConfidence: "low",
      score: 0,
      matchedCoachId: null,
      matchedCoachName: null,
      matchedCoachTitle: null,
      matchedCoachSchool: null,
      matchedCoachXHandle: lead.xHandle,
      matchedCoachFollowStatus: null,
      thankYouDraft: buildThankYouDraft(lead, null),
    }));
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("coaches")
    .select("id,name,title,school_name,x_handle,follow_status,dm_status");

  if (error) {
    console.error("Failed to load coaches for NCSA lead matching:", error);
    return leads.map((lead) => ({
      leadId: lead.id,
      matchConfidence: "low",
      score: 0,
      matchedCoachId: null,
      matchedCoachName: null,
      matchedCoachTitle: null,
      matchedCoachSchool: null,
      matchedCoachXHandle: lead.xHandle,
      matchedCoachFollowStatus: null,
      thankYouDraft: buildThankYouDraft(lead, null),
    }));
  }

  return buildLeadCoachMatchesFromRows(leads, (data ?? []) as CoachDirectoryRow[]);
}

export async function followLeadCoach(leadId: string): Promise<FollowLeadCoachResult> {
  const leads = await getAllLeads();
  const lead = leads.find((entry) => entry.id === leadId);
  if (!lead) {
    return {
      ok: false,
      leadId,
      matchedCoachId: null,
      matchedCoachName: null,
      matchedCoachXHandle: null,
      followed: false,
      message: "Lead not found",
    };
  }

  const [match] = await getLeadCoachMatches([lead]);
  if (!match?.matchedCoachXHandle) {
    return {
      ok: false,
      leadId,
      matchedCoachId: match?.matchedCoachId ?? null,
      matchedCoachName: match?.matchedCoachName ?? null,
      matchedCoachXHandle: null,
      followed: false,
      message: "No X handle is available for this lead yet",
    };
  }

  const xUser = await verifyHandle(match.matchedCoachXHandle);
  if (!xUser) {
    return {
      ok: false,
      leadId,
      matchedCoachId: match.matchedCoachId,
      matchedCoachName: match.matchedCoachName,
      matchedCoachXHandle: match.matchedCoachXHandle,
      followed: false,
      message: `Could not resolve ${match.matchedCoachXHandle} on X`,
    };
  }

  const followed = await followUser(xUser.id);
  if (!followed) {
    return {
      ok: false,
      leadId,
      matchedCoachId: match.matchedCoachId,
      matchedCoachName: match.matchedCoachName,
      matchedCoachXHandle: match.matchedCoachXHandle,
      followed: false,
      message: "X follow failed",
    };
  }

  await updateLeadStatus(leadId, "followed");

  if (isSupabaseConfigured() && match.matchedCoachId) {
    const supabase = createAdminClient();
    await supabase
      .from("coaches")
      .update({
        follow_status: "followed",
        last_engaged: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", match.matchedCoachId);
  }

  return {
    ok: true,
    leadId,
    matchedCoachId: match.matchedCoachId,
    matchedCoachName: match.matchedCoachName,
    matchedCoachXHandle: match.matchedCoachXHandle,
    followed: true,
    message: `Now following ${match.matchedCoachXHandle} on X`,
  };
}

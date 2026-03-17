/**
 * /api/recruit/social-proof
 *
 * GET — Aggregates real recruiting metrics for the recruit page.
 * Pulls from Supabase tables. Returns zeros if not configured.
 * Cached for 1 hour.
 */

import { NextResponse } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

export interface SocialProofData {
  coachFollowers: number;
  ncsaProfileViews: number;
  campInvites: number;
  contactFormSubmissions: number;
  competitorOffers: number;
  schoolsEngaged: number;
  recentSchools: string[];
  recentSchoolCount: number;
  schoolNames: string[];
  lastUpdated: string;
}

let cachedData: SocialProofData | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function fetchSocialProofData(): Promise<SocialProofData> {
  const data: SocialProofData = {
    coachFollowers: 0,
    ncsaProfileViews: 0,
    campInvites: 0,
    contactFormSubmissions: 0,
    competitorOffers: 0,
    schoolsEngaged: 0,
    recentSchools: [],
    recentSchoolCount: 0,
    schoolNames: [],
    lastUpdated: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) return data;

  const supabase = createAdminClient();

  // Count coach followers (coaches who follow Jacob on X)
  try {
    const { count } = await supabase
      .from("coaches")
      .select("*", { count: "exact", head: true })
      .eq("follow_status", "following_back");
    data.coachFollowers = count ?? 0;
  } catch { /* table may not exist */ }

  // Count NCSA follows as a fallback when X follower syncing lags behind
  try {
    const { count } = await supabase
      .from("ncsa_leads")
      .select("*", { count: "exact", head: true })
      .ilike("source_detail", "NCSA follow:%");
    data.coachFollowers = Math.max(data.coachFollowers, count ?? 0);
  } catch { /* table may not exist */ }

  // Count NCSA profile views from ncsa_leads
  try {
    const { count: profileViews } = await supabase
      .from("ncsa_leads")
      .select("*", { count: "exact", head: true })
      .eq("source", "profile_view");
    data.ncsaProfileViews = profileViews ?? 0;
  } catch { /* table may not exist */ }

  // Count camp invites
  try {
    const { count } = await supabase
      .from("ncsa_leads")
      .select("*", { count: "exact", head: true })
      .eq("source", "camp_invite");
    data.campInvites = count ?? 0;
  } catch { /* table may not exist */ }

  // Count contact form submissions
  try {
    const { count } = await supabase
      .from("coach_inquiries")
      .select("*", { count: "exact", head: true });
    data.contactFormSubmissions = count ?? 0;
  } catch { /* table may not exist */ }

  // Count unique schools that have engaged
  try {
    const { data: schools } = await supabase
      .from("ncsa_leads")
      .select("school_name");
    const uniqueSchools = new Set(
      (schools ?? [])
        .map((s: { school_name: string | null }) => s.school_name?.trim())
        .filter(Boolean)
    );
    data.schoolsEngaged = uniqueSchools.size;
  } catch { /* table may not exist */ }

  // Recent schools (last 30 days)
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentSchoolRows } = await supabase
      .from("ncsa_leads")
      .select("school_name, detected_at")
      .gte("detected_at", thirtyDaysAgo)
      .order("detected_at", { ascending: false });

    const recentUniqueSchools = [
      ...new Set(
        (recentSchoolRows ?? [])
          .map((s: { school_name: string | null }) => s.school_name?.trim())
          .filter(Boolean) as string[]
      ),
    ];
    data.recentSchools = recentUniqueSchools;
    data.recentSchoolCount = recentUniqueSchools.length;
  } catch { /* table may not exist */ }

  // All school names for ticker
  try {
    const { data: allSchoolRows } = await supabase
      .from("ncsa_leads")
      .select("school_name")
      .order("detected_at", { ascending: false });

    const allUniqueSchools = [
      ...new Set(
        (allSchoolRows ?? [])
          .map((s: { school_name: string | null }) => s.school_name?.trim())
          .filter(Boolean) as string[]
      ),
    ];
    data.schoolNames = allUniqueSchools;
  } catch { /* table may not exist */ }

  return data;
}

export async function GET() {
  const now = Date.now();

  // Return cached data if fresh
  if (cachedData && now - cachedAt < CACHE_TTL_MS) {
    return NextResponse.json(cachedData, {
      headers: { "Cache-Control": "public, max-age=3600" },
    });
  }

  const data = await fetchSocialProofData();
  cachedData = data;
  cachedAt = now;

  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}

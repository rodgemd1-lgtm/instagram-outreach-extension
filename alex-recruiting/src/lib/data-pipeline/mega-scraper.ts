/**
 * Mega Coach Scraper
 *
 * Scrapes NCAA football program staff directories to populate the coaches
 * database. Contains a comprehensive hardcoded list of NCAA programs across
 * all divisions, plus scraping functions using Firecrawl and Jina Reader.
 *
 * Usage:
 *   POST /api/data-pipeline/scrape  { division?: "D1_FBS", limit?: 10 }
 */

import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SchoolEntry {
  name: string;
  division: "D1_FBS" | "D1_FCS" | "D2" | "D3" | "NAIA";
  conference: string;
  state: string;
  city: string;
  staffUrl: string;
  rosterUrl: string;
  xHandle: string;
}

export interface ScrapedCoach {
  name: string;
  title: string;
  email: string | null;
  xHandle: string | null;
  school: string;
  division: string;
  recruitingArea: string | null;
}

export interface ScrapeResult {
  totalSchools: number;
  schoolsProcessed: number;
  coachesFound: number;
  coachesStored: number;
  errors: string[];
  startedAt: string;
  completedAt: string | null;
  division: string | null;
}

// ─── Rate Limiter ─────────────────────────────────────────────────────────────

const RATE_LIMIT_MS = 2000; // 1 request per 2 seconds

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Staff URL builder helpers ────────────────────────────────────────────────

function sidearmUrl(subdomain: string, path = "sports/football/coaches"): string {
  return `https://${subdomain}/${path}`;
}

function rosterUrl(subdomain: string, path = "sports/football/roster"): string {
  return `https://${subdomain}/${path}`;
}

// ─── Master School List ───────────────────────────────────────────────────────
//
// Real NCAA football programs organized by division.
// staffUrl/rosterUrl use the Sidearm/SIDEARM Sports pattern used by most
// NCAA athletics websites.

// ────────────────────────────────────────────────────────────────────────────────
//  D1 FBS — ALL 134 PROGRAMS (2024-25)
// ────────────────────────────────────────────────────────────────────────────────

const D1_FBS_SCHOOLS: SchoolEntry[] = [
  // ── SEC ──
  { name: "Alabama", division: "D1_FBS", conference: "SEC", state: "AL", city: "Tuscaloosa", staffUrl: sidearmUrl("rolltide.com"), rosterUrl: rosterUrl("rolltide.com"), xHandle: "@AlabamaFTBL" },
  { name: "Arkansas", division: "D1_FBS", conference: "SEC", state: "AR", city: "Fayetteville", staffUrl: sidearmUrl("arkansasrazorbacks.com"), rosterUrl: rosterUrl("arkansasrazorbacks.com"), xHandle: "@RazorbackFB" },
  { name: "Auburn", division: "D1_FBS", conference: "SEC", state: "AL", city: "Auburn", staffUrl: sidearmUrl("auburntigers.com"), rosterUrl: rosterUrl("auburntigers.com"), xHandle: "@AuburnFootball" },
  { name: "Florida", division: "D1_FBS", conference: "SEC", state: "FL", city: "Gainesville", staffUrl: sidearmUrl("floridagators.com"), rosterUrl: rosterUrl("floridagators.com"), xHandle: "@GatorsFB" },
  { name: "Georgia", division: "D1_FBS", conference: "SEC", state: "GA", city: "Athens", staffUrl: sidearmUrl("georgiadogs.com"), rosterUrl: rosterUrl("georgiadogs.com"), xHandle: "@GeorgiaFootball" },
  { name: "Kentucky", division: "D1_FBS", conference: "SEC", state: "KY", city: "Lexington", staffUrl: sidearmUrl("ukathletics.com"), rosterUrl: rosterUrl("ukathletics.com"), xHandle: "@UKFootball" },
  { name: "LSU", division: "D1_FBS", conference: "SEC", state: "LA", city: "Baton Rouge", staffUrl: sidearmUrl("lsusports.net"), rosterUrl: rosterUrl("lsusports.net"), xHandle: "@LSUfootball" },
  { name: "Mississippi State", division: "D1_FBS", conference: "SEC", state: "MS", city: "Starkville", staffUrl: sidearmUrl("hailstate.com"), rosterUrl: rosterUrl("hailstate.com"), xHandle: "@HailStateFB" },
  { name: "Missouri", division: "D1_FBS", conference: "SEC", state: "MO", city: "Columbia", staffUrl: sidearmUrl("mutigers.com"), rosterUrl: rosterUrl("mutigers.com"), xHandle: "@MizzouFootball" },
  { name: "Oklahoma", division: "D1_FBS", conference: "SEC", state: "OK", city: "Norman", staffUrl: sidearmUrl("soonersports.com"), rosterUrl: rosterUrl("soonersports.com"), xHandle: "@OU_Football" },
  { name: "Ole Miss", division: "D1_FBS", conference: "SEC", state: "MS", city: "Oxford", staffUrl: sidearmUrl("olemisssports.com"), rosterUrl: rosterUrl("olemisssports.com"), xHandle: "@OleMissFB" },
  { name: "South Carolina", division: "D1_FBS", conference: "SEC", state: "SC", city: "Columbia", staffUrl: sidearmUrl("gamecocksonline.com"), rosterUrl: rosterUrl("gamecocksonline.com"), xHandle: "@GamecockFB" },
  { name: "Tennessee", division: "D1_FBS", conference: "SEC", state: "TN", city: "Knoxville", staffUrl: sidearmUrl("utsports.com"), rosterUrl: rosterUrl("utsports.com"), xHandle: "@Vol_Football" },
  { name: "Texas", division: "D1_FBS", conference: "SEC", state: "TX", city: "Austin", staffUrl: sidearmUrl("texassports.com"), rosterUrl: rosterUrl("texassports.com"), xHandle: "@TexasFootball" },
  { name: "Texas A&M", division: "D1_FBS", conference: "SEC", state: "TX", city: "College Station", staffUrl: sidearmUrl("12thman.com"), rosterUrl: rosterUrl("12thman.com"), xHandle: "@AggieFootball" },
  { name: "Vanderbilt", division: "D1_FBS", conference: "SEC", state: "TN", city: "Nashville", staffUrl: sidearmUrl("vucommodores.com"), rosterUrl: rosterUrl("vucommodores.com"), xHandle: "@VandyFootball" },

  // ── Big Ten ──
  { name: "Illinois", division: "D1_FBS", conference: "Big Ten", state: "IL", city: "Champaign", staffUrl: sidearmUrl("fightingillini.com"), rosterUrl: rosterUrl("fightingillini.com"), xHandle: "@IlliniFootball" },
  { name: "Indiana", division: "D1_FBS", conference: "Big Ten", state: "IN", city: "Bloomington", staffUrl: sidearmUrl("iuhoosiers.com"), rosterUrl: rosterUrl("iuhoosiers.com"), xHandle: "@IndianaFootball" },
  { name: "Iowa", division: "D1_FBS", conference: "Big Ten", state: "IA", city: "Iowa City", staffUrl: sidearmUrl("hawkeyesports.com"), rosterUrl: rosterUrl("hawkeyesports.com"), xHandle: "@HawkeyeFootball" },
  { name: "Maryland", division: "D1_FBS", conference: "Big Ten", state: "MD", city: "College Park", staffUrl: sidearmUrl("umterps.com"), rosterUrl: rosterUrl("umterps.com"), xHandle: "@TerpsFootball" },
  { name: "Michigan", division: "D1_FBS", conference: "Big Ten", state: "MI", city: "Ann Arbor", staffUrl: sidearmUrl("mgoblue.com"), rosterUrl: rosterUrl("mgoblue.com"), xHandle: "@UMichFootball" },
  { name: "Michigan State", division: "D1_FBS", conference: "Big Ten", state: "MI", city: "East Lansing", staffUrl: sidearmUrl("msuspartans.com"), rosterUrl: rosterUrl("msuspartans.com"), xHandle: "@MSU_Football" },
  { name: "Minnesota", division: "D1_FBS", conference: "Big Ten", state: "MN", city: "Minneapolis", staffUrl: sidearmUrl("gophersports.com"), rosterUrl: rosterUrl("gophersports.com"), xHandle: "@GopherFootball" },
  { name: "Nebraska", division: "D1_FBS", conference: "Big Ten", state: "NE", city: "Lincoln", staffUrl: sidearmUrl("huskers.com"), rosterUrl: rosterUrl("huskers.com"), xHandle: "@HuskerFBNation" },
  { name: "Northwestern", division: "D1_FBS", conference: "Big Ten", state: "IL", city: "Evanston", staffUrl: sidearmUrl("nusports.com"), rosterUrl: rosterUrl("nusports.com"), xHandle: "@NUFBFamily" },
  { name: "Ohio State", division: "D1_FBS", conference: "Big Ten", state: "OH", city: "Columbus", staffUrl: sidearmUrl("ohiostatebuckeyes.com"), rosterUrl: rosterUrl("ohiostatebuckeyes.com"), xHandle: "@OhioStateFB" },
  { name: "Oregon", division: "D1_FBS", conference: "Big Ten", state: "OR", city: "Eugene", staffUrl: sidearmUrl("goducks.com"), rosterUrl: rosterUrl("goducks.com"), xHandle: "@oregonfootball" },
  { name: "Penn State", division: "D1_FBS", conference: "Big Ten", state: "PA", city: "University Park", staffUrl: sidearmUrl("gopsusports.com"), rosterUrl: rosterUrl("gopsusports.com"), xHandle: "@PennStateFball" },
  { name: "Purdue", division: "D1_FBS", conference: "Big Ten", state: "IN", city: "West Lafayette", staffUrl: sidearmUrl("purduesports.com"), rosterUrl: rosterUrl("purduesports.com"), xHandle: "@BoilerFootball" },
  { name: "Rutgers", division: "D1_FBS", conference: "Big Ten", state: "NJ", city: "Piscataway", staffUrl: sidearmUrl("scarletknights.com"), rosterUrl: rosterUrl("scarletknights.com"), xHandle: "@RFootball" },
  { name: "UCLA", division: "D1_FBS", conference: "Big Ten", state: "CA", city: "Los Angeles", staffUrl: sidearmUrl("uclabruins.com"), rosterUrl: rosterUrl("uclabruins.com"), xHandle: "@UCLAFootball" },
  { name: "USC", division: "D1_FBS", conference: "Big Ten", state: "CA", city: "Los Angeles", staffUrl: sidearmUrl("usctrojans.com"), rosterUrl: rosterUrl("usctrojans.com"), xHandle: "@USC_FB" },
  { name: "Washington", division: "D1_FBS", conference: "Big Ten", state: "WA", city: "Seattle", staffUrl: sidearmUrl("gohuskies.com"), rosterUrl: rosterUrl("gohuskies.com"), xHandle: "@UW_Football" },
  { name: "Wisconsin", division: "D1_FBS", conference: "Big Ten", state: "WI", city: "Madison", staffUrl: sidearmUrl("uwbadgers.com"), rosterUrl: rosterUrl("uwbadgers.com"), xHandle: "@BadgerFootball" },

  // ── ACC ──
  { name: "Boston College", division: "D1_FBS", conference: "ACC", state: "MA", city: "Chestnut Hill", staffUrl: sidearmUrl("bceagles.com"), rosterUrl: rosterUrl("bceagles.com"), xHandle: "@BCFootball" },
  { name: "California", division: "D1_FBS", conference: "ACC", state: "CA", city: "Berkeley", staffUrl: sidearmUrl("calbears.com"), rosterUrl: rosterUrl("calbears.com"), xHandle: "@CalFootball" },
  { name: "Clemson", division: "D1_FBS", conference: "ACC", state: "SC", city: "Clemson", staffUrl: sidearmUrl("clemsontigers.com"), rosterUrl: rosterUrl("clemsontigers.com"), xHandle: "@ClemsonFB" },
  { name: "Duke", division: "D1_FBS", conference: "ACC", state: "NC", city: "Durham", staffUrl: sidearmUrl("goduke.com"), rosterUrl: rosterUrl("goduke.com"), xHandle: "@DukeFOOTBALL" },
  { name: "Florida State", division: "D1_FBS", conference: "ACC", state: "FL", city: "Tallahassee", staffUrl: sidearmUrl("seminoles.com"), rosterUrl: rosterUrl("seminoles.com"), xHandle: "@FSUFootball" },
  { name: "Georgia Tech", division: "D1_FBS", conference: "ACC", state: "GA", city: "Atlanta", staffUrl: sidearmUrl("ramblinwreck.com"), rosterUrl: rosterUrl("ramblinwreck.com"), xHandle: "@GeorgiaTechFB" },
  { name: "Louisville", division: "D1_FBS", conference: "ACC", state: "KY", city: "Louisville", staffUrl: sidearmUrl("gocards.com"), rosterUrl: rosterUrl("gocards.com"), xHandle: "@LouisvilleFB" },
  { name: "Miami", division: "D1_FBS", conference: "ACC", state: "FL", city: "Coral Gables", staffUrl: sidearmUrl("hurricanesports.com"), rosterUrl: rosterUrl("hurricanesports.com"), xHandle: "@CanesFootball" },
  { name: "NC State", division: "D1_FBS", conference: "ACC", state: "NC", city: "Raleigh", staffUrl: sidearmUrl("gopack.com"), rosterUrl: rosterUrl("gopack.com"), xHandle: "@PackFootball" },
  { name: "North Carolina", division: "D1_FBS", conference: "ACC", state: "NC", city: "Chapel Hill", staffUrl: sidearmUrl("goheels.com"), rosterUrl: rosterUrl("goheels.com"), xHandle: "@UNCFootball" },
  { name: "Pittsburgh", division: "D1_FBS", conference: "ACC", state: "PA", city: "Pittsburgh", staffUrl: sidearmUrl("pittsburghpanthers.com"), rosterUrl: rosterUrl("pittsburghpanthers.com"), xHandle: "@Pitt_FB" },
  { name: "SMU", division: "D1_FBS", conference: "ACC", state: "TX", city: "Dallas", staffUrl: sidearmUrl("smumustangs.com"), rosterUrl: rosterUrl("smumustangs.com"), xHandle: "@SMUFB" },
  { name: "Stanford", division: "D1_FBS", conference: "ACC", state: "CA", city: "Stanford", staffUrl: sidearmUrl("gostanford.com"), rosterUrl: rosterUrl("gostanford.com"), xHandle: "@StanfordFball" },
  { name: "Syracuse", division: "D1_FBS", conference: "ACC", state: "NY", city: "Syracuse", staffUrl: sidearmUrl("cuse.com"), rosterUrl: rosterUrl("cuse.com"), xHandle: "@CuseFootball" },
  { name: "Virginia", division: "D1_FBS", conference: "ACC", state: "VA", city: "Charlottesville", staffUrl: sidearmUrl("virginiasports.com"), rosterUrl: rosterUrl("virginiasports.com"), xHandle: "@UVAFootball" },
  { name: "Virginia Tech", division: "D1_FBS", conference: "ACC", state: "VA", city: "Blacksburg", staffUrl: sidearmUrl("hokiesports.com"), rosterUrl: rosterUrl("hokiesports.com"), xHandle: "@HokiesFB" },
  { name: "Wake Forest", division: "D1_FBS", conference: "ACC", state: "NC", city: "Winston-Salem", staffUrl: sidearmUrl("godeacs.com"), rosterUrl: rosterUrl("godeacs.com"), xHandle: "@WakeFB" },

  // ── Big 12 ──
  { name: "Arizona", division: "D1_FBS", conference: "Big 12", state: "AZ", city: "Tucson", staffUrl: sidearmUrl("arizonawildcats.com"), rosterUrl: rosterUrl("arizonawildcats.com"), xHandle: "@ArizonaFBall" },
  { name: "Arizona State", division: "D1_FBS", conference: "Big 12", state: "AZ", city: "Tempe", staffUrl: sidearmUrl("thesundevils.com"), rosterUrl: rosterUrl("thesundevils.com"), xHandle: "@ASUFootball" },
  { name: "Baylor", division: "D1_FBS", conference: "Big 12", state: "TX", city: "Waco", staffUrl: sidearmUrl("baylorbears.com"), rosterUrl: rosterUrl("baylorbears.com"), xHandle: "@BUFootball" },
  { name: "BYU", division: "D1_FBS", conference: "Big 12", state: "UT", city: "Provo", staffUrl: sidearmUrl("byucougars.com"), rosterUrl: rosterUrl("byucougars.com"), xHandle: "@BYUfootball" },
  { name: "Cincinnati", division: "D1_FBS", conference: "Big 12", state: "OH", city: "Cincinnati", staffUrl: sidearmUrl("gobearcats.com"), rosterUrl: rosterUrl("gobearcats.com"), xHandle: "@GoBearcatsFB" },
  { name: "Colorado", division: "D1_FBS", conference: "Big 12", state: "CO", city: "Boulder", staffUrl: sidearmUrl("cubuffs.com"), rosterUrl: rosterUrl("cubuffs.com"), xHandle: "@CUBuffsFootball" },
  { name: "Houston", division: "D1_FBS", conference: "Big 12", state: "TX", city: "Houston", staffUrl: sidearmUrl("uhcougars.com"), rosterUrl: rosterUrl("uhcougars.com"), xHandle: "@UHCougarFB" },
  { name: "Iowa State", division: "D1_FBS", conference: "Big 12", state: "IA", city: "Ames", staffUrl: sidearmUrl("cyclones.com"), rosterUrl: rosterUrl("cyclones.com"), xHandle: "@CycloneFB" },
  { name: "Kansas", division: "D1_FBS", conference: "Big 12", state: "KS", city: "Lawrence", staffUrl: sidearmUrl("kuathletics.com"), rosterUrl: rosterUrl("kuathletics.com"), xHandle: "@KU_Football" },
  { name: "Kansas State", division: "D1_FBS", conference: "Big 12", state: "KS", city: "Manhattan", staffUrl: sidearmUrl("kstatesports.com"), rosterUrl: rosterUrl("kstatesports.com"), xHandle: "@KStateFB" },
  { name: "Oklahoma State", division: "D1_FBS", conference: "Big 12", state: "OK", city: "Stillwater", staffUrl: sidearmUrl("okstate.com"), rosterUrl: rosterUrl("okstate.com"), xHandle: "@CowboyFB" },
  { name: "TCU", division: "D1_FBS", conference: "Big 12", state: "TX", city: "Fort Worth", staffUrl: sidearmUrl("gofrogs.com"), rosterUrl: rosterUrl("gofrogs.com"), xHandle: "@TCUFootball" },
  { name: "Texas Tech", division: "D1_FBS", conference: "Big 12", state: "TX", city: "Lubbock", staffUrl: sidearmUrl("texastech.com"), rosterUrl: rosterUrl("texastech.com"), xHandle: "@TexasTechFB" },
  { name: "UCF", division: "D1_FBS", conference: "Big 12", state: "FL", city: "Orlando", staffUrl: sidearmUrl("ucfknights.com"), rosterUrl: rosterUrl("ucfknights.com"), xHandle: "@UCF_Football" },
  { name: "Utah", division: "D1_FBS", conference: "Big 12", state: "UT", city: "Salt Lake City", staffUrl: sidearmUrl("utahutes.com"), rosterUrl: rosterUrl("utahutes.com"), xHandle: "@Utah_Football" },
  { name: "West Virginia", division: "D1_FBS", conference: "Big 12", state: "WV", city: "Morgantown", staffUrl: sidearmUrl("wvusports.com"), rosterUrl: rosterUrl("wvusports.com"), xHandle: "@WVUfootball" },

  // ── American Athletic (AAC) ──
  { name: "Army", division: "D1_FBS", conference: "AAC", state: "NY", city: "West Point", staffUrl: sidearmUrl("goarmywestpoint.com"), rosterUrl: rosterUrl("goarmywestpoint.com"), xHandle: "@ArmyWP_FB" },
  { name: "Charlotte", division: "D1_FBS", conference: "AAC", state: "NC", city: "Charlotte", staffUrl: sidearmUrl("charlotte49ers.com"), rosterUrl: rosterUrl("charlotte49ers.com"), xHandle: "@CharlotteFTBL" },
  { name: "East Carolina", division: "D1_FBS", conference: "AAC", state: "NC", city: "Greenville", staffUrl: sidearmUrl("ecupirates.com"), rosterUrl: rosterUrl("ecupirates.com"), xHandle: "@ECUPiratesFB" },
  { name: "FAU", division: "D1_FBS", conference: "AAC", state: "FL", city: "Boca Raton", staffUrl: sidearmUrl("fausports.com"), rosterUrl: rosterUrl("fausports.com"), xHandle: "@FAUFootball" },
  { name: "Memphis", division: "D1_FBS", conference: "AAC", state: "TN", city: "Memphis", staffUrl: sidearmUrl("gotigersgo.com"), rosterUrl: rosterUrl("gotigersgo.com"), xHandle: "@MemphisFB" },
  { name: "Navy", division: "D1_FBS", conference: "AAC", state: "MD", city: "Annapolis", staffUrl: sidearmUrl("navysports.com"), rosterUrl: rosterUrl("navysports.com"), xHandle: "@NavyFB" },
  { name: "North Texas", division: "D1_FBS", conference: "AAC", state: "TX", city: "Denton", staffUrl: sidearmUrl("meangreensports.com"), rosterUrl: rosterUrl("meangreensports.com"), xHandle: "@MeanGreenFB" },
  { name: "Rice", division: "D1_FBS", conference: "AAC", state: "TX", city: "Houston", staffUrl: sidearmUrl("riceowls.com"), rosterUrl: rosterUrl("riceowls.com"), xHandle: "@RiceFootball" },
  { name: "South Florida", division: "D1_FBS", conference: "AAC", state: "FL", city: "Tampa", staffUrl: sidearmUrl("gousfbulls.com"), rosterUrl: rosterUrl("gousfbulls.com"), xHandle: "@USFFootball" },
  { name: "Temple", division: "D1_FBS", conference: "AAC", state: "PA", city: "Philadelphia", staffUrl: sidearmUrl("owlsports.com"), rosterUrl: rosterUrl("owlsports.com"), xHandle: "@TempleFootball" },
  { name: "Tulane", division: "D1_FBS", conference: "AAC", state: "LA", city: "New Orleans", staffUrl: sidearmUrl("tulanegreenwave.com"), rosterUrl: rosterUrl("tulanegreenwave.com"), xHandle: "@GreenWaveFB" },
  { name: "Tulsa", division: "D1_FBS", conference: "AAC", state: "OK", city: "Tulsa", staffUrl: sidearmUrl("tulsahurricane.com"), rosterUrl: rosterUrl("tulsahurricane.com"), xHandle: "@TulsaFootball" },
  { name: "UAB", division: "D1_FBS", conference: "AAC", state: "AL", city: "Birmingham", staffUrl: sidearmUrl("uabsports.com"), rosterUrl: rosterUrl("uabsports.com"), xHandle: "@UAB_FB" },
  { name: "UTSA", division: "D1_FBS", conference: "AAC", state: "TX", city: "San Antonio", staffUrl: sidearmUrl("goutsa.com"), rosterUrl: rosterUrl("goutsa.com"), xHandle: "@UTSAFTBL" },

  // ── Conference USA ──
  { name: "FIU", division: "D1_FBS", conference: "Conference USA", state: "FL", city: "Miami", staffUrl: sidearmUrl("fiusports.com"), rosterUrl: rosterUrl("fiusports.com"), xHandle: "@FIUFootball" },
  { name: "Jacksonville State", division: "D1_FBS", conference: "Conference USA", state: "AL", city: "Jacksonville", staffUrl: sidearmUrl("jsugamecocksports.com"), rosterUrl: rosterUrl("jsugamecocksports.com"), xHandle: "@JSUGamecockFB" },
  { name: "Kennesaw State", division: "D1_FBS", conference: "Conference USA", state: "GA", city: "Kennesaw", staffUrl: sidearmUrl("ksuowls.com"), rosterUrl: rosterUrl("ksuowls.com"), xHandle: "@KSUOwlsFB" },
  { name: "Liberty", division: "D1_FBS", conference: "Conference USA", state: "VA", city: "Lynchburg", staffUrl: sidearmUrl("libertyflames.com"), rosterUrl: rosterUrl("libertyflames.com"), xHandle: "@LibertyFootball" },
  { name: "Louisiana Tech", division: "D1_FBS", conference: "Conference USA", state: "LA", city: "Ruston", staffUrl: sidearmUrl("latechsports.com"), rosterUrl: rosterUrl("latechsports.com"), xHandle: "@LATechFB" },
  { name: "Middle Tennessee", division: "D1_FBS", conference: "Conference USA", state: "TN", city: "Murfreesboro", staffUrl: sidearmUrl("goblueraiders.com"), rosterUrl: rosterUrl("goblueraiders.com"), xHandle: "@MT_FB" },
  { name: "New Mexico State", division: "D1_FBS", conference: "Conference USA", state: "NM", city: "Las Cruces", staffUrl: sidearmUrl("nmstatesports.com"), rosterUrl: rosterUrl("nmstatesports.com"), xHandle: "@NMStateFootball" },
  { name: "Sam Houston", division: "D1_FBS", conference: "Conference USA", state: "TX", city: "Huntsville", staffUrl: sidearmUrl("gobearkats.com"), rosterUrl: rosterUrl("gobearkats.com"), xHandle: "@BearkatsFB" },
  { name: "Western Kentucky", division: "D1_FBS", conference: "Conference USA", state: "KY", city: "Bowling Green", staffUrl: sidearmUrl("wkusports.com"), rosterUrl: rosterUrl("wkusports.com"), xHandle: "@WKUFootball" },

  // ── MAC ──
  { name: "Akron", division: "D1_FBS", conference: "MAC", state: "OH", city: "Akron", staffUrl: sidearmUrl("gozips.com"), rosterUrl: rosterUrl("gozips.com"), xHandle: "@ZipsFB" },
  { name: "Ball State", division: "D1_FBS", conference: "MAC", state: "IN", city: "Muncie", staffUrl: sidearmUrl("ballstatesports.com"), rosterUrl: rosterUrl("ballstatesports.com"), xHandle: "@BallStateFB" },
  { name: "Bowling Green", division: "D1_FBS", conference: "MAC", state: "OH", city: "Bowling Green", staffUrl: sidearmUrl("bgsufalcons.com"), rosterUrl: rosterUrl("bgsufalcons.com"), xHandle: "@BG_Football" },
  { name: "Buffalo", division: "D1_FBS", conference: "MAC", state: "NY", city: "Buffalo", staffUrl: sidearmUrl("ubbulls.com"), rosterUrl: rosterUrl("ubbulls.com"), xHandle: "@UBFootball" },
  { name: "Central Michigan", division: "D1_FBS", conference: "MAC", state: "MI", city: "Mount Pleasant", staffUrl: sidearmUrl("cmuchippewas.com"), rosterUrl: rosterUrl("cmuchippewas.com"), xHandle: "@CMU_Football" },
  { name: "Eastern Michigan", division: "D1_FBS", conference: "MAC", state: "MI", city: "Ypsilanti", staffUrl: sidearmUrl("emueagles.com"), rosterUrl: rosterUrl("emueagles.com"), xHandle: "@ABOREMUFB" },
  { name: "Kent State", division: "D1_FBS", conference: "MAC", state: "OH", city: "Kent", staffUrl: sidearmUrl("kentstatesports.com"), rosterUrl: rosterUrl("kentstatesports.com"), xHandle: "@KentStateFB" },
  { name: "Miami (OH)", division: "D1_FBS", conference: "MAC", state: "OH", city: "Oxford", staffUrl: sidearmUrl("miamiredhawks.com"), rosterUrl: rosterUrl("miamiredhawks.com"), xHandle: "@MiamiOHFootball" },
  { name: "Northern Illinois", division: "D1_FBS", conference: "MAC", state: "IL", city: "DeKalb", staffUrl: sidearmUrl("niuhuskies.com"), rosterUrl: rosterUrl("niuhuskies.com"), xHandle: "@NIU_Football" },
  { name: "Ohio", division: "D1_FBS", conference: "MAC", state: "OH", city: "Athens", staffUrl: sidearmUrl("ohiobobcats.com"), rosterUrl: rosterUrl("ohiobobcats.com"), xHandle: "@OhioFootball" },
  { name: "Toledo", division: "D1_FBS", conference: "MAC", state: "OH", city: "Toledo", staffUrl: sidearmUrl("utrockets.com"), rosterUrl: rosterUrl("utrockets.com"), xHandle: "@ToledoFB" },
  { name: "Western Michigan", division: "D1_FBS", conference: "MAC", state: "MI", city: "Kalamazoo", staffUrl: sidearmUrl("wmubroncos.com"), rosterUrl: rosterUrl("wmubroncos.com"), xHandle: "@WMU_Football" },

  // ── Mountain West ──
  { name: "Air Force", division: "D1_FBS", conference: "Mountain West", state: "CO", city: "Colorado Springs", staffUrl: sidearmUrl("goairforcefalcons.com"), rosterUrl: rosterUrl("goairforcefalcons.com"), xHandle: "@AF_Football" },
  { name: "Boise State", division: "D1_FBS", conference: "Mountain West", state: "ID", city: "Boise", staffUrl: sidearmUrl("broncosports.com"), rosterUrl: rosterUrl("broncosports.com"), xHandle: "@BroncoSportsFB" },
  { name: "Colorado State", division: "D1_FBS", conference: "Mountain West", state: "CO", city: "Fort Collins", staffUrl: sidearmUrl("csurams.com"), rosterUrl: rosterUrl("csurams.com"), xHandle: "@CSUFootball" },
  { name: "Fresno State", division: "D1_FBS", conference: "Mountain West", state: "CA", city: "Fresno", staffUrl: sidearmUrl("gobulldogs.com"), rosterUrl: rosterUrl("gobulldogs.com"), xHandle: "@FresnoStateFB" },
  { name: "Hawaii", division: "D1_FBS", conference: "Mountain West", state: "HI", city: "Honolulu", staffUrl: sidearmUrl("hawaiiathletics.com"), rosterUrl: rosterUrl("hawaiiathletics.com"), xHandle: "@HawaiiFootball" },
  { name: "Nevada", division: "D1_FBS", conference: "Mountain West", state: "NV", city: "Reno", staffUrl: sidearmUrl("nevadawolfpack.com"), rosterUrl: rosterUrl("nevadawolfpack.com"), xHandle: "@NevadaFootball" },
  { name: "New Mexico", division: "D1_FBS", conference: "Mountain West", state: "NM", city: "Albuquerque", staffUrl: sidearmUrl("golobos.com"), rosterUrl: rosterUrl("golobos.com"), xHandle: "@UNMLoboFB" },
  { name: "San Diego State", division: "D1_FBS", conference: "Mountain West", state: "CA", city: "San Diego", staffUrl: sidearmUrl("goaztecs.com"), rosterUrl: rosterUrl("goaztecs.com"), xHandle: "@AztecFB" },
  { name: "San Jose State", division: "D1_FBS", conference: "Mountain West", state: "CA", city: "San Jose", staffUrl: sidearmUrl("sjsuspartans.com"), rosterUrl: rosterUrl("sjsuspartans.com"), xHandle: "@SanJoseStateFB" },
  { name: "UNLV", division: "D1_FBS", conference: "Mountain West", state: "NV", city: "Las Vegas", staffUrl: sidearmUrl("unlvrebels.com"), rosterUrl: rosterUrl("unlvrebels.com"), xHandle: "@unlvfootball" },
  { name: "Utah State", division: "D1_FBS", conference: "Mountain West", state: "UT", city: "Logan", staffUrl: sidearmUrl("utahstateaggies.com"), rosterUrl: rosterUrl("utahstateaggies.com"), xHandle: "@USUFootball" },
  { name: "Wyoming", division: "D1_FBS", conference: "Mountain West", state: "WY", city: "Laramie", staffUrl: sidearmUrl("gowyo.com"), rosterUrl: rosterUrl("gowyo.com"), xHandle: "@WyoFootball" },

  // ── Sun Belt ──
  { name: "Appalachian State", division: "D1_FBS", conference: "Sun Belt", state: "NC", city: "Boone", staffUrl: sidearmUrl("appstatesports.com"), rosterUrl: rosterUrl("appstatesports.com"), xHandle: "@AppState_FB" },
  { name: "Arkansas State", division: "D1_FBS", conference: "Sun Belt", state: "AR", city: "Jonesboro", staffUrl: sidearmUrl("astateredwolves.com"), rosterUrl: rosterUrl("astateredwolves.com"), xHandle: "@AStateFB" },
  { name: "Coastal Carolina", division: "D1_FBS", conference: "Sun Belt", state: "SC", city: "Conway", staffUrl: sidearmUrl("goccusports.com"), rosterUrl: rosterUrl("goccusports.com"), xHandle: "@CoastalFootball" },
  { name: "Georgia Southern", division: "D1_FBS", conference: "Sun Belt", state: "GA", city: "Statesboro", staffUrl: sidearmUrl("gseagles.com"), rosterUrl: rosterUrl("gseagles.com"), xHandle: "@GSAthletics_FB" },
  { name: "Georgia State", division: "D1_FBS", conference: "Sun Belt", state: "GA", city: "Atlanta", staffUrl: sidearmUrl("georgiastatesports.com"), rosterUrl: rosterUrl("georgiastatesports.com"), xHandle: "@GeorgiaStateFB" },
  { name: "James Madison", division: "D1_FBS", conference: "Sun Belt", state: "VA", city: "Harrisonburg", staffUrl: sidearmUrl("jmusports.com"), rosterUrl: rosterUrl("jmusports.com"), xHandle: "@JMUFootball" },
  { name: "Louisiana", division: "D1_FBS", conference: "Sun Belt", state: "LA", city: "Lafayette", staffUrl: sidearmUrl("ragincajuns.com"), rosterUrl: rosterUrl("ragincajuns.com"), xHandle: "@RaginCajunsFB" },
  { name: "Louisiana-Monroe", division: "D1_FBS", conference: "Sun Belt", state: "LA", city: "Monroe", staffUrl: sidearmUrl("ulmwarhawks.com"), rosterUrl: rosterUrl("ulmwarhawks.com"), xHandle: "@ULM_FB" },
  { name: "Marshall", division: "D1_FBS", conference: "Sun Belt", state: "WV", city: "Huntington", staffUrl: sidearmUrl("herdzone.com"), rosterUrl: rosterUrl("herdzone.com"), xHandle: "@HerdFB" },
  { name: "Old Dominion", division: "D1_FBS", conference: "Sun Belt", state: "VA", city: "Norfolk", staffUrl: sidearmUrl("odusports.com"), rosterUrl: rosterUrl("odusports.com"), xHandle: "@ODUFootball" },
  { name: "South Alabama", division: "D1_FBS", conference: "Sun Belt", state: "AL", city: "Mobile", staffUrl: sidearmUrl("usajaguars.com"), rosterUrl: rosterUrl("usajaguars.com"), xHandle: "@SouthAlabamaFB" },
  { name: "Southern Miss", division: "D1_FBS", conference: "Sun Belt", state: "MS", city: "Hattiesburg", staffUrl: sidearmUrl("southernmiss.com"), rosterUrl: rosterUrl("southernmiss.com"), xHandle: "@SouthernMissFB" },
  { name: "Texas State", division: "D1_FBS", conference: "Sun Belt", state: "TX", city: "San Marcos", staffUrl: sidearmUrl("txstatebobcats.com"), rosterUrl: rosterUrl("txstatebobcats.com"), xHandle: "@ABORETXSTATEFB" },
  { name: "Troy", division: "D1_FBS", conference: "Sun Belt", state: "AL", city: "Troy", staffUrl: sidearmUrl("troytrojans.com"), rosterUrl: rosterUrl("troytrojans.com"), xHandle: "@TroyTrojansFB" },

  // ── Independents ──
  { name: "Connecticut", division: "D1_FBS", conference: "Independent", state: "CT", city: "Storrs", staffUrl: sidearmUrl("uconnhuskies.com"), rosterUrl: rosterUrl("uconnhuskies.com"), xHandle: "@UConnFootball" },
  { name: "Notre Dame", division: "D1_FBS", conference: "Independent", state: "IN", city: "Notre Dame", staffUrl: sidearmUrl("und.com"), rosterUrl: rosterUrl("und.com"), xHandle: "@NDFootball" },
  { name: "UMass", division: "D1_FBS", conference: "Independent", state: "MA", city: "Amherst", staffUrl: sidearmUrl("umassathletics.com"), rosterUrl: rosterUrl("umassathletics.com"), xHandle: "@UMassFootball" },

  // ── Additional Conference USA ──
  { name: "UTEP", division: "D1_FBS", conference: "Conference USA", state: "TX", city: "El Paso", staffUrl: sidearmUrl("utepathletics.com"), rosterUrl: rosterUrl("utepathletics.com"), xHandle: "@UTEPFB" },

  // ── Additional Sun Belt ──
  { name: "Texas-Arlington", division: "D1_FBS", conference: "Sun Belt", state: "TX", city: "Arlington", staffUrl: sidearmUrl("utamavs.com"), rosterUrl: rosterUrl("utamavs.com"), xHandle: "@UTAFB" },
];

// ────────────────────────────────────────────────────────────────────────────────
//  D1 FCS — Key programs (Wisconsin-relevant + major conferences)
// ────────────────────────────────────────────────────────────────────────────────

const D1_FCS_SCHOOLS: SchoolEntry[] = [
  // ── MVFC (Missouri Valley) — closest FCS to Jacob ──
  { name: "Illinois State", division: "D1_FCS", conference: "MVFC", state: "IL", city: "Normal", staffUrl: sidearmUrl("goredbirds.com"), rosterUrl: rosterUrl("goredbirds.com"), xHandle: "@RedbirdFB" },
  { name: "Indiana State", division: "D1_FCS", conference: "MVFC", state: "IN", city: "Terre Haute", staffUrl: sidearmUrl("gosycamores.com"), rosterUrl: rosterUrl("gosycamores.com"), xHandle: "@IndStFB" },
  { name: "Missouri State", division: "D1_FCS", conference: "MVFC", state: "MO", city: "Springfield", staffUrl: sidearmUrl("missouristatebears.com"), rosterUrl: rosterUrl("missouristatebears.com"), xHandle: "@MOStateFB" },
  { name: "North Dakota", division: "D1_FCS", conference: "MVFC", state: "ND", city: "Grand Forks", staffUrl: sidearmUrl("undfighting hawks.com"), rosterUrl: rosterUrl("undfightinghawks.com"), xHandle: "@UNDfootball" },
  { name: "North Dakota State", division: "D1_FCS", conference: "MVFC", state: "ND", city: "Fargo", staffUrl: sidearmUrl("gobison.com"), rosterUrl: rosterUrl("gobison.com"), xHandle: "@NDSUfootball" },
  { name: "Northern Iowa", division: "D1_FCS", conference: "MVFC", state: "IA", city: "Cedar Falls", staffUrl: sidearmUrl("unipanthers.com"), rosterUrl: rosterUrl("unipanthers.com"), xHandle: "@UNIFootball" },
  { name: "South Dakota", division: "D1_FCS", conference: "MVFC", state: "SD", city: "Vermillion", staffUrl: sidearmUrl("goyotes.com"), rosterUrl: rosterUrl("goyotes.com"), xHandle: "@SDCoyotesFB" },
  { name: "South Dakota State", division: "D1_FCS", conference: "MVFC", state: "SD", city: "Brookings", staffUrl: sidearmUrl("gojacks.com"), rosterUrl: rosterUrl("gojacks.com"), xHandle: "@GoJacksFB" },
  { name: "Southern Illinois", division: "D1_FCS", conference: "MVFC", state: "IL", city: "Carbondale", staffUrl: sidearmUrl("siusalukis.com"), rosterUrl: rosterUrl("siusalukis.com"), xHandle: "@SIU_Football" },
  { name: "Western Illinois", division: "D1_FCS", conference: "MVFC", state: "IL", city: "Macomb", staffUrl: sidearmUrl("goleathernecks.com"), rosterUrl: rosterUrl("goleathernecks.com"), xHandle: "@WIUfootball" },
  { name: "Youngstown State", division: "D1_FCS", conference: "MVFC", state: "OH", city: "Youngstown", staffUrl: sidearmUrl("ysusports.com"), rosterUrl: rosterUrl("ysusports.com"), xHandle: "@YSUFootball" },

  // ── Pioneer Football League ──
  { name: "Butler", division: "D1_FCS", conference: "Pioneer", state: "IN", city: "Indianapolis", staffUrl: sidearmUrl("butlersports.com"), rosterUrl: rosterUrl("butlersports.com"), xHandle: "@ButlerUFootball" },
  { name: "Dayton", division: "D1_FCS", conference: "Pioneer", state: "OH", city: "Dayton", staffUrl: sidearmUrl("daytonflyers.com"), rosterUrl: rosterUrl("daytonflyers.com"), xHandle: "@DaytonFlyers" },
  { name: "Drake", division: "D1_FCS", conference: "Pioneer", state: "IA", city: "Des Moines", staffUrl: sidearmUrl("godrakebulldogs.com"), rosterUrl: rosterUrl("godrakebulldogs.com"), xHandle: "@DrakeBulldogFB" },
  { name: "Marist", division: "D1_FCS", conference: "Pioneer", state: "NY", city: "Poughkeepsie", staffUrl: sidearmUrl("goredfoxes.com"), rosterUrl: rosterUrl("goredfoxes.com"), xHandle: "@MaristFB" },
  { name: "Morehead State", division: "D1_FCS", conference: "Pioneer", state: "KY", city: "Morehead", staffUrl: sidearmUrl("msueagles.com"), rosterUrl: rosterUrl("msueagles.com"), xHandle: "@MSUEaglesFB" },
  { name: "Presbyterian", division: "D1_FCS", conference: "Pioneer", state: "SC", city: "Clinton", staffUrl: sidearmUrl("gobluehose.com"), rosterUrl: rosterUrl("gobluehose.com"), xHandle: "@BlueHoseFB" },
  { name: "San Diego", division: "D1_FCS", conference: "Pioneer", state: "CA", city: "San Diego", staffUrl: sidearmUrl("usdtoreros.com"), rosterUrl: rosterUrl("usdtoreros.com"), xHandle: "@USDFootball" },
  { name: "Stetson", division: "D1_FCS", conference: "Pioneer", state: "FL", city: "DeLand", staffUrl: sidearmUrl("gohatters.com"), rosterUrl: rosterUrl("gohatters.com"), xHandle: "@StetsonFB" },
  { name: "Valparaiso", division: "D1_FCS", conference: "Pioneer", state: "IN", city: "Valparaiso", staffUrl: sidearmUrl("valpoathletics.com"), rosterUrl: rosterUrl("valpoathletics.com"), xHandle: "@ValpoFootball" },

  // ── CAA ──
  { name: "Delaware", division: "D1_FCS", conference: "CAA", state: "DE", city: "Newark", staffUrl: sidearmUrl("bluehens.com"), rosterUrl: rosterUrl("bluehens.com"), xHandle: "@DelawareFB" },
  { name: "Elon", division: "D1_FCS", conference: "CAA", state: "NC", city: "Elon", staffUrl: sidearmUrl("elonphoenix.com"), rosterUrl: rosterUrl("elonphoenix.com"), xHandle: "@ElonFootball" },
  { name: "Hampton", division: "D1_FCS", conference: "CAA", state: "VA", city: "Hampton", staffUrl: sidearmUrl("hamptonpirates.com"), rosterUrl: rosterUrl("hamptonpirates.com"), xHandle: "@HamptonFB" },
  { name: "Maine", division: "D1_FCS", conference: "CAA", state: "ME", city: "Orono", staffUrl: sidearmUrl("goblackbears.com"), rosterUrl: rosterUrl("goblackbears.com"), xHandle: "@BlackBearsFB" },
  { name: "Monmouth", division: "D1_FCS", conference: "CAA", state: "NJ", city: "West Long Branch", staffUrl: sidearmUrl("monmouthhawks.com"), rosterUrl: rosterUrl("monmouthhawks.com"), xHandle: "@MUHawksFB" },
  { name: "New Hampshire", division: "D1_FCS", conference: "CAA", state: "NH", city: "Durham", staffUrl: sidearmUrl("unhwildcats.com"), rosterUrl: rosterUrl("unhwildcats.com"), xHandle: "@UNH_Football" },
  { name: "North Carolina A&T", division: "D1_FCS", conference: "CAA", state: "NC", city: "Greensboro", staffUrl: sidearmUrl("ncataggies.com"), rosterUrl: rosterUrl("ncataggies.com"), xHandle: "@ABORENCATFB" },
  { name: "Rhode Island", division: "D1_FCS", conference: "CAA", state: "RI", city: "Kingston", staffUrl: sidearmUrl("gorhody.com"), rosterUrl: rosterUrl("gorhody.com"), xHandle: "@RhodyFootball" },
  { name: "Richmond", division: "D1_FCS", conference: "CAA", state: "VA", city: "Richmond", staffUrl: sidearmUrl("richmondspiders.com"), rosterUrl: rosterUrl("richmondspiders.com"), xHandle: "@Spiders_FB" },
  { name: "Stony Brook", division: "D1_FCS", conference: "CAA", state: "NY", city: "Stony Brook", staffUrl: sidearmUrl("stonybrookathletics.com"), rosterUrl: rosterUrl("stonybrookathletics.com"), xHandle: "@StonyBrookFB" },
  { name: "Towson", division: "D1_FCS", conference: "CAA", state: "MD", city: "Towson", staffUrl: sidearmUrl("towsontigers.com"), rosterUrl: rosterUrl("towsontigers.com"), xHandle: "@Towson_FB" },
  { name: "Villanova", division: "D1_FCS", conference: "CAA", state: "PA", city: "Villanova", staffUrl: sidearmUrl("villanova.com"), rosterUrl: rosterUrl("villanova.com"), xHandle: "@NovaFootball" },
  { name: "William & Mary", division: "D1_FCS", conference: "CAA", state: "VA", city: "Williamsburg", staffUrl: sidearmUrl("tribeathletics.com"), rosterUrl: rosterUrl("tribeathletics.com"), xHandle: "@WMTribeFB" },

  // ── Big Sky ──
  { name: "Eastern Washington", division: "D1_FCS", conference: "Big Sky", state: "WA", city: "Cheney", staffUrl: sidearmUrl("goeags.com"), rosterUrl: rosterUrl("goeags.com"), xHandle: "@EWUFootball" },
  { name: "Idaho", division: "D1_FCS", conference: "Big Sky", state: "ID", city: "Moscow", staffUrl: sidearmUrl("govandals.com"), rosterUrl: rosterUrl("govandals.com"), xHandle: "@VandalFootball" },
  { name: "Idaho State", division: "D1_FCS", conference: "Big Sky", state: "ID", city: "Pocatello", staffUrl: sidearmUrl("isubengals.com"), rosterUrl: rosterUrl("isubengals.com"), xHandle: "@ISUBengalsFB" },
  { name: "Montana", division: "D1_FCS", conference: "Big Sky", state: "MT", city: "Missoula", staffUrl: sidearmUrl("gogriz.com"), rosterUrl: rosterUrl("gogriz.com"), xHandle: "@MontanaGrizFB" },
  { name: "Montana State", division: "D1_FCS", conference: "Big Sky", state: "MT", city: "Bozeman", staffUrl: sidearmUrl("msubobcats.com"), rosterUrl: rosterUrl("msubobcats.com"), xHandle: "@MSUBobcats_FB" },
  { name: "Northern Arizona", division: "D1_FCS", conference: "Big Sky", state: "AZ", city: "Flagstaff", staffUrl: sidearmUrl("nauathletics.com"), rosterUrl: rosterUrl("nauathletics.com"), xHandle: "@NAU_Football" },
  { name: "Northern Colorado", division: "D1_FCS", conference: "Big Sky", state: "CO", city: "Greeley", staffUrl: sidearmUrl("uncbears.com"), rosterUrl: rosterUrl("uncbears.com"), xHandle: "@UNC_BearsFB" },
  { name: "Portland State", division: "D1_FCS", conference: "Big Sky", state: "OR", city: "Portland", staffUrl: sidearmUrl("goviks.com"), rosterUrl: rosterUrl("goviks.com"), xHandle: "@psaboreviksFB" },
  { name: "Sacramento State", division: "D1_FCS", conference: "Big Sky", state: "CA", city: "Sacramento", staffUrl: sidearmUrl("hornetsports.com"), rosterUrl: rosterUrl("hornetsports.com"), xHandle: "@SacHornetsFB" },
  { name: "UC Davis", division: "D1_FCS", conference: "Big Sky", state: "CA", city: "Davis", staffUrl: sidearmUrl("ucdavisaggies.com"), rosterUrl: rosterUrl("ucdavisaggies.com"), xHandle: "@UCDavisFB" },
  { name: "Weber State", division: "D1_FCS", conference: "Big Sky", state: "UT", city: "Ogden", staffUrl: sidearmUrl("weberstatesports.com"), rosterUrl: rosterUrl("weberstatesports.com"), xHandle: "@WeberStateFB" },

  // ── Southland ──
  { name: "Houston Christian", division: "D1_FCS", conference: "Southland", state: "TX", city: "Houston", staffUrl: sidearmUrl("hcuhuskies.com"), rosterUrl: rosterUrl("hcuhuskies.com"), xHandle: "@HCUHuskiesFB" },
  { name: "Incarnate Word", division: "D1_FCS", conference: "Southland", state: "TX", city: "San Antonio", staffUrl: sidearmUrl("uiwcardinals.com"), rosterUrl: rosterUrl("uiwcardinals.com"), xHandle: "@UIWFootball" },
  { name: "Lamar", division: "D1_FCS", conference: "Southland", state: "TX", city: "Beaumont", staffUrl: sidearmUrl("lamarcardinals.com"), rosterUrl: rosterUrl("lamarcardinals.com"), xHandle: "@LamarFootball" },
  { name: "McNeese", division: "D1_FCS", conference: "Southland", state: "LA", city: "Lake Charles", staffUrl: sidearmUrl("mcneesesports.com"), rosterUrl: rosterUrl("mcneesesports.com"), xHandle: "@McNeeseFB" },
  { name: "Nicholls", division: "D1_FCS", conference: "Southland", state: "LA", city: "Thibodaux", staffUrl: sidearmUrl("geauxcolonels.com"), rosterUrl: rosterUrl("geauxcolonels.com"), xHandle: "@NichollsFB" },
  { name: "Northwestern State", division: "D1_FCS", conference: "Southland", state: "LA", city: "Natchitoches", staffUrl: sidearmUrl("naboreulathletics.com"), rosterUrl: rosterUrl("naboreulathletics.com"), xHandle: "@NSUDemonsFB" },
  { name: "Southeastern Louisiana", division: "D1_FCS", conference: "Southland", state: "LA", city: "Hammond", staffUrl: sidearmUrl("lionsports.net"), rosterUrl: rosterUrl("lionsports.net"), xHandle: "@LionUpFootball" },
  { name: "Texas A&M-Commerce", division: "D1_FCS", conference: "Southland", state: "TX", city: "Commerce", staffUrl: sidearmUrl("lionsports.com"), rosterUrl: rosterUrl("lionsports.com"), xHandle: "@LionFootball" },

  // ── Ivy League ──
  { name: "Brown", division: "D1_FCS", conference: "Ivy League", state: "RI", city: "Providence", staffUrl: sidearmUrl("brownbears.com"), rosterUrl: rosterUrl("brownbears.com"), xHandle: "@BrownU_Football" },
  { name: "Columbia", division: "D1_FCS", conference: "Ivy League", state: "NY", city: "New York", staffUrl: sidearmUrl("gocolumbialions.com"), rosterUrl: rosterUrl("gocolumbialions.com"), xHandle: "@CULionsFB" },
  { name: "Cornell", division: "D1_FCS", conference: "Ivy League", state: "NY", city: "Ithaca", staffUrl: sidearmUrl("cornellbigred.com"), rosterUrl: rosterUrl("cornellbigred.com"), xHandle: "@CornellFB" },
  { name: "Dartmouth", division: "D1_FCS", conference: "Ivy League", state: "NH", city: "Hanover", staffUrl: sidearmUrl("dartmouthsports.com"), rosterUrl: rosterUrl("dartmouthsports.com"), xHandle: "@DartmouthFTBL" },
  { name: "Harvard", division: "D1_FCS", conference: "Ivy League", state: "MA", city: "Cambridge", staffUrl: sidearmUrl("gocrimson.com"), rosterUrl: rosterUrl("gocrimson.com"), xHandle: "@HarvardFB" },
  { name: "Penn", division: "D1_FCS", conference: "Ivy League", state: "PA", city: "Philadelphia", staffUrl: sidearmUrl("pennathletics.com"), rosterUrl: rosterUrl("pennathletics.com"), xHandle: "@PennFB" },
  { name: "Princeton", division: "D1_FCS", conference: "Ivy League", state: "NJ", city: "Princeton", staffUrl: sidearmUrl("goprincetontigers.com"), rosterUrl: rosterUrl("goprincetontigers.com"), xHandle: "@PrincetonFTBL" },
  { name: "Yale", division: "D1_FCS", conference: "Ivy League", state: "CT", city: "New Haven", staffUrl: sidearmUrl("yalebulldogs.com"), rosterUrl: rosterUrl("yalebulldogs.com"), xHandle: "@yaborealefootball" },

  // ── Patriot League ──
  { name: "Bucknell", division: "D1_FCS", conference: "Patriot", state: "PA", city: "Lewisburg", staffUrl: sidearmUrl("bucknellbison.com"), rosterUrl: rosterUrl("bucknellbison.com"), xHandle: "@BucknellFB" },
  { name: "Colgate", division: "D1_FCS", conference: "Patriot", state: "NY", city: "Hamilton", staffUrl: sidearmUrl("gogatefootball.com"), rosterUrl: rosterUrl("gogatefootball.com"), xHandle: "@ColgateFB" },
  { name: "Fordham", division: "D1_FCS", conference: "Patriot", state: "NY", city: "Bronx", staffUrl: sidearmUrl("fordhamsports.com"), rosterUrl: rosterUrl("fordhamsports.com"), xHandle: "@ABOREFURDHAMFB" },
  { name: "Georgetown", division: "D1_FCS", conference: "Patriot", state: "DC", city: "Washington", staffUrl: sidearmUrl("guhoyas.com"), rosterUrl: rosterUrl("guhoyas.com"), xHandle: "@HoyasFB" },
  { name: "Holy Cross", division: "D1_FCS", conference: "Patriot", state: "MA", city: "Worcester", staffUrl: sidearmUrl("goholycross.com"), rosterUrl: rosterUrl("goholycross.com"), xHandle: "@HCrossFB" },
  { name: "Lafayette", division: "D1_FCS", conference: "Patriot", state: "PA", city: "Easton", staffUrl: sidearmUrl("goleopards.com"), rosterUrl: rosterUrl("goleopards.com"), xHandle: "@LafColFootball" },
  { name: "Lehigh", division: "D1_FCS", conference: "Patriot", state: "PA", city: "Bethlehem", staffUrl: sidearmUrl("lehighsports.com"), rosterUrl: rosterUrl("lehighsports.com"), xHandle: "@LehighFootball" },

  // ── NEC (Northeast Conference) ──
  { name: "Central Connecticut", division: "D1_FCS", conference: "NEC", state: "CT", city: "New Britain", staffUrl: sidearmUrl("ccsubluedevils.com"), rosterUrl: rosterUrl("ccsubluedevils.com"), xHandle: "@CCSU_FB" },
  { name: "Duquesne", division: "D1_FCS", conference: "NEC", state: "PA", city: "Pittsburgh", staffUrl: sidearmUrl("goduquesne.com"), rosterUrl: rosterUrl("goduquesne.com"), xHandle: "@DuqFB" },
  { name: "LIU", division: "D1_FCS", conference: "NEC", state: "NY", city: "Brookville", staffUrl: sidearmUrl("liuathletics.com"), rosterUrl: rosterUrl("liuathletics.com"), xHandle: "@LIUSharksFB" },
  { name: "Merrimack", division: "D1_FCS", conference: "NEC", state: "MA", city: "North Andover", staffUrl: sidearmUrl("merrimackathletics.com"), rosterUrl: rosterUrl("merrimackathletics.com"), xHandle: "@MerrimackFB" },
  { name: "Sacred Heart", division: "D1_FCS", conference: "NEC", state: "CT", city: "Fairfield", staffUrl: sidearmUrl("sacredheartpioneers.com"), rosterUrl: rosterUrl("sacredheartpioneers.com"), xHandle: "@SHU__Football" },
  { name: "St. Francis (PA)", division: "D1_FCS", conference: "NEC", state: "PA", city: "Loretto", staffUrl: sidearmUrl("sfuathletics.com"), rosterUrl: rosterUrl("sfuathletics.com"), xHandle: "@RedFlashFB" },
  { name: "Wagner", division: "D1_FCS", conference: "NEC", state: "NY", city: "Staten Island", staffUrl: sidearmUrl("wagnerathletics.com"), rosterUrl: rosterUrl("wagnerathletics.com"), xHandle: "@WagnerFootball" },

  // ── SWAC (Southwestern Athletic Conference) ──
  { name: "Alabama A&M", division: "D1_FCS", conference: "SWAC", state: "AL", city: "Huntsville", staffUrl: sidearmUrl("aamusports.com"), rosterUrl: rosterUrl("aamusports.com"), xHandle: "@AAMUFootball" },
  { name: "Alabama State", division: "D1_FCS", conference: "SWAC", state: "AL", city: "Montgomery", staffUrl: sidearmUrl("bamastatesports.com"), rosterUrl: rosterUrl("bamastatesports.com"), xHandle: "@BamaStateFB" },
  { name: "Alcorn State", division: "D1_FCS", conference: "SWAC", state: "MS", city: "Lorman", staffUrl: sidearmUrl("alcornsports.com"), rosterUrl: rosterUrl("alcornsports.com"), xHandle: "@ABOREALCORNSTFB" },
  { name: "Grambling State", division: "D1_FCS", conference: "SWAC", state: "LA", city: "Grambling", staffUrl: sidearmUrl("gaborersusports.com"), rosterUrl: rosterUrl("gaborersusports.com"), xHandle: "@GramblingFball" },
  { name: "Jackson State", division: "D1_FCS", conference: "SWAC", state: "MS", city: "Jackson", staffUrl: sidearmUrl("jsutigers.com"), rosterUrl: rosterUrl("jsutigers.com"), xHandle: "@GoJSUTigersFB" },
  { name: "Prairie View A&M", division: "D1_FCS", conference: "SWAC", state: "TX", city: "Prairie View", staffUrl: sidearmUrl("pvpanthers.com"), rosterUrl: rosterUrl("pvpanthers.com"), xHandle: "@PVAMUFB" },
  { name: "Southern", division: "D1_FCS", conference: "SWAC", state: "LA", city: "Baton Rouge", staffUrl: sidearmUrl("gojagsports.com"), rosterUrl: rosterUrl("gojagsports.com"), xHandle: "@SouthernUsports" },
  { name: "Texas Southern", division: "D1_FCS", conference: "SWAC", state: "TX", city: "Houston", staffUrl: sidearmUrl("tsusports.com"), rosterUrl: rosterUrl("tsusports.com"), xHandle: "@TSUFootball" },

  // ── MEAC (Mid-Eastern Athletic Conference) ──
  { name: "Delaware State", division: "D1_FCS", conference: "MEAC", state: "DE", city: "Dover", staffUrl: sidearmUrl("dsuhornets.com"), rosterUrl: rosterUrl("dsuhornets.com"), xHandle: "@DSUHornetsFB" },
  { name: "Howard", division: "D1_FCS", conference: "MEAC", state: "DC", city: "Washington", staffUrl: sidearmUrl("hubison.com"), rosterUrl: rosterUrl("hubison.com"), xHandle: "@HUBisonFB" },
  { name: "Morgan State", division: "D1_FCS", conference: "MEAC", state: "MD", city: "Baltimore", staffUrl: sidearmUrl("maborerganseboretatebears.com"), rosterUrl: rosterUrl("maborerganseboretatebears.com"), xHandle: "@MorganStBearsFB" },
  { name: "Norfolk State", division: "D1_FCS", conference: "MEAC", state: "VA", city: "Norfolk", staffUrl: sidearmUrl("nsuspartans.com"), rosterUrl: rosterUrl("nsuspartans.com"), xHandle: "@NSU_Spartans" },
  { name: "South Carolina State", division: "D1_FCS", conference: "MEAC", state: "SC", city: "Orangeburg", staffUrl: sidearmUrl("scstatebulldogs.com"), rosterUrl: rosterUrl("scstatebulldogs.com"), xHandle: "@SCStateFB" },

  // ── Additional Big Sky / OVC / SoCon ──
  { name: "Chattanooga", division: "D1_FCS", conference: "SoCon", state: "TN", city: "Chattanooga", staffUrl: sidearmUrl("gomocs.com"), rosterUrl: rosterUrl("gomocs.com"), xHandle: "@GoMocsFB" },
  { name: "East Tennessee State", division: "D1_FCS", conference: "SoCon", state: "TN", city: "Johnson City", staffUrl: sidearmUrl("etsubucs.com"), rosterUrl: rosterUrl("etsubucs.com"), xHandle: "@ETSUFootball" },
  { name: "Furman", division: "D1_FCS", conference: "SoCon", state: "SC", city: "Greenville", staffUrl: sidearmUrl("furmanpaladins.com"), rosterUrl: rosterUrl("furmanpaladins.com"), xHandle: "@PaladinFootball" },
  { name: "Mercer", division: "D1_FCS", conference: "SoCon", state: "GA", city: "Macon", staffUrl: sidearmUrl("mercerbears.com"), rosterUrl: rosterUrl("mercerbears.com"), xHandle: "@MercerFootball" },
  { name: "Samford", division: "D1_FCS", conference: "SoCon", state: "AL", city: "Birmingham", staffUrl: sidearmUrl("samfordsports.com"), rosterUrl: rosterUrl("samfordsports.com"), xHandle: "@SamfordFootball" },
  { name: "VMI", division: "D1_FCS", conference: "SoCon", state: "VA", city: "Lexington", staffUrl: sidearmUrl("vmikeydets.com"), rosterUrl: rosterUrl("vmikeydets.com"), xHandle: "@VMI_Football" },
  { name: "Western Carolina", division: "D1_FCS", conference: "SoCon", state: "NC", city: "Cullowhee", staffUrl: sidearmUrl("catamountsports.com"), rosterUrl: rosterUrl("catamountsports.com"), xHandle: "@CatamountsFB" },
  { name: "Wofford", division: "D1_FCS", conference: "SoCon", state: "SC", city: "Spartanburg", staffUrl: sidearmUrl("woffordterriers.com"), rosterUrl: rosterUrl("woffordterriers.com"), xHandle: "@WoffordTerriers" },
];

// ────────────────────────────────────────────────────────────────────────────────
//  D2 — Wisconsin/Midwest priority programs + major conferences
// ────────────────────────────────────────────────────────────────────────────────

const D2_SCHOOLS: SchoolEntry[] = [
  // ── GLIAC (Great Lakes Intercollegiate Athletic Conference) ──
  { name: "Davenport", division: "D2", conference: "GLIAC", state: "MI", city: "Grand Rapids", staffUrl: sidearmUrl("davenportpanthers.com"), rosterUrl: rosterUrl("davenportpanthers.com"), xHandle: "@DUPanthersFB" },
  { name: "Ferris State", division: "D2", conference: "GLIAC", state: "MI", city: "Big Rapids", staffUrl: sidearmUrl("ferrisstatebulldogs.com"), rosterUrl: rosterUrl("ferrisstatebulldogs.com"), xHandle: "@FerrisFootball" },
  { name: "Grand Valley State", division: "D2", conference: "GLIAC", state: "MI", city: "Allendale", staffUrl: sidearmUrl("gvsulakers.com"), rosterUrl: rosterUrl("gvsulakers.com"), xHandle: "@GVSUFootball" },
  { name: "Michigan Tech", division: "D2", conference: "GLIAC", state: "MI", city: "Houghton", staffUrl: sidearmUrl("michigantechhuskies.com"), rosterUrl: rosterUrl("michigantechhuskies.com"), xHandle: "@MTUFootball" },
  { name: "Northern Michigan", division: "D2", conference: "GLIAC", state: "MI", city: "Marquette", staffUrl: sidearmUrl("nmuwildcats.com"), rosterUrl: rosterUrl("nmuwildcats.com"), xHandle: "@NMU_Football" },
  { name: "Northwood", division: "D2", conference: "GLIAC", state: "MI", city: "Midland", staffUrl: sidearmUrl("northwoodtimberwolves.com"), rosterUrl: rosterUrl("northwoodtimberwolves.com"), xHandle: "@NorthwoodFB" },
  { name: "Saginaw Valley State", division: "D2", conference: "GLIAC", state: "MI", city: "University Center", staffUrl: sidearmUrl("svsuathletics.com"), rosterUrl: rosterUrl("svsuathletics.com"), xHandle: "@SVSU_Football" },
  { name: "Wayne State (MI)", division: "D2", conference: "GLIAC", state: "MI", city: "Detroit", staffUrl: sidearmUrl("wsuathletics.com"), rosterUrl: rosterUrl("wsuathletics.com"), xHandle: "@WSUWarriorsFB" },
  { name: "Wisconsin-Parkside", division: "D2", conference: "GLIAC", state: "WI", city: "Kenosha", staffUrl: sidearmUrl("parksiderangers.com"), rosterUrl: rosterUrl("parksiderangers.com"), xHandle: "@ParksideFB" },

  // ── GLVC (Great Lakes Valley Conference) ──
  { name: "Indianapolis", division: "D2", conference: "GLVC", state: "IN", city: "Indianapolis", staffUrl: sidearmUrl("uindyathletics.com"), rosterUrl: rosterUrl("uindyathletics.com"), xHandle: "@UIndyFB" },
  { name: "Truman State", division: "D2", conference: "GLVC", state: "MO", city: "Kirksville", staffUrl: sidearmUrl("trumanstateuniv.com"), rosterUrl: rosterUrl("trumanstateuniv.com"), xHandle: "@TrumanFootball" },
  { name: "Southwest Baptist", division: "D2", conference: "GLVC", state: "MO", city: "Bolivar", staffUrl: sidearmUrl("sbubearcat.com"), rosterUrl: rosterUrl("sbubearcat.com"), xHandle: "@SBU_Football" },
  { name: "William Jewell", division: "D2", conference: "GLVC", state: "MO", city: "Liberty", staffUrl: sidearmUrl("jewellcardinals.com"), rosterUrl: rosterUrl("jewellcardinals.com"), xHandle: "@JewellFB" },
  { name: "McKendree", division: "D2", conference: "GLVC", state: "IL", city: "Lebanon", staffUrl: sidearmUrl("mckbearcats.com"), rosterUrl: rosterUrl("mckbearcats.com"), xHandle: "@McKendreeFB" },
  { name: "Quincy", division: "D2", conference: "GLVC", state: "IL", city: "Quincy", staffUrl: sidearmUrl("quincyhawks.com"), rosterUrl: rosterUrl("quincyhawks.com"), xHandle: "@QUHawksFB" },

  // ── NSIC (Northern Sun Intercollegiate Conference) — Upper Midwest ──
  { name: "Augustana (SD)", division: "D2", conference: "NSIC", state: "SD", city: "Sioux Falls", staffUrl: sidearmUrl("goaugie.com"), rosterUrl: rosterUrl("goaugie.com"), xHandle: "@AugieFB" },
  { name: "Bemidji State", division: "D2", conference: "NSIC", state: "MN", city: "Bemidji", staffUrl: sidearmUrl("bsubeavers.com"), rosterUrl: rosterUrl("bsubeavers.com"), xHandle: "@BSUBeaversFB" },
  { name: "Concordia-St. Paul", division: "D2", conference: "NSIC", state: "MN", city: "St. Paul", staffUrl: sidearmUrl("caborespgoldenbears.com"), rosterUrl: rosterUrl("caborespgoldenbears.com"), xHandle: "@CSPFootball" },
  { name: "Mary", division: "D2", conference: "NSIC", state: "ND", city: "Bismarck", staffUrl: sidearmUrl("umarymarauders.com"), rosterUrl: rosterUrl("umarymarauders.com"), xHandle: "@UMaryFB" },
  { name: "Minnesota Duluth", division: "D2", conference: "NSIC", state: "MN", city: "Duluth", staffUrl: sidearmUrl("umdbulldogs.com"), rosterUrl: rosterUrl("umdbulldogs.com"), xHandle: "@UMDBulldogFB" },
  { name: "Minnesota State Mankato", division: "D2", conference: "NSIC", state: "MN", city: "Mankato", staffUrl: sidearmUrl("msumavericks.com"), rosterUrl: rosterUrl("msumavericks.com"), xHandle: "@MinnStFootball" },
  { name: "Minot State", division: "D2", conference: "NSIC", state: "ND", city: "Minot", staffUrl: sidearmUrl("maboreusubeavers.com"), rosterUrl: rosterUrl("maboreusubeavers.com"), xHandle: "@MinotStateFB" },
  { name: "MSU Moorhead", division: "D2", conference: "NSIC", state: "MN", city: "Moorhead", staffUrl: sidearmUrl("msumdragons.com"), rosterUrl: rosterUrl("msumdragons.com"), xHandle: "@MSUMFootball" },
  { name: "Northern State", division: "D2", conference: "NSIC", state: "SD", city: "Aberdeen", staffUrl: sidearmUrl("northernsunathletics.com"), rosterUrl: rosterUrl("northernsunathletics.com"), xHandle: "@NorthernStFB" },
  { name: "Sioux Falls", division: "D2", conference: "NSIC", state: "SD", city: "Sioux Falls", staffUrl: sidearmUrl("usfcougars.com"), rosterUrl: rosterUrl("usfcougars.com"), xHandle: "@USFCougarsFB" },
  { name: "Southwest Minnesota State", division: "D2", conference: "NSIC", state: "MN", city: "Marshall", staffUrl: sidearmUrl("smsumustangs.com"), rosterUrl: rosterUrl("smsumustangs.com"), xHandle: "@SMSUFootball" },
  { name: "St. Cloud State", division: "D2", conference: "NSIC", state: "MN", city: "St. Cloud", staffUrl: sidearmUrl("scsuhuskies.com"), rosterUrl: rosterUrl("scsuhuskies.com"), xHandle: "@SCSUHuskiesFB" },
  { name: "Upper Iowa", division: "D2", conference: "NSIC", state: "IA", city: "Fayette", staffUrl: sidearmUrl("uiupeacocks.com"), rosterUrl: rosterUrl("uiupeacocks.com"), xHandle: "@UIUFootball" },
  { name: "Wayne State (NE)", division: "D2", conference: "NSIC", state: "NE", city: "Wayne", staffUrl: sidearmUrl("wscwildcats.com"), rosterUrl: rosterUrl("wscwildcats.com"), xHandle: "@WSCWildcatFB" },
  { name: "Winona State", division: "D2", conference: "NSIC", state: "MN", city: "Winona", staffUrl: sidearmUrl("winonastatewarriors.com"), rosterUrl: rosterUrl("winonastatewarriors.com"), xHandle: "@WinonaStateFB" },

  // ── PSAC (Pennsylvania State Athletic Conference) ──
  { name: "Bloomsburg", division: "D2", conference: "PSAC", state: "PA", city: "Bloomsburg", staffUrl: sidearmUrl("buhuskies.com"), rosterUrl: rosterUrl("buhuskies.com"), xHandle: "@BloomsburgFB" },
  { name: "California (PA)", division: "D2", conference: "PSAC", state: "PA", city: "California", staffUrl: sidearmUrl("calvulcans.com"), rosterUrl: rosterUrl("calvulcans.com"), xHandle: "@CalUVulcanFB" },
  { name: "IUP", division: "D2", conference: "PSAC", state: "PA", city: "Indiana", staffUrl: sidearmUrl("iupathletics.com"), rosterUrl: rosterUrl("iupathletics.com"), xHandle: "@IUPFootball" },
  { name: "Kutztown", division: "D2", conference: "PSAC", state: "PA", city: "Kutztown", staffUrl: sidearmUrl("kutztownbears.com"), rosterUrl: rosterUrl("kutztownbears.com"), xHandle: "@KUBearsFB" },
  { name: "Millersville", division: "D2", conference: "PSAC", state: "PA", city: "Millersville", staffUrl: sidearmUrl("millersvilleathletics.com"), rosterUrl: rosterUrl("millersvilleathletics.com"), xHandle: "@MillersvilleFB" },
  { name: "Shepherd", division: "D2", conference: "PSAC", state: "WV", city: "Shepherdstown", staffUrl: sidearmUrl("shepherdrams.com"), rosterUrl: rosterUrl("shepherdrams.com"), xHandle: "@ShepherdFB" },
  { name: "Shippensburg", division: "D2", conference: "PSAC", state: "PA", city: "Shippensburg", staffUrl: sidearmUrl("shipraiders.com"), rosterUrl: rosterUrl("shipraiders.com"), xHandle: "@ShipRaidersFB" },
  { name: "Slippery Rock", division: "D2", conference: "PSAC", state: "PA", city: "Slippery Rock", staffUrl: sidearmUrl("srurockpride.com"), rosterUrl: rosterUrl("srurockpride.com"), xHandle: "@SRURockFB" },
  { name: "West Chester", division: "D2", conference: "PSAC", state: "PA", city: "West Chester", staffUrl: sidearmUrl("wcuathletics.com"), rosterUrl: rosterUrl("wcuathletics.com"), xHandle: "@WCUGoldenRamFB" },

  // ── GAC (Great American Conference) ──
  { name: "Harding", division: "D2", conference: "GAC", state: "AR", city: "Searcy", staffUrl: sidearmUrl("hardingsports.com"), rosterUrl: rosterUrl("hardingsports.com"), xHandle: "@HardingFB" },
  { name: "Henderson State", division: "D2", conference: "GAC", state: "AR", city: "Arkadelphia", staffUrl: sidearmUrl("haborendersonreddies.com"), rosterUrl: rosterUrl("haborendersonreddies.com"), xHandle: "@ReddieFootball" },
  { name: "Ouachita Baptist", division: "D2", conference: "GAC", state: "AR", city: "Arkadelphia", staffUrl: sidearmUrl("obutigers.com"), rosterUrl: rosterUrl("obutigers.com"), xHandle: "@OBUFootball" },
  { name: "Southern Arkansas", division: "D2", conference: "GAC", state: "AR", city: "Magnolia", staffUrl: sidearmUrl("muaboreriderbacks.com"), rosterUrl: rosterUrl("muaboreriderbacks.com"), xHandle: "@SAUFootball" },

  // ── LSC (Lone Star Conference) ──
  { name: "Angelo State", division: "D2", conference: "LSC", state: "TX", city: "San Angelo", staffUrl: sidearmUrl("angelosports.com"), rosterUrl: rosterUrl("angelosports.com"), xHandle: "@AngeloStateFB" },
  { name: "Midwestern State", division: "D2", conference: "LSC", state: "TX", city: "Wichita Falls", staffUrl: sidearmUrl("msumustangs.com"), rosterUrl: rosterUrl("msumustangs.com"), xHandle: "@MWStateFootball" },
  { name: "Tarleton State", division: "D2", conference: "LSC", state: "TX", city: "Stephenville", staffUrl: sidearmUrl("tarletonsports.com"), rosterUrl: rosterUrl("tarletonsports.com"), xHandle: "@TarletonFB" },
  { name: "Texas A&M-Kingsville", division: "D2", conference: "LSC", state: "TX", city: "Kingsville", staffUrl: sidearmUrl("javelinaathletics.com"), rosterUrl: rosterUrl("javelinaathletics.com"), xHandle: "@JavelinaFB" },
  { name: "West Texas A&M", division: "D2", conference: "LSC", state: "TX", city: "Canyon", staffUrl: sidearmUrl("gobuffsgo.com"), rosterUrl: rosterUrl("gobuffsgo.com"), xHandle: "@WTAMUFB" },

  // ── MIAA (Mid-America Intercollegiate Athletics Association) ──
  { name: "Central Missouri", division: "D2", conference: "MIAA", state: "MO", city: "Warrensburg", staffUrl: sidearmUrl("ucmathletics.com"), rosterUrl: rosterUrl("ucmathletics.com"), xHandle: "@UCMFootball" },
  { name: "Emporia State", division: "D2", conference: "MIAA", state: "KS", city: "Emporia", staffUrl: sidearmUrl("esuhornets.com"), rosterUrl: rosterUrl("esuhornets.com"), xHandle: "@ESUHornetFB" },
  { name: "Fort Hays State", division: "D2", conference: "MIAA", state: "KS", city: "Hays", staffUrl: sidearmUrl("fhsuathletics.com"), rosterUrl: rosterUrl("fhsuathletics.com"), xHandle: "@FHSUFootball" },
  { name: "Missouri Western", division: "D2", conference: "MIAA", state: "MO", city: "St. Joseph", staffUrl: sidearmUrl("gogriffons.com"), rosterUrl: rosterUrl("gogriffons.com"), xHandle: "@GriffonFB" },
  { name: "Northwest Missouri State", division: "D2", conference: "MIAA", state: "MO", city: "Maryville", staffUrl: sidearmUrl("nwmissouri.edu/athletics"), rosterUrl: rosterUrl("nwmissouri.edu/athletics"), xHandle: "@NWBearcatFB" },
  { name: "Pittsburg State", division: "D2", conference: "MIAA", state: "KS", city: "Pittsburg", staffUrl: sidearmUrl("pittstategorillas.com"), rosterUrl: rosterUrl("pittstategorillas.com"), xHandle: "@PittStGorillas" },
  { name: "Washburn", division: "D2", conference: "MIAA", state: "KS", city: "Topeka", staffUrl: sidearmUrl("wuichabods.com"), rosterUrl: rosterUrl("wuichabods.com"), xHandle: "@WashburnFB" },

  // ── NE-10 (Northeast-10 Conference) ──
  { name: "Assumption", division: "D2", conference: "NE-10", state: "MA", city: "Worcester", staffUrl: sidearmUrl("assumptiongreyhounds.com"), rosterUrl: rosterUrl("assumptiongreyhounds.com"), xHandle: "@AssumptionFB" },
  { name: "Bentley", division: "D2", conference: "NE-10", state: "MA", city: "Waltham", staffUrl: sidearmUrl("bentleyfalcons.com"), rosterUrl: rosterUrl("bentleyfalcons.com"), xHandle: "@BentleyFalcnFB" },
  { name: "New Haven", division: "D2", conference: "NE-10", state: "CT", city: "West Haven", staffUrl: sidearmUrl("newhavenchargers.com"), rosterUrl: rosterUrl("newhavenchargers.com"), xHandle: "@UNewHavenFB" },
  { name: "Pace", division: "D2", conference: "NE-10", state: "NY", city: "Pleasantville", staffUrl: sidearmUrl("pacesetters.com"), rosterUrl: rosterUrl("pacesetters.com"), xHandle: "@PaceUFootball" },
  { name: "Southern Connecticut", division: "D2", conference: "NE-10", state: "CT", city: "New Haven", staffUrl: sidearmUrl("southernctowls.com"), rosterUrl: rosterUrl("southernctowls.com"), xHandle: "@SCSUFB" },

  // ── SAC (South Atlantic Conference) ──
  { name: "Catawba", division: "D2", conference: "SAC", state: "NC", city: "Salisbury", staffUrl: sidearmUrl("gocatawbaindians.com"), rosterUrl: rosterUrl("gocatawbaindians.com"), xHandle: "@CatawbaFB" },
  { name: "Lenoir-Rhyne", division: "D2", conference: "SAC", state: "NC", city: "Hickory", staffUrl: sidearmUrl("lrbears.com"), rosterUrl: rosterUrl("lrbears.com"), xHandle: "@LRUFB" },
  { name: "Mars Hill", division: "D2", conference: "SAC", state: "NC", city: "Mars Hill", staffUrl: sidearmUrl("mhulions.com"), rosterUrl: rosterUrl("mhulions.com"), xHandle: "@MarsHillFB" },
  { name: "Newberry", division: "D2", conference: "SAC", state: "SC", city: "Newberry", staffUrl: sidearmUrl("newberrywolves.com"), rosterUrl: rosterUrl("newberrywolves.com"), xHandle: "@NewberryFB" },
  { name: "Tusculum", division: "D2", conference: "SAC", state: "TN", city: "Greeneville", staffUrl: sidearmUrl("tusculumpioneers.com"), rosterUrl: rosterUrl("tusculumpioneers.com"), xHandle: "@TusculumFB" },
  { name: "Wingate", division: "D2", conference: "SAC", state: "NC", city: "Wingate", staffUrl: sidearmUrl("wingatebulldogs.com"), rosterUrl: rosterUrl("wingatebulldogs.com"), xHandle: "@WingateFB" },

  // ── GSC (Gulf South Conference) ──
  { name: "Delta State", division: "D2", conference: "GSC", state: "MS", city: "Cleveland", staffUrl: sidearmUrl("gostatesmen.com"), rosterUrl: rosterUrl("gostatesmen.com"), xHandle: "@DeltaStateFB" },
  { name: "North Greenville", division: "D2", conference: "GSC", state: "SC", city: "Tigerville", staffUrl: sidearmUrl("ngucrusaders.com"), rosterUrl: rosterUrl("ngucrusaders.com"), xHandle: "@NGUFB" },
  { name: "Valdosta State", division: "D2", conference: "GSC", state: "GA", city: "Valdosta", staffUrl: sidearmUrl("vstateblazers.com"), rosterUrl: rosterUrl("vstateblazers.com"), xHandle: "@VStateFB" },
  { name: "West Alabama", division: "D2", conference: "GSC", state: "AL", city: "Livingston", staffUrl: sidearmUrl("uwaathletics.com"), rosterUrl: rosterUrl("uwaathletics.com"), xHandle: "@UWAFootball" },
  { name: "West Florida", division: "D2", conference: "GSC", state: "FL", city: "Pensacola", staffUrl: sidearmUrl("goargos.com"), rosterUrl: rosterUrl("goargos.com"), xHandle: "@UWFFootball" },
  { name: "West Georgia", division: "D2", conference: "GSC", state: "GA", city: "Carrollton", staffUrl: sidearmUrl("uwgathletics.com"), rosterUrl: rosterUrl("uwgathletics.com"), xHandle: "@UWGFootball" },

  // ── RMAC (Rocky Mountain Athletic Conference) ──
  { name: "Colorado Mesa", division: "D2", conference: "RMAC", state: "CO", city: "Grand Junction", staffUrl: sidearmUrl("cmumavericks.com"), rosterUrl: rosterUrl("cmumavericks.com"), xHandle: "@CMUMavsFB" },
  { name: "Colorado School of Mines", division: "D2", conference: "RMAC", state: "CO", city: "Golden", staffUrl: sidearmUrl("minesathletics.com"), rosterUrl: rosterUrl("minesathletics.com"), xHandle: "@MinesFootball" },
  { name: "CSU Pueblo", division: "D2", conference: "RMAC", state: "CO", city: "Pueblo", staffUrl: sidearmUrl("gothunderwolves.com"), rosterUrl: rosterUrl("gothunderwolves.com"), xHandle: "@CSUPuebloFB" },
  { name: "Western Colorado", division: "D2", conference: "RMAC", state: "CO", city: "Gunnison", staffUrl: sidearmUrl("gomountaineers.com"), rosterUrl: rosterUrl("gomountaineers.com"), xHandle: "@WesternColoFB" },
];

// ────────────────────────────────────────────────────────────────────────────────
//  D3 — Wisconsin + Midwest focus (WIAC, CCIW, MWC, etc.)
// ────────────────────────────────────────────────────────────────────────────────

const D3_SCHOOLS: SchoolEntry[] = [
  // ── WIAC (Wisconsin Intercollegiate Athletic Conference) — home conference! ──
  { name: "UW-Eau Claire", division: "D3", conference: "WIAC", state: "WI", city: "Eau Claire", staffUrl: sidearmUrl("uwecblugolds.com"), rosterUrl: rosterUrl("uwecblugolds.com"), xHandle: "@BlugoldFB" },
  { name: "UW-La Crosse", division: "D3", conference: "WIAC", state: "WI", city: "La Crosse", staffUrl: sidearmUrl("uwlathletics.com"), rosterUrl: rosterUrl("uwlathletics.com"), xHandle: "@UWLEaglesFB" },
  { name: "UW-Oshkosh", division: "D3", conference: "WIAC", state: "WI", city: "Oshkosh", staffUrl: sidearmUrl("uwoshkoshtitans.com"), rosterUrl: rosterUrl("uwoshkoshtitans.com"), xHandle: "@UWOTitanFB" },
  { name: "UW-Platteville", division: "D3", conference: "WIAC", state: "WI", city: "Platteville", staffUrl: sidearmUrl("uwplattevillepioneers.com"), rosterUrl: rosterUrl("uwplattevillepioneers.com"), xHandle: "@UWPlattFB" },
  { name: "UW-River Falls", division: "D3", conference: "WIAC", state: "WI", city: "River Falls", staffUrl: sidearmUrl("uwrffalcons.com"), rosterUrl: rosterUrl("uwrffalcons.com"), xHandle: "@UWRFFB" },
  { name: "UW-Stevens Point", division: "D3", conference: "WIAC", state: "WI", city: "Stevens Point", staffUrl: sidearmUrl("uwsppointers.com"), rosterUrl: rosterUrl("uwsppointers.com"), xHandle: "@uwspfootball" },
  { name: "UW-Stout", division: "D3", conference: "WIAC", state: "WI", city: "Menomonie", staffUrl: sidearmUrl("uwstout.edu/athletics"), rosterUrl: rosterUrl("uwstout.edu/athletics"), xHandle: "@UWStoutFB" },
  { name: "UW-Whitewater", division: "D3", conference: "WIAC", state: "WI", city: "Whitewater", staffUrl: sidearmUrl("uwwsports.com"), rosterUrl: rosterUrl("uwwsports.com"), xHandle: "@UWWFootball" },

  // ── CCIW (College Conference of Illinois & Wisconsin) ──
  { name: "Augustana (IL)", division: "D3", conference: "CCIW", state: "IL", city: "Rock Island", staffUrl: sidearmUrl("augustanaathletics.com"), rosterUrl: rosterUrl("augustanaathletics.com"), xHandle: "@AuggieFB" },
  { name: "Carroll (WI)", division: "D3", conference: "CCIW", state: "WI", city: "Waukesha", staffUrl: sidearmUrl("carrollathletics.com"), rosterUrl: rosterUrl("carrollathletics.com"), xHandle: "@CarrollPios" },
  { name: "Carthage", division: "D3", conference: "CCIW", state: "WI", city: "Kenosha", staffUrl: sidearmUrl("carthage.edu/athletics"), rosterUrl: rosterUrl("carthage.edu/athletics"), xHandle: "@CarthageFB" },
  { name: "Elmhurst", division: "D3", conference: "CCIW", state: "IL", city: "Elmhurst", staffUrl: sidearmUrl("elmhurstuathletics.com"), rosterUrl: rosterUrl("elmhurstuathletics.com"), xHandle: "@ElmhurstFB" },
  { name: "Illinois Wesleyan", division: "D3", conference: "CCIW", state: "IL", city: "Bloomington", staffUrl: sidearmUrl("iwusports.com"), rosterUrl: rosterUrl("iwusports.com"), xHandle: "@IWU_Football" },
  { name: "Millikin", division: "D3", conference: "CCIW", state: "IL", city: "Decatur", staffUrl: sidearmUrl("millikinbiaboregblue.com"), rosterUrl: rosterUrl("millikinbiaboregblue.com"), xHandle: "@MillikinFB" },
  { name: "North Central (IL)", division: "D3", conference: "CCIW", state: "IL", city: "Naperville", staffUrl: sidearmUrl("northcentralcardinals.com"), rosterUrl: rosterUrl("northcentralcardinals.com"), xHandle: "@NCC_Football" },
  { name: "North Park", division: "D3", conference: "CCIW", state: "IL", city: "Chicago", staffUrl: sidearmUrl("npuathletics.com"), rosterUrl: rosterUrl("npuathletics.com"), xHandle: "@NPVikingFB" },
  { name: "Wheaton (IL)", division: "D3", conference: "CCIW", state: "IL", city: "Wheaton", staffUrl: sidearmUrl("wheatonthunder.com"), rosterUrl: rosterUrl("wheatonthunder.com"), xHandle: "@WheatonFB" },

  // ── MWC (Midwest Conference) ──
  { name: "Beloit", division: "D3", conference: "MWC", state: "WI", city: "Beloit", staffUrl: sidearmUrl("beloitbuccaneers.com"), rosterUrl: rosterUrl("beloitbuccaneers.com"), xHandle: "@BeloitFB" },
  { name: "Cornell College", division: "D3", conference: "MWC", state: "IA", city: "Mount Vernon", staffUrl: sidearmUrl("cornellrams.com"), rosterUrl: rosterUrl("cornellrams.com"), xHandle: "@CornellRamsFB" },
  { name: "Grinnell", division: "D3", conference: "MWC", state: "IA", city: "Grinnell", staffUrl: sidearmUrl("pioneers.grinnell.edu"), rosterUrl: rosterUrl("pioneers.grinnell.edu"), xHandle: "@GrinnellFB" },
  { name: "Knox", division: "D3", conference: "MWC", state: "IL", city: "Galesburg", staffUrl: sidearmUrl("knoxprairifire.com"), rosterUrl: rosterUrl("knoxprairifire.com"), xHandle: "@KnoxFB" },
  { name: "Lake Forest", division: "D3", conference: "MWC", state: "IL", city: "Lake Forest", staffUrl: sidearmUrl("foresters.lakeforest.edu"), rosterUrl: rosterUrl("foresters.lakeforest.edu"), xHandle: "@LFCForesterFB" },
  { name: "Lawrence", division: "D3", conference: "MWC", state: "WI", city: "Appleton", staffUrl: sidearmUrl("lawrence.edu/athletics"), rosterUrl: rosterUrl("lawrence.edu/athletics"), xHandle: "@LUVikingFB" },
  { name: "Monmouth (IL)", division: "D3", conference: "MWC", state: "IL", city: "Monmouth", staffUrl: sidearmUrl("monmouthscots.com"), rosterUrl: rosterUrl("monmouthscots.com"), xHandle: "@FightingScotsFB" },
  { name: "Ripon", division: "D3", conference: "MWC", state: "WI", city: "Ripon", staffUrl: sidearmUrl("riponathletics.com"), rosterUrl: rosterUrl("riponathletics.com"), xHandle: "@RiponFB" },
  { name: "St. Norbert", division: "D3", conference: "MWC", state: "WI", city: "De Pere", staffUrl: sidearmUrl("snc.edu/athletics"), rosterUrl: rosterUrl("snc.edu/athletics"), xHandle: "@SNCGreenKnight" },

  // ── MIAC (Minnesota Intercollegiate Athletic Conference) ──
  { name: "Bethel (MN)", division: "D3", conference: "MIAC", state: "MN", city: "Arden Hills", staffUrl: sidearmUrl("bethelroyals.com"), rosterUrl: rosterUrl("bethelroyals.com"), xHandle: "@BethelRoyalsFB" },
  { name: "Carleton", division: "D3", conference: "MIAC", state: "MN", city: "Northfield", staffUrl: sidearmUrl("carletonknights.com"), rosterUrl: rosterUrl("carletonknights.com"), xHandle: "@CarletonFB" },
  { name: "Concordia-Moorhead", division: "D3", conference: "MIAC", state: "MN", city: "Moorhead", staffUrl: sidearmUrl("cobberathletics.com"), rosterUrl: rosterUrl("cobberathletics.com"), xHandle: "@CobberFB" },
  { name: "Gustavus Adolphus", division: "D3", conference: "MIAC", state: "MN", city: "St. Peter", staffUrl: sidearmUrl("gustavus.edu/athletics"), rosterUrl: rosterUrl("gustavus.edu/athletics"), xHandle: "@GustiesFB" },
  { name: "Hamline", division: "D3", conference: "MIAC", state: "MN", city: "St. Paul", staffUrl: sidearmUrl("hamlinepipers.com"), rosterUrl: rosterUrl("hamlinepipers.com"), xHandle: "@HamlineFB" },
  { name: "Macalester", division: "D3", conference: "MIAC", state: "MN", city: "St. Paul", staffUrl: sidearmUrl("macalesterathletics.com"), rosterUrl: rosterUrl("macalesterathletics.com"), xHandle: "@MacalesterFB" },
  { name: "St. John's (MN)", division: "D3", conference: "MIAC", state: "MN", city: "Collegeville", staffUrl: sidearmUrl("gojohnnies.com"), rosterUrl: rosterUrl("gojohnnies.com"), xHandle: "@SJUJohnnieFB" },
  { name: "St. Olaf", division: "D3", conference: "MIAC", state: "MN", city: "Northfield", staffUrl: sidearmUrl("stolaf.edu/athletics"), rosterUrl: rosterUrl("stolaf.edu/athletics"), xHandle: "@StOlafFB" },
  { name: "St. Thomas (MN)", division: "D3", conference: "MIAC", state: "MN", city: "St. Paul", staffUrl: sidearmUrl("tommiesports.com"), rosterUrl: rosterUrl("tommiesports.com"), xHandle: "@TommieFB" },

  // ── OAC (Ohio Athletic Conference) ──
  { name: "Baldwin Wallace", division: "D3", conference: "OAC", state: "OH", city: "Berea", staffUrl: sidearmUrl("bwyellowjackets.com"), rosterUrl: rosterUrl("bwyellowjackets.com"), xHandle: "@BWFB" },
  { name: "John Carroll", division: "D3", conference: "OAC", state: "OH", city: "University Heights", staffUrl: sidearmUrl("jcuathletics.com"), rosterUrl: rosterUrl("jcuathletics.com"), xHandle: "@JCUFootball" },
  { name: "Mount Union", division: "D3", conference: "OAC", state: "OH", city: "Alliance", staffUrl: sidearmUrl("mountunionathletics.com"), rosterUrl: rosterUrl("mountunionathletics.com"), xHandle: "@MtUnionFB" },
  { name: "Ohio Northern", division: "D3", conference: "OAC", state: "OH", city: "Ada", staffUrl: sidearmUrl("onupolarbears.com"), rosterUrl: rosterUrl("onupolarbears.com"), xHandle: "@ONUfootball" },

  // ── UAA (University Athletic Association) ──
  { name: "Carnegie Mellon", division: "D3", conference: "UAA", state: "PA", city: "Pittsburgh", staffUrl: sidearmUrl("cmuathletics.com"), rosterUrl: rosterUrl("cmuathletics.com"), xHandle: "@CMUTartanFB" },
  { name: "Case Western Reserve", division: "D3", conference: "UAA", state: "OH", city: "Cleveland", staffUrl: sidearmUrl("cwruspartans.com"), rosterUrl: rosterUrl("cwruspartans.com"), xHandle: "@CWRUfootball" },
  { name: "Chicago", division: "D3", conference: "UAA", state: "IL", city: "Chicago", staffUrl: sidearmUrl("uchicagoathletics.com"), rosterUrl: rosterUrl("uchicagoathletics.com"), xHandle: "@UChicagoFB" },
  { name: "Washington U (MO)", division: "D3", conference: "UAA", state: "MO", city: "St. Louis", staffUrl: sidearmUrl("wubears.com"), rosterUrl: rosterUrl("wubears.com"), xHandle: "@WashUFootball" },

  // ── NESCAC ──
  { name: "Amherst", division: "D3", conference: "NESCAC", state: "MA", city: "Amherst", staffUrl: sidearmUrl("amherstmammoths.com"), rosterUrl: rosterUrl("amherstmammoths.com"), xHandle: "@AmherstFB" },
  { name: "Middlebury", division: "D3", conference: "NESCAC", state: "VT", city: "Middlebury", staffUrl: sidearmUrl("middleburypanthers.com"), rosterUrl: rosterUrl("middleburypanthers.com"), xHandle: "@MiddPanthersFB" },
  { name: "Trinity (CT)", division: "D3", conference: "NESCAC", state: "CT", city: "Hartford", staffUrl: sidearmUrl("bantamsports.com"), rosterUrl: rosterUrl("bantamsports.com"), xHandle: "@TrinCollFB" },
  { name: "Tufts", division: "D3", conference: "NESCAC", state: "MA", city: "Medford", staffUrl: sidearmUrl("gotuftsjumbos.com"), rosterUrl: rosterUrl("gotuftsjumbos.com"), xHandle: "@TuftsFB" },
  { name: "Wesleyan", division: "D3", conference: "NESCAC", state: "CT", city: "Middletown", staffUrl: sidearmUrl("wescardinals.com"), rosterUrl: rosterUrl("wescardinals.com"), xHandle: "@Wes_Football" },
  { name: "Williams", division: "D3", conference: "NESCAC", state: "MA", city: "Williamstown", staffUrl: sidearmUrl("ephsports.com"), rosterUrl: rosterUrl("ephsports.com"), xHandle: "@WilliamsFB" },

  // ── Centennial Conference ──
  { name: "Dickinson", division: "D3", conference: "Centennial", state: "PA", city: "Carlisle", staffUrl: sidearmUrl("dickinsonathletics.com"), rosterUrl: rosterUrl("dickinsonathletics.com"), xHandle: "@DsonRedDevilFB" },
  { name: "Franklin & Marshall", division: "D3", conference: "Centennial", state: "PA", city: "Lancaster", staffUrl: sidearmUrl("godiplomats.com"), rosterUrl: rosterUrl("godiplomats.com"), xHandle: "@FandM_Football" },
  { name: "Gettysburg", division: "D3", conference: "Centennial", state: "PA", city: "Gettysburg", staffUrl: sidearmUrl("gettysburgsports.com"), rosterUrl: rosterUrl("gettysburgsports.com"), xHandle: "@GburgBulletFB" },
  { name: "Johns Hopkins", division: "D3", conference: "Centennial", state: "MD", city: "Baltimore", staffUrl: sidearmUrl("hopkinssports.com"), rosterUrl: rosterUrl("hopkinssports.com"), xHandle: "@HopkinsFB" },
  { name: "Muhlenberg", division: "D3", conference: "Centennial", state: "PA", city: "Allentown", staffUrl: sidearmUrl("muhlenbergsports.com"), rosterUrl: rosterUrl("muhlenbergsports.com"), xHandle: "@MuhlenbergFB" },

  // ── ARC (American Rivers Conference) — Iowa/Midwest ──
  { name: "Buena Vista", division: "D3", conference: "ARC", state: "IA", city: "Storm Lake", staffUrl: sidearmUrl("bvbeavers.com"), rosterUrl: rosterUrl("bvbeavers.com"), xHandle: "@BVBeaversFB" },
  { name: "Central (IA)", division: "D3", conference: "ARC", state: "IA", city: "Pella", staffUrl: sidearmUrl("centraldutch.com"), rosterUrl: rosterUrl("centraldutch.com"), xHandle: "@CentralDutchFB" },
  { name: "Coe", division: "D3", conference: "ARC", state: "IA", city: "Cedar Rapids", staffUrl: sidearmUrl("coekohawks.com"), rosterUrl: rosterUrl("coekohawks.com"), xHandle: "@CoeKohawksFB" },
  { name: "Dubuque", division: "D3", conference: "ARC", state: "IA", city: "Dubuque", staffUrl: sidearmUrl("dbqspartans.com"), rosterUrl: rosterUrl("dbqspartans.com"), xHandle: "@UDubuqueFB" },
  { name: "Luther", division: "D3", conference: "ARC", state: "IA", city: "Decorah", staffUrl: sidearmUrl("luthernorsesports.com"), rosterUrl: rosterUrl("luthernorsesports.com"), xHandle: "@NorseFB" },
  { name: "Simpson", division: "D3", conference: "ARC", state: "IA", city: "Indianola", staffUrl: sidearmUrl("simpsonstorm.com"), rosterUrl: rosterUrl("simpsonstorm.com"), xHandle: "@SimpsonStormFB" },
  { name: "Wartburg", division: "D3", conference: "ARC", state: "IA", city: "Waverly", staffUrl: sidearmUrl("goknights.net"), rosterUrl: rosterUrl("goknights.net"), xHandle: "@WartburgFB" },

  // ── NACC (Northern Athletics Collegiate Conference) — Illinois/Wisconsin ──
  { name: "Aurora", division: "D3", conference: "NACC", state: "IL", city: "Aurora", staffUrl: sidearmUrl("auroraspartans.com"), rosterUrl: rosterUrl("auroraspartans.com"), xHandle: "@AUSpartanFB" },
  { name: "Benedictine (IL)", division: "D3", conference: "NACC", state: "IL", city: "Lisle", staffUrl: sidearmUrl("beneagles.com"), rosterUrl: rosterUrl("beneagles.com"), xHandle: "@BenUEaglesFB" },
  { name: "Concordia Chicago", division: "D3", conference: "NACC", state: "IL", city: "River Forest", staffUrl: sidearmUrl("caboreuchiccougars.com"), rosterUrl: rosterUrl("caboreuchiccougars.com"), xHandle: "@CUCCougarsFB" },
  { name: "Dominican (IL)", division: "D3", conference: "NACC", state: "IL", city: "River Forest", staffUrl: sidearmUrl("dustars.com"), rosterUrl: rosterUrl("dustars.com"), xHandle: "@DominicanFB" },
  { name: "Lakeland (WI)", division: "D3", conference: "NACC", state: "WI", city: "Plymouth", staffUrl: sidearmUrl("lakelandmuskies.com"), rosterUrl: rosterUrl("lakelandmuskies.com"), xHandle: "@LUMuskiesFB" },
  { name: "MSOE", division: "D3", conference: "NACC", state: "WI", city: "Milwaukee", staffUrl: sidearmUrl("msoeathletics.com"), rosterUrl: rosterUrl("msoeathletics.com"), xHandle: "@MSOEFootball" },
  { name: "Rockford", division: "D3", conference: "NACC", state: "IL", city: "Rockford", staffUrl: sidearmUrl("gorockford.com"), rosterUrl: rosterUrl("gorockford.com"), xHandle: "@RockfordFB" },
  { name: "Wisconsin Lutheran", division: "D3", conference: "NACC", state: "WI", city: "Milwaukee", staffUrl: sidearmUrl("wlcwarriors.com"), rosterUrl: rosterUrl("wlcwarriors.com"), xHandle: "@WLCWarriorFB" },

  // ── Liberty League ──
  { name: "Hobart", division: "D3", conference: "Liberty League", state: "NY", city: "Geneva", staffUrl: sidearmUrl("hwsathletics.com"), rosterUrl: rosterUrl("hwsathletics.com"), xHandle: "@HobartFB" },
  { name: "RPI", division: "D3", conference: "Liberty League", state: "NY", city: "Troy", staffUrl: sidearmUrl("rpiathletics.com"), rosterUrl: rosterUrl("rpiathletics.com"), xHandle: "@RPIFootball" },
  { name: "Rochester", division: "D3", conference: "Liberty League", state: "NY", city: "Rochester", staffUrl: sidearmUrl("uofrathletics.com"), rosterUrl: rosterUrl("uofrathletics.com"), xHandle: "@URochesterFB" },
  { name: "St. Lawrence", division: "D3", conference: "Liberty League", state: "NY", city: "Canton", staffUrl: sidearmUrl("saintsathletics.com"), rosterUrl: rosterUrl("saintsathletics.com"), xHandle: "@SLUSaintsFB" },
  { name: "Union (NY)", division: "D3", conference: "Liberty League", state: "NY", city: "Schenectady", staffUrl: sidearmUrl("unionathletics.com"), rosterUrl: rosterUrl("unionathletics.com"), xHandle: "@UnionFB" },
];

// ────────────────────────────────────────────────────────────────────────────────
//  NAIA — Midwest focus
// ────────────────────────────────────────────────────────────────────────────────

const NAIA_SCHOOLS: SchoolEntry[] = [
  // ── MSFA (Mid-States Football Association) Mideast ──
  { name: "Marian (IN)", division: "NAIA", conference: "MSFA Mideast", state: "IN", city: "Indianapolis", staffUrl: sidearmUrl("marianknights.com"), rosterUrl: rosterUrl("marianknights.com"), xHandle: "@MarianKnightFB" },
  { name: "St. Francis (IN)", division: "NAIA", conference: "MSFA Mideast", state: "IN", city: "Fort Wayne", staffUrl: sidearmUrl("sfcougars.com"), rosterUrl: rosterUrl("sfcougars.com"), xHandle: "@SFCougarFB" },
  { name: "Taylor", division: "NAIA", conference: "MSFA Mideast", state: "IN", city: "Upland", staffUrl: sidearmUrl("taylortrojans.com"), rosterUrl: rosterUrl("taylortrojans.com"), xHandle: "@TaylorTrojFB" },
  { name: "Indiana Wesleyan", division: "NAIA", conference: "MSFA Mideast", state: "IN", city: "Marion", staffUrl: sidearmUrl("iwuwildcats.com"), rosterUrl: rosterUrl("iwuwildcats.com"), xHandle: "@IWUWildcatsFB" },
  { name: "Olivet Nazarene", division: "NAIA", conference: "MSFA Mideast", state: "IL", city: "Bourbonnais", staffUrl: sidearmUrl("olivettigers.com"), rosterUrl: rosterUrl("olivettigers.com"), xHandle: "@ONUFB" },
  { name: "St. Xavier (IL)", division: "NAIA", conference: "MSFA Mideast", state: "IL", city: "Chicago", staffUrl: sidearmUrl("sxucougars.com"), rosterUrl: rosterUrl("sxucougars.com"), xHandle: "@SXUCougarFB" },
  { name: "Trinity International", division: "NAIA", conference: "MSFA Mideast", state: "IL", city: "Deerfield", staffUrl: sidearmUrl("trinitytrojans.com"), rosterUrl: rosterUrl("trinitytrojans.com"), xHandle: "@TIUTrojansFB" },
  { name: "Concordia (WI)", division: "NAIA", conference: "MSFA Mideast", state: "WI", city: "Mequon", staffUrl: sidearmUrl("cufalcons.com"), rosterUrl: rosterUrl("cufalcons.com"), xHandle: "@CUWFalconsFB" },
  { name: "Lakeland", division: "NAIA", conference: "MSFA Mideast", state: "WI", city: "Sheboygan", staffUrl: sidearmUrl("lakelandmuskies.com"), rosterUrl: rosterUrl("lakelandmuskies.com"), xHandle: "@LakelandFB" },
  { name: "Maranatha Baptist", division: "NAIA", conference: "MSFA Mideast", state: "WI", city: "Watertown", staffUrl: sidearmUrl("maranathacrusaders.com"), rosterUrl: rosterUrl("maranathacrusaders.com"), xHandle: "@MBUFB" },

  // ── KCAC (Kansas Collegiate Athletic Conference) ──
  { name: "Baker", division: "NAIA", conference: "KCAC", state: "KS", city: "Baldwin City", staffUrl: sidearmUrl("bakerwildcats.com"), rosterUrl: rosterUrl("bakerwildcats.com"), xHandle: "@BakerWildcatFB" },
  { name: "Benedictine (KS)", division: "NAIA", conference: "KCAC", state: "KS", city: "Atchison", staffUrl: sidearmUrl("bcravens.com"), rosterUrl: rosterUrl("bcravens.com"), xHandle: "@BCRavensFB" },
  { name: "Friends", division: "NAIA", conference: "KCAC", state: "KS", city: "Wichita", staffUrl: sidearmUrl("friendsfalcons.com"), rosterUrl: rosterUrl("friendsfalcons.com"), xHandle: "@FriendsFootball" },
  { name: "Kansas Wesleyan", division: "NAIA", conference: "KCAC", state: "KS", city: "Salina", staffUrl: sidearmUrl("kwucoyotes.com"), rosterUrl: rosterUrl("kwucoyotes.com"), xHandle: "@KWUCoyotesFB" },
  { name: "McPherson", division: "NAIA", conference: "KCAC", state: "KS", city: "McPherson", staffUrl: sidearmUrl("mcphersonbulldogs.com"), rosterUrl: rosterUrl("mcphersonbulldogs.com"), xHandle: "@MacBulldogsFB" },
  { name: "Ottawa (KS)", division: "NAIA", conference: "KCAC", state: "KS", city: "Ottawa", staffUrl: sidearmUrl("ottawabraves.com"), rosterUrl: rosterUrl("ottawabraves.com"), xHandle: "@OttawaBravesFB" },
  { name: "Southwestern (KS)", division: "NAIA", conference: "KCAC", state: "KS", city: "Winfield", staffUrl: sidearmUrl("scbuilders.com"), rosterUrl: rosterUrl("scbuilders.com"), xHandle: "@SCBuilderFB" },
  { name: "Sterling", division: "NAIA", conference: "KCAC", state: "KS", city: "Sterling", staffUrl: sidearmUrl("sterlingwarriors.com"), rosterUrl: rosterUrl("sterlingwarriors.com"), xHandle: "@SterlingWarFB" },
  { name: "Tabor", division: "NAIA", conference: "KCAC", state: "KS", city: "Hillsboro", staffUrl: sidearmUrl("taborbluejays.com"), rosterUrl: rosterUrl("taborbluejays.com"), xHandle: "@TaborFB" },

  // ── HAAC (Heart of America Athletic Conference) ──
  { name: "Culver-Stockton", division: "NAIA", conference: "HAAC", state: "MO", city: "Canton", staffUrl: sidearmUrl("caborescwildcats.com"), rosterUrl: rosterUrl("caborescwildcats.com"), xHandle: "@CulverStockFB" },
  { name: "Evangel", division: "NAIA", conference: "HAAC", state: "MO", city: "Springfield", staffUrl: sidearmUrl("evangelcrusaders.com"), rosterUrl: rosterUrl("evangelcrusaders.com"), xHandle: "@EvangelFB" },
  { name: "Graceland", division: "NAIA", conference: "HAAC", state: "IA", city: "Lamoni", staffUrl: sidearmUrl("gracelandyellowjackets.com"), rosterUrl: rosterUrl("gracelandyellowjackets.com"), xHandle: "@GracelandFB" },
  { name: "Grand View", division: "NAIA", conference: "HAAC", state: "IA", city: "Des Moines", staffUrl: sidearmUrl("grandviewvikings.com"), rosterUrl: rosterUrl("grandviewvikings.com"), xHandle: "@GrandViewFB" },
  { name: "MidAmerica Nazarene", division: "NAIA", conference: "HAAC", state: "KS", city: "Olathe", staffUrl: sidearmUrl("manupioneers.com"), rosterUrl: rosterUrl("manupioneers.com"), xHandle: "@MANUFB" },
  { name: "Missouri Valley", division: "NAIA", conference: "HAAC", state: "MO", city: "Marshall", staffUrl: sidearmUrl("mvikings.com"), rosterUrl: rosterUrl("mvikings.com"), xHandle: "@MissouriValFB" },
  { name: "Peru State", division: "NAIA", conference: "HAAC", state: "NE", city: "Peru", staffUrl: sidearmUrl("perustbobcats.com"), rosterUrl: rosterUrl("perustbobcats.com"), xHandle: "@PeruStateFB" },
  { name: "William Penn", division: "NAIA", conference: "HAAC", state: "IA", city: "Oskaloosa", staffUrl: sidearmUrl("wpstatesmen.com"), rosterUrl: rosterUrl("wpstatesmen.com"), xHandle: "@WPennFB" },

  // ── GPAC (Great Plains Athletic Conference) ──
  { name: "Concordia (NE)", division: "NAIA", conference: "GPAC", state: "NE", city: "Seward", staffUrl: sidearmUrl("cunebulldogs.com"), rosterUrl: rosterUrl("cunebulldogs.com"), xHandle: "@CUNEBulldogFB" },
  { name: "Doane", division: "NAIA", conference: "GPAC", state: "NE", city: "Crete", staffUrl: sidearmUrl("doanetigers.com"), rosterUrl: rosterUrl("doanetigers.com"), xHandle: "@DoaneTigerFB" },
  { name: "Dordt", division: "NAIA", conference: "GPAC", state: "IA", city: "Sioux Center", staffUrl: sidearmUrl("dordtdefenders.com"), rosterUrl: rosterUrl("dordtdefenders.com"), xHandle: "@DordtFB" },
  { name: "Hastings", division: "NAIA", conference: "GPAC", state: "NE", city: "Hastings", staffUrl: sidearmUrl("hastingsbroncos.com"), rosterUrl: rosterUrl("hastingsbroncos.com"), xHandle: "@HastingsFB" },
  { name: "Midland", division: "NAIA", conference: "GPAC", state: "NE", city: "Fremont", staffUrl: sidearmUrl("midlandwarriors.com"), rosterUrl: rosterUrl("midlandwarriors.com"), xHandle: "@MidlandFB" },
  { name: "Morningside", division: "NAIA", conference: "GPAC", state: "IA", city: "Sioux City", staffUrl: sidearmUrl("morningsidemustangs.com"), rosterUrl: rosterUrl("morningsidemustangs.com"), xHandle: "@MSideFB" },
  { name: "Northwestern (IA)", division: "NAIA", conference: "GPAC", state: "IA", city: "Orange City", staffUrl: sidearmUrl("nwcraiders.com"), rosterUrl: rosterUrl("nwcraiders.com"), xHandle: "@NWCRaiderFB" },

  // ── Wolverine-Hoosier Athletic Conference ──
  { name: "Cornerstone", division: "NAIA", conference: "WHAC", state: "MI", city: "Grand Rapids", staffUrl: sidearmUrl("caborernerstoneeagles.com"), rosterUrl: rosterUrl("caborernerstoneeagles.com"), xHandle: "@CUGoldenEaglFB" },
  { name: "Lawrence Tech", division: "NAIA", conference: "WHAC", state: "MI", city: "Southfield", staffUrl: sidearmUrl("ltubluedevils.com"), rosterUrl: rosterUrl("ltubluedevils.com"), xHandle: "@LTUFB" },
  { name: "Madonna", division: "NAIA", conference: "WHAC", state: "MI", city: "Livonia", staffUrl: sidearmUrl("madonnacrusaders.com"), rosterUrl: rosterUrl("madonnacrusaders.com"), xHandle: "@MUCrusaderFB" },
  { name: "Siena Heights", division: "NAIA", conference: "WHAC", state: "MI", city: "Adrian", staffUrl: sidearmUrl("shusaints.com"), rosterUrl: rosterUrl("shusaints.com"), xHandle: "@SHUSaintsFB" },

  // ── Chicagoland Collegiate Athletic Conference ──
  { name: "Judson", division: "NAIA", conference: "CCAC", state: "IL", city: "Elgin", staffUrl: sidearmUrl("judsoneagles.com"), rosterUrl: rosterUrl("judsoneagles.com"), xHandle: "@JudsonEagleFB" },
  { name: "Roosevelt", division: "NAIA", conference: "CCAC", state: "IL", city: "Chicago", staffUrl: sidearmUrl("rooseveltlakers.com"), rosterUrl: rosterUrl("rooseveltlakers.com"), xHandle: "@RooseveltFB" },
  { name: "St. Ambrose", division: "NAIA", conference: "CCAC", state: "IA", city: "Davenport", staffUrl: sidearmUrl("saustingbees.com"), rosterUrl: rosterUrl("saustingbees.com"), xHandle: "@SAUFightinBees" },
  { name: "Calumet-St. Joseph", division: "NAIA", conference: "CCAC", state: "IN", city: "Whiting", staffUrl: sidearmUrl("csjathletics.com"), rosterUrl: rosterUrl("csjathletics.com"), xHandle: "@CSJFootball" },

  // ── Frontier Conference ──
  { name: "Carroll (MT)", division: "NAIA", conference: "Frontier", state: "MT", city: "Helena", staffUrl: sidearmUrl("carrollathletics.com"), rosterUrl: rosterUrl("carrollathletics.com"), xHandle: "@CarrollSaintsFB" },
  { name: "Montana Tech", division: "NAIA", conference: "Frontier", state: "MT", city: "Butte", staffUrl: sidearmUrl("maborentechorediggers.com"), rosterUrl: rosterUrl("maborentechorediggers.com"), xHandle: "@MontanaTechFB" },
  { name: "Montana Western", division: "NAIA", conference: "Frontier", state: "MT", city: "Dillon", staffUrl: sidearmUrl("umwbulldogs.com"), rosterUrl: rosterUrl("umwbulldogs.com"), xHandle: "@UMWBulldogsFB" },
  { name: "Rocky Mountain", division: "NAIA", conference: "Frontier", state: "MT", city: "Billings", staffUrl: sidearmUrl("gobattlin.com"), rosterUrl: rosterUrl("gobattlin.com"), xHandle: "@BattlinBearsFB" },

  // ── Sooner Athletic Conference ──
  { name: "Oklahoma Baptist", division: "NAIA", conference: "SAC", state: "OK", city: "Shawnee", staffUrl: sidearmUrl("obubison.com"), rosterUrl: rosterUrl("obubison.com"), xHandle: "@OBUBisonFB" },
  { name: "Oklahoma Panhandle", division: "NAIA", conference: "SAC", state: "OK", city: "Goodwell", staffUrl: sidearmUrl("opsuaggies.com"), rosterUrl: rosterUrl("opsuaggies.com"), xHandle: "@OPSUAggiesFB" },
  { name: "Southwestern Assemblies of God", division: "NAIA", conference: "SAC", state: "TX", city: "Waxahachie", staffUrl: sidearmUrl("sagulions.com"), rosterUrl: rosterUrl("sagulions.com"), xHandle: "@SAGUFB" },
  { name: "Wayland Baptist", division: "NAIA", conference: "SAC", state: "TX", city: "Plainview", staffUrl: sidearmUrl("wbupioneers.com"), rosterUrl: rosterUrl("wbupioneers.com"), xHandle: "@WBUPioneerFB" },
];

// ─── Combined master list ─────────────────────────────────────────────────────

export const NCAA_SCHOOLS: SchoolEntry[] = [
  ...D1_FBS_SCHOOLS,
  ...D1_FCS_SCHOOLS,
  ...D2_SCHOOLS,
  ...D3_SCHOOLS,
  ...NAIA_SCHOOLS,
];

// ─── Scraping Logic ───────────────────────────────────────────────────────────

/**
 * Scrape a URL using Firecrawl API, with fallback to Jina Reader.
 * Returns raw markdown text or null on failure.
 */
async function scrapeUrl(url: string): Promise<string | null> {
  // Strategy 1: Firecrawl
  const firecrawlKey = process.env.FIRECRAWL_API_KEY;
  if (firecrawlKey) {
    try {
      const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${firecrawlKey}`,
        },
        body: JSON.stringify({ url, formats: ["markdown"] }),
      });

      if (response.ok) {
        const data = await response.json();
        const markdown = data?.data?.markdown ?? data?.markdown ?? null;
        if (markdown && markdown.length > 100) {
          return markdown;
        }
      }
    } catch {
      // Fall through to Jina
    }
  }

  // Strategy 2: Jina Reader
  const jinaKey = process.env.JINA_API_KEY;
  try {
    const headers: Record<string, string> = {
      Accept: "text/plain",
    };
    if (jinaKey) {
      headers["Authorization"] = `Bearer ${jinaKey}`;
    }

    const response = await fetch(`https://r.jina.ai/${url}`, { headers });
    if (response.ok) {
      const text = await response.text();
      if (text && text.length > 100) {
        return text;
      }
    }
  } catch {
    // Both strategies failed
  }

  return null;
}

/**
 * Parse scraped markdown for coaching staff information.
 * Looks for name + title patterns common on Sidearm/athletics staff pages.
 */
function parseStaffMarkdown(markdown: string, school: SchoolEntry): ScrapedCoach[] {
  const coaches: ScrapedCoach[] = [];
  const lines = markdown.split("\n").map((l) => l.trim()).filter(Boolean);

  // Title patterns we care about (OL-first recruiting strategy)
  const priorityTitles = [
    /offensive\s+line/i,
    /\bol\b\s+coach/i,
    /o[\s-]?line/i,
    /recruiting\s+coordinator/i,
    /head\s+coach/i,
    /offensive\s+coordinator/i,
    /assistant\s+head\s+coach/i,
    /run\s+game\s+coordinator/i,
    /associate\s+head\s+coach/i,
  ];

  // Email pattern
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

  // Twitter/X handle pattern
  const xHandlePattern = /@[A-Za-z0-9_]{1,15}/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = i + 1 < lines.length ? lines[i + 1] : "";
    const prevLine = i > 0 ? lines[i - 1] : "";

    // Check if current line or adjacent lines contain a priority title
    let matchedTitle: string | null = null;
    for (const pattern of priorityTitles) {
      if (pattern.test(line)) {
        matchedTitle = line.replace(/^[#*\s]+/, "").replace(/[*#]+$/, "").trim();
        break;
      }
      if (pattern.test(nextLine)) {
        matchedTitle = nextLine.replace(/^[#*\s]+/, "").replace(/[*#]+$/, "").trim();
        break;
      }
    }

    if (!matchedTitle) continue;

    // Try to extract coach name from current line, previous line, or the title line itself
    let coachName: string | null = null;

    // Name is typically on the line before or the same line as the title
    // Pattern: "First Last" or "First M. Last" - capitalized words
    const namePattern = /^[#*\s]*([A-Z][a-z]+(?:\s+[A-Z]\.?)?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/;

    // Check if name is on the line with the title (e.g., "John Smith - Head Coach")
    const dashSplit = line.split(/\s*[-–—|]\s*/);
    if (dashSplit.length >= 2) {
      const nameCandidate = dashSplit[0].replace(/^[#*\s]+/, "").trim();
      const nameMatch = nameCandidate.match(namePattern);
      if (nameMatch) {
        coachName = nameMatch[1];
      }
    }

    // Check the previous line for the name
    if (!coachName && prevLine) {
      const prevMatch = prevLine.match(namePattern);
      if (prevMatch) {
        coachName = prevMatch[1];
      }
    }

    // Check the current line if it has the name (for lines where name IS the line)
    if (!coachName) {
      const currentMatch = line.match(namePattern);
      if (currentMatch && !priorityTitles.some((p) => p.test(currentMatch[1]))) {
        coachName = currentMatch[1];
      }
    }

    if (!coachName) continue;

    // Check for duplicates
    if (coaches.some((c) => c.name === coachName)) continue;

    // Look for email in surrounding lines (check +-3 lines)
    let email: string | null = null;
    let xHandle: string | null = null;
    for (let j = Math.max(0, i - 2); j < Math.min(lines.length, i + 4); j++) {
      const emailMatch = lines[j].match(emailPattern);
      if (emailMatch && !email) {
        email = emailMatch[0];
      }
      const handleMatch = lines[j].match(xHandlePattern);
      if (handleMatch && !xHandle && !lines[j].includes("@gmail") && !lines[j].includes("@yahoo")) {
        xHandle = handleMatch[0];
      }
    }

    // Derive recruiting area from state for position coaches
    let recruitingArea: string | null = null;
    if (/recruiting/i.test(matchedTitle)) {
      recruitingArea = school.state;
    }

    coaches.push({
      name: coachName,
      title: matchedTitle,
      email,
      xHandle,
      school: school.name,
      division: school.division,
      recruitingArea,
    });
  }

  return coaches;
}

/**
 * Scrape a single school's staff page for coaching data.
 */
export async function scrapeSchoolStaff(school: SchoolEntry): Promise<ScrapedCoach[]> {
  const markdown = await scrapeUrl(school.staffUrl);
  if (!markdown) {
    return [];
  }

  return parseStaffMarkdown(markdown, school);
}

/**
 * Store scraped coaches into the Supabase `coaches` table.
 */
async function storeCoaches(coaches: ScrapedCoach[]): Promise<number> {
  if (!isSupabaseConfigured() || coaches.length === 0) {
    return 0;
  }

  const supabase = createAdminClient();
  let stored = 0;

  for (const coach of coaches) {
    try {
      // Check if coach already exists (by name + school)
      const { data: existing } = await supabase
        .from("coaches")
        .select("id")
        .eq("name", coach.name)
        .eq("school_name", coach.school)
        .limit(1);

      if (existing && existing.length > 0) {
        // Update existing record
        await supabase
          .from("coaches")
          .update({
            title: coach.title,
            x_handle: coach.xHandle,
            division: coach.division,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing[0].id);
        stored++;
      } else {
        // Insert new coach
        const { error } = await supabase.from("coaches").insert({
          name: coach.name,
          title: coach.title,
          school_name: coach.school,
          division: coach.division,
          x_handle: coach.xHandle,
          priority_tier: "scrape_discovered",
          dm_status: "not_sent",
          follow_status: "not_followed",
        });
        if (!error) stored++;
      }
    } catch {
      // Skip individual failures
    }
  }

  return stored;
}

// ─── In-memory scrape status tracking ─────────────────────────────────────────

let lastScrapeResult: ScrapeResult | null = null;

export function getLastScrapeResult(): ScrapeResult | null {
  return lastScrapeResult;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Run the mega scraper across NCAA programs.
 *
 * @param options.division  Filter to a specific division (e.g., "D1_FBS")
 * @param options.limit     Max number of schools to scrape (for testing)
 */
export async function runMegaScrape(options: {
  division?: string;
  limit?: number;
}): Promise<ScrapeResult> {
  const { division, limit } = options;

  // Filter schools by division if specified
  let schools = [...NCAA_SCHOOLS];
  if (division) {
    schools = schools.filter((s) => s.division === division);
  }

  // Apply limit
  if (limit && limit > 0) {
    schools = schools.slice(0, limit);
  }

  const result: ScrapeResult = {
    totalSchools: schools.length,
    schoolsProcessed: 0,
    coachesFound: 0,
    coachesStored: 0,
    errors: [],
    startedAt: new Date().toISOString(),
    completedAt: null,
    division: division ?? null,
  };

  lastScrapeResult = result;

  for (const school of schools) {
    try {
      console.info(`[mega-scraper] Scraping: ${school.name} (${school.division})`);

      const coaches = await scrapeSchoolStaff(school);
      result.coachesFound += coaches.length;
      result.schoolsProcessed++;

      if (coaches.length > 0) {
        const stored = await storeCoaches(coaches);
        result.coachesStored += stored;
        console.info(
          `[mega-scraper] ${school.name}: found ${coaches.length} coaches, stored ${stored}`
        );
      } else {
        console.info(`[mega-scraper] ${school.name}: no coaches parsed from staff page`);
      }

      // Rate limit: 1 request per 2 seconds
      await delay(RATE_LIMIT_MS);
    } catch (err) {
      const message = `${school.name}: ${err instanceof Error ? err.message : String(err)}`;
      result.errors.push(message);
      console.error(`[mega-scraper] Error: ${message}`);

      // Continue to next school
      await delay(RATE_LIMIT_MS);
    }
  }

  result.completedAt = new Date().toISOString();
  lastScrapeResult = result;

  console.info(
    `[mega-scraper] Complete: ${result.schoolsProcessed}/${result.totalSchools} schools, ` +
      `${result.coachesFound} coaches found, ${result.coachesStored} stored, ` +
      `${result.errors.length} errors`
  );

  return result;
}

/**
 * Get all schools in the database, optionally filtered by division.
 */
export function getSchools(division?: string): SchoolEntry[] {
  if (division) {
    return NCAA_SCHOOLS.filter((s) => s.division === division);
  }
  return [...NCAA_SCHOOLS];
}

/**
 * Get school count by division for dashboard display.
 */
export function getSchoolCounts(): Record<string, number> {
  return {
    D1_FBS: D1_FBS_SCHOOLS.length,
    D1_FCS: D1_FCS_SCHOOLS.length,
    D2: D2_SCHOOLS.length,
    D3: D3_SCHOOLS.length,
    NAIA: NAIA_SCHOOLS.length,
    total: NCAA_SCHOOLS.length,
  };
}

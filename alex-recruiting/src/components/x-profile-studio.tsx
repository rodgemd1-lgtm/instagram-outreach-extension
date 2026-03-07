"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Link as LinkIcon,
  CalendarDays,
  CheckCircle2,
  Copy,
  AlertTriangle,
  Check,
  Eye,
  Pen,
  Palette,
  Pin,
  Heart,
  MessageCircle,
  Repeat2,
  BarChart3,
  Share,
  Camera,
  Image,
  Type,
  Calendar,
  Star,
  Shield,
  Trophy,
  ArrowRight,
  Film,
  GraduationCap,
  Ruler,
  Sparkles,
  GitCompareArrows,
  Wand2,
  ListChecks,
  ExternalLink,
  Loader2,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_BIO =
  "Offensive Lineman | 6'4\" 285 | Class of 2029\nPewaukee HS, Wisconsin\n3.7 GPA | All-Conference\nFilm: hudl.com/jacobrogers";

const BIO_BLOCKS = [
  { label: "Position / Size", text: "Offensive Lineman | 6'4\" 285", icon: Ruler },
  { label: "School / Class", text: "Pewaukee HS '29 | Wisconsin", icon: GraduationCap },
  { label: "GPA", text: "3.7 GPA | Honor Roll", icon: Star },
  { label: "Film Link", text: "Film: hudl.com/jacobrogers", icon: Film },
  { label: "NCSA Link", text: "ncsasports.org/jacobrogers", icon: LinkIcon },
  { label: "Motto", text: "Built Different. Outwork Everyone.", icon: Sparkles },
];

const SUGGESTED_BIOS = [
  {
    label: "Clean & Professional",
    text: "OL | 6'4\" 285 | Pewaukee HS '29\n3.7 GPA | All-Conference\nFilm: hudl.com/jacobrogers\nDream big. Work harder.",
  },
  {
    label: "Stats-Forward",
    text: "Class of 2029 Offensive Lineman\n6'4\" 285 | 5.1 40yd | 315 Bench\nPewaukee HS, Pewaukee WI\n3.7 GPA | hudl.com/jacobrogers",
  },
  {
    label: "Personality + Recruiting",
    text: "Future D1 Offensive Lineman\nPewaukee HS '29 | 6'4\" 285\nFaith. Family. Football.\nCoaches: DMs open | Film below",
  },
];

const SLANG_WORDS = [
  "goat",
  "bussin",
  "no cap",
  "fr fr",
  "lowkey",
  "highkey",
  "lit",
  "sus",
  "slay",
  "bruh",
  "fam",
  "yolo",
  "vibes",
  "trash",
  "ratio",
  "deadass",
  "ngl",
];

const PINNED_POST_TEMPLATE = `Class of 2029 | Offensive Lineman
📍 Pewaukee HS, Pewaukee WI
📏 6'4" 285 | 5.1 40yd | 315 Bench
📚 3.7 GPA | Honor Roll

🎬 Junior Season Highlights:
hudl.com/jacobrogers

📋 NCSA Profile:
ncsasports.org/jacobrogers

Coaches — DMs are open. Looking forward to earning an opportunity at the next level.

#Recruiting #ClassOf2029 #OffensiveLine`;

const SEASONAL_CALENDAR = [
  {
    period: "Jan – Mar",
    label: "Off-Season Training",
    description: "Pin your winter workout highlights and measurables update. Show coaches you are putting in off-season work.",
    active: true,
  },
  {
    period: "Apr – Jun",
    label: "Camp Season",
    description: "Pin your camp schedule and any offers or camp MVPs. Tag the camps you are attending.",
    active: false,
  },
  {
    period: "Jul – Aug",
    label: "Pre-Season Hype",
    description: "Pin updated highlights reel with new measurables. Include your schedule so coaches know when to scout you.",
    active: false,
  },
  {
    period: "Sep – Nov",
    label: "In-Season Film",
    description: "Pin weekly film links or a rolling highlight reel. Update stats after every game.",
    active: false,
  },
  {
    period: "Dec",
    label: "Season Recap",
    description: "Pin your full season highlight reel with final stats, awards, and all-conference selections.",
    active: false,
  },
];

const PHOTO_CHECKLIST = [
  { label: "Professional headshot in school gear", tip: "Clean background, good lighting, looking at camera" },
  { label: "High-resolution (at least 400x400px)", tip: "X displays profile photos at 400x400" },
  { label: "Face clearly visible, no sunglasses", tip: "Coaches want to see who you are" },
  { label: "Wearing school or team apparel", tip: "Reinforces your identity and affiliation" },
  { label: "No filters or heavy editing", tip: "Keep it authentic and professional" },
];

const HEADER_CHECKLIST = [
  { label: "Action shot from game or practice", tip: "Shows you in your element competing" },
  { label: "Dimensions: 1500x500px", tip: "X's recommended header size" },
  { label: "Name/number text overlay (optional)", tip: "Helps coaches identify you in the photo" },
  { label: "School colors prominent", tip: "Reinforces brand and school pride" },
  { label: "No busy or cluttered backgrounds", tip: "Keep focus on you and key info" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function XProfileStudio() {
  const [bio, setBio] = useState(DEFAULT_BIO);
  const [displayName, setDisplayName] = useState("Jacob Rodgers");
  const [handle] = useState("@JacobRodge52987");
  const [location, setLocation] = useState("Pewaukee, WI");
  const [websiteLink, setWebsiteLink] = useState("hudl.com/jacobrogers");
  const [pinnedPost, setPinnedPost] = useState(PINNED_POST_TEMPLATE);
  const [copiedBio, setCopiedBio] = useState<number | null>(null);
  const [copiedPinned, setCopiedPinned] = useState(false);
  const [photoChecks, setPhotoChecks] = useState<boolean[]>(new Array(PHOTO_CHECKLIST.length).fill(false));
  const [headerChecks, setHeaderChecks] = useState<boolean[]>(new Array(HEADER_CHECKLIST.length).fill(false));
  const [actionChecks, setActionChecks] = useState<boolean[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("alex-action-checklist");
      if (saved) return JSON.parse(saved);
    }
    return new Array(8).fill(false);
  });
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [apiUpdating, setApiUpdating] = useState(false);
  const [apiResult, setApiResult] = useState<{ success: boolean; message: string } | null>(null);

  // ─── Bio compliance check ───────────────────────────────────────────────────
  const complianceIssues = useMemo(() => {
    const issues: string[] = [];
    const lower = bio.toLowerCase();
    SLANG_WORDS.forEach((word) => {
      const w = word.toLowerCase().trim();
      const regex = new RegExp(`\\b${w}\\b`, "i");
      if (regex.test(lower)) {
        issues.push(`Contains slang: "${word.trim()}"`);
      }
    });
    if (bio.includes("!!") || bio.includes("???")) {
      issues.push("Excessive punctuation detected");
    }
    if (/[A-Z]{5,}/.test(bio)) {
      issues.push("Avoid excessive capitalization (ALL CAPS)");
    }
    return issues;
  }, [bio]);

  const bioCharCount = bio.length;
  const pinnedCharCount = pinnedPost.length;

  const brandScore = useMemo(() => {
    let score = 0;
    const checkedPhoto = photoChecks.filter(Boolean).length;
    const checkedHeader = headerChecks.filter(Boolean).length;
    score += (checkedPhoto / PHOTO_CHECKLIST.length) * 40;
    score += (checkedHeader / HEADER_CHECKLIST.length) * 30;
    if (bioCharCount > 20 && bioCharCount <= 160) score += 15;
    if (complianceIssues.length === 0) score += 15;
    return Math.round(score);
  }, [photoChecks, headerChecks, bioCharCount, complianceIssues]);

  function handleCopyBio(index: number) {
    navigator.clipboard.writeText(SUGGESTED_BIOS[index].text);
    setCopiedBio(index);
    setTimeout(() => setCopiedBio(null), 2000);
  }

  function handleCopyPinned() {
    navigator.clipboard.writeText(pinnedPost);
    setCopiedPinned(true);
    setTimeout(() => setCopiedPinned(false), 2000);
  }

  function addBioBlock(text: string) {
    const newBio = bio ? bio + "\n" + text : text;
    if (newBio.length <= 160) {
      setBio(newBio);
    }
  }

  function togglePhotoCheck(index: number) {
    setPhotoChecks((prev) => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  }

  function toggleHeaderCheck(index: number) {
    setHeaderChecks((prev) => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  }

  function toggleActionCheck(index: number) {
    setActionChecks((prev) => {
      const copy = [...prev];
      copy[index] = !copy[index];
      if (typeof window !== "undefined") {
        localStorage.setItem("alex-action-checklist", JSON.stringify(copy));
      }
      return copy;
    });
  }

  function generateClaudePrompt() {
    const prompt = `You are helping optimize a college football recruit's X (Twitter) profile for maximum coach visibility.

ATHLETE PROFILE:
- Name: ${displayName}
- Handle: ${handle}
- Position: Offensive Lineman
- Class: 2029
- School: Pewaukee HS, Pewaukee, WI
- Height: 6'4" | Weight: 285
- GPA: 3.7

CURRENT PROFILE:
- Bio: "${bio}"
- Location: "${location}"
- Website: "${websiteLink}"
- Pinned Post: "${pinnedPost.slice(0, 200)}..."

TASKS:
1. Rewrite the bio (max 160 chars) to maximize coach engagement. Include position, measurables, school, class year, GPA, and a film link.
2. Suggest the optimal display name format.
3. Write a pinned post (max 280 chars) that serves as a recruiting resume — film link, stats, measurables, academic info, CTA for coaches.
4. Recommend location format.
5. Suggest website URL (Hudl, NCSA, or Linktree).
6. Provide a 7-day content calendar with post topics for each day.
7. Rate the current profile 1-10 and explain how to get to 10.
8. List the top 5 hashtags for recruiting visibility.

Format your response with clear headers for each section.`;
    setGeneratedPrompt(prompt);
  }

  async function updateProfileViaApi() {
    setApiUpdating(true);
    setApiResult(null);
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          displayName,
          location,
          websiteUrl: websiteLink,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setApiResult({ success: true, message: "Profile updated on X successfully!" });
      } else {
        setApiResult({ success: false, message: data.error || "Failed to update profile" });
      }
    } catch {
      setApiResult({ success: false, message: "Network error — check your connection" });
    } finally {
      setApiUpdating(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  // ─── Profile Preview Sub-component ──────────────────────────────────────────
  function ProfilePreview({ compact = false }: { compact?: boolean }) {
    return (
      <div className={cn("rounded-2xl overflow-hidden border border-gray-800 bg-black text-white", compact ? "text-sm" : "")}>
        {/* Header banner */}
        <div className="relative h-32 sm:h-40 bg-gradient-to-br from-gray-900 via-blue-950 to-gray-800">
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <Trophy className="h-20 w-20 text-blue-400" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Avatar + follow button row */}
        <div className="px-4 relative">
          <div className="flex justify-between items-start">
            {/* Avatar */}
            <div className="-mt-12 sm:-mt-16 relative z-10">
              <div className="h-20 w-20 sm:h-28 sm:w-28 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 border-4 border-black flex items-center justify-center">
                <span className="text-white font-bold text-2xl sm:text-4xl">JR</span>
              </div>
            </div>
            <Button
              size="sm"
              className="mt-3 rounded-full bg-white text-black font-bold hover:bg-gray-200 text-xs px-4"
            >
              Follow
            </Button>
          </div>

          {/* Name & handle */}
          <div className="mt-2">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg sm:text-xl">{displayName}</span>
            </div>
            <p className="text-gray-500 text-sm">{handle}</p>
          </div>

          {/* Bio */}
          <p className="mt-2 text-sm sm:text-base whitespace-pre-line leading-snug">
            {bio || "No bio yet..."}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-gray-500 text-xs sm:text-sm">
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {location}
              </span>
            )}
            {websiteLink && (
              <span className="flex items-center gap-1 text-blue-400">
                <LinkIcon className="h-3.5 w-3.5" />
                {websiteLink}
              </span>
            )}
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              Joined September 2024
            </span>
          </div>

          {/* Followers */}
          <div className="flex gap-4 mt-3 text-sm">
            <span>
              <span className="font-bold text-white">247</span>{" "}
              <span className="text-gray-500">Following</span>
            </span>
            <span>
              <span className="font-bold text-white">183</span>{" "}
              <span className="text-gray-500">Followers</span>
            </span>
          </div>
        </div>

        {/* Tab bar mock */}
        <div className="flex border-b border-gray-800 mt-4">
          {["Posts", "Replies", "Highlights", "Media", "Likes"].map((tab, i) => (
            <button
              key={tab}
              className={cn(
                "flex-1 py-3 text-xs sm:text-sm font-medium text-gray-500 hover:bg-gray-900/50 transition-colors relative",
                i === 0 && "text-white"
              )}
            >
              {tab}
              {i === 0 && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Pinned post */}
        {!compact && (
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-2">
              <Pin className="h-3 w-3" />
              Pinned
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">JR</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm">{displayName}</span>
                  <span className="text-gray-500 text-sm">{handle}</span>
                  <span className="text-gray-500 text-sm">· 2h</span>
                </div>
                <p className="text-sm whitespace-pre-line mt-1 leading-snug">
                  {pinnedPost
                    ? pinnedPost.length > 200
                      ? pinnedPost.slice(0, 200) + "..."
                      : pinnedPost
                    : "No pinned post yet..."}
                </p>
                {/* Engagement row */}
                <div className="flex items-center gap-8 mt-3 text-gray-500">
                  <span className="flex items-center gap-1.5 text-xs hover:text-blue-400 cursor-pointer">
                    <MessageCircle className="h-4 w-4" /> 4
                  </span>
                  <span className="flex items-center gap-1.5 text-xs hover:text-green-400 cursor-pointer">
                    <Repeat2 className="h-4 w-4" /> 12
                  </span>
                  <span className="flex items-center gap-1.5 text-xs hover:text-pink-400 cursor-pointer">
                    <Heart className="h-4 w-4" /> 47
                  </span>
                  <span className="flex items-center gap-1.5 text-xs hover:text-blue-400 cursor-pointer">
                    <BarChart3 className="h-4 w-4" /> 1.2K
                  </span>
                  <span className="flex items-center gap-1.5 text-xs hover:text-blue-400 cursor-pointer">
                    <Share className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            X Profile Design Studio
          </h1>
          <p className="text-slate-500 mt-1">
            Build a professional X (Twitter) profile for Jacob Rodgers — OL, Class of 2029, Pewaukee HS
          </p>
        </div>

        <Tabs defaultValue="preview" className="space-y-4">
          <TabsList className="w-full flex overflow-x-auto h-auto gap-1 bg-slate-100 p-1 rounded-lg">
            <TabsTrigger value="preview" className="flex items-center gap-1.5 text-xs sm:text-sm py-2 flex-shrink-0">
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Profile</span> Preview
            </TabsTrigger>
            <TabsTrigger value="bio" className="flex items-center gap-1.5 text-xs sm:text-sm py-2 flex-shrink-0">
              <Pen className="h-3.5 w-3.5" />
              Bio Builder
            </TabsTrigger>
            <TabsTrigger value="visual" className="flex items-center gap-1.5 text-xs sm:text-sm py-2 flex-shrink-0">
              <Palette className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Visual</span> Identity
            </TabsTrigger>
            <TabsTrigger value="pinned" className="flex items-center gap-1.5 text-xs sm:text-sm py-2 flex-shrink-0">
              <Pin className="h-3.5 w-3.5" />
              Pinned Post
            </TabsTrigger>
            <TabsTrigger value="diff" className="flex items-center gap-1.5 text-xs sm:text-sm py-2 flex-shrink-0">
              <GitCompareArrows className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Visual</span> Diff
            </TabsTrigger>
            <TabsTrigger value="prompt" className="flex items-center gap-1.5 text-xs sm:text-sm py-2 flex-shrink-0">
              <Wand2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Claude</span> Prompt
            </TabsTrigger>
            <TabsTrigger value="checklist" className="flex items-center gap-1.5 text-xs sm:text-sm py-2 flex-shrink-0">
              <ListChecks className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Action</span> Checklist
            </TabsTrigger>
          </TabsList>

          {/* ─── Tab 1: Profile Preview ──────────────────────────────────── */}
          <TabsContent value="preview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Edit Profile Info</CardTitle>
                    <CardDescription>Changes update the preview in real time</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                        Display Name
                      </label>
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        maxLength={50}
                        placeholder="Jacob Rodgers"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                        Handle
                      </label>
                      <Input value={handle} disabled className="bg-slate-50 text-slate-500" />
                      <p className="text-xs text-slate-400 mt-1">Handle is locked for brand consistency</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                        Bio
                      </label>
                      <Textarea
                        value={bio}
                        onChange={(e) => {
                          if (e.target.value.length <= 160) setBio(e.target.value);
                        }}
                        rows={4}
                        placeholder="Write your bio..."
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-slate-400">
                          {complianceIssues.length === 0 ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Professional tone
                            </span>
                          ) : (
                            <span className="text-amber-600 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> {complianceIssues.length} issue(s)
                            </span>
                          )}
                        </span>
                        <span
                          className={cn(
                            "text-xs",
                            bioCharCount > 150 ? "text-amber-600" : "text-slate-400",
                            bioCharCount >= 160 && "text-red-600"
                          )}
                        >
                          {bioCharCount}/160
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                        Location
                      </label>
                      <Input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Pewaukee, WI"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                        Website Link
                      </label>
                      <Input
                        value={websiteLink}
                        onChange={(e) => setWebsiteLink(e.target.value)}
                        placeholder="hudl.com/jacobrogers"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="bg-gray-950 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <Eye className="h-5 w-5 text-blue-400" /> Live Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProfilePreview />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ─── Tab 2: Bio Builder ──────────────────────────────────────── */}
          <TabsContent value="bio">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Editor */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Bio Editor</CardTitle>
                    <CardDescription>Craft the perfect 160-character bio for Jacob</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={bio}
                      onChange={(e) => {
                        if (e.target.value.length <= 160) setBio(e.target.value);
                      }}
                      rows={5}
                      placeholder="Write your bio..."
                      className="font-mono text-sm"
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setBio("")}>
                          Clear
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setBio(DEFAULT_BIO)}>
                          Reset Default
                        </Button>
                      </div>
                      <span
                        className={cn(
                          "text-sm font-medium tabular-nums",
                          bioCharCount > 150 ? "text-amber-600" : "text-slate-500",
                          bioCharCount >= 160 && "text-red-600 font-bold"
                        )}
                      >
                        {bioCharCount}/160
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Bio Blocks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick-Add Blocks</CardTitle>
                    <CardDescription>Click to append a line to your bio</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {BIO_BLOCKS.map((block) => {
                        const Icon = block.icon;
                        return (
                          <Button
                            key={block.label}
                            variant="outline"
                            size="sm"
                            className="justify-start h-auto py-2.5 px-3 text-left"
                            onClick={() => addBioBlock(block.text)}
                          >
                            <Icon className="h-4 w-4 mr-2 flex-shrink-0 text-blue-600" />
                            <div className="min-w-0">
                              <div className="font-medium text-xs">{block.label}</div>
                              <div className="text-xs text-slate-400 truncate">{block.text}</div>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Compliance Checker */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      Constitution Compliance
                    </CardTitle>
                    <CardDescription>
                      Ensuring a professional tone — no slang, no trash talk
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {complianceIssues.length === 0 ? (
                      <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg p-3">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          Bio passes all compliance checks. Professional and recruiter-ready.
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {complianceIssues.map((issue, i) => (
                          <div key={i} className="flex items-center gap-2 text-amber-700 bg-amber-50 rounded-lg p-3">
                            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                            <span className="text-sm">{issue}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                {/* Suggested Bios */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Suggested Bios</CardTitle>
                    <CardDescription>One-click templates — copy or use as your bio</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {SUGGESTED_BIOS.map((suggestion, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-slate-200 p-4 space-y-3 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{suggestion.label}</Badge>
                          <span className="text-xs text-slate-400">{suggestion.text.length}/160</span>
                        </div>
                        <p className="text-sm whitespace-pre-line font-mono leading-relaxed text-slate-700">
                          {suggestion.text}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyBio(index)}
                            className="flex items-center gap-1.5"
                          >
                            {copiedBio === index ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-green-600" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" /> Copy
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setBio(suggestion.text)}
                            className="flex items-center gap-1.5"
                          >
                            <ArrowRight className="h-3.5 w-3.5" /> Use This
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Live preview */}
                <Card className="bg-gray-950 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <Eye className="h-5 w-5 text-blue-400" /> Live Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProfilePreview compact />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ─── Tab 3: Visual Identity ──────────────────────────────────── */}
          <TabsContent value="visual">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Photo */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Camera className="h-5 w-5 text-blue-600" />
                    Profile Photo Requirements
                  </CardTitle>
                  <CardDescription>
                    Your profile photo is the first thing coaches see. Make it count.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {PHOTO_CHECKLIST.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => togglePhotoCheck(index)}
                      className="flex items-start gap-3 w-full text-left rounded-lg p-3 hover:bg-slate-50 transition-colors"
                    >
                      <div
                        className={cn(
                          "mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                          photoChecks[index]
                            ? "bg-green-600 border-green-600"
                            : "border-slate-300"
                        )}
                      >
                        {photoChecks[index] && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <div>
                        <p className={cn("text-sm font-medium", photoChecks[index] && "line-through text-slate-400")}>
                          {item.label}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{item.tip}</p>
                      </div>
                    </button>
                  ))}
                  <div className="pt-2 border-t">
                    <p className="text-xs text-slate-500">
                      {photoChecks.filter(Boolean).length}/{PHOTO_CHECKLIST.length} completed
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Header Image */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    <Image className="h-5 w-5 text-blue-600" />
                    Header Image Requirements
                  </CardTitle>
                  <CardDescription>
                    The banner sets the tone for your entire profile. 1500x500px recommended.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {HEADER_CHECKLIST.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => toggleHeaderCheck(index)}
                      className="flex items-start gap-3 w-full text-left rounded-lg p-3 hover:bg-slate-50 transition-colors"
                    >
                      <div
                        className={cn(
                          "mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                          headerChecks[index]
                            ? "bg-green-600 border-green-600"
                            : "border-slate-300"
                        )}
                      >
                        {headerChecks[index] && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <div>
                        <p className={cn("text-sm font-medium", headerChecks[index] && "line-through text-slate-400")}>
                          {item.label}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{item.tip}</p>
                      </div>
                    </button>
                  ))}
                  <div className="pt-2 border-t">
                    <p className="text-xs text-slate-500">
                      {headerChecks.filter(Boolean).length}/{HEADER_CHECKLIST.length} completed
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Color Palette */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Palette className="h-5 w-5 text-blue-600" />
                    Color Palette
                  </CardTitle>
                  <CardDescription>
                    Pewaukee HS school colors with complementary accents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { name: "Navy Blue", hex: "#002855", role: "Primary" },
                      { name: "Gold", hex: "#FFBF00", role: "Secondary" },
                      { name: "White", hex: "#FFFFFF", role: "Accent" },
                      { name: "Steel Gray", hex: "#4A5568", role: "Neutral" },
                    ].map((color) => (
                      <div key={color.name} className="text-center space-y-2">
                        <div
                          className="h-16 rounded-lg border border-slate-200 shadow-sm"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div>
                          <p className="text-xs font-semibold">{color.name}</p>
                          <p className="text-xs text-slate-400">{color.hex}</p>
                          <Badge variant="secondary" className="mt-1 text-[10px]">
                            {color.role}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600">
                      Use these colors consistently across profile photo borders, highlight reel
                      thumbnails, and graphic overlays to build a recognizable brand.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Visual Style Guide */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Type className="h-5 w-5 text-blue-600" />
                    Content Visual Style Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      {
                        title: "Font Overlays for Highlight Reels",
                        desc: "Use bold sans-serif fonts (e.g., Montserrat, Bebas Neue) in Navy Blue or White. Keep text minimal — name, number, and one stat.",
                      },
                      {
                        title: "Consistent Filter Usage",
                        desc: "Apply a subtle contrast boost to all game photos. Avoid trendy filters. Black & white can work for dramatic moments only.",
                      },
                      {
                        title: "Thumbnail Consistency",
                        desc: "All video thumbnails should follow the same template: action shot + name text + school logo. Use the color palette above.",
                      },
                      {
                        title: "Post Graphics Template",
                        desc: "Stats graphics should use Navy Blue background, Gold accents, White text. Include the Pewaukee logo and Jacob's number.",
                      },
                    ].map((item, i) => (
                      <div key={i} className="rounded-lg border p-3 space-y-1">
                        <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                        <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Brand Score */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    Brand Consistency Score
                  </CardTitle>
                  <CardDescription>
                    How well your current assets match the visual guidelines
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative h-32 w-32 flex-shrink-0">
                      <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                        <circle
                          cx="60"
                          cy="60"
                          r="52"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="10"
                        />
                        <circle
                          cx="60"
                          cy="60"
                          r="52"
                          fill="none"
                          stroke={brandScore >= 70 ? "#16a34a" : brandScore >= 40 ? "#d97706" : "#dc2626"}
                          strokeWidth="10"
                          strokeDasharray={`${(brandScore / 100) * 327} 327`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold">{brandScore}</span>
                        <span className="text-xs text-slate-400">/ 100</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2 w-full">
                      {[
                        {
                          label: "Profile Photo",
                          value: photoChecks.filter(Boolean).length,
                          max: PHOTO_CHECKLIST.length,
                          weight: 40,
                        },
                        {
                          label: "Header Image",
                          value: headerChecks.filter(Boolean).length,
                          max: HEADER_CHECKLIST.length,
                          weight: 30,
                        },
                        {
                          label: "Bio Quality",
                          value: bioCharCount > 20 && bioCharCount <= 160 ? 1 : 0,
                          max: 1,
                          weight: 15,
                        },
                        {
                          label: "Professional Tone",
                          value: complianceIssues.length === 0 ? 1 : 0,
                          max: 1,
                          weight: 15,
                        },
                      ].map((metric) => (
                        <div key={metric.label} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">{metric.label}</span>
                            <span className="text-slate-400 text-xs">
                              {metric.value}/{metric.max} ({metric.weight}% weight)
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                metric.value === metric.max
                                  ? "bg-green-500"
                                  : metric.value > 0
                                  ? "bg-amber-500"
                                  : "bg-slate-200"
                              )}
                              style={{ width: `${(metric.value / metric.max) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── Tab 4: Pinned Post Strategy ─────────────────────────────── */}
          <TabsContent value="pinned">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* What makes a great pinned post */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Pin className="h-5 w-5 text-blue-600" />
                      What Makes a Great Pinned Post
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      {
                        title: "Film link front and center",
                        desc: "Coaches want to see you play. Your Hudl or highlight link should be the first thing they see.",
                      },
                      {
                        title: "Key stats and measurables",
                        desc: "Height, weight, 40 time, bench, squat — hard numbers coaches can evaluate quickly.",
                      },
                      {
                        title: "Clear call to action",
                        desc: "\"DMs are open\" or \"Email me at...\" — make it easy for coaches to reach out.",
                      },
                      {
                        title: "Academic info",
                        desc: "GPA and test scores signal you are a serious student-athlete. Coaches recruit the whole person.",
                      },
                      {
                        title: "Professional and clean",
                        desc: "No slang, no trash talk. This is your recruiting resume pinned to the top of your profile.",
                      },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="mt-1 h-5 w-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold">{i + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Seasonal Calendar */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      Seasonal Rotation Calendar
                    </CardTitle>
                    <CardDescription>When to update your pinned post throughout the year</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {SEASONAL_CALENDAR.map((season, i) => (
                      <div
                        key={i}
                        className={cn(
                          "rounded-lg border p-3 transition-colors",
                          season.active
                            ? "border-blue-300 bg-blue-50"
                            : "border-slate-200"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={season.active ? "default" : "secondary"} className="text-xs">
                            {season.period}
                          </Badge>
                          <span className="text-sm font-semibold text-slate-800">{season.label}</span>
                          {season.active && (
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{season.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                {/* Draft Builder */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Pen className="h-5 w-5 text-blue-600" />
                      Pinned Post Draft Builder
                    </CardTitle>
                    <CardDescription>Compose your pinned post — 280 character max</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={pinnedPost}
                      onChange={(e) => {
                        if (e.target.value.length <= 280) setPinnedPost(e.target.value);
                      }}
                      rows={10}
                      className="font-mono text-sm"
                      placeholder="Write your pinned post..."
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPinnedPost("")}>
                          Clear
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPinnedPost(PINNED_POST_TEMPLATE)}
                        >
                          Reset Template
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCopyPinned}
                          className="flex items-center gap-1.5"
                        >
                          {copiedPinned ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-green-600" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" /> Copy
                            </>
                          )}
                        </Button>
                      </div>
                      <span
                        className={cn(
                          "text-sm font-medium tabular-nums",
                          pinnedCharCount > 260 ? "text-amber-600" : "text-slate-500",
                          pinnedCharCount >= 280 && "text-red-600 font-bold"
                        )}
                      >
                        {pinnedCharCount}/280
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Pinned post preview */}
                <Card className="bg-gray-950 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <Eye className="h-5 w-5 text-blue-400" /> Pinned Post Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl border border-gray-800 bg-black text-white p-4">
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-3">
                        <Pin className="h-3 w-3" />
                        Pinned
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">JR</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm">{displayName}</span>
                            <span className="text-gray-500 text-sm">{handle}</span>
                          </div>
                          <p className="text-sm whitespace-pre-line mt-2 leading-snug">
                            {pinnedPost || "No pinned post yet..."}
                          </p>
                          <div className="flex items-center gap-8 mt-3 text-gray-500">
                            <span className="flex items-center gap-1.5 text-xs">
                              <MessageCircle className="h-4 w-4" /> 4
                            </span>
                            <span className="flex items-center gap-1.5 text-xs">
                              <Repeat2 className="h-4 w-4" /> 12
                            </span>
                            <span className="flex items-center gap-1.5 text-xs">
                              <Heart className="h-4 w-4" /> 47
                            </span>
                            <span className="flex items-center gap-1.5 text-xs">
                              <BarChart3 className="h-4 w-4" /> 1.2K
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ─── Tab 5: Visual Diff ────────────────────────────────────── */}
          <TabsContent value="diff">
            {/* Readiness Score Summary */}
            {(() => {
              const textFields = [
                { match: displayName.trim() === "Jacob Rodgers", label: "Display Name" },
                { match: bio.trim() === DEFAULT_BIO.trim(), label: "Bio" },
                { match: location.trim() === "Pewaukee, WI", label: "Location" },
                { match: websiteLink.trim() === "hudl.com/jacobrogers", label: "Website" },
                { match: pinnedPost.trim().length > 0, label: "Pinned Post" },
              ];
              const photoReady = photoChecks.filter(Boolean).length === PHOTO_CHECKLIST.length;
              const headerReady = headerChecks.filter(Boolean).length === HEADER_CHECKLIST.length;
              const readyCount = textFields.filter((f) => f.match).length + (photoReady ? 1 : 0) + (headerReady ? 1 : 0);
              const totalFields = 7;
              const pct = Math.round((readyCount / totalFields) * 100);
              const nextAction = !textFields[0].match ? "Set display name to 'Jacob Rodgers'"
                : !textFields[1].match ? "Optimize your bio with position, measurables, and film link"
                : !textFields[2].match ? "Set location to 'Pewaukee, WI'"
                : !textFields[3].match ? "Add your Hudl film link as website"
                : !photoReady ? "Complete the profile photo checklist in Visual Identity tab"
                : !headerReady ? "Complete the header image checklist in Visual Identity tab"
                : !textFields[4].match ? "Pin your recruiting resume post"
                : null;
              return (
                <Card className="mb-4">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-6">
                      <div className="relative h-20 w-20 flex-shrink-0">
                        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                          <circle cx="60" cy="60" r="52" fill="none"
                            stroke={pct === 100 ? "#16a34a" : pct >= 60 ? "#d97706" : "#dc2626"}
                            strokeWidth="10" strokeDasharray={`${(pct / 100) * 327} 327`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xl font-bold">{pct}%</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-800">
                          Profile Readiness: {readyCount}/{totalFields} fields complete
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          {pct === 100
                            ? "Your profile is fully optimized for coach visibility. Keep posting consistently!"
                            : `${totalFields - readyCount} field${totalFields - readyCount > 1 ? "s" : ""} still need attention to maximize coach engagement.`}
                        </p>
                        {nextAction && (
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">Next Step</Badge>
                            <span className="text-slate-600">{nextAction}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GitCompareArrows className="h-5 w-5 text-blue-600" />
                  Profile Diff — Current vs Recommended
                </CardTitle>
                <CardDescription>
                  Side-by-side comparison of your current profile fields against recommended values
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-3 font-semibold text-slate-600 w-1/5">Field</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-600 w-2/5">Current</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-600 w-2/5">Recommended</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-600 w-auto">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        {
                          field: "Display Name",
                          current: displayName,
                          recommended: "Jacob Rodgers",
                        },
                        {
                          field: "Bio",
                          current: bio,
                          recommended: DEFAULT_BIO,
                        },
                        {
                          field: "Location",
                          current: location,
                          recommended: "Pewaukee, WI",
                        },
                        {
                          field: "Website",
                          current: websiteLink,
                          recommended: "hudl.com/jacobrogers",
                        },
                      ].map((row) => {
                        const matches = row.current.trim() === row.recommended.trim();
                        const missing = !row.current.trim();
                        return (
                          <tr key={row.field} className="hover:bg-slate-50">
                            <td className="py-3 px-3 font-medium text-slate-700">{row.field}</td>
                            <td className="py-3 px-3 text-slate-600 max-w-[200px]">
                              <span className="whitespace-pre-line break-words text-xs font-mono">
                                {row.current || <span className="text-slate-300 italic">Empty</span>}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-600 max-w-[200px]">
                              <span className="whitespace-pre-line break-words text-xs font-mono">
                                {row.recommended}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              {missing ? (
                                <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Missing</Badge>
                              ) : matches ? (
                                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Matches</Badge>
                              ) : (
                                <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">Needs Update</Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-medium text-slate-700">Profile Photo</td>
                        <td className="py-3 px-3 text-slate-600">
                          <span className="text-xs">{photoChecks.filter(Boolean).length}/{PHOTO_CHECKLIST.length} checks passed</span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          <span className="text-xs">All {PHOTO_CHECKLIST.length} checks passed</span>
                        </td>
                        <td className="py-3 px-3">
                          {photoChecks.every(Boolean) ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Matches</Badge>
                          ) : photoChecks.some(Boolean) ? (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">Needs Update</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Missing</Badge>
                          )}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-medium text-slate-700">Header Image</td>
                        <td className="py-3 px-3 text-slate-600">
                          <span className="text-xs">{headerChecks.filter(Boolean).length}/{HEADER_CHECKLIST.length} checks passed</span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          <span className="text-xs">All {HEADER_CHECKLIST.length} checks passed</span>
                        </td>
                        <td className="py-3 px-3">
                          {headerChecks.every(Boolean) ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Matches</Badge>
                          ) : headerChecks.some(Boolean) ? (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">Needs Update</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Missing</Badge>
                          )}
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-medium text-slate-700">Pinned Post</td>
                        <td className="py-3 px-3 text-slate-600">
                          <span className="text-xs font-mono break-words max-w-[200px] block">
                            {pinnedPost ? pinnedPost.slice(0, 80) + (pinnedPost.length > 80 ? "..." : "") : <span className="text-slate-300 italic">Empty</span>}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          <span className="text-xs">Recruiting resume pinned post set</span>
                        </td>
                        <td className="py-3 px-3">
                          {pinnedPost.trim() ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Matches</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Missing</Badge>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Tab 6: Claude Prompt Generator ────────────────────────── */}
          <TabsContent value="prompt">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-purple-600" />
                  Claude Prompt Generator
                </CardTitle>
                <CardDescription>
                  Generate a comprehensive prompt for Claude to optimize Jacob&apos;s X profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={generateClaudePrompt} className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  Generate Prompt
                </Button>

                {generatedPrompt && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">Generated Prompt</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          copyToClipboard(generatedPrompt);
                          setCopiedPrompt(true);
                          setTimeout(() => setCopiedPrompt(false), 2000);
                        }}
                        className="flex items-center gap-1.5"
                      >
                        {copiedPrompt ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-green-600" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" /> Copy Prompt
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="bg-gray-900 text-green-400 font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto rounded-lg p-4">
                      {generatedPrompt}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Tab 7: Action Checklist ───────────────────────────────── */}
          <TabsContent value="checklist">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-blue-600" />
                  X Profile Update Checklist
                </CardTitle>
                <CardDescription>
                  Step-by-step checklist to manually update Jacob&apos;s X profile. Progress is saved locally.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">Progress</span>
                    <span className="text-slate-500">
                      {actionChecks.filter(Boolean).length} / 8 completed
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        actionChecks.filter(Boolean).length === 8
                          ? "bg-green-500"
                          : actionChecks.filter(Boolean).length > 0
                          ? "bg-blue-500"
                          : "bg-slate-200"
                      )}
                      style={{ width: `${(actionChecks.filter(Boolean).length / 8) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Checklist items */}
                <div className="space-y-3">
                  {[
                    {
                      title: "Update display name",
                      description: `Change display name to "${displayName}"`,
                      copyText: displayName,
                    },
                    {
                      title: "Update bio",
                      description: "Copy and paste the optimized bio into your X profile",
                      copyText: bio,
                    },
                    {
                      title: "Update location",
                      description: `Set location to "${location}"`,
                      copyText: location,
                    },
                    {
                      title: "Update website URL",
                      description: `Set website to "${websiteLink}"`,
                      copyText: websiteLink,
                    },
                    {
                      title: "Upload new profile photo",
                      description: "Upload a professional headshot in school gear (400x400px minimum)",
                      copyText: null,
                    },
                    {
                      title: "Upload new header image",
                      description: "Upload an action shot header image (1500x500px recommended)",
                      copyText: null,
                    },
                    {
                      title: "Pin the recruiting post",
                      description: "Pin your recruiting resume post to the top of your profile",
                      copyText: pinnedPost,
                    },
                    {
                      title: "Follow 10 target coaches",
                      description: "Follow at least 10 college coaches from your target schools — see Coach Pipeline for handles",
                      copyText: null,
                    },
                  ].map((step, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-3 rounded-lg border p-4 transition-colors",
                        actionChecks[index]
                          ? "border-green-200 bg-green-50"
                          : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <button
                        onClick={() => toggleActionCheck(index)}
                        className="mt-0.5 flex-shrink-0"
                      >
                        <div
                          className={cn(
                            "h-5 w-5 rounded border-2 flex items-center justify-center transition-colors",
                            actionChecks[index]
                              ? "bg-green-600 border-green-600"
                              : "border-slate-300"
                          )}
                        >
                          {actionChecks[index] && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </button>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-sm font-medium",
                            actionChecks[index] && "line-through text-slate-400"
                          )}
                        >
                          {index + 1}. {step.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {step.copyText && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(step.copyText!)}
                            className="h-8 px-2 text-xs"
                          >
                            <Copy className="h-3 w-3 mr-1" /> Copy
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open("https://x.com/settings/profile", "_blank")}
                          className="h-8 px-2 text-xs"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" /> Open X
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* API Update section */}
                <div className="border-t pt-4 space-y-3">
                  <Button
                    onClick={updateProfileViaApi}
                    disabled={apiUpdating}
                    className="flex items-center gap-2"
                  >
                    {apiUpdating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Updating...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4" /> Update via API
                      </>
                    )}
                  </Button>
                  {apiResult && (
                    <div
                      className={cn(
                        "rounded-lg p-3 text-sm flex items-center gap-2",
                        apiResult.success
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      )}
                    >
                      {apiResult.success ? (
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                      )}
                      {apiResult.message}
                    </div>
                  )}
                  <p className="text-xs text-slate-400">
                    Updates bio, display name, location, and website via X API. Photo, header, and pinned post must be updated manually.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

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
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_BIO =
  "Offensive Lineman | 6'4\" 285 | Class of 2028\nPewaukee HS, Wisconsin\n3.7 GPA | All-Conference\nFilm: hudl.com/jacobrogers";

const BIO_BLOCKS = [
  { label: "Position / Size", text: "Offensive Lineman | 6'4\" 285", icon: Ruler },
  { label: "School / Class", text: "Pewaukee HS '28 | Wisconsin", icon: GraduationCap },
  { label: "GPA", text: "3.7 GPA | Honor Roll", icon: Star },
  { label: "Film Link", text: "Film: hudl.com/jacobrogers", icon: Film },
  { label: "NCSA Link", text: "ncsasports.org/jacobrogers", icon: LinkIcon },
  { label: "Motto", text: "Built Different. Outwork Everyone.", icon: Sparkles },
];

const SUGGESTED_BIOS = [
  {
    label: "Clean & Professional",
    text: "OL | 6'4\" 285 | Pewaukee HS '28\n3.7 GPA | All-Conference\nFilm: hudl.com/jacobrogers\nDream big. Work harder.",
  },
  {
    label: "Stats-Forward",
    text: "Class of 2028 Offensive Lineman\n6'4\" 285 | 5.1 40yd | 315 Bench\nPewaukee HS, Pewaukee WI\n3.7 GPA | hudl.com/jacobrogers",
  },
  {
    label: "Personality + Recruiting",
    text: "Future D1 Offensive Lineman\nPewaukee HS '28 | 6'4\" 285\nFaith. Family. Football.\nCoaches: DMs open | Film below",
  },
];

const SLANG_WORDS = [
  "goat",
  "bussin",
  "no cap",
  "fr fr",
  "lowkey",
  "highkey",
  "fire",
  "lit",
  "sus",
  "slay",
  "bet",
  "bruh",
  "fam",
  "yolo",
  "vibes",
  "trash",
  "clap",
  "ratio",
  "mid",
  "L ",
  "W ",
  "ong",
  "deadass",
  "ngl",
];

const PINNED_POST_TEMPLATE = `Class of 2028 | Offensive Lineman
📍 Pewaukee HS, Pewaukee WI
📏 6'4" 285 | 5.1 40yd | 315 Bench
📚 3.7 GPA | Honor Roll

🎬 Junior Season Highlights:
hudl.com/jacobrogers

📋 NCSA Profile:
ncsasports.org/jacobrogers

Coaches — DMs are open. Looking forward to earning an opportunity at the next level.

#Recruiting #ClassOf2028 #OffensiveLine`;

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
  const [displayName, setDisplayName] = useState("Jacob Rogers");
  const [handle] = useState("@JacobRogersOL28");
  const [location, setLocation] = useState("Pewaukee, WI");
  const [websiteLink, setWebsiteLink] = useState("hudl.com/jacobrogers");
  const [pinnedPost, setPinnedPost] = useState(PINNED_POST_TEMPLATE);
  const [copiedBio, setCopiedBio] = useState<number | null>(null);
  const [copiedPinned, setCopiedPinned] = useState(false);
  const [photoChecks, setPhotoChecks] = useState<boolean[]>(new Array(PHOTO_CHECKLIST.length).fill(false));
  const [headerChecks, setHeaderChecks] = useState<boolean[]>(new Array(HEADER_CHECKLIST.length).fill(false));

  // ─── Bio compliance check ───────────────────────────────────────────────────
  const complianceIssues = useMemo(() => {
    const issues: string[] = [];
    const lower = bio.toLowerCase();
    SLANG_WORDS.forEach((word) => {
      if (lower.includes(word.toLowerCase().trim())) {
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
            Build a professional X (Twitter) profile for Jacob Rogers — OL, Class of 2028, Pewaukee HS
          </p>
        </div>

        <Tabs defaultValue="preview" className="space-y-4">
          <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 h-auto gap-1 bg-slate-100 p-1 rounded-lg">
            <TabsTrigger value="preview" className="flex items-center gap-1.5 text-xs sm:text-sm py-2">
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Profile</span> Preview
            </TabsTrigger>
            <TabsTrigger value="bio" className="flex items-center gap-1.5 text-xs sm:text-sm py-2">
              <Pen className="h-3.5 w-3.5" />
              Bio Builder
            </TabsTrigger>
            <TabsTrigger value="visual" className="flex items-center gap-1.5 text-xs sm:text-sm py-2">
              <Palette className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Visual</span> Identity
            </TabsTrigger>
            <TabsTrigger value="pinned" className="flex items-center gap-1.5 text-xs sm:text-sm py-2">
              <Pin className="h-3.5 w-3.5" />
              Pinned Post
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
                        placeholder="Jacob Rogers"
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
        </Tabs>
      </div>
    </div>
  );
}

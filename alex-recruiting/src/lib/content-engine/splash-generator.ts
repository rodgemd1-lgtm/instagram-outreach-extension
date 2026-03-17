/**
 * Splash Generator — SVG-to-PNG image engine for Jacob Rodgers recruiting content
 *
 * All graphics are generated entirely server-side using inline SVG strings
 * rendered to PNG via `sharp`. No external image-generation APIs are required.
 *
 * Three exports:
 *   generateHighlightSplash  — 1920×1080 widescreen splash for highlight reels
 *   generatePostGraphic      — 1080×1080 square post graphic for X/Twitter
 *   generateStatCard         — 1080×1080 stats comparison card
 */

import sharp from "sharp";
import { jacobProfile } from "@/lib/data/jacob-profile";

// ---------------------------------------------------------------------------
// Shared design tokens
// ---------------------------------------------------------------------------

const COLORS = {
  bg: "#0A0A0A",
  bgCard: "#111111",
  bgAccent: "#1A1A1A",
  amber: "#F59E0B",
  amberLight: "#FCD34D",
  orange: "#EA580C",
  orangeLight: "#FB923C",
  white: "#FFFFFF",
  gray400: "#9CA3AF",
  gray600: "#4B5563",
  gray700: "#374151",
  gray800: "#1F2937",
  green: "#10B981",
};

// ---------------------------------------------------------------------------
// Public option types
// ---------------------------------------------------------------------------

export interface HighlightSplashOptions {
  /** Override player name (defaults to jacobProfile.name) */
  playerName?: string;
  /** Override jersey number (defaults to jacobProfile.jerseyNumber) */
  jerseyNumber?: number;
  /** Override position label (defaults to jacobProfile.position) */
  position?: string;
  /** Override school name (defaults to jacobProfile.school) */
  school?: string;
  /** Override class year (defaults to jacobProfile.classYear) */
  classYear?: number;
  /** Optional subtitle shown below the gradient divider */
  subtitle?: string;
  /** Optional stats overlay section */
  stats?: {
    pancakes?: number;
    sacks?: number;
    bench?: string;
    squat?: string;
    record?: string;
  };
}

export interface PostGraphicOptions {
  /** Main quote or stat text — up to ~120 characters looks best */
  text: string;
  /** Smaller supporting line shown below the main text */
  subtext?: string;
  /** Override the bottom branding tag */
  brandTag?: string;
  /** Override the background style: "dark" | "gradient" | "photo-overlay" */
  style?: "dark" | "gradient";
}

export interface StatCardStats {
  pancakeBlocks?: number;
  sacks?: number;
  fumbleRecoveries?: number;
  benchPress?: string;
  squat?: string;
  height?: string;
  weight?: string;
  gpa?: string;
  teamRecord?: string;
  classYear?: number;
}

// ---------------------------------------------------------------------------
// SVG helpers
// ---------------------------------------------------------------------------

/** Escape characters that break SVG attribute strings */
function escSVG(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Wrap a long string at word boundaries for SVG tspan elements */
function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if ((current + " " + word).trim().length > maxChars) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = current ? current + " " + word : word;
    }
  }
  if (current) lines.push(current.trim());
  return lines;
}

// ---------------------------------------------------------------------------
// 1. generateHighlightSplash — 1920×1080
// ---------------------------------------------------------------------------

export async function generateHighlightSplash(
  options: HighlightSplashOptions = {}
): Promise<Buffer> {
  const playerName = options.playerName ?? jacobProfile.name;
  const jerseyNumber = options.jerseyNumber ?? jacobProfile.jerseyNumber;
  const position = options.position ?? jacobProfile.position;
  const school = options.school ?? jacobProfile.school;
  const classYear = options.classYear ?? jacobProfile.classYear;
  const subtitle = options.subtitle ?? jacobProfile.bio;
  const stats = options.stats;

  // Stats block — only rendered when stats are provided
  const statsBlockSVG = stats
    ? buildHighlightStatsBlock(stats)
    : "";

  const nameFontSize = playerName.length > 18 ? 100 : 128;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
    <!-- Primary radial glow behind text -->
    <radialGradient id="bgGlow" cx="35%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#1C1000" stop-opacity="1"/>
      <stop offset="100%" stop-color="${COLORS.bg}" stop-opacity="1"/>
    </radialGradient>

    <!-- Amber-to-orange gradient for accent lines and highlights -->
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${COLORS.amber}"/>
      <stop offset="60%" stop-color="${COLORS.orange}"/>
      <stop offset="100%" stop-color="${COLORS.orangeLight}" stop-opacity="0"/>
    </linearGradient>

    <!-- Vertical fade on the right side for stats overlay -->
    <linearGradient id="rightFade" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${COLORS.bg}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${COLORS.bg}" stop-opacity="0.92"/>
    </linearGradient>

    <!-- Corner vignette -->
    <radialGradient id="vignette" cx="50%" cy="50%" r="75%">
      <stop offset="50%" stop-color="transparent"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.7"/>
    </radialGradient>

    <!-- Text glow filter -->
    <filter id="textGlow" x="-5%" y="-5%" width="110%" height="110%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Subtle drop shadow for large text -->
    <filter id="heavyShadow" x="-2%" y="-2%" width="110%" height="115%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1920" height="1080" fill="url(#bgGlow)"/>

  <!-- Subtle grid texture -->
  <defs>
    <pattern id="grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="${COLORS.gray800}" stroke-width="0.5" opacity="0.4"/>
    </pattern>
  </defs>
  <rect width="1920" height="1080" fill="url(#grid)"/>

  <!-- Vignette overlay -->
  <rect width="1920" height="1080" fill="url(#vignette)"/>

  <!-- Right-side gradient (space for stats panel) -->
  ${stats ? `<rect x="1100" y="0" width="820" height="1080" fill="url(#rightFade)"/>` : ""}

  <!-- Left accent bar (vertical) -->
  <rect x="80" y="120" width="5" height="840" fill="url(#accentGrad)" rx="2"/>

  <!-- Jersey number watermark (large, behind text) -->
  <text x="180" y="820"
        font-family="Arial Black, Arial, sans-serif"
        font-size="640" font-weight="900"
        fill="${COLORS.amber}" opacity="0.05"
        text-anchor="start" dominant-baseline="auto">
    ${jerseyNumber}
  </text>

  <!-- POSITION label -->
  <text x="120" y="240"
        font-family="Arial, sans-serif"
        font-size="22" font-weight="700" letter-spacing="8"
        fill="${COLORS.amber}" text-anchor="start">
    ${escSVG(position.toUpperCase())}
  </text>

  <!-- PLAYER NAME -->
  <text x="120" y="${240 + nameFontSize + 20}"
        font-family="Arial Black, Arial, sans-serif"
        font-size="${nameFontSize}" font-weight="900" letter-spacing="-2"
        fill="${COLORS.white}" text-anchor="start"
        filter="url(#heavyShadow)">
    ${escSVG(playerName.toUpperCase())}
  </text>

  <!-- Jersey number inline -->
  <text x="120" y="${240 + nameFontSize + 20 + 72}"
        font-family="Arial Black, Arial, sans-serif"
        font-size="68" font-weight="900"
        fill="${COLORS.amber}" text-anchor="start"
        filter="url(#textGlow)">
    #${jerseyNumber}
  </text>

  <!-- Gradient accent line -->
  <rect x="120" y="${240 + nameFontSize + 20 + 72 + 30}" width="560" height="4"
        fill="url(#accentGrad)" rx="2"/>

  <!-- SCHOOL NAME -->
  <text x="120" y="${240 + nameFontSize + 20 + 72 + 30 + 60}"
        font-family="Arial, sans-serif"
        font-size="32" font-weight="700" letter-spacing="2"
        fill="${COLORS.gray400}" text-anchor="start">
    ${escSVG(school.toUpperCase())}
  </text>

  <!-- CLASS YEAR -->
  <text x="120" y="${240 + nameFontSize + 20 + 72 + 30 + 60 + 48}"
        font-family="Arial, sans-serif"
        font-size="28" font-weight="400" letter-spacing="4"
        fill="${COLORS.gray400}" text-anchor="start">
    CLASS OF ${classYear}
  </text>

  <!-- Subtitle / bio line -->
  <text x="120" y="${240 + nameFontSize + 20 + 72 + 30 + 60 + 48 + 72}"
        font-family="Arial, sans-serif"
        font-size="20" font-weight="400" letter-spacing="1"
        fill="${COLORS.gray600}" text-anchor="start">
    ${escSVG(subtitle)}
  </text>

  <!-- Stats block (conditional) -->
  ${statsBlockSVG}

  <!-- Bottom bar -->
  <rect x="0" y="1040" width="1920" height="4" fill="url(#accentGrad)"/>
</svg>`;

  const pngBuffer = await sharp(Buffer.from(svg), { density: 96 })
    .png({ compressionLevel: 6 })
    .toBuffer();

  return pngBuffer;
}

/** Build the stats block SVG fragment for the highlight splash (right panel) */
function buildHighlightStatsBlock(stats: NonNullable<HighlightSplashOptions["stats"]>): string {
  const panelX = 1260;
  const panelY = 200;
  const panelW = 520;
  const statItems: Array<{ label: string; value: string }> = [];

  if (stats.pancakes !== undefined)
    statItems.push({ label: "PANCAKE BLOCKS", value: String(stats.pancakes) });
  if (stats.sacks !== undefined)
    statItems.push({ label: "SACKS", value: String(stats.sacks) });
  if (stats.bench)
    statItems.push({ label: "BENCH PRESS", value: stats.bench + " lbs" });
  if (stats.squat)
    statItems.push({ label: "SQUAT", value: stats.squat + " lbs" });
  if (stats.record)
    statItems.push({ label: "SEASON RECORD", value: stats.record });

  const rowH = 120;
  const rows = statItems
    .map((item, i) => {
      const y = panelY + 60 + i * rowH;
      return `
      <!-- Stat row ${i} -->
      <line x1="${panelX}" y1="${y + rowH - 8}" x2="${panelX + panelW}" y2="${y + rowH - 8}"
            stroke="${COLORS.gray800}" stroke-width="1"/>
      <text x="${panelX}" y="${y + 20}"
            font-family="Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="4"
            fill="${COLORS.amber}" text-anchor="start">${escSVG(item.label)}</text>
      <text x="${panelX}" y="${y + 80}"
            font-family="Arial Black, Arial, sans-serif" font-size="64" font-weight="900"
            fill="${COLORS.white}" text-anchor="start">${escSVG(item.value)}</text>`;
    })
    .join("\n");

  return `
  <!-- Stats header -->
  <text x="${panelX}" y="${panelY}"
        font-family="Arial, sans-serif" font-size="14" font-weight="700" letter-spacing="6"
        fill="${COLORS.amber}" text-anchor="start">STATS</text>
  <rect x="${panelX}" y="${panelY + 14}" width="60" height="2" fill="${COLORS.amber}" rx="1"/>
  ${rows}`;
}

// ---------------------------------------------------------------------------
// 2. generatePostGraphic — 1080×1080
// ---------------------------------------------------------------------------

export async function generatePostGraphic(
  options: PostGraphicOptions
): Promise<Buffer> {
  const { text, subtext, style = "dark" } = options;
  const brandTag =
    options.brandTag ??
    `${jacobProfile.xHandle} | #${jacobProfile.jerseyNumber} | Class of ${jacobProfile.classYear}`;

  // Wrap the main text at ~28 chars per line for big display
  const mainLines = wrapText(text, 28);
  const lineHeight = 90;
  const totalTextH = mainLines.length * lineHeight;
  const textStartY = Math.max(200, (1080 - totalTextH) / 2 - 60);

  const bgFill =
    style === "gradient"
      ? `<defs><radialGradient id="sqBg" cx="30%" cy="30%" r="80%">
           <stop offset="0%" stop-color="#1C0F00"/>
           <stop offset="100%" stop-color="${COLORS.bg}"/>
         </radialGradient></defs>
         <rect width="1080" height="1080" fill="url(#sqBg)"/>`
      : `<rect width="1080" height="1080" fill="${COLORS.bg}"/>`;

  const tspans = mainLines
    .map(
      (line, i) =>
        `<tspan x="80" dy="${i === 0 ? 0 : lineHeight}">${escSVG(line)}</tspan>`
    )
    .join("\n        ");

  const subtextSVG = subtext
    ? `<text x="80" y="${textStartY + totalTextH + 48}"
           font-family="Arial, sans-serif" font-size="28" font-weight="400" letter-spacing="1"
           fill="${COLORS.gray400}" text-anchor="start">
        ${escSVG(subtext)}
      </text>`
    : "";

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs>
    <linearGradient id="accentH" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${COLORS.amber}"/>
      <stop offset="70%" stop-color="${COLORS.orange}"/>
      <stop offset="100%" stop-color="${COLORS.orangeLight}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="accentV" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${COLORS.amber}"/>
      <stop offset="100%" stop-color="${COLORS.orange}" stop-opacity="0"/>
    </linearGradient>
    <filter id="glow" x="-5%" y="-5%" width="115%" height="115%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <radialGradient id="corner" cx="0%" cy="0%" r="50%">
      <stop offset="0%" stop-color="${COLORS.amber}" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  ${bgFill}

  <!-- Corner accent glow (top-left) -->
  <rect width="1080" height="1080" fill="url(#corner)"/>

  <!-- Grid pattern -->
  <defs>
    <pattern id="sqGrid" x="0" y="0" width="54" height="54" patternUnits="userSpaceOnUse">
      <path d="M 54 0 L 0 0 0 54" fill="none" stroke="${COLORS.gray800}" stroke-width="0.4" opacity="0.35"/>
    </pattern>
  </defs>
  <rect width="1080" height="1080" fill="url(#sqGrid)"/>

  <!-- Left vertical accent bar -->
  <rect x="40" y="80" width="4" height="920" fill="url(#accentV)" rx="2"/>

  <!-- Top horizontal accent bar -->
  <rect x="40" y="80" width="1000" height="4" fill="url(#accentH)" rx="2"/>

  <!-- Large jersey number watermark -->
  <text x="580" y="900"
        font-family="Arial Black, Arial, sans-serif"
        font-size="700" font-weight="900"
        fill="${COLORS.amber}" opacity="0.04"
        text-anchor="middle" dominant-baseline="auto">
    ${jacobProfile.jerseyNumber}
  </text>

  <!-- Main quote / stat text -->
  <text x="80" y="${textStartY}"
        font-family="Arial Black, Arial, sans-serif"
        font-size="80" font-weight="900" letter-spacing="-1"
        fill="${COLORS.white}" text-anchor="start"
        filter="url(#glow)">
    ${tspans}
  </text>

  ${subtextSVG}

  <!-- Divider line above brand -->
  <rect x="80" y="950" width="920" height="2" fill="url(#accentH)" rx="1"/>

  <!-- Brand tag -->
  <text x="80" y="990"
        font-family="Arial, sans-serif" font-size="20" font-weight="700" letter-spacing="3"
        fill="${COLORS.amber}" text-anchor="start">
    ${escSVG(brandTag.toUpperCase())}
  </text>

  <!-- Position + size -->
  <text x="1000" y="990"
        font-family="Arial, sans-serif" font-size="18" font-weight="400" letter-spacing="2"
        fill="${COLORS.gray400}" text-anchor="end">
    ${escSVG(jacobProfile.height)} ${escSVG(jacobProfile.weight)}
  </text>

  <!-- Bottom border -->
  <rect x="0" y="1072" width="1080" height="8" fill="url(#accentH)" rx="0"/>
</svg>`;

  const pngBuffer = await sharp(Buffer.from(svg), { density: 96 })
    .png({ compressionLevel: 6 })
    .toBuffer();

  return pngBuffer;
}

// ---------------------------------------------------------------------------
// 3. generateStatCard — 1080×1080 stats comparison card
// ---------------------------------------------------------------------------

export async function generateStatCard(stats: StatCardStats): Promise<Buffer> {
  const height = stats.height ?? jacobProfile.height;
  const weight = stats.weight ?? jacobProfile.weight;
  const bench = stats.benchPress ?? jacobProfile.bench;
  const squat = stats.squat ?? jacobProfile.squat;
  const pancakes = stats.pancakeBlocks ?? jacobProfile.seasonStats.pancakeBlocks;
  const sacks = stats.sacks ?? jacobProfile.seasonStats.sacks;
  const frs = stats.fumbleRecoveries ?? jacobProfile.seasonStats.fumbleRecoveries;
  const record = stats.teamRecord ?? jacobProfile.seasonStats.teamRecord;
  const gpa = stats.gpa ?? jacobProfile.gpa;
  const classYear = stats.classYear ?? jacobProfile.classYear;

  // Build a 2-column grid of stat cells
  type StatCell = { label: string; value: string; highlight?: boolean };
  const cells: StatCell[] = [
    { label: "HEIGHT", value: height, highlight: true },
    { label: "WEIGHT", value: weight, highlight: true },
    { label: "BENCH PRESS", value: `${bench} lbs`, highlight: true },
    { label: "SQUAT", value: `${squat} lbs`, highlight: true },
    { label: "PANCAKE BLOCKS", value: String(pancakes) },
    { label: "SACKS", value: String(sacks) },
    { label: "FUMBLE RECOVERIES", value: String(frs) },
    { label: "SEASON RECORD", value: record },
    { label: "GPA", value: gpa },
    { label: "CLASS", value: String(classYear) },
  ];

  const cols = 2;
  const cellW = 440;
  const cellH = 140;
  const colGap = 20;
  const rowGap = 16;
  const startX = 80;
  const startY = 260;

  const cellsSVG = cells
    .map((cell, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = startX + col * (cellW + colGap);
      const cy = startY + row * (cellH + rowGap);

      return `
    <!-- Cell ${i}: ${cell.label} -->
    <rect x="${cx}" y="${cy}" width="${cellW}" height="${cellH}"
          fill="${cell.highlight ? "#1A0F00" : COLORS.bgCard}" rx="8"
          stroke="${cell.highlight ? COLORS.amber : COLORS.gray700}" stroke-width="${cell.highlight ? 1.5 : 0.5}"
          stroke-opacity="${cell.highlight ? 0.7 : 0.4}"/>
    <text x="${cx + 20}" y="${cy + 36}"
          font-family="Arial, sans-serif" font-size="11" font-weight="700" letter-spacing="4"
          fill="${cell.highlight ? COLORS.amber : COLORS.gray400}">
      ${escSVG(cell.label)}
    </text>
    <text x="${cx + 20}" y="${cy + 108}"
          font-family="Arial Black, Arial, sans-serif" font-size="52" font-weight="900"
          fill="${cell.highlight ? COLORS.white : COLORS.gray400}">
      ${escSVG(cell.value)}
    </text>`;
    })
    .join("\n");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs>
    <linearGradient id="hGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${COLORS.amber}"/>
      <stop offset="60%" stop-color="${COLORS.orange}"/>
      <stop offset="100%" stop-color="${COLORS.orangeLight}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="cardBg" cx="20%" cy="20%" r="70%">
      <stop offset="0%" stop-color="#140C00"/>
      <stop offset="100%" stop-color="${COLORS.bg}"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="1080" height="1080" fill="url(#cardBg)"/>

  <!-- Grid texture -->
  <defs>
    <pattern id="stGrid" x="0" y="0" width="54" height="54" patternUnits="userSpaceOnUse">
      <path d="M 54 0 L 0 0 0 54" fill="none" stroke="${COLORS.gray800}" stroke-width="0.4" opacity="0.3"/>
    </pattern>
  </defs>
  <rect width="1080" height="1080" fill="url(#stGrid)"/>

  <!-- Header section -->
  <rect x="0" y="0" width="1080" height="220" fill="#0D0800"/>

  <!-- Header top accent -->
  <rect x="0" y="0" width="1080" height="5" fill="url(#hGrad)"/>

  <!-- Player name in header -->
  <text x="80" y="100"
        font-family="Arial Black, Arial, sans-serif"
        font-size="72" font-weight="900" letter-spacing="-1"
        fill="${COLORS.white}" text-anchor="start">
    ${escSVG(jacobProfile.name.toUpperCase())}
  </text>

  <!-- Subtitle row -->
  <text x="80" y="148"
        font-family="Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="5"
        fill="${COLORS.amber}" text-anchor="start">
    #${jacobProfile.jerseyNumber} — ${escSVG(jacobProfile.position)} — ${escSVG(jacobProfile.school)}
  </text>

  <!-- Sub-subtitle -->
  <text x="80" y="185"
        font-family="Arial, sans-serif" font-size="16" font-weight="400" letter-spacing="3"
        fill="${COLORS.gray400}" text-anchor="start">
    CLASS OF ${classYear} | WIAA STATE CHAMPIONS
  </text>

  <!-- Header bottom accent -->
  <rect x="0" y="215" width="1080" height="3" fill="url(#hGrad)"/>

  <!-- Stat cells grid -->
  ${cellsSVG}

  <!-- Bottom brand bar -->
  <rect x="0" y="1050" width="1080" height="5" fill="url(#hGrad)"/>
  <rect x="0" y="1020" width="1080" height="30" fill="#0D0800"/>
  <text x="80" y="1042"
        font-family="Arial, sans-serif" font-size="14" font-weight="700" letter-spacing="4"
        fill="${COLORS.amber}" text-anchor="start">
    ${escSVG(jacobProfile.xHandle.toUpperCase())} | NCSA VERIFIED ATHLETE
  </text>
</svg>`;

  const pngBuffer = await sharp(Buffer.from(svg), { density: 96 })
    .png({ compressionLevel: 6 })
    .toBuffer();

  return pngBuffer;
}

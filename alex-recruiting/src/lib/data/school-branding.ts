/**
 * School Branding Data Layer
 *
 * Provides brand colors and logo paths for all 17 target schools.
 * Consumed by coach cards, school headers, and detail panels.
 */

export interface SchoolBrand {
  primary: string;
  secondary: string;
  name: string;
}

export const schoolColors: Record<string, SchoolBrand> = {
  wisconsin: { primary: "#C5050C", secondary: "#FFFFFF", name: "Wisconsin" },
  northwestern: {
    primary: "#4E2A84",
    secondary: "#FFFFFF",
    name: "Northwestern",
  },
  iowa: { primary: "#FFCD00", secondary: "#000000", name: "Iowa" },
  "iowa-state": {
    primary: "#C8102E",
    secondary: "#F1BE48",
    name: "Iowa State",
  },
  "northern-illinois": {
    primary: "#BA0C2F",
    secondary: "#000000",
    name: "Northern Illinois",
  },
  "western-michigan": {
    primary: "#6C4023",
    secondary: "#B5A167",
    name: "Western Michigan",
  },
  "ball-state": {
    primary: "#BA0C2F",
    secondary: "#FFFFFF",
    name: "Ball State",
  },
  "central-michigan": {
    primary: "#6A0032",
    secondary: "#FFC82E",
    name: "Central Michigan",
  },
  "south-dakota-state": {
    primary: "#0033A0",
    secondary: "#FFD100",
    name: "South Dakota State",
  },
  "north-dakota-state": {
    primary: "#006A31",
    secondary: "#FFC82E",
    name: "North Dakota State",
  },
  "illinois-state": {
    primary: "#CE1126",
    secondary: "#FFFFFF",
    name: "Illinois State",
  },
  "youngstown-state": {
    primary: "#EE3224",
    secondary: "#FFFFFF",
    name: "Youngstown State",
  },
  "saginaw-valley": {
    primary: "#003366",
    secondary: "#CC0000",
    name: "Saginaw Valley",
  },
  "michigan-tech": {
    primary: "#000000",
    secondary: "#FFCD00",
    name: "Michigan Tech",
  },
  "ferris-state": {
    primary: "#BA0C2F",
    secondary: "#FFD200",
    name: "Ferris State",
  },
  "winona-state": {
    primary: "#4B2E84",
    secondary: "#FFFFFF",
    name: "Winona State",
  },
  "minnesota-state-mankato": {
    primary: "#4F2D7F",
    secondary: "#F7E24B",
    name: "Minnesota State Mankato",
  },
};

const defaultColors: SchoolBrand = {
  primary: "#6B7280",
  secondary: "#E5E7EB",
  name: "Unknown",
};

/** Set of school IDs that have logo SVGs in public/logos/ */
const SCHOOLS_WITH_LOGOS = new Set([
  "ball-state", "central-michigan", "ferris-state", "illinois-state",
  "iowa-state", "iowa", "michigan-tech", "minnesota-state-mankato",
  "north-dakota-state", "northern-illinois", "northwestern",
  "saginaw-valley", "south-dakota-state", "western-michigan",
  "winona-state", "wisconsin", "youngstown-state",
]);

/**
 * Returns the path to a school's logo SVG, or null if no logo exists.
 */
export function getSchoolLogo(id: string): string | null {
  if (SCHOOLS_WITH_LOGOS.has(id)) return `/logos/${id}.svg`;
  return null;
}

/**
 * Returns the brand colors for a school, or default gray if not found.
 */
export function getSchoolColors(id: string): SchoolBrand {
  return schoolColors[id] ?? defaultColors;
}

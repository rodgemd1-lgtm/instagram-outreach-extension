"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** All section IDs present on the recruit page, in scroll order. */
export const RECRUIT_SECTIONS = [
  "hero",
  "film-reel",
  "social-proof",
  "origin",
  "athlete",
  "character",
  "academics",
  "fit",
  "contact",
] as const;

export type RecruitSection = (typeof RECRUIT_SECTIONS)[number];

// ---------------------------------------------------------------------------
// Pure utility functions (tested independently of React)
// ---------------------------------------------------------------------------

/**
 * Generate a visitor ID string prefixed with "v-".
 * Uses crypto.randomUUID when available, falls back to Math.random.
 */
export function generateVisitorId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `v-${crypto.randomUUID()}`;
  }
  // Fallback for environments without crypto.randomUUID
  const segment = () =>
    Math.floor(Math.random() * 0x10000)
      .toString(16)
      .padStart(4, "0");
  return `v-${segment()}${segment()}-${segment()}-${segment()}-${segment()}-${segment()}${segment()}${segment()}`;
}

/**
 * Extract UTM parameters from a URL string.
 * Returns an object with `utmSource`, `utmMedium`, and `utmCampaign`.
 * Missing parameters default to empty strings.
 */
export function extractUtmParams(url: string): {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
} {
  try {
    const parsed = new URL(url);
    return {
      utmSource: parsed.searchParams.get("utm_source") ?? "",
      utmMedium: parsed.searchParams.get("utm_medium") ?? "",
      utmCampaign: parsed.searchParams.get("utm_campaign") ?? "",
    };
  } catch {
    return { utmSource: "", utmMedium: "", utmCampaign: "" };
  }
}

// ---------------------------------------------------------------------------
// React hook
// ---------------------------------------------------------------------------

interface UseAnalyticsReturn {
  /** Server-assigned visit ID (set after the initial POST resolves). */
  visitId: string | null;
  /** Locally-persisted visitor ID. */
  visitorId: string;
  /** Track time spent and interaction in a page section. */
  trackSection: (sectionId: string, dwellTime: number, interacted: boolean) => void;
  /** Track a film/video view event. */
  trackFilmView: (filmId: string, watchDuration: number, completed: boolean) => void;
}

const VISITOR_ID_KEY = "recruit-visitor-id";

/**
 * Client-side analytics hook for the recruit page.
 *
 * On mount it:
 *  1. Retrieves (or generates + persists) a visitor ID from localStorage.
 *  2. Extracts UTM params from the current URL.
 *  3. POSTs to `/api/analytics/visit` to register the page visit.
 *
 * It also exposes `trackSection` and `trackFilmView` helpers that POST to
 * the corresponding API routes.
 */
export function useAnalytics(): UseAnalyticsReturn {
  const [visitId, setVisitId] = useState<string | null>(null);
  const [visitorId, setVisitorId] = useState<string>("");
  const registeredRef = useRef(false);

  // ------ Mount: register the visit ------
  useEffect(() => {
    if (registeredRef.current) return;
    registeredRef.current = true;

    // 1. Visitor ID
    let vid = "";
    try {
      vid = localStorage.getItem(VISITOR_ID_KEY) ?? "";
    } catch {
      // localStorage may be unavailable (e.g. incognito on some browsers)
    }
    if (!vid) {
      vid = generateVisitorId();
      try {
        localStorage.setItem(VISITOR_ID_KEY, vid);
      } catch {
        // swallow
      }
    }
    setVisitorId(vid);

    // 2. UTM params
    const utmParams = extractUtmParams(window.location.href);

    // 3. Register the visit
    fetch("/api/analytics/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorId: vid,
        page: "/recruit",
        referrer: document.referrer || null,
        utmSource: utmParams.utmSource || null,
        utmMedium: utmParams.utmMedium || null,
        utmCampaign: utmParams.utmCampaign || null,
        userAgent: navigator.userAgent || null,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.visitId) setVisitId(data.visitId);
      })
      .catch(() => {
        // Non-critical; analytics failure should never break the page
      });
  }, []);

  // ------ Section tracking ------
  const trackSection = useCallback(
    (sectionId: string, dwellTime: number, interacted: boolean) => {
      if (!visitId) return;
      fetch("/api/analytics/section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitId, sectionId, dwellTime, interacted }),
      }).catch(() => {
        // swallow
      });
    },
    [visitId],
  );

  // ------ Film view tracking ------
  const trackFilmView = useCallback(
    (filmId: string, watchDuration: number, completed: boolean) => {
      if (!visitId) return;
      fetch("/api/analytics/film", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitId, filmId, watchDuration, completed }),
      }).catch(() => {
        // swallow
      });
    },
    [visitId],
  );

  return { visitId, visitorId, trackSection, trackFilmView };
}

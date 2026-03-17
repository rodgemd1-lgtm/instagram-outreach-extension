import type { WeeklyCalendarEntry } from "../types";

export const weeklyCalendar: WeeklyCalendarEntry[] = [
  {
    day: "Monday",
    contentType: "'Back to work' training post — weekend film review or Monday workout",
    pillar: "work_ethic",
    bestTime: "6:30-8:00 AM CST",
    notes: "Coaches check X Monday morning; start the week with a work ethic signal",
  },
  {
    day: "Tuesday",
    contentType: "Film clip or game highlight — 15-45 second native video",
    pillar: "performance",
    bestTime: "3:30-5:00 PM CST",
    notes: "Post after school; coaches review film in late afternoon; native video preferred",
  },
  {
    day: "Wednesday",
    contentType: "Character post — team moment, academic mention, or community",
    pillar: "character",
    bestTime: "12:00-1:00 PM CST",
    notes: "Midweek character signal; keeps Jacob in coaches' timelines without film burnout",
  },
  {
    day: "Thursday",
    contentType: "Camp/showcase preview OR training clip OR recruiting update",
    pillar: "performance",
    bestTime: "4:00-6:00 PM CST",
    notes: "Pre-weekend momentum build; if a camp is upcoming, announce it Thursday",
  },
  {
    day: "Friday",
    contentType: "Game day post (in season) OR weekend training preview (off-season)",
    pillar: "performance",
    bestTime: "2:00-3:30 PM CST",
    notes: "Game day hype in season; weekly prep content in off-season; highest engagement window",
  },
  {
    day: "Saturday",
    contentType: "Game result post OR camp recap post (optional)",
    pillar: "performance",
    bestTime: "Immediately post-event",
    notes: "Post within 2 hours of game end or camp conclusion; recency matters",
  },
  {
    day: "Sunday",
    contentType: "Film review/reflection OR next week preview (optional)",
    pillar: "work_ethic",
    bestTime: "7:00-9:00 PM CST",
    notes: "Coaches plan their week Sunday night; a thoughtful post Sunday evening can land well",
  },
];

export function getTodayEntry(): WeeklyCalendarEntry {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = days[new Date().getDay()];
  return weeklyCalendar.find((e) => e.day === today) || weeklyCalendar[0];
}

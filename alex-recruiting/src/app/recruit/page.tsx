"use client";

import { useRef } from "react";
import { RecruitHero } from "@/components/recruit/hero";
import { FilmReel } from "@/components/recruit/film-reel";
import { OriginStory } from "@/components/recruit/origin-story";
import { CharacterSection } from "@/components/recruit/character";
import { FilmStats } from "@/components/recruit/film-stats";
import { AcademicsSection } from "@/components/recruit/academics";
import { TheFit } from "@/components/recruit/the-fit";
import { ContactCTA } from "@/components/recruit/contact";
import { ScrollProgress } from "@/components/recruit/scroll-progress";
import { RecruitNav } from "@/components/recruit/nav";
import { MobileNav } from "@/components/recruit/mobile-nav";
import { useRecruitPhotos } from "@/hooks/useRecruitPhotos";

export default function RecruitPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const { photoMap } = useRecruitPhotos();

  return (
    <div ref={pageRef}>
      <RecruitNav />
      <MobileNav />
      <ScrollProgress />

      {/* Beat 1: Hero — "Do I keep scrolling?" (LAAL: Known-ness) */}
      <RecruitHero backgroundUrl={photoMap.hero} />

      {/* Beat 2: Film Reel — "Can he play?" (LAAL: Known-ness) */}
      <FilmReel backgroundUrl={photoMap["film-reel"]} />

      {/* Beat 3: Origin — "What's his work ethic?" (LAAL: Temporal Window) */}
      <OriginStory />

      {/* Beat 4: Character — "Will he fit our locker room?" (LAAL: Ownership) */}
      <CharacterSection />

      {/* Beat 5: Film & Stats — "What are his numbers?" (LAAL: Known-ness) */}
      <FilmStats />

      {/* Beat 6: Academics — "Will he qualify?" (LAAL: Continuity Thread) */}
      <AcademicsSection />

      {/* Beat 7: The Fit — "Why should we recruit him?" (LAAL: Ownership) */}
      <TheFit />

      {/* Beat 8: Contact — "How do I reach out?" (LAAL: Forgiving Stakes) */}
      <ContactCTA />
    </div>
  );
}

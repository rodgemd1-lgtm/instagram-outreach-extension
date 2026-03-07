"use client";

import { useRef } from "react";
import { RecruitHero } from "@/components/recruit/hero";
import { FilmReel } from "@/components/recruit/film-reel";
import { OriginStory } from "@/components/recruit/origin-story";
import { CharacterSection } from "@/components/recruit/character";
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

      {/* 1. Hero — "Is this kid in my window?" (LAAL: Known-ness) */}
      <RecruitHero backgroundUrl={photoMap.hero} />

      {/* 2. Film + Stats — "Can he play? What are his numbers?" (LAAL: Known-ness) */}
      <FilmReel backgroundUrl={photoMap["film-reel"]} />

      {/* 3. The Work — "What's his work ethic?" (LAAL: Temporal Window) */}
      <OriginStory />

      {/* 4. Character — "Will he fit our locker room?" (LAAL: Ownership) */}
      <CharacterSection />

      {/* 5. Academics — "Will he qualify?" (LAAL: Continuity Thread) */}
      <AcademicsSection />

      {/* 6. The Fit — "Why should we recruit him?" (LAAL: Ownership + Loss Aversion) */}
      <TheFit />

      {/* 7. Contact — "How do I reach out?" (LAAL: Forgiving Stakes) */}
      <ContactCTA />
    </div>
  );
}

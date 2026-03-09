"use client";

import { useRef } from "react";
import { RecruitHero } from "@/components/recruit/hero";
import { FilmReel } from "@/components/recruit/film-reel";
import { OriginStory } from "@/components/recruit/origin-story";
import { MultiSportSection } from "@/components/recruit/multi-sport";
import { CharacterSection } from "@/components/recruit/character";
import { AcademicsSection } from "@/components/recruit/academics";
import { TheFit } from "@/components/recruit/the-fit";
import { ContactCTA } from "@/components/recruit/contact";
import { SocialProofBanner } from "@/components/recruit/social-proof";
import { ScrollProgress } from "@/components/recruit/scroll-progress";
import { FilmGrainOverlay } from "@/components/recruit/film-grain";
import { RecruitNav } from "@/components/recruit/nav";
import { MobileNav } from "@/components/recruit/mobile-nav";
import { MusicToggle } from "@/components/recruit/music-toggle";
import { useRecruitPhotos } from "@/hooks/useRecruitPhotos";

export default function RecruitPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const { photoMap } = useRecruitPhotos();

  return (
    <div ref={pageRef}>
      <RecruitNav />
      <MobileNav />
      <ScrollProgress />
      <FilmGrainOverlay />
      <MusicToggle src="/recruit/audio/ambient.mp3" />

      {/* 1. Hero — "Is this kid in my window?" (LAAL: Known-ness) */}
      <RecruitHero backgroundUrl={photoMap.hero} />

      {/* 2. Film + Stats — "Can he play? What are his numbers?" (LAAL: Known-ness) */}
      <FilmReel backgroundUrl={photoMap["film-reel"]} />

      {/* 2.5 Social Proof — credibility signal between film and origin */}
      <SocialProofBanner />

      {/* 3. The Work — "What's his work ethic?" (LAAL: Temporal Window) */}
      <OriginStory backgroundUrl={photoMap.origin} />

      {/* 4. Multi-sport transfer — "What else supports the projection?" */}
      <MultiSportSection />

      {/* 5. Character — "Will he fit our locker room?" (LAAL: Ownership) */}
      <CharacterSection backgroundUrl={photoMap.character} />

      {/* 6. Academics — "Will he qualify?" (LAAL: Continuity Thread) */}
      <AcademicsSection />

      {/* 7. The Fit — "Why should we recruit him?" (LAAL: Ownership + Loss Aversion) */}
      <TheFit backgroundUrl={photoMap.fit} />

      {/* 8. Contact — "How do I reach out?" (LAAL: Forgiving Stakes) */}
      <ContactCTA />
    </div>
  );
}

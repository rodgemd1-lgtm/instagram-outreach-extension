"use client";

import { RecruitHero } from "@/components/recruit/hero";
import { OriginStory } from "@/components/recruit/origin-story";
import { CharacterSection } from "@/components/recruit/character";
import { FilmStats } from "@/components/recruit/film-stats";
import { AcademicsSection } from "@/components/recruit/academics";
import { TheFit } from "@/components/recruit/the-fit";
import { ContactCTA } from "@/components/recruit/contact";
import { ScrollProgress } from "@/components/recruit/scroll-progress";
import { RecruitNav } from "@/components/recruit/nav";

export default function RecruitPage() {
  return (
    <>
      <RecruitNav />
      <ScrollProgress />

      {/* Beat 1: Hero - Cinematic entrance */}
      <RecruitHero />

      {/* Beat 2: Origin - Training since 12 (GSAP horizontal scroll) */}
      <OriginStory />

      {/* Beat 3: Character - Why coaches want him */}
      <CharacterSection />

      {/* Beat 4: Film & Stats - The proof */}
      <FilmStats />

      {/* Beat 5: Academics - The whole package */}
      <AcademicsSection />

      {/* Beat 6: The Fit - Why your program */}
      <TheFit />

      {/* Beat 7: Contact CTA - Close the deal */}
      <ContactCTA />
    </>
  );
}

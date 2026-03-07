"use client";

import { useRef } from "react";
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
  const pageRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={pageRef}>
      <RecruitNav />
      <ScrollProgress />

      {/* Beat 1: Hero - Cinematic entrance (LAAL: Known-ness) */}
      <RecruitHero />

      {/* Beat 2: Origin - Training since 12 (LAAL: Temporal Window) */}
      <OriginStory />

      {/* Beat 3: Character - Why coaches want him (LAAL: Ownership) */}
      <CharacterSection />

      {/* Beat 4: Film & Stats - The proof (LAAL: Known-ness) */}
      <FilmStats />

      {/* Beat 5: Academics - The whole package (LAAL: Continuity Thread) */}
      <AcademicsSection />

      {/* Beat 6: The Fit - Why your program (LAAL: Ownership) */}
      <TheFit />

      {/* Beat 7: Contact CTA - Close the deal (LAAL: Forgiving Stakes) */}
      <ContactCTA />
    </div>
  );
}

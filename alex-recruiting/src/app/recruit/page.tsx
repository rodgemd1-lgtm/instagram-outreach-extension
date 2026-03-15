"use client";

import { useRef } from "react";
import { RecruitHero } from "@/components/recruit/hero";
import { FilmReel } from "@/components/recruit/film-reel";
import { CoachMonologue } from "@/components/recruit/coach-monologue";
import { OriginStory } from "@/components/recruit/origin-story";
import { CharacterSection } from "@/components/recruit/character";
import { JacobVoice } from "@/components/recruit/jacob-voice";
import { AcademicsSection } from "@/components/recruit/academics";
import { TheFit } from "@/components/recruit/the-fit";
import { ContactCTA } from "@/components/recruit/contact";
import { Wingspan } from "@/components/recruit/wingspan";
import { FilmGrainOverlay } from "@/components/recruit/film-grain";
import { RecruitNav } from "@/components/recruit/nav";
import { useRecruitPhotos } from "@/hooks/useRecruitPhotos";
import { useAnalytics } from "@/components/recruit/hooks/use-analytics";

export default function RecruitPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const { photoMap } = useRecruitPhotos();
  useAnalytics();

  return (
    <div ref={pageRef} className="bg-black pb-16 md:pb-0">
      <RecruitNav />
      <FilmGrainOverlay />

      {/* Beat 1: Introduction (Jacob — right 2/3) */}
      <RecruitHero backgroundUrl={photoMap.hero} />

      {/* Beat 2: Film + Stats (Jacob — right 2/3) */}
      <FilmReel backgroundUrl={photoMap["film-reel"]} />

      {/* Beat 2.5: Wingspan — physical measurable (Jacob — full width) */}
      <Wingspan photoUrl={photoMap.wingspan ?? ""} />

      {/* Beat 3: Coach evaluates (Coach — left 2/3) */}
      <CoachMonologue
        id="coach-eval-1"
        lines={[
          "He's got D1 size at 15. 445 deadlift as a freshman.",
          "But is he self-made, or just big?",
        ]}
      />

      {/* Beat 4: The Work (Jacob — right 2/3) */}
      <OriginStory backgroundUrl={photoMap.origin} />

      {/* Beat 5: Coach reflects (Coach — left 2/3) */}
      <CoachMonologue
        id="coach-eval-2"
        lines={[
          "Years of documented work. Real facility. Real trainer.",
          "The kid is serious. But will he fit our locker room?",
        ]}
      />

      {/* Beat 6: Jacob answers the coach's question (Jacob — right 2/3) */}
      <JacobVoice />

      {/* Beat 7: Character — external validation (Jacob — right 2/3) */}
      <CharacterSection backgroundUrl={photoMap.character} />

      {/* Beat 8: Coach closes the arc (Coach — left 2/3) */}
      <CoachMonologue
        id="coach-eval-3"
        lines={[
          "Four years of work before anyone was watching. 445 deadlift as a freshman. Two games in one day and produced in both.",
          "Self-made. Coachable. Get him on campus.",
        ]}
      />

      {/* Beat 9: Academics (Neutral — centered bar) */}
      <AcademicsSection />

      {/* Beat 10: The Fit (Coach — left 2/3) */}
      <TheFit backgroundUrl={photoMap.fit} />

      {/* Beat 11: Contact (Both — converge to center) */}
      <ContactCTA />
    </div>
  );
}

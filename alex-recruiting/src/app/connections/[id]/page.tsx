"use client";

import { use } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  StitchButton,
  GlassCard,
  StitchBadge,
  ActivityRadar,
  SentimentBars,
} from "@/components/stitch";

export default function FollowerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  return (
    <div className="space-y-6">
      <StitchButton variant="ghost" size="sm" onClick={() => router.push("/connections")}>
        <ArrowLeft className="mr-1 h-4 w-4" />
        Connections
      </StitchButton>

      {/* Profile Header */}
      <div className="flex items-start gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 rotate-3">
          <span className="text-2xl font-black text-white/40">
            {id.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">@{id}</h1>
          <p className="mt-1 text-sm text-white/40">Follower Profile</p>
          <div className="mt-2 flex gap-2">
            <StitchBadge variant="default">Follower</StitchBadge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Sentiment Radar */}
        <GlassCard className="p-5">
          <h3 className="stitch-label mb-4">Interaction Radar</h3>
          <div className="mx-auto max-w-[240px]">
            <ActivityRadar
              data={{
                posting: 40,
                engagement: 60,
                recruiting: 20,
                responsiveness: 50,
                visibility: 30,
              }}
            />
          </div>
        </GlassCard>

        {/* Interaction Feed */}
        <GlassCard className="p-5">
          <h3 className="stitch-label mb-4">Interaction History</h3>
          <p className="text-sm text-white/30">
            No interaction data available yet for @{id}.
          </p>
          <p className="mt-2 text-xs text-white/20">
            Follow, like, or engage with this account to build interaction data.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}

"use client";

import { CoachCRM } from "@/components/coach-crm";
import { SchoolCard } from "@/components/school-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSchoolsByTier } from "@/lib/data/target-schools";

export default function CoachesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Coach CRM</h1>
        <p className="text-sm text-slate-500">Track 17 target schools, coach engagement, follow-backs, and DM campaigns</p>
      </div>

      <Tabs defaultValue="crm">
        <TabsList>
          <TabsTrigger value="crm">Coach Database</TabsTrigger>
          <TabsTrigger value="schools">Target Schools</TabsTrigger>
        </TabsList>

        <TabsContent value="crm">
          <CoachCRM />
        </TabsContent>

        <TabsContent value="schools">
          <div className="space-y-6">
            {(["Tier 1", "Tier 2", "Tier 3"] as const).map((tier) => (
              <div key={tier}>
                <h2 className="text-lg font-semibold mb-3">
                  {tier} — {tier === "Tier 1" ? "Reach Programs" : tier === "Tier 2" ? "Target Programs" : "Safety Programs"}
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  {getSchoolsByTier(tier).map((school) => (
                    <SchoolCard key={school.id} school={school} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { CoachCRM } from "@/components/coach-crm";
import { CoachPipeline } from "@/components/coach-pipeline";
import { SchoolCard } from "@/components/school-card";
import { StudioPageHeader } from "@/components/studio-page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSchoolsByTier } from "@/lib/data/target-schools";

export default function CoachesPage() {
  return (
    <div className="space-y-6">
      <StudioPageHeader
        icon="Users"
        kicker="Dashboard Studio + Susan"
        title="Run the coach pipeline with clear stages, not scattered names and loose notes."
        description="This is the relationship map for target programs. Prioritize the right schools, enrich the right coaches, and keep the next action obvious."
        council={["Susan", "Dashboard", "Marcus"]}
      >
        <p className="font-semibold">Recruiting ops rule:</p>
        <p className="mt-2 leading-6 text-[var(--app-muted)]">
          Pipeline quality beats raw volume. A smaller list with real signals, X handles, and next actions is worth more than a bloated list of dead rows.
        </p>
      </StudioPageHeader>

      <Tabs defaultValue="crm">
        <TabsList>
          <TabsTrigger value="crm">CRM Table</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="schools">Target Schools</TabsTrigger>
        </TabsList>

        <TabsContent value="crm">
          <CoachCRM />
        </TabsContent>

        <TabsContent value="pipeline">
          <CoachPipeline />
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

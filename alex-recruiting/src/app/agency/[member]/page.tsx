import { notFound } from "next/navigation";
import { TeamChat } from "@/components/team-chat";
import { TEAM_MEMBERS } from "@/lib/rec/types";

export default async function TeamMemberPage({
  params,
}: {
  params: Promise<{ member: string }>;
}) {
  const { member } = await params;

  // Validate member ID
  const validMember = TEAM_MEMBERS.find((m) => m.id === member);
  if (!validMember) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:ml-64 md:p-8 pb-24 md:pb-8">
      <TeamChat memberId={member} />
    </main>
  );
}

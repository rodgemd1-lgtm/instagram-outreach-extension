import { notFound } from "next/navigation";
import { SCPageHeader, SCBadge } from "@/components/sc";
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
    <div className="space-y-6">
      <SCPageHeader
        kicker="Agency Specialist"
        title={validMember.name.toUpperCase()}
        subtitle={validMember.specialty}
      />
      <TeamChat memberId={member} />
    </div>
  );
}

"use client";

import { ProfileAudit } from "@/components/profile-audit";

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile Audit</h1>
        <p className="text-sm text-slate-500">10-point monthly evaluation — photo, bio, pinned post, cadence, engagement, coach follows, DMs, compliance</p>
      </div>
      <ProfileAudit />
    </div>
  );
}

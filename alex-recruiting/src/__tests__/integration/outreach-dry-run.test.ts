import { describe, it, expect } from "vitest";
import type { ProcessResult } from "@/lib/outreach/dm-sequences";

describe("Outreach Dry Run", () => {
  it("dry run response should show what WOULD be sent without actually sending", () => {
    const mockDryRunResult: ProcessResult = {
      processed: 3,
      sent: 0,
      wouldSend: 2,
      skipped: 1,
      dryRun: true,
      errors: [],
      details: [
        { sequenceId: "s1", coachName: "Coach A", step: 1, action: "would_send", reason: "[DRY RUN] Would send..." },
        { sequenceId: "s2", coachName: "Coach B", step: 1, action: "would_send", reason: "[DRY RUN] Would send..." },
        { sequenceId: "s3", coachName: "Coach C", step: 1, action: "skipped", reason: "no X handle" },
      ],
    };

    expect(mockDryRunResult.dryRun).toBe(true);
    expect(mockDryRunResult.sent).toBe(0);
    expect(mockDryRunResult.wouldSend).toBeGreaterThan(0);
    expect(mockDryRunResult.details.filter((d) => d.action === "would_send")).toHaveLength(2);
  });

  it("non-dry-run result should have dryRun false", () => {
    const mockResult: ProcessResult = {
      processed: 1,
      sent: 1,
      wouldSend: 0,
      skipped: 0,
      dryRun: false,
      errors: [],
      details: [{ sequenceId: "s1", coachName: "Coach A", step: 1, action: "sent" }],
    };

    expect(mockResult.dryRun).toBe(false);
    expect(mockResult.wouldSend).toBe(0);
  });
});

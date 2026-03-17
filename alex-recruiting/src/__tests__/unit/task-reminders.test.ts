import { describe, expect, it } from "vitest";
import { buildTaskReminderMessage } from "@/lib/reminders/task-reminders";

describe("task reminder formatting", () => {
  it("builds a concise daily reminder message", () => {
    const message = buildTaskReminderMessage({
      tasks: [
        { title: "Review Wednesday film post", status: "pending", priority: 5 },
        { title: "Personalize Auburn DM sequence", status: "in_progress", priority: 4 },
      ],
      posts: [
        {
          content: "New OL/DL film from spring ball. Still stacking reps.",
          scheduledAt: "2026-03-09T00:30:00.000Z",
          pillar: "performance",
        },
      ],
      camps: [
        {
          name: "Big Man Camp",
          school: "Wisconsin",
          date: "2026-03-14T15:00:00.000Z",
          registrationStatus: "registered",
        },
      ],
      appUrl: "https://alexrecruiting.example",
    });

    expect(message).toContain("Jake Recruiting OS");
    expect(message).toContain("Review Wednesday film post");
    expect(message).toContain("New OL/DL film from spring ball");
    expect(message).toContain("Big Man Camp");
    expect(message).toContain("https://alexrecruiting.example/calendar");
    expect(message.length).toBeLessThanOrEqual(1200);
  });
});

import { describe, expect, it } from "vitest";

import { canCoachContact } from "@/lib/rec/knowledge/ncaa-calendar";
import { ncaaRules } from "@/lib/rec/knowledge/ncaa-rules";
import { xPlaybook } from "@/lib/rec/knowledge/x-playbook";

describe("football recruiting rules", () => {
  it("opens D1 football coach communication on June 15 after sophomore year", () => {
    const beforeWindow = canCoachContact("D1 FBS", new Date("2027-06-14T12:00:00Z"));
    const afterWindow = canCoachContact("D1 FBS", new Date("2027-06-16T12:00:00Z"));

    expect(beforeWindow.canCoachInitiate).toBe(false);
    expect(beforeWindow.canCoachCallText).toBe(false);
    expect(beforeWindow.nextMilestoneDate).toBe("2027-06-15");

    expect(afterWindow.canCoachInitiate).toBe(true);
    expect(afterWindow.canCoachCallText).toBe(true);
    expect(afterWindow.canCoachSendMaterials).toBe(true);
    expect(afterWindow.canOfficialVisit).toBe(false);
    expect(afterWindow.nextMilestoneDate).toBe("2028-04-01");
  });

  it("opens football official visits on April 1 of junior year", () => {
    const beforeVisits = canCoachContact("D1 FBS", new Date("2028-03-31T12:00:00Z"));
    const afterVisits = canCoachContact("D1 FBS", new Date("2028-04-02T12:00:00Z"));

    expect(beforeVisits.canOfficialVisit).toBe(false);
    expect(afterVisits.canOfficialVisit).toBe(true);
  });

  it("publishes the updated football timeline across knowledge modules", () => {
    expect(ncaaRules.contactRules).toContain(
      "Football coaches at the Division I level may begin coach-initiated calls, texts and private electronic communication on June 15 after sophomore year."
    );
    expect(ncaaRules.contactRules).toContain(
      "Football official visits (school pays) are allowed starting April 1 of junior year, with one official visit per school under the current prospect-visit model."
    );
    expect(xPlaybook.dmStrategy.timing.fbsPrograms).toContain("June 15 after sophomore year");
  });
});

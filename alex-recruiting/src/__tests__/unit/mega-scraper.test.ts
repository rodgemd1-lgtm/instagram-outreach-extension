import { describe, expect, it } from "vitest";
import {
  parseStaffHtml,
  parseStaffMarkdown,
  type SchoolEntry,
} from "@/lib/data-pipeline/mega-scraper";

const school: SchoolEntry = {
  name: "Georgia",
  division: "D1_FBS",
  conference: "SEC",
  state: "GA",
  city: "Athens",
  staffUrl: "https://georgiadogs.com/sports/football/coaches",
  rosterUrl: "https://georgiadogs.com/sports/football/roster",
  xHandle: "@GeorgiaFootball",
};

describe("mega scraper parser coverage", () => {
  it("parses image-first markdown staff tables", () => {
    const markdown = `
### Coaching Staff

| Image | Name | Title | Phone | Twitter |
| --- | --- | --- | --- | --- |
| [![Image](https://example.com/phil.jpg)](https://example.com/phil) | [Phil Rauscher](https://example.com/phil) | Assistant Coach - Offensive Line |  | [@Rausch84](https://twitter.com/Rausch84) |
| [![Image](https://example.com/kirby.jpg)](https://example.com/kirby) | [Kirby Smart](https://example.com/kirby) | Head Coach |  |  |
`;

    const coaches = parseStaffMarkdown(markdown, school);

    expect(coaches).toHaveLength(2);
    expect(coaches[0]).toMatchObject({
      name: "Phil Rauscher",
      title: "Assistant Coach - Offensive Line",
      xHandle: "@Rausch84",
      school: "Georgia",
    });
    expect(coaches[1]).toMatchObject({
      name: "Kirby Smart",
      title: "Head Coach",
    });
  });

  it("does not misread staff emails as X handles", () => {
    const markdown = `
### Coaching Staff

| Name | Title | Email |
| --- | --- | --- |
| Marcus Johnson | Offensive Line | mjohnson@school.edu |
`;

    const [coach] = parseStaffMarkdown(markdown, school);

    expect(coach).toMatchObject({
      name: "Marcus Johnson",
      title: "Offensive Line",
      email: "mjohnson@school.edu",
      xHandle: null,
    });
  });

  it("ignores player position rows that look like offensive line titles", () => {
    const markdown = `
| Name | Title |
| --- | --- |
| Brendan Black | Offensive Lineman |
| Tyler Hudanick | Run Game Coordinator / Offensive Line |
`;

    const coaches = parseStaffMarkdown(markdown, school);

    expect(coaches).toHaveLength(1);
    expect(coaches[0]).toMatchObject({
      name: "Tyler Hudanick",
      title: "Run Game Coordinator / Offensive Line",
    });
  });

  it("parses roster staff cards from modern athletics sites", () => {
    const html = `
<div class="roster-staff-members">
  <ul>
    <li class="roster-list-item">
      <a class="roster-list-item__title" href="/sports/football/roster/season/2026/staff/alex-golesh">Alex Golesh</a>
      <div class="roster-list-item__profile-fields">
        <strong class="roster-list-item__profile-field roster-list-item__profile-field--position">Head Coach</strong>
      </div>
      <a href="https://twitter.com/@CoachGolesh">Twitter</a>
    </li>
    <li class="roster-list-item">
      <a class="roster-list-item__title" href="/sports/football/roster/season/2026/staff/joel-gordon">Joel Gordon</a>
      <div class="roster-list-item__profile-fields">
        <strong class="roster-list-item__profile-field roster-list-item__profile-field--position">Offensive Line</strong>
      </div>
      <a href="mailto:coach@example.edu">Email</a>
    </li>
  </ul>
</div>
`;

    const coaches = parseStaffHtml(html, {
      ...school,
      name: "Auburn",
      city: "Auburn",
      staffUrl: "https://auburntigers.com/sports/football/coaches",
      rosterUrl: "https://auburntigers.com/sports/football/roster",
      xHandle: "@AuburnFootball",
    });

    expect(coaches).toHaveLength(2);
    expect(coaches[0]).toMatchObject({
      name: "Alex Golesh",
      title: "Head Coach",
      xHandle: "@CoachGolesh",
    });
    expect(coaches[1]).toMatchObject({
      name: "Joel Gordon",
      title: "Offensive Line",
      email: "coach@example.edu",
      xHandle: null,
    });
  });
});

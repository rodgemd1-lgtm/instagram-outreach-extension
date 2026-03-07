# REC System (Recruiting Excellence Center) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a virtual recruiting agency with 7 AI team members (Devin + 6 specialists), each with dedicated knowledge bases, accessible via chat personas and a team dashboard.

**Architecture:** Team members are Claude personas loaded via system prompts from `src/lib/rec/team/`. Each persona has a knowledge base in `src/lib/rec/knowledge/`. A new `/agency` page shows the team dashboard. A chat API streams persona-specific responses. NCSA leads are scraped and fed into Nina's pipeline. All actions flow through the existing approval queue.

**Tech Stack:** Next.js 14, Claude API (streaming), Drizzle ORM, Vitest, existing shadcn/ui components, Firecrawl for scraping.

---

## Task 1: Team Registry & Persona Types

**Files:**
- Create: `src/lib/rec/types.ts`
- Test: `src/__tests__/unit/rec-types.test.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/unit/rec-types.test.ts
import { describe, it, expect } from 'vitest';

describe('REC Types', () => {
  it('TEAM_MEMBERS contains all 7 members', async () => {
    const { TEAM_MEMBERS } = await import('@/lib/rec/types');
    expect(TEAM_MEMBERS).toHaveLength(7);
    expect(TEAM_MEMBERS.map(m => m.id)).toContain('devin');
    expect(TEAM_MEMBERS.map(m => m.id)).toContain('marcus');
    expect(TEAM_MEMBERS.map(m => m.id)).toContain('nina');
    expect(TEAM_MEMBERS.map(m => m.id)).toContain('trey');
    expect(TEAM_MEMBERS.map(m => m.id)).toContain('jordan');
    expect(TEAM_MEMBERS.map(m => m.id)).toContain('sophie');
    expect(TEAM_MEMBERS.map(m => m.id)).toContain('casey');
  });

  it('each member has required fields', async () => {
    const { TEAM_MEMBERS } = await import('@/lib/rec/types');
    for (const member of TEAM_MEMBERS) {
      expect(member).toHaveProperty('id');
      expect(member).toHaveProperty('name');
      expect(member).toHaveProperty('title');
      expect(member).toHaveProperty('specialty');
      expect(member).toHaveProperty('owns');
      expect(member).toHaveProperty('color');
      expect(typeof member.name).toBe('string');
      expect(member.owns.length).toBeGreaterThan(0);
    }
  });

  it('getTeamMember returns correct member by id', async () => {
    const { getTeamMember } = await import('@/lib/rec/types');
    const nina = getTeamMember('nina');
    expect(nina).toBeDefined();
    expect(nina!.name).toBe('Nina Banks');
  });

  it('getTeamMember returns undefined for invalid id', async () => {
    const { getTeamMember } = await import('@/lib/rec/types');
    expect(getTeamMember('nobody')).toBeUndefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit -- src/__tests__/unit/rec-types.test.ts`
Expected: FAIL — module not found

**Step 3: Write implementation**

```typescript
// src/lib/rec/types.ts
export type TeamMemberId = "devin" | "marcus" | "nina" | "trey" | "jordan" | "sophie" | "casey";

export interface TeamMember {
  id: TeamMemberId;
  name: string;
  title: string;
  specialty: string;
  background: string;
  owns: string[];
  color: string;       // Tailwind color key (e.g., "blue")
  iconInitials: string; // 2-letter initials for avatar
}

export interface NCSALead {
  id: string;
  coachName: string;
  schoolName: string;
  division: string;
  conference: string;
  source: "profile_view" | "camp_invite" | "message" | "manual";
  sourceDetail: string;
  detectedAt: string;
  xHandle: string | null;
  outreachStatus: "new" | "researched" | "followed" | "dm_drafted" | "dm_sent" | "responded";
  assignedTo: TeamMemberId;
  notes: string;
}

export interface RecTask {
  id: string;
  assignedTo: TeamMemberId;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "blocked";
  priority: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
  completedAt: string | null;
  output: string | null;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "devin",
    name: "Devin",
    title: "Technical Director & Orchestrator",
    specialty: "System architecture, code, integrations, data pipelines, team coordination",
    background: "Full-stack engineer specializing in AI-powered recruiting systems. Coordinates the entire operation.",
    owns: ["Architecture", "Code", "Integrations", "Data enrichment", "Team coordination"],
    color: "slate",
    iconInitials: "DV",
  },
  {
    id: "marcus",
    name: "Marcus Cole",
    title: "Head of Recruiting Strategy",
    specialty: "NCAA rules, school targeting, recruiting timelines, milestone management",
    background: "Former D1 recruiting coordinator with 15 years placing OL at Power 5 and FCS programs.",
    owns: ["School targeting", "Tier assignments", "Recruiting calendar", "NCAA compliance", "Milestone tracking"],
    color: "amber",
    iconInitials: "MC",
  },
  {
    id: "nina",
    name: "Nina Banks",
    title: "Coach Intelligence & Outreach Director",
    specialty: "Coach research, DM campaigns, relationship building, NCSA lead processing",
    background: "Former college admissions counselor turned recruiting consultant, expert in cold outreach that converts.",
    owns: ["Coach database", "DM campaigns", "Follow strategy", "NCSA leads", "Camp invite responses"],
    color: "purple",
    iconInitials: "NB",
  },
  {
    id: "trey",
    name: "Trey Jackson",
    title: "Content Strategist & X Manager",
    specialty: "X/Twitter content strategy, posting cadence, visual storytelling for recruits",
    background: "Former social media director for a top-25 college football program. Built multiple recruit profiles from zero to coach-noticed.",
    owns: ["Content calendar", "Post drafting", "Hashtag strategy", "Profile optimization", "Engagement tracking"],
    color: "blue",
    iconInitials: "TJ",
  },
  {
    id: "jordan",
    name: "Jordan Reeves",
    title: "Film & Media Producer",
    specialty: "Video editing, highlight reels, thumbnail design, AI-enhanced content production",
    background: "Hudl certified film analyst who produces recruiting highlight packages for D1 prospects.",
    owns: ["Video library", "Clip optimization", "Highlight reels", "Training clip selection", "AI-enhanced graphics"],
    color: "green",
    iconInitials: "JR",
  },
  {
    id: "sophie",
    name: "Sophie Chen",
    title: "Analytics & Intelligence Lead",
    specialty: "Recruiting data analysis, competitor tracking, engagement metrics, school fit scoring",
    background: "Data scientist who built recruiting analytics tools for a major scouting service.",
    owns: ["Intelligence dashboard", "Scoring engine", "Competitor analysis", "Engagement metrics", "NCSA analytics"],
    color: "rose",
    iconInitials: "SC",
  },
  {
    id: "casey",
    name: "Casey Ward",
    title: "Network Growth & Community Manager",
    specialty: "Strategic follower networks, recruit peer connections, community engagement",
    background: "Growth marketing specialist who managed social presence for 50+ college athletes.",
    owns: ["Follow strategy", "Recruit peer connections", "Coach follow campaigns", "Engagement pods", "Comment strategy"],
    color: "cyan",
    iconInitials: "CW",
  },
];

export function getTeamMember(id: string): TeamMember | undefined {
  return TEAM_MEMBERS.find((m) => m.id === id);
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test:unit -- src/__tests__/unit/rec-types.test.ts`
Expected: 4 tests PASS

**Step 5: Commit**

```bash
git add src/lib/rec/types.ts src/__tests__/unit/rec-types.test.ts
git commit -m "feat(rec): add team registry types and 7 team member definitions"
```

---

## Task 2: Team Persona System Prompts

**Files:**
- Create: `src/lib/rec/team/personas.ts`
- Test: `src/__tests__/unit/rec-personas.test.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/unit/rec-personas.test.ts
import { describe, it, expect } from 'vitest';

describe('REC Personas', () => {
  it('getPersonaPrompt returns a string for each team member', async () => {
    const { getPersonaPrompt } = await import('@/lib/rec/team/personas');
    const { TEAM_MEMBERS } = await import('@/lib/rec/types');
    for (const member of TEAM_MEMBERS) {
      const prompt = getPersonaPrompt(member.id);
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(100);
      expect(prompt).toContain(member.name);
    }
  });

  it('persona prompt includes Jacob context', async () => {
    const { getPersonaPrompt } = await import('@/lib/rec/team/personas');
    const prompt = getPersonaPrompt('nina');
    expect(prompt).toContain('Jacob Rodgers');
    expect(prompt).toContain('Class of 2029');
  });

  it('detectTeamMember identifies member from natural language', async () => {
    const { detectTeamMember } = await import('@/lib/rec/team/personas');
    expect(detectTeamMember('Nina, draft a DM')).toBe('nina');
    expect(detectTeamMember('Ask Marcus about the timeline')).toBe('marcus');
    expect(detectTeamMember('Hey Trey, create a post')).toBe('trey');
    expect(detectTeamMember('What should I do today?')).toBeNull();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit -- src/__tests__/unit/rec-personas.test.ts`
Expected: FAIL

**Step 3: Write implementation**

Create `src/lib/rec/team/personas.ts` with:
- `getPersonaPrompt(memberId: TeamMemberId): string` — Returns the full system prompt for a team member, including their background, personality, Jacob's profile context, and their specific knowledge domain.
- `detectTeamMember(input: string): TeamMemberId | null` — Parses user input to detect which team member is being addressed (checks for name mentions, role keywords).

Each persona prompt follows this structure:
1. Identity: "You are {name}, {title} at Alex Recruiting."
2. Background: Their expertise and persona
3. Owns: What they're responsible for
4. Jacob Context: Full athlete profile (import from jacob-profile.ts)
5. Domain Knowledge: Specific instructions for their area
6. Communication Style: How they should respond
7. Rules: Draft everything for approval, reference data, stay in character

**Step 4: Run tests, verify pass**

**Step 5: Commit**

```bash
git add src/lib/rec/team/personas.ts src/__tests__/unit/rec-personas.test.ts
git commit -m "feat(rec): add persona system prompts for all 7 team members"
```

---

## Task 3: Knowledge Base Files

**Files:**
- Create: `src/lib/rec/knowledge/ncaa-rules.ts`
- Create: `src/lib/rec/knowledge/x-playbook.ts`
- Create: `src/lib/rec/knowledge/coach-database.ts`
- Create: `src/lib/rec/knowledge/ncsa-leads.ts`
- Create: `src/lib/rec/knowledge/school-needs.ts`
- Create: `src/lib/rec/knowledge/competitor-intel.ts`
- Create: `src/lib/rec/knowledge/content-library.ts`
- Test: `src/__tests__/unit/rec-knowledge.test.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/unit/rec-knowledge.test.ts
import { describe, it, expect } from 'vitest';

describe('REC Knowledge Bases', () => {
  it('ncaaRules contains recruiting calendar and contact rules', async () => {
    const { ncaaRules } = await import('@/lib/rec/knowledge/ncaa-rules');
    expect(ncaaRules).toHaveProperty('contactRules');
    expect(ncaaRules).toHaveProperty('recruitingCalendar');
    expect(ncaaRules).toHaveProperty('classOf2029Timeline');
    expect(ncaaRules.classOf2029Timeline.length).toBeGreaterThan(0);
  });

  it('xPlaybook contains posting best practices', async () => {
    const { xPlaybook } = await import('@/lib/rec/knowledge/x-playbook');
    expect(xPlaybook).toHaveProperty('profileOptimization');
    expect(xPlaybook).toHaveProperty('postingCadence');
    expect(xPlaybook).toHaveProperty('dmStrategy');
    expect(xPlaybook).toHaveProperty('followStrategy');
  });

  it('all knowledge bases export getKnowledgeContext function', async () => {
    const modules = [
      '@/lib/rec/knowledge/ncaa-rules',
      '@/lib/rec/knowledge/x-playbook',
      '@/lib/rec/knowledge/coach-database',
      '@/lib/rec/knowledge/ncsa-leads',
      '@/lib/rec/knowledge/school-needs',
      '@/lib/rec/knowledge/competitor-intel',
      '@/lib/rec/knowledge/content-library',
    ];
    for (const mod of modules) {
      const m = await import(mod);
      expect(typeof m.getKnowledgeContext).toBe('function');
      const ctx = m.getKnowledgeContext();
      expect(typeof ctx).toBe('string');
      expect(ctx.length).toBeGreaterThan(0);
    }
  });
});
```

**Step 2: Run test to verify it fails**

**Step 3: Write implementation**

Each knowledge base file exports:
1. A typed data structure with the domain knowledge
2. A `getKnowledgeContext(): string` function that serializes the knowledge into a text block suitable for injection into a system prompt

Key knowledge bases:
- **ncaa-rules.ts**: Class of 2029 timeline (freshman through signing day), contact periods, dead periods, "Click Don't Type" rule, DM rules by division. Source: research from Task 8.
- **x-playbook.ts**: Profile optimization checklist, posting cadence rules (1-2 training clips/week, Tue-Thu mornings), DM etiquette, follow strategy, content that coaches look for. Source: research from Task 8.
- **coach-database.ts**: Reads from existing `targetSchools` data in `src/lib/data/schools.ts` + wraps the coach behavior analysis functions. `getKnowledgeContext()` returns a summary of all tracked coaches with their X handles, follow status, and DM priority.
- **ncsa-leads.ts**: In-memory + file-backed store (like video store pattern) for NCSA profile viewers, camp invites, and coach messages. `getKnowledgeContext()` returns current lead pipeline summary.
- **school-needs.ts**: Wraps existing school fit scoring data + adds graduating senior counts. `getKnowledgeContext()` returns school-by-school needs assessment.
- **competitor-intel.ts**: Wraps existing competitor recruit data. `getKnowledgeContext()` returns competitor activity summary.
- **content-library.ts**: Reads from video store to get Jacob's 74 videos categorized. `getKnowledgeContext()` returns inventory summary by category with suggested clips for posting.

**Step 4: Run tests, verify pass**

**Step 5: Commit**

```bash
git add src/lib/rec/knowledge/ src/__tests__/unit/rec-knowledge.test.ts
git commit -m "feat(rec): add 7 knowledge base files with domain data"
```

---

## Task 4: Team Chat API Route

**Files:**
- Create: `src/app/api/rec/team/chat/route.ts`
- Test: `src/__tests__/integration/rec-chat.test.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/integration/rec-chat.test.ts
import { describe, it, expect } from 'vitest';

describe('REC Team Chat', () => {
  it('getPersonaPrompt + knowledge context produces valid system prompt', async () => {
    const { getPersonaPrompt } = await import('@/lib/rec/team/personas');
    const { buildChatSystemPrompt } = await import('@/lib/rec/team/personas');
    const prompt = buildChatSystemPrompt('nina');
    expect(prompt).toContain('Nina Banks');
    expect(prompt).toContain('Jacob Rodgers');
    expect(prompt).toContain('coach');  // Nina's domain
    expect(prompt.length).toBeGreaterThan(500);
  });
});
```

**Step 2: Run test to verify it fails**

**Step 3: Write implementation**

`src/app/api/rec/team/chat/route.ts`:
- POST handler accepts `{ memberId, messages }`
- Loads persona system prompt via `buildChatSystemPrompt(memberId)` which combines the persona prompt + relevant knowledge contexts
- Calls Claude with streaming (same pattern as `/api/alex` route)
- Returns SSE stream
- If no `memberId` provided, uses `detectTeamMember()` on the last user message to auto-route

Also add `buildChatSystemPrompt(memberId: TeamMemberId): string` to `personas.ts`:
- Combines `getPersonaPrompt(memberId)` with the knowledge bases relevant to that member
- Marcus gets: ncaa-rules + school-needs
- Nina gets: coach-database + ncsa-leads + x-playbook (DM section)
- Trey gets: x-playbook + content-library
- Jordan gets: content-library
- Sophie gets: competitor-intel + school-needs + coach-database
- Casey gets: x-playbook (follow section) + competitor-intel
- Devin gets: all knowledge bases (coordinator)

**Step 4: Run tests, verify pass**

**Step 5: Commit**

```bash
git add src/app/api/rec/team/chat/route.ts src/lib/rec/team/personas.ts src/__tests__/integration/rec-chat.test.ts
git commit -m "feat(rec): add team chat API with persona routing and knowledge injection"
```

---

## Task 5: NCSA Lead Store & Scrape Endpoint

**Files:**
- Create: `src/app/api/rec/ncsa/scrape/route.ts`
- Create: `src/app/api/rec/ncsa/leads/route.ts`
- Modify: `src/lib/rec/knowledge/ncsa-leads.ts`
- Test: `src/__tests__/unit/ncsa-leads.test.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/unit/ncsa-leads.test.ts
import { describe, it, expect } from 'vitest';

describe('NCSA Lead Pipeline', () => {
  it('addLead creates a new lead', async () => {
    const { addLead, getAllLeads, clearLeads } = await import('@/lib/rec/knowledge/ncsa-leads');
    clearLeads(); // reset
    const lead = addLead({
      coachName: 'Coach Smith',
      schoolName: 'Iowa State',
      division: 'D1 FBS',
      conference: 'Big 12',
      source: 'profile_view',
      sourceDetail: 'Viewed Jacob profile on 2026-03-05',
      xHandle: null,
      notes: '',
    });
    expect(lead.id).toBeDefined();
    expect(lead.outreachStatus).toBe('new');
    expect(lead.assignedTo).toBe('nina');
    const all = getAllLeads();
    expect(all).toHaveLength(1);
  });

  it('updateLeadStatus transitions correctly', async () => {
    const { addLead, updateLeadStatus, clearLeads } = await import('@/lib/rec/knowledge/ncsa-leads');
    clearLeads();
    const lead = addLead({
      coachName: 'Coach Jones',
      schoolName: 'Ball State',
      division: 'D1 FBS',
      conference: 'MAC',
      source: 'camp_invite',
      sourceDetail: 'Summer camp invite June 2026',
      xHandle: '@CoachJones',
      notes: '',
    });
    const updated = updateLeadStatus(lead.id, 'researched');
    expect(updated?.outreachStatus).toBe('researched');
  });
});
```

**Step 2: Run test to verify it fails**

**Step 3: Write implementation**

- `ncsa-leads.ts`: File-backed store (same pattern as video store) with `addLead()`, `updateLeadStatus()`, `getAllLeads()`, `clearLeads()`, `getLeadsByStatus()`. Store path: `.ncsa-leads.json`.
- `POST /api/rec/ncsa/scrape`: Accepts `{ html }` — user pastes or we receive the NCSA dashboard HTML. Parses it for profile viewers, camp invites, coach messages. Creates leads from parsed data. Returns `{ leads: NCSALead[], created: number }`.
- `GET /api/rec/ncsa/leads`: Returns all leads with optional `?status=` filter.

Add `.ncsa-leads.json` to `.gitignore`.

**Step 4: Run tests, verify pass**

**Step 5: Commit**

```bash
git add src/lib/rec/knowledge/ncsa-leads.ts src/app/api/rec/ncsa/ src/__tests__/unit/ncsa-leads.test.ts .gitignore
git commit -m "feat(rec): add NCSA lead pipeline with scrape endpoint and file-backed store"
```

---

## Task 6: REC Task System

**Files:**
- Create: `src/lib/rec/tasks.ts`
- Create: `src/app/api/rec/tasks/route.ts`
- Test: `src/__tests__/unit/rec-tasks.test.ts`

**Step 1: Write the failing test**

```typescript
// src/__tests__/unit/rec-tasks.test.ts
import { describe, it, expect } from 'vitest';

describe('REC Task System', () => {
  it('createTask assigns to team member', async () => {
    const { createTask, getAllTasks, clearTasks } = await import('@/lib/rec/tasks');
    clearTasks();
    const task = createTask({
      assignedTo: 'trey',
      title: 'Draft 3 posts for Tuesday',
      description: 'Training clip + character post + film share',
      priority: 3,
    });
    expect(task.id).toBeDefined();
    expect(task.assignedTo).toBe('trey');
    expect(task.status).toBe('pending');
    expect(getAllTasks()).toHaveLength(1);
  });

  it('getTasksForMember filters correctly', async () => {
    const { createTask, getTasksForMember, clearTasks } = await import('@/lib/rec/tasks');
    clearTasks();
    createTask({ assignedTo: 'nina', title: 'Research Iowa coach', description: '', priority: 2 });
    createTask({ assignedTo: 'trey', title: 'Draft post', description: '', priority: 3 });
    createTask({ assignedTo: 'nina', title: 'Draft DM', description: '', priority: 1 });
    expect(getTasksForMember('nina')).toHaveLength(2);
    expect(getTasksForMember('trey')).toHaveLength(1);
  });
});
```

**Step 2-5: Implement, test, commit**

File-backed store at `.rec-tasks.json`. API routes: `POST /api/rec/tasks` (create), `GET /api/rec/tasks` (list with `?assignedTo=` and `?status=` filters), `PUT /api/rec/tasks/[id]` (update status).

```bash
git commit -m "feat(rec): add task assignment system for team members"
```

---

## Task 7: Agency Dashboard Page

**Files:**
- Create: `src/components/agency-dashboard.tsx`
- Create: `src/app/agency/page.tsx`
- Modify: `src/components/sidebar.tsx` — add Agency nav item
- Modify: `src/components/mobile-nav.tsx` — add Agency to secondary nav

**Step 1: Write the failing test**

```typescript
// src/__tests__/e2e/agency-page.test.ts
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Agency Page', () => {
  it('agency page.tsx exists', () => {
    const pagePath = path.resolve(__dirname, '../../app/agency/page.tsx');
    expect(fs.existsSync(pagePath)).toBe(true);
  });

  it('agency-dashboard component exists', () => {
    const compPath = path.resolve(__dirname, '../../components/agency-dashboard.tsx');
    expect(fs.existsSync(compPath)).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

**Step 3: Write implementation**

`agency-dashboard.tsx` — Main dashboard with:
- **Team Grid**: 7 cards (one per member) showing name, title, avatar (colored initials), active task count, and a "Chat" button
- **Lead Pipeline**: Card showing NCSA leads by status (new → researched → followed → dm_drafted → dm_sent → responded) with counts
- **Recent Activity**: Feed of completed tasks and outputs
- **Quick Actions**: "Scan NCSA", "Draft Posts", "Run Coach Intel", "Review Approvals"

Uses: Card, Badge, Button from shadcn/ui. Icons from lucide-react.

`src/app/agency/page.tsx` — imports and renders AgencyDashboard.

Add `{ href: "/agency", label: "Agency", icon: UsersRound }` to sidebar (after Dashboard) and mobile nav.

**Step 4: Run tests, verify pass. Also run `npm run build` to verify no type errors.**

**Step 5: Commit**

```bash
git commit -m "feat(rec): add agency dashboard page with team cards and lead pipeline"
```

---

## Task 8: Team Member Chat Page

**Files:**
- Create: `src/components/team-chat.tsx`
- Create: `src/app/agency/[member]/page.tsx`

**Step 1: Write the failing test**

```typescript
// src/__tests__/e2e/agency-chat.test.ts
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Agency Chat Pages', () => {
  it('dynamic member chat page exists', () => {
    const pagePath = path.resolve(__dirname, '../../app/agency/[member]/page.tsx');
    expect(fs.existsSync(pagePath)).toBe(true);
  });

  it('team-chat component exists', () => {
    const compPath = path.resolve(__dirname, '../../components/team-chat.tsx');
    expect(fs.existsSync(compPath)).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

**Step 3: Write implementation**

`team-chat.tsx` — Adapts the existing `alex-chat.tsx` pattern:
- Accepts `memberId` prop
- Shows team member info card at top (avatar, name, title, "owns" badges)
- Chat interface with SSE streaming from `/api/rec/team/chat`
- Suggested prompts specific to each member (e.g., Nina shows "Show NCSA leads", "Draft outreach for [school]")
- Messages display with member's colored avatar

`src/app/agency/[member]/page.tsx`:
- Server component that validates `params.member` against TEAM_MEMBERS
- Renders TeamChat with the member's id
- 404 for invalid member ids

**Step 4: Run tests + build**

**Step 5: Commit**

```bash
git commit -m "feat(rec): add team member chat pages with persona-specific streaming"
```

---

## Task 9: NCSA Leads Page

**Files:**
- Create: `src/components/ncsa-lead-pipeline.tsx`
- Create: `src/app/agency/leads/page.tsx`

**Step 1: Write the failing test**

```typescript
// src/__tests__/e2e/agency-leads.test.ts
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('NCSA Leads Page', () => {
  it('leads page exists', () => {
    const pagePath = path.resolve(__dirname, '../../app/agency/leads/page.tsx');
    expect(fs.existsSync(pagePath)).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

**Step 3: Write implementation**

`ncsa-lead-pipeline.tsx`:
- Kanban-style columns: New → Researched → Followed → DM Drafted → DM Sent → Responded
- Each lead card shows: coach name, school, division, source badge, X handle (if found), action buttons
- "Add Lead" manual entry dialog (for when user sees something on NCSA)
- "Scan NCSA" button opens a dialog where user can paste NCSA HTML
- Click a lead → detail panel with outreach history and next actions
- Status transitions via drag or button click

**Step 4: Run tests + build**

**Step 5: Commit**

```bash
git commit -m "feat(rec): add NCSA lead pipeline kanban page"
```

---

## Task 10: Update CLAUDE.md with Team Identity

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Update CLAUDE.md**

Add a "REC System — Virtual Recruiting Agency" section that establishes:
- Devin as the system identity (Technical Director)
- The 7-member team roster with roles
- How to activate personas (address by name in chat)
- The `/agency` dashboard and `/agency/[member]` chat routes
- NCSA lead pipeline at `/agency/leads`

This ensures every future Claude session knows the team structure.

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add REC system team identity and routing to CLAUDE.md"
```

---

## Task 11: Build Verification & Smoke Test

**Step 1: Run full test suite**

```bash
npm test
```

Expected: All tests pass

**Step 2: Run production build**

```bash
npm run build
```

Expected: Build succeeds, all pages listed including `/agency`, `/agency/[member]`, `/agency/leads`

**Step 3: Manual smoke test**

1. Navigate to `/agency` — team dashboard loads with 7 member cards
2. Click a team member → chat page loads with persona
3. Send "What should Jacob do this week?" → streaming response in character
4. Navigate to `/agency/leads` — empty lead pipeline loads
5. Add a manual lead → appears in "New" column
6. Navigate to sidebar → "Agency" link works

**Step 4: Final commit**

```bash
git commit -m "feat(rec): complete REC system — virtual recruiting agency with 7 AI team members"
```

---

## Summary

| Task | What | Files | Estimated Steps |
|------|------|-------|-----------------|
| 1 | Team registry & types | 2 | 5 |
| 2 | Persona system prompts | 2 | 5 |
| 3 | Knowledge base files (7) | 8 | 5 |
| 4 | Team chat API | 2 | 5 |
| 5 | NCSA lead pipeline | 4 | 5 |
| 6 | Task system | 3 | 5 |
| 7 | Agency dashboard page | 4 | 5 |
| 8 | Team member chat page | 2 | 5 |
| 9 | NCSA leads page | 2 | 5 |
| 10 | CLAUDE.md update | 1 | 2 |
| 11 | Build verification | 0 | 4 |
| **Total** | | **30 files** | **51 steps** |

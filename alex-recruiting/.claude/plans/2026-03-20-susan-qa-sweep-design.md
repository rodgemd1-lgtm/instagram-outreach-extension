# Susan-Orchestrated QA Sweep — Design Doc

**Date:** 2026-03-20
**Author:** Jake (AI Co-Founder)
**Status:** APPROVED
**Approach:** Parallel Agent Swarm (Approach B)

## Goal

Full audit of Alex Recruiting: demo readiness + production hardening + security/accessibility + recruiting strategy evaluation via simulated coaching panel.

## Wave Structure

### Wave 1 — Engineering (parallel, 3 agents)

| Agent | Subagent Type | Focus |
|-------|--------------|-------|
| Forge (QA) | `forge-qa` | Every page loads, every button works, every API returns valid data. Dead buttons, stub modals, placeholder data, 500 errors |
| Sentinel (Security) | `sentinel-security` | Auth gaps, exposed env vars, RLS status, XSS vectors, unvalidated inputs, API routes without auth |
| Atlas (Architecture) | `atlas-engineering` | Circular deps, dead imports, Drizzle/Supabase divergence, unused files, bundle size |

### Wave 2 — Product/UX (parallel, 3 agents)

| Agent | Subagent Type | Focus |
|-------|--------------|-------|
| Marcus (UX) | `marcus-ux` | Visual consistency, mobile responsiveness, nav flow, info hierarchy, empty/loading states |
| Lens (Accessibility) | `lens-accessibility` | WCAG compliance, keyboard nav, screen reader, color contrast, aria labels |
| Dashboard Review | `superpowers:code-reviewer` | CRM-specific: coach pipeline UX, data flow, right metrics surfaced |

### Wave 3 — Coaching Panel Simulation (parallel, 3 agents)

Each roleplays as a college coach evaluating: "Would I recruit Jacob based on this app?"

| Agent | Persona | Evaluates |
|-------|---------|-----------|
| Coach Outreach Studio | D1 FBS OL Coach (Big Ten) | Outreach professionalism, DM/email quality |
| Recruiting Strategy Studio | D2 OL Coach (GLIAC) | Profile completeness — film, measurables, academics |
| X Growth Studio | D3 HC (Iowa Athletic Conference) | X presence, content strategy effectiveness |

### Wave 4 — Synthesis (Jake)

- Compile all findings into scored QA Report
- P0/P1/P2 categorization
- Coaching panel verdict
- Fix sprint plan

## Output Format

### Engineering/Product Agents
```
## [Agent Name] — [Domain] Review
### Score: X/10
### P0 (Critical) — blocks demo or breaks functionality
### P1 (Important) — should fix before real outreach
### P2 (Minor) — polish/improvement
### Strengths
### Recommendation
```

### Coaching Panel Agents
```
## [Division] Coach Perspective
### Would you recruit Jacob? YES / MAYBE / NO
### What convinced you (or didn't)
### What's missing
### How this compares to other recruits
### Red flags
```

## Scoring Rubric

- 9-10: Ship-ready
- 7-8: Solid, few issues
- 5-6: Functional, needs work
- 3-4: Significant gaps
- 1-2: Fundamental problems

## Final Report Structure

- Overall weighted score
- P0 fix list ordered by impact
- Coaching panel verdict (consensus)
- Recommended fix sprint plan
- Context for next session

## Execution

1. Write design doc (this file) and commit
2. Launch Wave 1 (3 agents parallel)
3. Launch Wave 2 + Wave 3 (6 agents parallel, or next session)
4. Synthesize into QA Report
5. Triage P0s with Mike
6. Fix P0s (same session if context allows)
7. Handoff remaining fixes

## Context Budget

- Agents run in their own context windows (no cost to main session)
- Synthesis: ~10-15% of remaining context
- P0 fixes: 3-5 fixes per session before checkpoint needed

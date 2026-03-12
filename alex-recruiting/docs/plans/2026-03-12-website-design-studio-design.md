# Website Design Studio — Design Document

**Date:** 2026-03-12
**Status:** Approved
**Scope:** Any web presence (apps, marketing, emails, decks, social)
**Optimization:** Design excellence
**Interaction model:** Checkpoint-driven

---

## Overview

A unified pipeline skill that orchestrates end-to-end website design from research through deployment. Integrates the existing UX design process (double diamond), Claude Code plugins/skills, web scraping for best practices, and Susan's full agent team into a single `website-design-studio` skill.

The studio handles: web apps, marketing sites, landing pages, email templates, pitch decks, and social media assets.

---

## Architecture: 6-Phase Pipeline

```
Research → Strategy → Design System → Layout → Build → Verify
   ↓          ↓           ↓             ↓        ↓        ↓
 [GATE]    [GATE]      [GATE]        [GATE]   [GATE]   [GATE]
```

Each phase produces artifacts. Each gate requires user checkpoint approval before proceeding.

### Phase 1: Research (Parallel Tracks)

Four parallel research tracks run simultaneously via subagents:

| Track | Tools | Output |
|-------|-------|--------|
| Competitive Intelligence | Firecrawl branding extraction, Exa semantic search | Competitor design patterns, color palettes, typography choices |
| Trend Discovery | Brave Search, Jina, Context7 | Current design trends, emerging patterns, framework innovations |
| Behavioral Science | Susan agents (Freya, Echo, Flow) | LAAL protocol audit, Fogg Behavior Model mapping, SDT assessment |
| Brand Audit | Firecrawl branding format on existing site | Current brand identity extraction, gap analysis |

**Gate 1:** Research brief presented to user. User approves direction or requests pivots.

### Phase 2: Strategy

Susan agents synthesize research into design strategy:

- **Marcus UX** — User journey mapping, information architecture
- **Prism Brand** — Brand positioning, visual identity direction
- **Echo Neuro-Design** — Dopamine scheduling, motivation systems, habit loop architecture
- **Freya Behavioral Economics** — Retention architecture, ethical persuasion design

Outputs: Design principles document, user journey map, emotional arc, content hierarchy.

**Gate 2:** Strategy deck presented. User approves or adjusts priorities.

### Phase 3: Design System

Auto-generates a design system from strategy outputs:

- **Color palette** — Primary, secondary, accent, semantic colors (success/warning/error), dark/light variants
- **Typography scale** — Font families, size scale (fluid clamp values), line heights, letter spacing
- **Spacing system** — 4px grid, named spacing tokens
- **Component tokens** — Border radius, shadows, transitions, z-index layers
- **Tailwind config** — Generated `tailwind.config.ts` extension with all tokens

Reference extraction: Firecrawl branding format scrapes 2-3 inspiration sites for concrete values.

**Gate 3:** Design system preview (color swatches, type specimens, spacing examples). User approves palette and typography.

### Phase 4: Layout Architecture

Auto-routes to the appropriate Susan studio agent based on project type:

| Project Type | Studio Agent | Focus |
|-------------|-------------|-------|
| Landing page | `landing-page-studio` | Hero, social proof, CTA flow |
| Web app | `app-experience-studio` | Navigation, dashboards, data display |
| Recruiting site | `recruiting-dashboard-studio` | Athlete profiles, coach CRM, film sections |
| Marketing | `design-studio-director` | Campaign assets, email templates |

Outputs: Page-level wireframes (semantic HTML structure), component inventory, responsive breakpoint strategy.

**Gate 4:** Layout wireframes presented. User approves structure.

### Phase 5: Build

Invokes the `frontend-design` skill with:
- Design system tokens from Phase 3
- Layout architecture from Phase 4
- Anti-generic principles (no default shadows, no stock gradients, signature animations)
- Accessibility requirements from Lens agent

Implementation is component-by-component with the frontend-design skill's quality standards.

**Gate 5:** Built components verified via preview server. User approves visual output.

### Phase 6: Verify

Multi-dimensional verification:

- **Lens Accessibility** — WCAG compliance audit, color contrast, keyboard navigation, screen reader testing
- **Preview screenshots** — Visual regression across mobile/tablet/desktop breakpoints
- **Lighthouse metrics** — Performance, accessibility, best practices, SEO scores
- **Behavioral audit** — Freya reviews for dark patterns, Echo validates engagement loops

**Gate 6:** Verification report presented. User approves for deployment.

---

## Skill Interface

```
/website-design-studio [project-type] [url?]
```

- `project-type`: landing-page | web-app | marketing | recruiting | email | deck
- `url` (optional): Existing site URL for brand audit baseline

The skill manages state across phases, persists artifacts to `docs/studio/`, and presents checkpoint summaries at each gate.

---

## Integration Points

| System | How Used |
|--------|----------|
| Susan Intelligence MCP | Agent execution (Marcus, Prism, Echo, Freya, Lens), knowledge base queries |
| Firecrawl MCP | Branding extraction, competitive site scraping |
| Exa MCP | Semantic search for design trends and best practices |
| Context7 MCP | Up-to-date framework documentation |
| frontend-design skill | Implementation phase (Phase 5) |
| ux-design-process skill | Research methodology reference |
| preview tools | Build verification (Phase 5-6) |

---

## File Structure

```
.claude/skills/website-design-studio.md    # Main pipeline skill
docs/studio/                                # Studio artifacts per project
  {project}/
    research-brief.md
    strategy-deck.md
    design-system.md
    layout-architecture.md
    verification-report.md
```

---

## First Application

After the studio is built, apply it to Alex's recruiting app as V3.0 — running the full 6-phase pipeline against the existing `/recruit` page to produce a research-backed, behaviorally-optimized redesign.

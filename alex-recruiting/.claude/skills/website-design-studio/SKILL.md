---
name: website-design-studio
description: End-to-end website design pipeline — research, strategy, design system, layout, build, verify. Orchestrates Susan agents, MCP tools, and frontend-design skill with checkpoint gates. Use when designing or redesigning any web presence.
---

# Website Design Studio

A 6-phase pipeline for designing and building any web presence — apps, marketing sites, landing pages, email templates, pitch decks, social assets.

## Invocation

The user triggers this skill when they want to design or redesign a web presence. Determine:
1. **Project type**: landing-page | web-app | marketing | recruiting | email | deck
2. **Project name**: kebab-case identifier (e.g., `recruit-v3`)
3. **Existing URL** (optional): For brand audit baseline
4. **Optimization goal**: Design excellence | Speed to launch | Conversion optimization

Create the artifact directory: `docs/studio/{project-name}/`

## Pipeline Overview

```
Phase 1: Research    → [CHECKPOINT] →
Phase 2: Strategy    → [CHECKPOINT] →
Phase 3: Design System → [CHECKPOINT] →
Phase 4: Layout      → [CHECKPOINT] →
Phase 5: Build       → [CHECKPOINT] →
Phase 6: Verify      → [CHECKPOINT] → Done
```

Each phase produces a markdown artifact saved to `docs/studio/{project-name}/`. Each checkpoint presents a summary to the user and waits for approval before proceeding.

---

## Phase 1: Research

Run 4 parallel research tracks using the Agent tool with `subagent_type` agents. All tracks run simultaneously.

### Track A: Competitive Intelligence

Use `subagent_type: Explore` agent with these instructions:
1. Use `mcp__firecrawl__firecrawl_scrape` with `formats: ["branding"]` on 3 competitor URLs to extract brand identity (colors, fonts, spacing, UI components)
2. Use `mcp__exa__web_search_exa` to find "{project-type} design best practices 2026"
3. Compile findings: competitor color palettes, typography choices, layout patterns, differentiators

### Track B: Trend Discovery

Use `subagent_type: Explore` agent with these instructions:
1. Use `mcp__exa__web_search_exa` for "best {project-type} design trends 2026"
2. Use `mcp__exa__web_search_exa` for "{industry} website design awards recent"
3. Use `mcp__context7__resolve-library-id` + `mcp__context7__query-docs` for framework-specific patterns (Next.js, Tailwind, etc.)
4. Compile: emerging patterns, animation trends, layout innovations

### Track C: Behavioral Science

Use `subagent_type: echo-neuro-design` agent:
1. Map the target user's motivation profile using SDT (autonomy, competence, relatedness)
2. Design the feeling-state arc: uncertainty → orientation → trust → desire → commitment → reassurance
3. Identify habit loop opportunities (cue → routine → reward → investment)
4. Flag ethical boundaries

Then use `subagent_type: freya-behavioral-economics` agent:
1. Run LAAL protocol assessment for the project type
2. Identify applicable BE mechanisms (loss aversion, endowment effect, social proof, etc.)
3. Map friction points and commitment devices
4. Flag dark pattern risks

### Track D: Brand Audit (if existing URL provided)

Use `subagent_type: Explore` agent:
1. Use `mcp__firecrawl__firecrawl_scrape` with `formats: ["branding"]` on the existing site URL
2. Extract: current colors, fonts, spacing, component patterns
3. Run `mcp__susan-intelligence__run_agent` with `agent_id: "prism-brand"` to assess brand coherence
4. Identify gaps between current brand and target positioning

### Research Artifact

Save combined findings to `docs/studio/{project-name}/01-research-brief.md` with sections:
- Competitive Landscape (color palettes, typography, patterns from competitors)
- Design Trends (emerging patterns, award-winning examples)
- Behavioral Science Brief (motivation profile, feeling-state arc, BE mechanisms)
- Brand Audit (current state, gaps) — if applicable
- Key Insights (3-5 actionable takeaways)

### Checkpoint 1

Present the research brief to the user as a concise summary:
- "Here's what I found across [N] competitors, [N] trend sources, and behavioral science analysis."
- Show the 3-5 key insights
- Ask: "Does this direction align with your vision? Any competitors or references I should add?"

Wait for user approval before proceeding to Phase 2.

---

## Phase 2: Strategy

Synthesize research into a design strategy using Susan agents.

### Step 2a: User Journey Mapping

Use `subagent_type: marcus-ux` agent:
1. Read the research brief from `docs/studio/{project-name}/01-research-brief.md`
2. Map the primary user journey (entry → key actions → conversion → retention)
3. Identify moments of truth (first impression, first trust handoff, commitment point, post-action reassurance)
4. Define information architecture (page hierarchy, navigation model, content priority)

### Step 2b: Brand Strategy

Use `subagent_type: prism-brand` agent:
1. Read the research brief
2. Define positioning stack: category, enemy, promise, proof, tone, symbolic code
3. Specify visual identity direction: color mood, typography character, imagery style
4. Define verbal identity: voice attributes, headline patterns, CTA language

### Step 2c: Emotional Architecture

Use `subagent_type: echo-neuro-design` agent:
1. Read the research brief
2. Design the page-level emotional arc (what feeling at each scroll depth)
3. Map dopamine scheduling points (micro-rewards, progress indicators, surprise moments)
4. Specify motion narrative (what moves, when, why)

Use `subagent_type: freya-behavioral-economics` agent:
1. Design retention architecture (what brings users back)
2. Specify commitment escalation ladder (micro → medium → macro commitments)
3. Define social proof strategy (what evidence, where, how displayed)

### Strategy Artifact

Save to `docs/studio/{project-name}/02-strategy-deck.md`:
- Design Principles (5-7 principles derived from research + strategy)
- User Journey Map (entry → conversion flow with moments of truth)
- Brand Positioning (positioning stack, visual direction, verbal identity)
- Emotional Arc (feeling-state progression per page/section)
- Content Hierarchy (what content matters most, information architecture)

### Checkpoint 2

Present strategy deck summary:
- Show the 5-7 design principles
- Show the user journey with moments of truth highlighted
- Show brand positioning one-liner
- Ask: "Do these principles and the journey map capture what you want? Any adjustments?"

Wait for user approval.

---

## Phase 3: Design System

Generate a complete design system from the strategy outputs.

### Step 3a: Reference Extraction

Use `mcp__firecrawl__firecrawl_scrape` with `formats: ["branding"]` on 2-3 inspiration sites identified during research to extract concrete values:
- Exact hex colors, font families, font sizes
- Spacing values, border radii, shadow definitions
- Component patterns

### Step 3b: Token Generation

Using the strategy deck (design principles, brand positioning, emotional arc) and reference extraction data, generate:

**Color System:**
- Primary palette (3-4 shades): brand color + light/dark variants
- Secondary palette: complementary accent
- Semantic colors: success, warning, error, info
- Neutral scale: 10 shades from near-white to near-black
- Surface colors: background, card, raised, overlay
- Dark mode variants if applicable

**Typography Scale:**
- Display font family (distinctive, character-defining)
- Body font family (readable, complementary)
- Size scale using fluid `clamp()` values: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl
- Line heights per size
- Letter spacing per size
- Font weights used

**Spacing System:**
- Base unit: 4px
- Named tokens: xs(4), sm(8), md(16), lg(24), xl(32), 2xl(48), 3xl(64), 4xl(96)

**Component Tokens:**
- Border radius scale: sm, md, lg, xl, full
- Shadow scale: sm, md, lg, xl
- Transition durations: fast(150ms), normal(300ms), slow(500ms)
- Z-index layers: base, dropdown, sticky, modal, toast

**Tailwind Config Extension:**
Generate a `tailwind.config.ts` `theme.extend` block with all tokens mapped to Tailwind utilities.

### Step 3c: Apply Frontend Design Principles

Cross-reference with the `frontend-design` skill anti-patterns:
- Verify no Inter/Roboto/Arial in typography choices
- Verify no purple-gradient-on-white in color system
- Verify color palette has dominant + sharp accent (not evenly distributed)
- Verify typography pairing is distinctive (display + body, not two safe choices)

### Design System Artifact

Save to `docs/studio/{project-name}/03-design-system.md`:
- Color palette (with hex values and semantic names)
- Typography scale (with font families, sizes, weights)
- Spacing system
- Component tokens
- Tailwind config extension (copy-paste ready)
- Anti-pattern checklist (verified)

### Checkpoint 3

Present design system:
- Show color swatches (describe the palette with hex values)
- Show typography choices (font names, sample sizes)
- Show the Tailwind config extension
- Ask: "Do you like the palette and typography? Any colors or fonts you'd prefer?"

Wait for user approval.

---

## Phase 4: Layout Architecture

Generate page-level layouts based on project type.

### Auto-Route to Studio Agent

Based on the project type determined in the invocation, route to the appropriate Susan studio agent:

| Project Type | Agent | Focus |
|-------------|-------|-------|
| landing-page | `landing-page-studio` | Hero → social proof → features → CTA flow (6-beat arc) |
| web-app | `app-experience-studio` | Navigation, dashboards, data display, onboarding ladder |
| recruiting | `recruiting-dashboard-studio` | Athlete profiles, coach CRM, film sections |
| marketing | `design-studio-director` | Campaign assets, email templates, multi-page sites |
| email | `design-studio-director` | Single-column flow, mobile-first, CTA hierarchy |
| deck | `design-studio-director` | Slide structure, narrative arc, data visualization |

### Step 4a: Page Structure

Use the appropriate studio agent (via `mcp__susan-intelligence__run_agent`) with:
- The strategy deck from Phase 2
- The design system from Phase 3
- Request: "Generate page-level wireframes as semantic HTML structure"

Output per page:
- Section order with content type (hero, features, testimonials, CTA, etc.)
- Component inventory (what UI components each section needs)
- Responsive strategy (what changes at mobile/tablet/desktop breakpoints)
- Content slots (what text/media goes where)

### Step 4b: Accessibility Pre-Check

Use `subagent_type: lens-accessibility` agent:
1. Review the layout architecture for accessibility concerns
2. Verify navigation is keyboard-accessible
3. Verify content hierarchy uses proper heading levels
4. Verify color contrast will meet WCAG AA with the design system colors
5. Flag any potential issues before build phase

### Layout Artifact

Save to `docs/studio/{project-name}/04-layout-architecture.md`:
- Page inventory (list of pages/sections)
- Per-page wireframe (semantic HTML structure with comments)
- Component inventory (all unique components needed)
- Responsive breakpoint strategy
- Accessibility pre-check results

### Checkpoint 4

Present layout:
- Show page inventory with section order
- Show component inventory
- Highlight any accessibility concerns
- Ask: "Does this page structure work? Any sections to add, remove, or reorder?"

Wait for user approval.

---

## Phase 5: Build

Implement the design using the `frontend-design` skill.

### Build Protocol

1. **Load the frontend-design skill** — invoke `frontend-design:frontend-design` to activate its design thinking framework and anti-pattern guards.

2. **Feed context to frontend-design:**
   - Design system tokens from `docs/studio/{project-name}/03-design-system.md`
   - Layout architecture from `docs/studio/{project-name}/04-layout-architecture.md`
   - Strategy principles from `docs/studio/{project-name}/02-strategy-deck.md`
   - The emotional arc and motion narrative specifications

3. **Implementation order:**
   - Start with Tailwind config (design tokens)
   - Build layout shell (navigation, footer, page structure)
   - Build components top-to-bottom per page (hero first, then sections in order)
   - Add motion/animation last (CSS-first, Motion library for React if available)

4. **Per-component checklist:**
   - [ ] Matches design system tokens (colors, typography, spacing)
   - [ ] Responsive across mobile/tablet/desktop
   - [ ] Keyboard accessible
   - [ ] Follows the emotional arc (appropriate feeling at this scroll depth)
   - [ ] No frontend-design anti-patterns (no Inter, no purple gradients, no cookie-cutter)

5. **Preview verification during build:**
   - Use `preview_start` to run the dev server
   - After each major component: `preview_screenshot` to verify visual output
   - Use `preview_inspect` to verify CSS values match design tokens
   - Use `preview_console_logs` to check for errors
   - Use `preview_snapshot` to verify content and structure

### Checkpoint 5

After all components are built:
- Take `preview_screenshot` at desktop, tablet, and mobile breakpoints
- Present screenshots to user
- List any deviations from the design system
- Ask: "How does this look? Any visual adjustments needed?"

Wait for user approval.

---

## Phase 6: Verify

Multi-dimensional verification before delivery.

### Step 6a: Accessibility Audit

Use `subagent_type: lens-accessibility` agent:
1. Run WCAG 2.1 AA compliance check against built pages
2. Verify color contrast ratios (use `preview_inspect` to get computed colors)
3. Test keyboard navigation flow (use `preview_click` and `preview_snapshot`)
4. Verify heading hierarchy and ARIA labels
5. Check for missing alt text, focus indicators, skip links

### Step 6b: Visual Regression

Use preview tools:
1. `preview_resize` to mobile (375x812) → `preview_screenshot`
2. `preview_resize` to tablet (768x1024) → `preview_screenshot`
3. `preview_resize` to desktop (1280x800) → `preview_screenshot`
4. Verify no layout breaks, overflow issues, or missing content at any breakpoint

### Step 6c: Performance Check

Run build and check output:
1. `npm run build` — verify no errors
2. Check bundle sizes in build output
3. Verify no unnecessary dependencies added
4. Check for render-blocking resources

### Step 6d: Behavioral Audit

Use `subagent_type: freya-behavioral-economics` agent:
1. Review final implementation for dark patterns
2. Verify commitment ladder is ethical (no trick confirmations, no forced urgency)
3. Verify social proof is authentic (no fake counters or manufactured scarcity)

### Verification Artifact

Save to `docs/studio/{project-name}/05-verification-report.md`:
- Accessibility score (pass/fail per WCAG criterion checked)
- Visual regression results (breakpoint screenshots described)
- Performance metrics (build success, bundle sizes)
- Behavioral audit (dark pattern check results)
- Issues found and resolution status

### Checkpoint 6

Present verification report:
- Show accessibility pass/fail summary
- Show screenshots at all breakpoints
- Show build results
- Show behavioral audit results
- Ask: "Everything checks out. Ready to deploy, or any fixes needed?"

Wait for user approval. If approved, proceed to deployment (git push, Vercel deploy, etc.).

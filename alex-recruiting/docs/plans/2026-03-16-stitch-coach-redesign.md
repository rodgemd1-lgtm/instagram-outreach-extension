# Stitch Coach Unified Shell — Full Redesign

**Date:** 2026-03-16
**Status:** Approved
**Approach:** Shell Swap (Approach B) — New design system + progressive reskin

## Overview

Replace all three existing design shells (Light Dashboard, Stitch Dark, Standard App Shell) with the unified Stitch Coach design system derived from 32 reference screens. Delete all old components after migration.

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--sc-bg` | `#0a0a0a` | Page background |
| `--sc-surface` | `#141414` | Cards, panels |
| `--sc-surface-glass` | `rgba(26, 19, 19, 0.6)` | Glass-morphism panels |
| `--sc-primary` | `#C5050C` | Pirate red |
| `--sc-primary-glow` | `rgba(197, 5, 12, 0.3)` | Shadows, glows |
| `--sc-text` | `#f1f5f9` | Primary text |
| `--sc-text-muted` | `#94a3b8` | Secondary text |
| `--sc-text-dim` | `#64748b` | Tertiary/labels |
| `--sc-border` | `rgba(197, 5, 12, 0.1)` | Default borders |
| `--sc-success` | `#22c55e` | Green indicators |
| `--sc-warning` | `#eab308` | Gold/pirate-gold |
| `--sc-danger` | `#ef4444` | Error states |
| `--sc-accent-cyan` | `#00f2ff` | Terminal/intel screens |

## Typography

- Display: Inter (300–900)
- Mono: JetBrains Mono (data/terminal)
- Headlines: font-black, uppercase, tracking-tighter, italic for emphasis
- Labels: text-[10px], font-bold, uppercase, tracking-widest

## Icons

Material Symbols Outlined throughout.

## Shell Layout

- Sidebar: 256px, dark surface, red active-state gradient with left border
- Header: Sticky top, h-16, blur backdrop, centered search, notifications + avatar
- Mobile: Sidebar collapses, bottom nav with 5 key tabs
- Footer: System status bar with uplink indicators
- Content: p-8, max-w-7xl, mx-auto

## Core Components

1. `StitchCoachShell` — Root layout wrapper
2. `SCHeader` — Sticky top bar
3. `SCSidebar` — 256px nav
4. `SCMobileNav` — Bottom tab bar
5. `SCFooter` — System status bar
6. `SCGlassCard` — Glass-morphism panel
7. `SCStatCard` — Metric display
8. `SCTable` — Data table
9. `SCBadge` — Status pills
10. `SCButton` — Primary/secondary/ghost
11. `SCInput` — Form inputs
12. `SCPageHeader` — Page title + actions
13. `SCSectionHeader` — Section title with red border
14. `SCTabs` — Tab switching

## Page Mapping

| Route | Reference Screen |
|-------|-----------------|
| `/dashboard` | Lead Scout Command Center |
| `/outreach` | Campaign HQ Elite Access |
| `/analytics` | Scout Performance Analytics |
| `/coaches` | Offer Management Portal |
| `/agency` | Lead Scout Command Center variant |
| `/dms` | Message Archive & Compliance |
| `/content-queue` | Social Sentiment Engine |
| `/intelligence` | The Pipeline Regional View |
| `/map` | National Heat Map |
| `/competitors` | Prospect Comparison Matrix |
| `/audit` | Scouting Report Generator |

## Deletions

- `src/components/dashboard/` (entire directory)
- `src/components/stitch/` (entire directory)
- `src/components/recruit/` (entire directory)
- `src/components/motion/` (entire directory)
- `src/components/sidebar.tsx`
- `src/components/mobile-nav.tsx`
- `src/components/header.tsx`
- `src/components/app-shell.tsx`
- Old Tailwind tokens (dash-*, stitch-*, light-shell-*)
- Old CSS utilities from globals.css

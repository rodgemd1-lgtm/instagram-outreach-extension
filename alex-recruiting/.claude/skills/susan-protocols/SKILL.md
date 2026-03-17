---
name: susan-protocols
description: Use Susan's backend, routed agents, research corpus, and studio assets when working on strategy, research, product, marketing, or company-building tasks in this repo.
---

# Susan Protocols

This project is wired to the central Susan backend at `/Users/mikerodgers/Startup-Intelligence-OS/susan-team-architect/backend`.

Default company_id: `alex-recruiting`
Project: `Alex Recruiting`

## Use Susan by default when
- the task spans more than one domain
- you need current research, examples, or screenshots
- you need the right specialist agents pulled in
- you are producing slides, white papers, memos, articles, or execution plans

## Default protocol
1. Run `/susan-route "task"` first for new workstreams.
2. Run `/susan-query "task"` to pull research and examples.
3. Choose one mode command: `/susan-fast`, `/susan-think`, `/susan-design`, or `/susan-foundry`.
4. Run `/susan-assets` when the output is visual, narrative, or deck-heavy.
5. Run `/susan-refresh` if the evidence is stale or coverage is thin.

Inside this repo, these commands default to `alex-recruiting`. Override explicitly only when you want another tenant.

## Core agents
- `susan`
- `recruiting-strategy-studio`
- `highlight-reel-studio`
- `coach-outreach-studio`
- `x-growth-studio`
- `recruiting-dashboard-studio`

## Operating rule
Use the central backend as the source of truth, but bring the specialist agents from `.susan/agents/` into the active project conversation when their domain is required.

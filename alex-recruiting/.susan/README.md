# Susan Protocol Pack

Project: Alex Recruiting
Default company_id: alex-recruiting
Central backend: /Users/mikerodgers/Startup-Intelligence-OS/susan-team-architect/backend

## What gets installed
- `.claude/commands/susan-*.md`
- `.claude/skills/susan-protocols/SKILL.md`
- `.mcp.json` with the Susan MCP server
- `.claude/settings.json` with Susan safety hooks
- `.susan/agents/*.md`
- `.susan/PROTOCOLS.md`
- `.susan/project-context.yaml`

## Default workflow
1. `/susan-route "task"`
2. `/susan-query "task"`
3. `/susan-fast`, `/susan-think`, `/susan-design`, or `/susan-foundry`
4. `/susan-assets` if you need screenshots/examples
5. `/susan-refresh` when the corpus needs to be refreshed

These commands default to `alex-recruiting` inside this repo. You can still override the company explicitly if needed.

## Core agents for this project
- `susan`
- `recruiting-strategy-studio`
- `highlight-reel-studio`
- `coach-outreach-studio`
- `x-growth-studio`
- `recruiting-dashboard-studio`

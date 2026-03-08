---
description: View the current Susan team manifest for a company
argument-hint: "[company_id]"
allowed-tools: Bash, Read
---

!`cd /Users/mikerodgers/Startup-Intelligence-OS/susan-team-architect/backend && SUSAN_DEFAULT_COMPANY=alex-recruiting ./.venv/bin/python scripts/susan_cli.py shell-team "$ARGUMENTS"`

Using the team manifest above:
- list the active agents and why they are in the plan
- flag missing research, studio, or domain coverage
- suggest the next specialist handoff only if there is a gap

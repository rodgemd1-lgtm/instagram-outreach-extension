---
description: Run Susan's planning workflow for a company and summarize the outputs
argument-hint: "[company_id] [--mode quick|deep|design|foundry|full] [--refresh]"
allowed-tools: Bash, Read, Write
---

!`cd /Users/mikerodgers/Startup-Intelligence-OS/susan-team-architect/backend && SUSAN_DEFAULT_COMPANY=alex-recruiting ./.venv/bin/python scripts/susan_cli.py shell-plan "$ARGUMENTS"`

Using the generated Susan status above:
- summarize the newest planning outputs
- name the key workstreams, gaps, and recommended agents
- point to the most important generated artifacts by filename

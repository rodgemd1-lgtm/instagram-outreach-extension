---
description: Install Susan protocols, commands, MCP config, and agent packs into active project repos
argument-hint: "[--config /abs/path/to/project_protocol_targets.yaml]"
allowed-tools: Bash, Read, Write
---

!`cd /Users/mikerodgers/Startup-Intelligence-OS/susan-team-architect/backend && SUSAN_DEFAULT_COMPANY=alex-recruiting ./.venv/bin/python scripts/susan_cli.py shell-bootstrap "$ARGUMENTS"`

Summarize the sync result above:
- which repos were synced
- which company IDs they map to
- whether commands, MCP, and skills were installed
- any repos that are missing or need follow-up

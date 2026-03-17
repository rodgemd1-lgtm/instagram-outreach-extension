---
description: Pull Susan research, examples, and database-backed retrieval results for a company
argument-hint: "\"query\" [--company company_id] [--types a,b] [--top-k N]"
allowed-tools: Bash, Read
---

!`cd /Users/mikerodgers/Startup-Intelligence-OS/susan-team-architect/backend && SUSAN_DEFAULT_COMPANY=alex-recruiting ./.venv/bin/python scripts/susan_cli.py shell-query "$ARGUMENTS"`

Use the Susan retrieval output above to:
- summarize the most relevant evidence
- call out the highest-signal examples or assets
- note gaps or stale coverage if they are visible
- recommend the next Susan command only if it would materially help

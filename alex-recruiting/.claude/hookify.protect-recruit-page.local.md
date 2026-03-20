---
name: protect-recruit-page
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: src/app/recruit
action: block
---

**BLOCKED: Public Recruit Page Edit Detected**

You are editing a file under `src/app/recruit/` — this is Jacob Rodgers' public-facing recruitment site that coaches are actively viewing.

**No changes to the recruit page without Mike's explicit approval.**

Before making this edit:
1. Tell Mike exactly what you want to change and why
2. Wait for his explicit "yes" or approval
3. Only then proceed with the edit

If Mike has already approved this specific change in this session, say so and proceed.

---
name: protect-operator-dock-routes
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: operator-dock\.tsx$
  - field: new_text
    operator: not_contains
    pattern: /recruit
action: warn
---

**Warning: OperatorDock Route Guard**

You're editing `operator-dock.tsx`. The `HIDDEN_ROUTES` array must always include `/recruit` to prevent the operator panel from appearing on Jacob's public recruitment page.

Verify that `HIDDEN_ROUTES` still contains `"/recruit"` after your edit.

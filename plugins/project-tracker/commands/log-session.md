---
name: log-session
description: Log a work session for an initiative
arguments:
  - name: initiative
    description: The initiative slug to log session for
    required: false
---

# Log Work Session

Create a session log documenting work done on an initiative.

## Instructions

1. **Identify the initiative**:
   - If slug provided, use it
   - Otherwise, list active initiatives and ask which one
   - Look in `$PROJECT_TRACKER_WORKSPACE/initiatives/active/` first, then `backlog/`

2. **Gather session details**:
   - Brief description (becomes filename and title)
   - What was completed
   - Any decisions made
   - Blockers or open questions
   - Next steps
   - Files changed (optional)
   - Git branch (optional)

3. **Create the session file** at:
   `$PROJECT_TRACKER_WORKSPACE/initiatives/{state}/{slug}/sessions/{YYYY-MM-DD}-{description}.md`

```markdown
---
date: '{today's date YYYY-MM-DD}'
branch: {branch if provided}
---
# {description}

## Context

{Why this session was needed - can be brief}

## Completed

- [x] {completed item 1}
- [x] {completed item 2}

## Decisions Made

- {decision 1}

## Blockers / Open Questions

- {blocker if any}

## Next Session

- [ ] {next step 1}
- [ ] {next step 2}

## Files Changed

- `{file1}`
- `{file2}`
```

4. **Update initiative status** if relevant (offer to update Current Status section in INITIATIVE.md)

## Example

User runs: `/log-session user-auth`

You ask about what was accomplished, decisions, next steps...

You create: `$PROJECT_TRACKER_WORKSPACE/initiatives/active/user-auth/sessions/2026-01-05-jwt-implementation.md`

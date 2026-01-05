---
name: new-initiative
description: Create a new initiative in the project tracker workspace
arguments:
  - name: title
    description: The title for the new initiative
    required: true
---

# Create New Initiative

Create a new initiative in the project tracker workspace.

## Instructions

1. **Generate a slug** from the provided title using kebab-case (e.g., "User Authentication" → `user-authentication`)

2. **Determine initial state**: Ask the user if this should go in `active` or `backlog` (default to `backlog`)

3. **Create the folder structure**:
   ```
   $PROJECT_TRACKER_WORKSPACE/initiatives/{state}/{slug}/
   └── sessions/
   ```

4. **Create `INITIATIVE.md`** with this content:

```markdown
---
title: '{title}'
created: '{today's date YYYY-MM-DD}'
status: {state}
tags: []
---
# {title}

## Goal

{Ask user for the goal or leave as placeholder}

## Scope

### In Scope
- *Define what's included*

### Out of Scope
- *Define what's excluded*

## Completion Criteria

- [ ] *Define measurable completion criteria*

## Current Status

*No updates yet*

## Blockers

*None*
```

5. **Confirm creation** by telling the user the path and suggesting next steps (like logging a session or defining scope)

## Example

User runs: `/new-initiative "API Rate Limiting"`

You create:
- `$PROJECT_TRACKER_WORKSPACE/initiatives/backlog/api-rate-limiting/INITIATIVE.md`
- `$PROJECT_TRACKER_WORKSPACE/initiatives/backlog/api-rate-limiting/sessions/`

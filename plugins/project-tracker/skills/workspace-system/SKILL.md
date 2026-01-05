---
name: Project Tracker Workspace System
description: Use this skill when working with project tracking - creating initiatives, todos, ideas, logging sessions, or recording decisions. Activates when user mentions projects, tasks, initiatives, or planning.
---

# Project Tracker Workspace System

This skill teaches you how to manage the project tracker workspace - a file-based system for tracking initiatives, todos, and ideas.

**Important**: The workspace root is defined by `$PROJECT_TRACKER_WORKSPACE`. All paths below are relative to this root.

---

## Workspace Structure

```
$PROJECT_TRACKER_WORKSPACE/
├── initiatives/
│   ├── active/           # Currently being worked on
│   │   └── {slug}/
│   ├── backlog/          # Planned for future
│   │   └── {slug}/
│   └── completed/        # Finished work
│       └── {slug}/
├── todos/                # Quick standalone tasks
│   └── {slug}.md
└── ideas/                # Captured ideas for later
    └── {slug}.md
```

### Initiative Folder Structure

Each initiative is a **folder** containing:

```
initiatives/{state}/{slug}/
├── INITIATIVE.md         # Main document (required)
├── sessions/             # Work session logs
│   └── YYYY-MM-DD-{description}.md
├── decisions/            # Architecture Decision Records
│   └── {slug}.md
└── plans/                # Planning documents
    └── {slug}.md
```

---

## Naming Conventions

- **Slugs**: Always use `kebab-case` (lowercase, hyphens for spaces)
  - Good: `user-authentication`, `api-refactor`
  - Bad: `UserAuthentication`, `api_refactor`
- **Dates**: Always use `YYYY-MM-DD` format
- **Session files**: `YYYY-MM-DD-{brief-description}.md`

---

## File Formats

All files use **YAML frontmatter** followed by **Markdown content**.

### Initiative (`INITIATIVE.md`)

```markdown
---
title: Human-Readable Title
created: 'YYYY-MM-DD'
status: active | backlog | completed
tags:
  - tag1
  - tag2
---
# Title

## Goal

What this initiative aims to accomplish.

## Scope

### In Scope
- Item 1
- Item 2

### Out of Scope
- Item 1

## Completion Criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Current Status

*Latest updates on progress*

## Blockers

*Any blocking issues*
```

### Session Log (`sessions/YYYY-MM-DD-{desc}.md`)

```markdown
---
date: 'YYYY-MM-DD'
branch: feature/branch-name    # optional
---
# Session Description

## Context

Why this session was needed.

## Completed

- [x] Task 1
- [x] Task 2

## Decisions Made

- Decision 1
- Decision 2

## Blockers / Open Questions

- Blocker 1

## Next Session

- [ ] Next task 1
- [ ] Next task 2

## Files Changed

- `path/to/file1.ts`
- `path/to/file2.ts`
```

### Decision Record (`decisions/{slug}.md`)

```markdown
---
date: 'YYYY-MM-DD'
status: proposed | accepted | superseded | deprecated
---
# Decision Title

## Context

What situation prompted this decision.

## Decision

What was decided.

## Rationale

Why this decision was made.

## Alternatives Considered

### Alternative 1
Why it wasn't chosen.

### Alternative 2
Why it wasn't chosen.

## Consequences

### Positive
- Benefit 1
- Benefit 2

### Negative
- Drawback 1
```

### Todo (`todos/{slug}.md`)

```markdown
---
title: Todo Title
created: 'YYYY-MM-DD'
priority: low | medium | high    # optional
tags:                            # optional
  - tag1
---
# Todo Title

Description of what needs to be done.

## Notes

Additional context or details.
```

### Idea (`ideas/{slug}.md`)

```markdown
---
title: Idea Title
created: 'YYYY-MM-DD'
tags:                    # optional
  - tag1
---
# Idea Title

Description of the idea.

## Why This Could Be Valuable

Value proposition.

## Initial Thoughts

- Thought 1
- Thought 2

---
*Captured: YYYY-MM-DD*
```

---

## Common Operations

### Creating an Initiative

1. Create folder: `$PROJECT_TRACKER_WORKSPACE/initiatives/backlog/{slug}/`
2. Create `INITIATIVE.md` with frontmatter and content
3. Create `sessions/` subdirectory

### Moving an Initiative

Move the entire folder between state directories:
- `initiatives/backlog/{slug}/` → `initiatives/active/{slug}/`
- Update the `status` field in frontmatter to match

### Logging a Session

1. Create file: `initiatives/{state}/{slug}/sessions/YYYY-MM-DD-{description}.md`
2. Use today's date in filename and frontmatter
3. Document what was accomplished, decisions made, and next steps

### Recording a Decision

1. Create file: `initiatives/{state}/{slug}/decisions/{decision-slug}.md`
2. Set status to `proposed` initially, update to `accepted` when finalized
3. Document context, decision, rationale, and alternatives

### Creating a Todo

1. Create file: `$PROJECT_TRACKER_WORKSPACE/todos/{slug}.md`
2. Set priority if urgent

### Creating an Idea

1. Create file: `$PROJECT_TRACKER_WORKSPACE/ideas/{slug}.md`
2. Capture the idea quickly - can be refined later

### Promoting an Idea to Initiative

1. Create new initiative folder in `initiatives/backlog/`
2. Expand the idea into full initiative format
3. Delete the original idea file

---

## Best Practices

1. **One active initiative at a time** - Focus on completing work before starting new initiatives
2. **Log sessions regularly** - Document progress at the end of each work session
3. **Decisions need context** - Always explain WHY, not just what
4. **Keep todos small** - If it needs multiple sessions, it's an initiative
5. **Capture ideas quickly** - Don't let ideas get lost; refine later
6. **Use tags consistently** - Helps with filtering and organization

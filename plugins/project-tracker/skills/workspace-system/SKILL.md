---
name: Project Tracker Workspace System
description: Use this skill when working with project tracking - creating initiatives, todos, ideas, logging sessions, or recording decisions. Activates when user mentions projects, tasks, initiatives, or planning.
---

# Project Tracker Workspace System

A file-based system for tracking work across Claude Code sessions. The workspace root is defined by `$PROJECT_TRACKER_WORKSPACE`.

---

## Core Concepts

### What is an Initiative?

An **initiative** is a body of work that:
- Has a clear goal and definition of "done"
- Spans multiple Claude sessions
- Benefits from tracking decisions and progress over time
- Lives in a folder with supporting documents

**Examples**: "Add user authentication", "Refactor database layer", "Build CLI tool"

### Initiative vs Todo vs Idea

| Type | When to Use | Scope | Structure |
|------|-------------|-------|-----------|
| **Initiative** | Multi-session work with a clear goal | Days to weeks | Folder with tracker, sessions, decisions |
| **Todo** | Single-session task, standalone | Hours | Single markdown file |
| **Idea** | Captured thought, not committed to yet | N/A | Single markdown file |

**Rule of thumb**: If you'll need to "pick up where you left off" in a future session, it's an initiative. If you can finish it now, it's a todo.

### The Lifecycle

```
Idea → Initiative (backlog) → Initiative (active) → Initiative (completed)
        ↑                            ↓
      Todo ←──── (if scope shrinks) ←┘
```

1. **Capture** ideas freely - low friction, refine later
2. **Promote** ideas to initiatives when committing to the work
3. **Activate** one initiative at a time for focus
4. **Complete** initiatives by meeting completion criteria
5. **Archive** to completed/ for future reference

---

## Initiative Structure

```
initiatives/{state}/{slug}/
├── INITIATIVE.md      # Required: Goal, scope, completion criteria (static)
├── TRACKER.md         # Required: Current status dashboard (updated frequently)
├── sessions/          # Recommended: Work session logs
│   └── YYYY-MM-DD-{description}.md
├── decisions/         # Optional: Architecture Decision Records
│   └── {slug}.md
└── {other}/           # Optional: plans/, research/, notes/, assets/
```

### Required vs Optional

| Component | Required? | Purpose |
|-----------|-----------|---------|
| `INITIATIVE.md` | **Yes** | Defines what and why - the anchor document |
| `TRACKER.md` | **Yes** | Current status - read this for quick context |
| `sessions/` | Recommended | History of work sessions |
| `decisions/` | Optional | Significant architectural decisions |
| Other folders | Optional | Whatever supports the work |

---

## The Tracker File

`TRACKER.md` is the **quick-context file**. Read this first to understand where an initiative stands without loading full session history.

### Format

```markdown
---
phase: planning | in-progress | testing | blocked | wrapping-up
updated: 'YYYY-MM-DD'
---

# {Initiative Title} - Tracker

## Current Status

One paragraph: What's the current state? What was just completed? What's next?

## Completion Progress

- [x] Criterion 1 (done in session YYYY-MM-DD)
- [ ] Criterion 2 (in progress)
- [ ] Criterion 3

## Active Blockers

- Blocker description → potential resolution

## Next Session

Priority tasks for the next work session:
1. Task 1
2. Task 2

## Recent Activity

| Date | Session | Summary |
|------|---------|---------|
| YYYY-MM-DD | [description](sessions/YYYY-MM-DD-description.md) | What was done |
| YYYY-MM-DD | [description](sessions/YYYY-MM-DD-description.md) | What was done |

## Key Decisions

| Decision | Date | Link |
|----------|------|------|
| Decision title | YYYY-MM-DD | [→](decisions/slug.md) |
```

### Keeping the Tracker Updated

**After each session**:
1. Update `phase` and `updated` in frontmatter
2. Update "Current Status" paragraph
3. Check off completed criteria
4. Update blockers
5. Set "Next Session" tasks
6. Add session to "Recent Activity" (keep last 3-5)

**The tracker should be readable in under 30 seconds** - it's a dashboard, not documentation.

---

## Multi-Session Workflow

### Starting a Session

1. **Read the tracker**: `TRACKER.md` tells you where things stand
2. **Check "Next Session"**: These are your priority tasks
3. **Review blockers**: Address any blockers before diving in
4. **Optionally read recent sessions**: If you need more context

### During a Session

- Work on the initiative tasks
- Note decisions as you make them (significant ones get decision records)
- Track what you complete

### Ending a Session

1. **Create session log**: `sessions/YYYY-MM-DD-{description}.md`
   - What you completed
   - Decisions made
   - Blockers encountered
   - What's next

2. **Update tracker**: Reflect current state
   - Update status paragraph
   - Check off completed criteria
   - Set next session tasks
   - Add to recent activity

This creates continuity across Claude sessions without requiring full history reads.

---

## File Formats

### INITIATIVE.md (The Anchor)

Defines the work. Relatively static - updated when scope changes, not every session.

```markdown
---
title: Human-Readable Title
description: One-line summary of what this initiative accomplishes
created: 'YYYY-MM-DD'
status: active | backlog | completed
tags:
  - tag1
---

# {Title}

## Goal

What this initiative aims to accomplish. Be specific.

## Scope

### In Scope
- Item 1
- Item 2

### Out of Scope
- Item 1 (explicitly excluded)

## Completion Criteria

How we know this is done:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Context

Background information, links to related resources, or technical context needed to understand this initiative.
```

### Session Log

Records what happened in a work session.

```markdown
---
date: 'YYYY-MM-DD'
---

# {Brief Description}

## Completed

- [x] Task 1
- [x] Task 2

## Decisions Made

- Decision 1: rationale
- Decision 2: rationale

## Blockers Encountered

- Blocker: how it was resolved (or not)

## Next Session

- [ ] Task 1
- [ ] Task 2

## Notes

Any additional context, code snippets, or observations.
```

### Decision Record (Optional)

For significant decisions that need preserved rationale. Don't create these for every small choice.

**When to create a decision record**:
- The decision affects architecture or design
- You considered multiple approaches
- Future-you will ask "why did we do it this way?"

```markdown
---
date: 'YYYY-MM-DD'
status: proposed | accepted | superseded
---

# {Decision Title}

## Context

What situation prompted this decision.

## Decision

What was decided.

## Rationale

Why this approach was chosen.

## Alternatives Considered

- Alternative 1: Why not chosen
- Alternative 2: Why not chosen
```

### Todo

Quick standalone task. If it grows, promote to initiative.

```markdown
---
title: Todo Title
created: 'YYYY-MM-DD'
priority: low | medium | high
---

# {Title}

What needs to be done.

## Notes

Additional context if needed.
```

### Idea

Captured thought. Low friction - just get it down.

```markdown
---
title: Idea Title
created: 'YYYY-MM-DD'
---

# {Title}

The idea.

## Why Valuable

Why this might be worth doing.

## Initial Thoughts

- Thought 1
- Thought 2
```

---

## Workspace Structure

```
$PROJECT_TRACKER_WORKSPACE/
├── initiatives/
│   ├── active/           # Currently being worked on (ideally 1)
│   │   └── {slug}/
│   ├── backlog/          # Planned for future
│   │   └── {slug}/
│   └── completed/        # Finished work (reference)
│       └── {slug}/
├── todos/                # Quick standalone tasks
│   └── {slug}.md
└── ideas/                # Captured ideas
    └── {slug}.md
```

---

## Common Operations

### Create an Initiative

1. Create folder: `initiatives/backlog/{slug}/`
2. Create `INITIATIVE.md` with goal, scope, completion criteria
3. Create `TRACKER.md` with initial status
4. Create `sessions/` directory

### Activate an Initiative

1. Move folder: `backlog/{slug}/` → `active/{slug}/`
2. Update `status` in `INITIATIVE.md` frontmatter
3. Update `phase` in `TRACKER.md`

### Log a Session

1. Create: `sessions/YYYY-MM-DD-{description}.md`
2. Document completed work, decisions, blockers, next steps
3. Update `TRACKER.md` with current status

### Complete an Initiative

1. Verify all completion criteria are met
2. Move folder: `active/{slug}/` → `completed/{slug}/`
3. Update `status` to `completed`
4. Final tracker update noting completion

### Promote Idea to Initiative

1. Create initiative folder in `backlog/`
2. Expand idea into full `INITIATIVE.md`
3. Create `TRACKER.md`
4. Delete original idea file

---

## Best Practices

1. **One active initiative** - Focus beats multitasking
2. **Update tracker every session** - Future-you will thank you
3. **Keep tracker lean** - Dashboard, not documentation
4. **Session logs are append-only** - Don't edit old sessions
5. **Decisions need "why"** - Context decays fast
6. **Todos stay small** - Multi-session = initiative
7. **Capture ideas freely** - Filter later, not at capture time

---

## Naming Conventions

- **Slugs**: `kebab-case` (lowercase, hyphens)
- **Dates**: `YYYY-MM-DD`
- **Sessions**: `YYYY-MM-DD-{brief-description}.md`

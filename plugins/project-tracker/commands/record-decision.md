---
name: record-decision
description: Record an architecture or design decision for an initiative
arguments:
  - name: initiative
    description: The initiative slug to record decision for
    required: false
---

# Record Decision

Create an Architecture Decision Record (ADR) for an initiative.

## Instructions

1. **Identify the initiative**:
   - If slug provided, use it
   - Otherwise, list active initiatives and ask which one

2. **Gather decision details**:
   - Decision title (becomes slug and heading)
   - Context: What situation prompted this decision?
   - Decision: What was decided?
   - Rationale: Why this approach?
   - Alternatives considered (at least 1-2)
   - Consequences (positive and negative)
   - Status: `proposed` or `accepted`

3. **Create the decision file** at:
   `$PROJECT_TRACKER_WORKSPACE/initiatives/{state}/{slug}/decisions/{decision-slug}.md`

```markdown
---
date: '{today's date YYYY-MM-DD}'
status: {proposed | accepted}
---
# {Decision Title}

## Context

{What situation prompted this decision}

## Decision

{What was decided}

## Rationale

{Why this decision was made}

## Alternatives Considered

### {Alternative 1}
{Why it wasn't chosen}

### {Alternative 2}
{Why it wasn't chosen}

## Consequences

### Positive
- {benefit 1}
- {benefit 2}

### Negative
- {drawback 1}
```

4. **Create decisions folder** if it doesn't exist

## Example

User runs: `/record-decision user-auth`

You ask about the decision...

User explains they chose JWT over sessions.

You create: `$PROJECT_TRACKER_WORKSPACE/initiatives/active/user-auth/decisions/jwt-over-sessions.md`

## Decision Status Flow

- `proposed` → Initial state, under discussion
- `accepted` → Decision is final and being implemented
- `superseded` → Replaced by a newer decision (link to it)
- `deprecated` → No longer relevant

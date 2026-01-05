---
name: new-todo
description: Create a new todo item in the project tracker workspace
arguments:
  - name: title
    description: The title for the new todo
    required: true
---

# Create New Todo

Create a quick todo item in the project tracker workspace.

## Instructions

1. **Generate a slug** from the provided title using kebab-case

2. **Ask for details**:
   - Description (what needs to be done)
   - Priority (optional): `low`, `medium`, or `high`
   - Tags (optional)

3. **Create the file** at `$PROJECT_TRACKER_WORKSPACE/todos/{slug}.md`:

```markdown
---
title: '{title}'
created: '{today's date YYYY-MM-DD}'
priority: {priority if provided}
tags: {tags if provided}
---
# {title}

{description}

## Notes

*Add any additional context here*
```

4. **Confirm creation** with the file path

## Example

User runs: `/new-todo "Fix login redirect bug"`

You ask: "Any additional details? Priority?"

User says: "High priority, it's blocking QA"

You create `$PROJECT_TRACKER_WORKSPACE/todos/fix-login-redirect-bug.md`:
```markdown
---
title: 'Fix login redirect bug'
created: '2026-01-05'
priority: high
tags:
  - bug
  - blocking
---
# Fix login redirect bug

It's blocking QA testing.

## Notes

*Add any additional context here*
```

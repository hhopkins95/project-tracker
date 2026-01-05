---
name: new-idea
description: Capture a new idea in the project tracker workspace
arguments:
  - name: title
    description: The title for the new idea
    required: true
---

# Capture New Idea

Quickly capture an idea in the project tracker workspace. Ideas are lightweight - they can be refined later or promoted to initiatives.

## Instructions

1. **Generate a slug** from the provided title using kebab-case

2. **Ask for details** (keep it quick):
   - Brief description
   - Why it could be valuable (optional)
   - Initial thoughts (optional)

3. **Create the file** at `$PROJECT_TRACKER_WORKSPACE/ideas/{slug}.md`:

```markdown
---
title: '{title}'
created: '{today's date YYYY-MM-DD}'
tags: []
---
# {title}

{description}

## Why This Could Be Valuable

{value proposition if provided, or "*To be explored*"}

## Initial Thoughts

- {any initial thoughts}

---
*Captured: {today's date}*
```

4. **Confirm capture** - emphasize that ideas can be promoted to initiatives later

## Example

User runs: `/new-idea "GraphQL API layer"`

You ask: "Quick description?"

User says: "Could simplify frontend data fetching"

You create `$PROJECT_TRACKER_WORKSPACE/ideas/graphql-api-layer.md`

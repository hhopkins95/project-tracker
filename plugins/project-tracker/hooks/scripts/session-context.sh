#!/bin/bash
# Session context script for project-tracker plugin
# Outputs brief workspace summary on session start

# Exit silently if workspace not configured
if [ -z "$PROJECT_TRACKER_WORKSPACE" ]; then
    exit 0
fi

# Exit silently if workspace doesn't exist
if [ ! -d "$PROJECT_TRACKER_WORKSPACE" ]; then
    exit 0
fi

echo "## Project Tracker Workspace"
echo ""

# List active initiatives
ACTIVE_DIR="$PROJECT_TRACKER_WORKSPACE/initiatives/active"
if [ -d "$ACTIVE_DIR" ]; then
    ACTIVE_COUNT=$(find "$ACTIVE_DIR" -maxdepth 1 -type d | tail -n +2 | wc -l | tr -d ' ')
    if [ "$ACTIVE_COUNT" -gt 0 ]; then
        echo "**Active Initiatives ($ACTIVE_COUNT):**"
        for dir in "$ACTIVE_DIR"/*/; do
            if [ -d "$dir" ]; then
                INIT_FILE="$dir/INITIATIVE.md"
                if [ -f "$INIT_FILE" ]; then
                    # Extract title from frontmatter
                    TITLE=$(grep -m1 "^title:" "$INIT_FILE" | sed "s/^title: *['\"]*//" | sed "s/['\"]* *$//")
                    NAME=$(basename "$dir")
                    if [ -n "$TITLE" ]; then
                        echo "- $TITLE (\`$NAME\`)"
                    else
                        echo "- \`$NAME\`"
                    fi
                fi
            fi
        done
        echo ""
    fi
fi

# Count backlog
BACKLOG_DIR="$PROJECT_TRACKER_WORKSPACE/initiatives/backlog"
if [ -d "$BACKLOG_DIR" ]; then
    BACKLOG_COUNT=$(find "$BACKLOG_DIR" -maxdepth 1 -type d | tail -n +2 | wc -l | tr -d ' ')
    if [ "$BACKLOG_COUNT" -gt 0 ]; then
        echo "**Backlog:** $BACKLOG_COUNT initiative(s)"
    fi
fi

# Count todos
TODOS_DIR="$PROJECT_TRACKER_WORKSPACE/todos"
if [ -d "$TODOS_DIR" ]; then
    TODO_COUNT=$(find "$TODOS_DIR" -name "*.md" -type f | wc -l | tr -d ' ')
    if [ "$TODO_COUNT" -gt 0 ]; then
        echo "**Todos:** $TODO_COUNT"
    fi
fi

# Count ideas
IDEAS_DIR="$PROJECT_TRACKER_WORKSPACE/ideas"
if [ -d "$IDEAS_DIR" ]; then
    IDEA_COUNT=$(find "$IDEAS_DIR" -name "*.md" -type f | wc -l | tr -d ' ')
    if [ "$IDEA_COUNT" -gt 0 ]; then
        echo "**Ideas:** $IDEA_COUNT"
    fi
fi

echo ""
echo "Use \`/new-initiative\`, \`/new-todo\`, \`/new-idea\`, \`/log-session\`, or \`/record-decision\` to manage."

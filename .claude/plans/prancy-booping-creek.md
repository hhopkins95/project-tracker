# Plan: Add Tabs to Initiative View

## Goal
Replace the stacked sections in `InitiativeView` with a tabbed interface. Tabs: Overview, Sessions, Decisions, Plans.

## File to Modify
`src/components/InitiativeView.tsx`

## Implementation

### 1. Add Tab State
```tsx
const [activeTab, setActiveTab] = useState<"overview" | "sessions" | "decisions" | "plans">("overview");
```

### 2. Define Tab Configuration
```tsx
const tabs = [
  { id: "overview", label: "Overview" },
  { id: "sessions", label: "Sessions", count: initiative.sessions.length },
  { id: "decisions", label: "Decisions", count: initiative.decisions.length },
  { id: "plans", label: "Plans", count: initiative.plans.length },
];
```

### 3. Add Tab Bar (below header, above content)
- Horizontal row of tab buttons
- Active tab highlighted with bottom border
- Show counts in parentheses for Sessions/Decisions/Plans
- Style: underline tabs (clean, minimal)

### 4. Conditional Content Rendering
Replace the current stacked sections with:
```tsx
{activeTab === "overview" && <MarkdownContent content={initiative.content} />}
{activeTab === "sessions" && <SessionsList sessions={initiative.sessions} />}
{activeTab === "decisions" && <DecisionsList decisions={initiative.decisions} />}
{activeTab === "plans" && <PlansList plans={initiative.plans} />}
```

### 5. Handle Empty States
Show a message when a tab has no items (e.g., "No sessions yet")

## No New Files Required
All changes are contained within `InitiativeView.tsx`. The existing card components (SessionCard, DecisionCard, PlanCard) remain unchanged.

"use client";

import { Initiative } from "@/core/types";
import { MarkdownContent } from "./MarkdownContent";

interface InitiativeViewProps {
  initiative: Initiative;
  onDelete: () => void;
  onMove: (targetState: "active" | "backlog" | "completed") => void;
  onRefresh: () => void;
}

export function InitiativeView({ initiative, onDelete, onMove, onRefresh }: InitiativeViewProps) {
  const stateColors = {
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    backlog: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    completed: "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300",
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2 py-1 text-xs font-medium rounded ${stateColors[initiative.state]}`}>
                {initiative.state.charAt(0).toUpperCase() + initiative.state.slice(1)}
              </span>
              <span className="text-sm text-gray-500">{initiative.frontmatter.created}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {initiative.frontmatter.title}
            </h1>
            {initiative.frontmatter.tags && initiative.frontmatter.tags.length > 0 && (
              <div className="flex gap-2 mt-2">
                {initiative.frontmatter.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <MoveDropdown currentState={initiative.state} onMove={onMove} />
            <button
              onClick={onDelete}
              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl">
          {/* Main content */}
          <div className="mb-8">
            <MarkdownContent content={initiative.content} />
          </div>

          {/* Sessions */}
          {initiative.sessions.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Sessions ({initiative.sessions.length})
              </h2>
              <div className="space-y-4">
                {initiative.sessions.map((session) => (
                  <SessionCard key={session.name} session={session} />
                ))}
              </div>
            </section>
          )}

          {/* Decisions */}
          {initiative.decisions.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Decisions ({initiative.decisions.length})
              </h2>
              <div className="space-y-4">
                {initiative.decisions.map((decision) => (
                  <DecisionCard key={decision.name} decision={decision} />
                ))}
              </div>
            </section>
          )}

          {/* Plans */}
          {initiative.plans.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Plans ({initiative.plans.length})
              </h2>
              <div className="space-y-4">
                {initiative.plans.map((plan) => (
                  <PlanCard key={plan.name} plan={plan} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// Move dropdown
interface MoveDropdownProps {
  currentState: "active" | "backlog" | "completed";
  onMove: (targetState: "active" | "backlog" | "completed") => void;
}

function MoveDropdown({ currentState, onMove }: MoveDropdownProps) {
  const states = ["active", "backlog", "completed"] as const;
  const availableStates = states.filter((s) => s !== currentState);

  return (
    <div className="relative group">
      <button className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
        Move to...
      </button>
      <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
        {availableStates.map((state) => (
          <button
            key={state}
            onClick={() => onMove(state)}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
          >
            {state.charAt(0).toUpperCase() + state.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

// Session card
interface SessionCardProps {
  session: { name: string; date: string; branch?: string; content: string };
}

function SessionCard({ session }: SessionCardProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="font-medium text-gray-900 dark:text-white">{session.date}</span>
        {session.branch && (
          <span className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded font-mono">
            {session.branch}
          </span>
        )}
      </div>
      <div className="text-sm">
        <MarkdownContent content={session.content} />
      </div>
    </div>
  );
}

// Decision card
interface DecisionCardProps {
  decision: { name: string; date: string; status: string; content: string };
}

function DecisionCard({ decision }: DecisionCardProps) {
  const statusColors: Record<string, string> = {
    proposed: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    accepted: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    superseded: "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300",
    deprecated: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="font-medium text-gray-900 dark:text-white">{decision.name}</span>
        <span className={`px-2 py-0.5 text-xs rounded ${statusColors[decision.status] || statusColors.proposed}`}>
          {decision.status}
        </span>
        <span className="text-sm text-gray-500">{decision.date}</span>
      </div>
      <div className="text-sm">
        <MarkdownContent content={decision.content} />
      </div>
    </div>
  );
}

// Plan card
interface PlanCardProps {
  plan: { name: string; content: string };
}

function PlanCard({ plan }: PlanCardProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="font-medium text-gray-900 dark:text-white mb-2">{plan.name}</div>
      <div className="text-sm">
        <MarkdownContent content={plan.content} />
      </div>
    </div>
  );
}

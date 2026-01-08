"use client";

import { useState, useEffect } from "react";
import { Initiative, FileTreeNode } from "@/core/types";
import { MarkdownContent } from "./MarkdownContent";
import { FileTree } from "./FileTree";
import { FileViewer } from "./FileViewer";

interface InitiativeViewProps {
  initiative: Initiative;
  onDelete: () => void;
  onMove: (targetState: "active" | "backlog" | "completed") => void;
  onRefresh: () => void;
}

type TabId = "overview" | "tracker" | "sessions" | "decisions" | "plans" | "files";

export function InitiativeView({ initiative, onDelete, onMove, onRefresh }: InitiativeViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Fetch file tree when Files tab is selected
  useEffect(() => {
    if (activeTab === "files" && fileTree.length === 0) {
      setLoadingFiles(true);
      fetch(`/api/initiatives/${initiative.state}/${initiative.name}/files`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setFileTree(data.data);
          }
        })
        .catch(console.error)
        .finally(() => setLoadingFiles(false));
    }
  }, [activeTab, initiative.state, initiative.name, fileTree.length]);

  const tabs: { id: TabId; label: string; count?: number; badge?: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "tracker", label: "Tracker", badge: initiative.tracker?.phase },
    { id: "sessions", label: "Sessions", count: initiative.sessions.length },
    { id: "decisions", label: "Decisions", count: initiative.decisions.length },
    { id: "plans", label: "Plans", count: initiative.plans.length },
    { id: "files", label: "Files" },
  ];
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

      {/* Tab Bar */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1.5 text-xs text-gray-400">({tab.count})</span>
              )}
              {tab.badge && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <MarkdownContent content={initiative.content} />
          )}

          {/* Tracker Tab */}
          {activeTab === "tracker" && (
            initiative.tracker ? (
              <div>
                {initiative.tracker.phase && (
                  <div className="mb-4 flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Phase:</span>
                    <span className="px-2 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                      {initiative.tracker.phase}
                    </span>
                    {initiative.tracker.updated && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        · Updated: {initiative.tracker.updated}
                      </span>
                    )}
                  </div>
                )}
                <MarkdownContent content={initiative.tracker.content} />
              </div>
            ) : (
              <EmptyState message="No TRACKER.md found. Create one to track progress across sessions." />
            )
          )}

          {/* Sessions Tab */}
          {activeTab === "sessions" && (
            initiative.sessions.length > 0 ? (
              <div className="space-y-4">
                {initiative.sessions.map((session) => (
                  <SessionCard key={session.name} session={session} />
                ))}
              </div>
            ) : (
              <EmptyState message="No sessions yet" />
            )
          )}

          {/* Decisions Tab */}
          {activeTab === "decisions" && (
            initiative.decisions.length > 0 ? (
              <div className="space-y-4">
                {initiative.decisions.map((decision) => (
                  <DecisionCard key={decision.name} decision={decision} />
                ))}
              </div>
            ) : (
              <EmptyState message="No decisions yet" />
            )
          )}

          {/* Plans Tab */}
          {activeTab === "plans" && (
            initiative.plans.length > 0 ? (
              <div className="space-y-4">
                {initiative.plans.map((plan) => (
                  <PlanCard key={plan.name} plan={plan} />
                ))}
              </div>
            ) : (
              <EmptyState message="No plans yet" />
            )
          )}
        </div>

        {/* Files Tab - Full width with two-column layout */}
        {activeTab === "files" && (
          <div className="h-full flex">
            {/* File Tree */}
            <div className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 overflow-auto">
              {loadingFiles ? (
                <div className="p-4 text-gray-500 dark:text-gray-400 animate-pulse">
                  Loading files...
                </div>
              ) : fileTree.length > 0 ? (
                <div className="py-2">
                  <FileTree
                    nodes={fileTree}
                    onSelect={setSelectedFilePath}
                    selectedPath={selectedFilePath ?? undefined}
                  />
                </div>
              ) : (
                <div className="p-4 text-gray-500 dark:text-gray-400">
                  No files found
                </div>
              )}
            </div>

            {/* File Viewer */}
            <div className="flex-1 overflow-auto">
              {selectedFilePath ? (
                <FileViewer
                  filePath={selectedFilePath}
                  initiativeState={initiative.state}
                  initiativeName={initiative.name}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                  Select a file to view
                </div>
              )}
            </div>
          </div>
        )}
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

// Empty state
function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
      {message}
    </div>
  );
}

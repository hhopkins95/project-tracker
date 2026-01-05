"use client";

import { WorkspaceTree, InitiativeSummary, TodoSummary, IdeaSummary } from "@/core/types";

interface SidebarProps {
  workspaceTree: WorkspaceTree | null;
  selectedItem: { type: string; name: string; state?: string } | null;
  onSelectInitiative: (summary: InitiativeSummary) => void;
  onSelectTodo: (summary: TodoSummary) => void;
  onSelectIdea: (summary: IdeaSummary) => void;
  onCreate: (type: "initiative" | "todo" | "idea") => void;
}

export function Sidebar({
  workspaceTree,
  selectedItem,
  onSelectInitiative,
  onSelectTodo,
  onSelectIdea,
  onCreate,
}: SidebarProps) {
  if (!workspaceTree) return null;

  const { initiatives, todos, ideas } = workspaceTree;

  return (
    <aside className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          Project Tracker
        </h1>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Active Initiatives */}
        <Section
          title="Active"
          count={initiatives.active.length}
          color="emerald"
          onAdd={() => onCreate("initiative")}
        >
          {initiatives.active.map((item) => (
            <InitiativeItem
              key={item.name}
              item={item}
              selected={selectedItem?.type === "initiative" && selectedItem?.name === item.name}
              onClick={() => onSelectInitiative(item)}
            />
          ))}
        </Section>

        {/* Backlog Initiatives */}
        <Section
          title="Backlog"
          count={initiatives.backlog.length}
          color="indigo"
        >
          {initiatives.backlog.map((item) => (
            <InitiativeItem
              key={item.name}
              item={item}
              selected={selectedItem?.type === "initiative" && selectedItem?.name === item.name}
              onClick={() => onSelectInitiative(item)}
            />
          ))}
        </Section>

        {/* Completed Initiatives */}
        <Section
          title="Completed"
          count={initiatives.completed.length}
          color="gray"
          collapsed
        >
          {initiatives.completed.map((item) => (
            <InitiativeItem
              key={item.name}
              item={item}
              selected={selectedItem?.type === "initiative" && selectedItem?.name === item.name}
              onClick={() => onSelectInitiative(item)}
            />
          ))}
        </Section>

        {/* Todos */}
        <Section
          title="Todos"
          count={todos.length}
          color="amber"
          onAdd={() => onCreate("todo")}
        >
          {todos.map((item) => (
            <TodoItem
              key={item.name}
              item={item}
              selected={selectedItem?.type === "todo" && selectedItem?.name === item.name}
              onClick={() => onSelectTodo(item)}
            />
          ))}
        </Section>

        {/* Ideas */}
        <Section
          title="Ideas"
          count={ideas.length}
          color="violet"
          onAdd={() => onCreate("idea")}
        >
          {ideas.map((item) => (
            <IdeaItem
              key={item.name}
              item={item}
              selected={selectedItem?.type === "idea" && selectedItem?.name === item.name}
              onClick={() => onSelectIdea(item)}
            />
          ))}
        </Section>
      </div>
    </aside>
  );
}

// Section component
interface SectionProps {
  title: string;
  count: number;
  color: "emerald" | "indigo" | "gray" | "amber" | "violet";
  collapsed?: boolean;
  onAdd?: () => void;
  children: React.ReactNode;
}

function Section({ title, count, color, collapsed, onAdd, children }: SectionProps) {
  const colorClasses = {
    emerald: "bg-emerald-500",
    indigo: "bg-indigo-500",
    gray: "bg-gray-500",
    amber: "bg-amber-500",
    violet: "bg-violet-500",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${colorClasses[color]}`} />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {title}
          </span>
          <span className="text-xs text-gray-400">({count})</span>
        </div>
        {onAdd && (
          <button
            onClick={onAdd}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            title={`Add ${title.toLowerCase()}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

// Initiative item
interface InitiativeItemProps {
  item: InitiativeSummary;
  selected: boolean;
  onClick: () => void;
}

function InitiativeItem({ item, selected, onClick }: InitiativeItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
        selected
          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
          : "hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
      }`}
    >
      <div className="font-medium truncate">{item.title}</div>
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        <span>{item.sessionCount} sessions</span>
        {item.latestSession && <span>· {item.latestSession}</span>}
      </div>
    </button>
  );
}

// Todo item
interface TodoItemProps {
  item: TodoSummary;
  selected: boolean;
  onClick: () => void;
}

function TodoItem({ item, selected, onClick }: TodoItemProps) {
  const priorityColors = {
    high: "text-red-500",
    medium: "text-yellow-500",
    low: "text-green-500",
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
        selected
          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
          : "hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
      }`}
    >
      <div className="flex items-center gap-2">
        {item.priority && (
          <span className={`text-xs ${priorityColors[item.priority]}`}>●</span>
        )}
        <span className="font-medium truncate">{item.title}</span>
      </div>
    </button>
  );
}

// Idea item
interface IdeaItemProps {
  item: IdeaSummary;
  selected: boolean;
  onClick: () => void;
}

function IdeaItem({ item, selected, onClick }: IdeaItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
        selected
          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
          : "hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
      }`}
    >
      <div className="font-medium truncate">{item.title}</div>
    </button>
  );
}

"use client";

interface EmptyStateProps {
  onCreate: (type: "initiative" | "todo" | "idea") => void;
}

export function EmptyState({ onCreate }: EmptyStateProps) {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Welcome to Project Tracker
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Select an item from the sidebar or create something new to get started.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => onCreate("initiative")}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            New Initiative
          </button>
          <button
            onClick={() => onCreate("todo")}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            New Todo
          </button>
          <button
            onClick={() => onCreate("idea")}
            className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
          >
            New Idea
          </button>
        </div>
      </div>
    </div>
  );
}

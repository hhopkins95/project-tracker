"use client";

import { Todo } from "@/core/types";
import { MarkdownContent } from "./MarkdownContent";

interface TodoViewProps {
  todo: Todo;
  onDelete: () => void;
}

export function TodoView({ todo, onDelete }: TodoViewProps) {
  const priorityColors = {
    high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-1 text-xs font-medium rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                Todo
              </span>
              {todo.frontmatter.priority && (
                <span className={`px-2 py-1 text-xs font-medium rounded ${priorityColors[todo.frontmatter.priority]}`}>
                  {todo.frontmatter.priority.charAt(0).toUpperCase() + todo.frontmatter.priority.slice(1)} Priority
                </span>
              )}
              <span className="text-sm text-gray-500">{todo.frontmatter.created}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {todo.frontmatter.title}
            </h1>
            {todo.frontmatter.tags && todo.frontmatter.tags.length > 0 && (
              <div className="flex gap-2 mt-2">
                {todo.frontmatter.tags.map((tag) => (
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
          <MarkdownContent content={todo.content} />
        </div>
      </div>
    </div>
  );
}

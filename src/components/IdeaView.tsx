"use client";

import { Idea } from "@/core/types";
import { MarkdownContent } from "./MarkdownContent";

interface IdeaViewProps {
  idea: Idea;
  onDelete: () => void;
}

export function IdeaView({ idea, onDelete }: IdeaViewProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-1 text-xs font-medium rounded bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                Idea
              </span>
              <span className="text-sm text-gray-500">{idea.frontmatter.created}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {idea.frontmatter.title}
            </h1>
            {idea.frontmatter.tags && idea.frontmatter.tags.length > 0 && (
              <div className="flex gap-2 mt-2">
                {idea.frontmatter.tags.map((tag) => (
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
              className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
              title="Promote this idea to an initiative"
            >
              Promote to Initiative
            </button>
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
          <MarkdownContent content={idea.content} />
        </div>
      </div>
    </div>
  );
}

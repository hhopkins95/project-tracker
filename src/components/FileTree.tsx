"use client";

import { useState } from "react";
import { FileTreeNode } from "@/core/types";

interface FileTreeProps {
  nodes: FileTreeNode[];
  onSelect: (path: string) => void;
  selectedPath?: string;
}

export function FileTree({ nodes, onSelect, selectedPath }: FileTreeProps) {
  return (
    <div className="text-sm">
      {nodes.map((node) => (
        <FileTreeItem
          key={node.path}
          node={node}
          onSelect={onSelect}
          selectedPath={selectedPath}
          depth={0}
        />
      ))}
    </div>
  );
}

interface FileTreeItemProps {
  node: FileTreeNode;
  onSelect: (path: string) => void;
  selectedPath?: string;
  depth: number;
}

function FileTreeItem({ node, onSelect, selectedPath, depth }: FileTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(depth < 2); // Auto-expand first 2 levels
  const isSelected = selectedPath === node.path;
  const isDirectory = node.type === "directory";

  const handleClick = () => {
    if (isDirectory) {
      setIsExpanded(!isExpanded);
    } else {
      onSelect(node.path);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={`w-full text-left px-2 py-1 rounded flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
          isSelected
            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
            : "text-gray-700 dark:text-gray-300"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {/* Icon */}
        {isDirectory ? (
          <span className="text-gray-400 dark:text-gray-500 w-4 text-center">
            {isExpanded ? "▼" : "▶"}
          </span>
        ) : (
          <span className="text-gray-400 dark:text-gray-500 w-4 text-center">
            {getFileIcon(node.name)}
          </span>
        )}

        {/* Name */}
        <span className={isDirectory ? "font-medium" : ""}>
          {node.name}
        </span>
      </button>

      {/* Children */}
      {isDirectory && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.path}
              node={child}
              onSelect={onSelect}
              selectedPath={selectedPath}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function getFileIcon(filename: string): string {
  if (filename.endsWith(".md")) return "📄";
  if (filename.endsWith(".json")) return "📋";
  if (filename.endsWith(".ts") || filename.endsWith(".tsx")) return "📜";
  if (filename.endsWith(".js") || filename.endsWith(".jsx")) return "📜";
  return "📄";
}

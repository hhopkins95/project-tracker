"use client";

import { useEffect, useState } from "react";
import { MarkdownContent } from "./MarkdownContent";
import { InitiativeState } from "@/core/types";

interface FileViewerProps {
  filePath: string;
  initiativeState: InitiativeState;
  initiativeName: string;
}

interface FileData {
  content: string;
  name: string;
  path: string;
}

export function FileViewer({ filePath, initiativeState, initiativeName }: FileViewerProps) {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFile() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/initiatives/${initiativeState}/${initiativeName}/file?path=${encodeURIComponent(filePath)}`
        );
        const data = await response.json();

        if (!data.success) {
          setError(data.error || "Failed to load file");
          setFileData(null);
        } else {
          setFileData(data.data);
        }
      } catch (err) {
        setError("Failed to fetch file");
        setFileData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchFile();
  }, [filePath, initiativeState, initiativeName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (!fileData) {
    return null;
  }

  const isMarkdown = fileData.name.endsWith(".md");
  const isJson = fileData.name.endsWith(".json");

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {fileData.path}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {isMarkdown ? (
          <MarkdownContent content={fileData.content} />
        ) : (
          <pre className={`text-sm whitespace-pre-wrap break-words ${
            isJson ? "text-green-700 dark:text-green-400" : "text-gray-700 dark:text-gray-300"
          }`}>
            {fileData.content}
          </pre>
        )}
      </div>
    </div>
  );
}

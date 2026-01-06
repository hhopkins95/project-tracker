#!/usr/bin/env bun

import { readdir, readFile, stat } from "node:fs/promises";
import path, { join } from "node:path";

interface Initiative {
  name: string;
  title?: string;
}

interface Frontmatter {
  title?: string;
  [key: string]: unknown;
}

/**
 * Parse YAML frontmatter from markdown content
 */
function parseFrontmatter(content: string): Frontmatter | null {
  if (!content.startsWith("---")) {
    return null;
  }

  const endIndex = content.indexOf("---", 3);
  if (endIndex === -1) {
    return null;
  }

  const yamlBlock = content.slice(3, endIndex).trim();
  const frontmatter: Frontmatter = {};

  for (const line of yamlBlock.split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value: string = line.slice(colonIndex + 1).trim();

    // Remove quotes from strings
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    frontmatter[key] = value;
  }

  return frontmatter;
}

/**
 * Count files matching a pattern in a directory
 */
async function countMarkdownFiles(dir: string): Promise<number> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries.filter(e => e.isFile() && e.name.endsWith(".md")).length;
  } catch {
    return 0;
  }
}

/**
 * Get initiative directories from a parent folder
 */
async function getInitiatives(dir: string): Promise<Initiative[]> {
  const initiatives: Initiative[] = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const initFile = join(dir, entry.name, "INITIATIVE.md");
      let title: string | undefined;

      try {
        const content = await readFile(initFile, "utf-8");
        const frontmatter = parseFrontmatter(content);
        title = frontmatter?.title as string | undefined;
      } catch {
        // No INITIATIVE.md or can't read it
      }

      initiatives.push({ name: entry.name, title });
    }
  } catch {
    // Directory doesn't exist
  }

  return initiatives;
}

/**
 * Check if a path exists and is a directory
 */
async function isDirectory(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Main entry point
 */
async function main() {
  let workspacePath = process.env.PROJECT_TRACKER_WORKSPACE;

  // Silent exit if not configured
  if (!workspacePath) {
    process.exit(0);
  }


  workspacePath = path.resolve(process.cwd(), workspacePath);



  // Silent exit if workspace doesn't exist
  if (!(await isDirectory(workspacePath))) {
    process.exit(0);
  }

  let context = "## Project Tracker Workspace\n\n";

  // List active initiatives
  const activeDir = join(workspacePath, "initiatives", "active");
  const activeInitiatives = await getInitiatives(activeDir);

  if (activeInitiatives.length > 0) {
    context += `**Active Initiatives (${activeInitiatives.length}):**\n`;
    for (const init of activeInitiatives) {
      if (init.title) {
        context += `- ${init.title} (\`${init.name}\`)\n`;
      } else {
        context += `- \`${init.name}\`\n`;
      }
    }
    context += "\n";
  }

  // Count backlog
  const backlogDir = join(workspacePath, "initiatives", "backlog");
  const backlogInitiatives = await getInitiatives(backlogDir);
  if (backlogInitiatives.length > 0) {
    context += `**Backlog:** ${backlogInitiatives.length} initiative(s)\n`;
  }

  // Count todos
  const todosDir = join(workspacePath, "todos");
  const todoCount = await countMarkdownFiles(todosDir);
  if (todoCount > 0) {
    context += `**Todos:** ${todoCount}\n`;
  }

  // Count ideas
  const ideasDir = join(workspacePath, "ideas");
  const ideaCount = await countMarkdownFiles(ideasDir);
  if (ideaCount > 0) {
    context += `**Ideas:** ${ideaCount}\n`;
  }

  context += "\nUse `/new-initiative`, `/new-todo`, `/new-idea`, `/log-session`, or `/record-decision` to manage.";

  // Output proper hook JSON format
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: context
    }
  }));
}

main().catch(() => process.exit(1));

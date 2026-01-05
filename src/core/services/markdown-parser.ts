/**
 * Markdown parsing utilities using gray-matter for frontmatter extraction.
 */

import matter from "gray-matter";

export interface ParsedMarkdown<T = Record<string, unknown>> {
  frontmatter: T;
  content: string;
}

/**
 * Parse a markdown string and extract YAML frontmatter.
 * Returns both the frontmatter object and the remaining content.
 */
export function parseMarkdown<T = Record<string, unknown>>(
  markdown: string
): ParsedMarkdown<T> {
  const { data, content } = matter(markdown);
  return {
    frontmatter: data as T,
    content: content.trim(),
  };
}

/**
 * Create a markdown string with YAML frontmatter.
 */
export function createMarkdown<T extends Record<string, unknown>>(
  frontmatter: T,
  content: string
): string {
  return matter.stringify(content, frontmatter);
}

/**
 * Update frontmatter in an existing markdown string.
 * Preserves the content, only updates the frontmatter.
 */
export function updateFrontmatter<T extends Record<string, unknown>>(
  markdown: string,
  updates: Partial<T>
): string {
  const { frontmatter, content } = parseMarkdown<T>(markdown);
  const newFrontmatter = { ...frontmatter, ...updates };
  return createMarkdown(newFrontmatter, content);
}

/**
 * Extract a specific section from markdown content by heading.
 * Returns the content under the heading until the next heading of same or higher level.
 */
export function extractSection(
  markdown: string,
  heading: string,
  level: number = 2
): string | null {
  const headingPrefix = "#".repeat(level);
  const regex = new RegExp(
    `^${headingPrefix}\\s+${escapeRegex(heading)}\\s*$([\\s\\S]*?)(?=^#{1,${level}}\\s|$)`,
    "m"
  );
  const match = markdown.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Parse a markdown list into an array of strings.
 * Handles both ordered and unordered lists.
 */
export function parseList(markdown: string): string[] {
  const lines = markdown.split("\n");
  const items: string[] = [];

  for (const line of lines) {
    // Match unordered lists (-, *, +) and ordered lists (1., 2., etc.)
    const match = line.match(/^\s*(?:[-*+]|\d+\.)\s+(.+)$/);
    if (match) {
      items.push(match[1].trim());
    }
  }

  return items;
}

/**
 * Parse checkbox items from markdown (- [ ] or - [x]).
 * Returns array of { text, checked } objects.
 */
export function parseCheckboxes(
  markdown: string
): Array<{ text: string; checked: boolean }> {
  const lines = markdown.split("\n");
  const items: Array<{ text: string; checked: boolean }> = [];

  for (const line of lines) {
    const match = line.match(/^\s*[-*+]\s+\[([ xX])\]\s+(.+)$/);
    if (match) {
      items.push({
        checked: match[1].toLowerCase() === "x",
        text: match[2].trim(),
      });
    }
  }

  return items;
}

/**
 * Get the current date in YYYY-MM-DD format.
 */
export function getCurrentDate(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

/**
 * Escape special regex characters in a string.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Convert a string to kebab-case for use in filenames.
 */
export function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Parse a date from various formats into YYYY-MM-DD.
 */
export function normalizeDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return getCurrentDate();
  }
  return date.toISOString().split("T")[0];
}

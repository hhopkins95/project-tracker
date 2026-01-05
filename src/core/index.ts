/**
 * Core library exports for Project Tracker.
 * Used by both the web app and the Claude Code plugin.
 */

// Types
export * from "./types";

// Services
export { WorkspaceService } from "./services/workspace-service";
export {
  FileWatcher,
  getFileWatcher,
  stopFileWatcher,
  type FileWatcherOptions,
} from "./services/file-watcher";
export {
  parseMarkdown,
  createMarkdown,
  updateFrontmatter,
  extractSection,
  parseList,
  parseCheckboxes,
  getCurrentDate,
  toKebabCase,
  normalizeDate,
  type ParsedMarkdown,
} from "./services/markdown-parser";

// Templates
export * from "./templates";

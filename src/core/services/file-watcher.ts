/**
 * File watcher service using chokidar for real-time workspace updates.
 * Emits events when files in the workspace change.
 */

import * as chokidar from "chokidar";
import * as path from "path";
import { EventEmitter } from "events";
import { FileChangeEvent, FileEventType, WorkspaceArea } from "../types";

export interface FileWatcherOptions {
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Whether to emit events for initial files */
  ignoreInitial?: boolean;
}

export class FileWatcher extends EventEmitter {
  private workspacePath: string;
  private watcher: chokidar.FSWatcher | null = null;
  private options: Required<FileWatcherOptions>;

  constructor(workspacePath: string, options: FileWatcherOptions = {}) {
    super();
    this.workspacePath = workspacePath;
    this.options = {
      debounceMs: options.debounceMs ?? 100,
      ignoreInitial: options.ignoreInitial ?? true,
    };
  }

  /**
   * Start watching the workspace for file changes.
   */
  start(): void {
    if (this.watcher) {
      return; // Already watching
    }

    this.watcher = chokidar.watch(this.workspacePath, {
      ignored: [
        /(^|[\/\\])\../, // Ignore hidden files
        /node_modules/,
      ],
      persistent: true,
      ignoreInitial: this.options.ignoreInitial,
      awaitWriteFinish: {
        stabilityThreshold: this.options.debounceMs,
        pollInterval: 50,
      },
    });

    this.watcher
      .on("add", (filePath) => this.handleEvent("add", filePath))
      .on("change", (filePath) => this.handleEvent("change", filePath))
      .on("unlink", (filePath) => this.handleEvent("unlink", filePath))
      .on("error", (error) => this.emit("error", error));
  }

  /**
   * Stop watching the workspace.
   */
  async stop(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }
  }

  /**
   * Handle a file system event and emit a typed FileChangeEvent.
   */
  private handleEvent(type: FileEventType, absolutePath: string): void {
    // Only care about markdown files
    if (!absolutePath.endsWith(".md")) return;

    const relativePath = path.relative(this.workspacePath, absolutePath);
    const area = this.determineArea(relativePath);

    if (!area) return; // File is not in a tracked area

    const event: FileChangeEvent = {
      area,
      type,
      path: absolutePath,
      relativePath,
    };

    this.emit("file-change", event);
  }

  /**
   * Determine which workspace area a file belongs to based on its path.
   */
  private determineArea(relativePath: string): WorkspaceArea | null {
    const parts = relativePath.split(path.sep);

    if (parts[0] === "initiatives") {
      // Check for nested folders within initiatives
      if (parts.length >= 4) {
        const folder = parts[3];
        if (folder === "sessions") return "sessions";
        if (folder === "decisions") return "decisions";
        if (folder === "plans") return "plans";
      }
      return "initiatives";
    }

    if (parts[0] === "todos") return "todos";
    if (parts[0] === "ideas") return "ideas";

    return null;
  }

  /**
   * Check if the watcher is currently active.
   */
  isWatching(): boolean {
    return this.watcher !== null;
  }
}

/**
 * Create a singleton file watcher instance.
 * Useful for server-side usage where we want one watcher per workspace.
 */
let singletonWatcher: FileWatcher | null = null;

export function getFileWatcher(
  workspacePath: string,
  options?: FileWatcherOptions
): FileWatcher {
  if (!singletonWatcher || singletonWatcher["workspacePath"] !== workspacePath) {
    if (singletonWatcher) {
      singletonWatcher.stop();
    }
    singletonWatcher = new FileWatcher(workspacePath, options);
  }
  return singletonWatcher;
}

export function stopFileWatcher(): Promise<void> {
  if (singletonWatcher) {
    const watcher = singletonWatcher;
    singletonWatcher = null;
    return watcher.stop();
  }
  return Promise.resolve();
}

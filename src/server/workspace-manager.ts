/**
 * Server-side workspace manager.
 * Provides a singleton WorkspaceService instance based on environment configuration.
 */

import { WorkspaceService } from "@/core";

let workspaceService: WorkspaceService | null = null;

/**
 * Get the workspace path from environment variables.
 */
export function getWorkspacePath(): string {
  const workspacePath = process.env.PROJECT_TRACKER_WORKSPACE;
  if (!workspacePath) {
    throw new Error(
      "PROJECT_TRACKER_WORKSPACE environment variable is not set"
    );
  }
  return workspacePath;
}

/**
 * Get the singleton WorkspaceService instance.
 */
export function getWorkspaceService(): WorkspaceService {
  if (!workspaceService) {
    const workspacePath = getWorkspacePath();
    workspaceService = new WorkspaceService(workspacePath);
  }
  return workspaceService;
}

/**
 * Reset the workspace service (useful for testing or when workspace path changes).
 */
export function resetWorkspaceService(): void {
  workspaceService = null;
}

/**
 * Get server configuration.
 */
export function getServerConfig() {
  return {
    workspacePath: getWorkspacePath(),
    projectRoot: process.env.PROJECT_TRACKER_PROJECT_ROOT,
  };
}

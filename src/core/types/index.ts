/**
 * Core types for the Project Tracker system.
 * These types define the data model for initiatives, todos, ideas, and sessions.
 */

// =============================================================================
// Initiative Types
// =============================================================================

export type InitiativeState = "active" | "backlog" | "completed";

export interface InitiativeFrontmatter {
  title: string;
  created: string; // YYYY-MM-DD format
  status: InitiativeState;
  tags?: string[];
  [key: string]: unknown;
}

export interface Session {
  name: string;
  path: string;
  date: string; // YYYY-MM-DD format
  branch?: string;
  content: string;
}

export interface Decision {
  name: string;
  path: string;
  date: string;
  status: "proposed" | "accepted" | "superseded" | "deprecated";
  content: string;
}

export interface Plan {
  name: string;
  path: string;
  content: string;
}

export interface Initiative {
  name: string;
  path: string; // Full path to initiative folder
  state: InitiativeState;
  frontmatter: InitiativeFrontmatter;
  content: string; // Markdown content from INITIATIVE.md
  sessions: Session[];
  decisions: Decision[];
  plans: Plan[];
}

// Summary version for list views (without full content)
export interface InitiativeSummary {
  name: string;
  path: string;
  state: InitiativeState;
  title: string;
  created: string;
  sessionCount: number;
  latestSession?: string; // Date of most recent session
  tags?: string[];
}

// =============================================================================
// Todo Types
// =============================================================================

export interface TodoFrontmatter {
  title: string;
  created: string;
  priority?: "low" | "medium" | "high";
  tags?: string[];
  [key: string]: unknown;
}

export interface Todo {
  name: string;
  path: string;
  frontmatter: TodoFrontmatter;
  content: string;
}

export interface TodoSummary {
  name: string;
  path: string;
  title: string;
  created: string;
  priority?: "low" | "medium" | "high";
  tags?: string[];
}

// =============================================================================
// Idea Types
// =============================================================================

export interface IdeaFrontmatter {
  title: string;
  created: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface Idea {
  name: string;
  path: string;
  frontmatter: IdeaFrontmatter;
  content: string;
}

export interface IdeaSummary {
  name: string;
  path: string;
  title: string;
  created: string;
  tags?: string[];
}

// =============================================================================
// Workspace Types
// =============================================================================

export interface WorkspaceConfig {
  workspacePath: string;
  projectRoot?: string;
}

export interface WorkspaceTree {
  initiatives: {
    active: InitiativeSummary[];
    backlog: InitiativeSummary[];
    completed: InitiativeSummary[];
  };
  todos: TodoSummary[];
  ideas: IdeaSummary[];
}

// Generic file tree node for raw navigation
export interface FileTreeNode {
  type: "file" | "directory";
  name: string;
  path: string; // Relative path from workspace root
  children?: FileTreeNode[];
}

// =============================================================================
// Event Types (for real-time updates)
// =============================================================================

export type FileEventType = "add" | "change" | "unlink";

export type WorkspaceArea =
  | "initiatives"
  | "todos"
  | "ideas"
  | "sessions"
  | "decisions"
  | "plans";

export interface FileChangeEvent {
  area: WorkspaceArea;
  type: FileEventType;
  path: string; // Absolute path
  relativePath: string; // Relative to workspace
}

// =============================================================================
// API Types
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Create/Update payloads
export interface CreateInitiativePayload {
  name: string;
  title: string;
  goal: string;
  scope?: {
    inScope: string[];
    outOfScope: string[];
  };
  completionCriteria?: string[];
  state?: InitiativeState; // Defaults to 'backlog'
  tags?: string[];
}

export interface UpdateInitiativePayload {
  title?: string;
  content?: string;
  tags?: string[];
}

export interface MoveInitiativePayload {
  targetState: InitiativeState;
}

export interface CreateTodoPayload {
  name: string;
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
  tags?: string[];
}

export interface CreateIdeaPayload {
  name: string;
  title: string;
  description: string;
  valueProposition?: string;
  tags?: string[];
}

export interface CreateSessionPayload {
  initiativeName: string;
  initiativeState: InitiativeState;
  description: string;
  context?: string;
  completed?: string[];
  decisions?: string[];
  blockers?: string[];
  nextSteps?: string[];
  filesChanged?: string[];
  branch?: string;
}

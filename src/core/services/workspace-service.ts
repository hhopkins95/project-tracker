/**
 * Workspace service for managing initiatives, todos, and ideas.
 * Handles all CRUD operations for the project tracker workspace.
 */

import * as fs from "fs/promises";
import * as path from "path";
import {
  Initiative,
  InitiativeFrontmatter,
  InitiativeState,
  InitiativeSummary,
  Todo,
  TodoFrontmatter,
  TodoSummary,
  Idea,
  IdeaFrontmatter,
  IdeaSummary,
  Session,
  Decision,
  Plan,
  WorkspaceTree,
  FileTreeNode,
  CreateInitiativePayload,
  CreateTodoPayload,
  CreateIdeaPayload,
  CreateSessionPayload,
  MoveInitiativePayload,
} from "../types";
import {
  parseMarkdown,
  createMarkdown,
  getCurrentDate,
  toKebabCase,
} from "./markdown-parser";

export class WorkspaceService {
  private workspacePath: string;

  constructor(workspacePath: string) {
    this.workspacePath = workspacePath;
  }

  // ===========================================================================
  // Workspace Initialization
  // ===========================================================================

  /**
   * Initialize the workspace directory structure.
   * Creates all required folders if they don't exist.
   */
  async initializeWorkspace(): Promise<void> {
    const dirs = [
      "initiatives/active",
      "initiatives/backlog",
      "initiatives/completed",
      "todos",
      "ideas",
    ];

    for (const dir of dirs) {
      const fullPath = path.join(this.workspacePath, dir);
      await fs.mkdir(fullPath, { recursive: true });
    }
  }

  /**
   * Check if the workspace exists and has the expected structure.
   */
  async isValidWorkspace(): Promise<boolean> {
    try {
      const requiredDirs = ["initiatives", "todos", "ideas"];
      for (const dir of requiredDirs) {
        const stat = await fs.stat(path.join(this.workspacePath, dir));
        if (!stat.isDirectory()) return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  // ===========================================================================
  // Workspace Tree
  // ===========================================================================

  /**
   * Get the full workspace tree with all initiatives, todos, and ideas.
   */
  async getWorkspaceTree(): Promise<WorkspaceTree> {
    const [active, backlog, completed, todos, ideas] = await Promise.all([
      this.listInitiatives("active"),
      this.listInitiatives("backlog"),
      this.listInitiatives("completed"),
      this.listTodos(),
      this.listIdeas(),
    ]);

    return {
      initiatives: { active, backlog, completed },
      todos,
      ideas,
    };
  }

  /**
   * Get raw file tree for a directory.
   */
  async getFileTree(relativePath: string = ""): Promise<FileTreeNode[]> {
    const fullPath = path.join(this.workspacePath, relativePath);
    const entries = await fs.readdir(fullPath, { withFileTypes: true });

    const nodes: FileTreeNode[] = [];
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue; // Skip hidden files

      const nodePath = path.join(relativePath, entry.name);
      const node: FileTreeNode = {
        type: entry.isDirectory() ? "directory" : "file",
        name: entry.name,
        path: nodePath,
      };

      if (entry.isDirectory()) {
        node.children = await this.getFileTree(nodePath);
      }

      nodes.push(node);
    }

    return nodes.sort((a, b) => {
      // Directories first, then alphabetical
      if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }

  // ===========================================================================
  // Initiatives
  // ===========================================================================

  /**
   * List all initiatives in a given state.
   */
  async listInitiatives(state: InitiativeState): Promise<InitiativeSummary[]> {
    const dirPath = path.join(this.workspacePath, "initiatives", state);

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const summaries: InitiativeSummary[] = [];

      for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith(".")) continue;

        const initiativePath = path.join(dirPath, entry.name);
        const summary = await this.getInitiativeSummary(
          initiativePath,
          entry.name,
          state
        );
        if (summary) summaries.push(summary);
      }

      // Sort by most recently created
      return summaries.sort(
        (a, b) =>
          new Date(b.created).getTime() - new Date(a.created).getTime()
      );
    } catch {
      return [];
    }
  }

  /**
   * Get a summary of an initiative (without full content).
   */
  private async getInitiativeSummary(
    initiativePath: string,
    name: string,
    state: InitiativeState
  ): Promise<InitiativeSummary | null> {
    try {
      const initiativeFile = path.join(initiativePath, "INITIATIVE.md");
      const content = await fs.readFile(initiativeFile, "utf-8");
      const { frontmatter } = parseMarkdown<InitiativeFrontmatter>(content);

      // Count sessions
      const sessionsPath = path.join(initiativePath, "sessions");
      let sessionCount = 0;
      let latestSession: string | undefined;

      try {
        const sessions = await fs.readdir(sessionsPath);
        const mdSessions = sessions.filter((s) => s.endsWith(".md"));
        sessionCount = mdSessions.length;

        // Get latest session date from filename (YYYY-MM-DD-*.md)
        if (mdSessions.length > 0) {
          const sorted = mdSessions.sort().reverse();
          const match = sorted[0].match(/^(\d{4}-\d{2}-\d{2})/);
          if (match) latestSession = match[1];
        }
      } catch {
        // Sessions folder might not exist
      }

      return {
        name,
        path: initiativePath,
        state,
        title: frontmatter.title || name,
        created: frontmatter.created || getCurrentDate(),
        sessionCount,
        latestSession,
        tags: frontmatter.tags,
      };
    } catch {
      return null;
    }
  }

  /**
   * Get a full initiative with all details.
   */
  async getInitiative(
    state: InitiativeState,
    name: string
  ): Promise<Initiative | null> {
    const initiativePath = path.join(
      this.workspacePath,
      "initiatives",
      state,
      name
    );

    try {
      // Read main file
      const initiativeFile = path.join(initiativePath, "INITIATIVE.md");
      const content = await fs.readFile(initiativeFile, "utf-8");
      const { frontmatter, content: markdownContent } =
        parseMarkdown<InitiativeFrontmatter>(content);

      // Read sessions, decisions, plans
      const [sessions, decisions, plans] = await Promise.all([
        this.readSessions(path.join(initiativePath, "sessions")),
        this.readDecisions(path.join(initiativePath, "decisions")),
        this.readPlans(path.join(initiativePath, "plans")),
      ]);

      return {
        name,
        path: initiativePath,
        state,
        frontmatter,
        content: markdownContent,
        sessions,
        decisions,
        plans,
      };
    } catch {
      return null;
    }
  }

  /**
   * Create a new initiative.
   */
  async createInitiative(payload: CreateInitiativePayload): Promise<Initiative> {
    const kebabName = toKebabCase(payload.name);
    const state = payload.state || "backlog";
    const initiativePath = path.join(
      this.workspacePath,
      "initiatives",
      state,
      kebabName
    );

    // Create directory structure
    await fs.mkdir(path.join(initiativePath, "sessions"), { recursive: true });

    // Create INITIATIVE.md
    const frontmatter: InitiativeFrontmatter = {
      title: payload.title,
      created: getCurrentDate(),
      status: state,
      tags: payload.tags,
    };

    const content = this.generateInitiativeContent(payload);
    const markdown = createMarkdown(frontmatter, content);

    await fs.writeFile(path.join(initiativePath, "INITIATIVE.md"), markdown);

    return (await this.getInitiative(state, kebabName))!;
  }

  /**
   * Move an initiative to a different state.
   */
  async moveInitiative(
    currentState: InitiativeState,
    name: string,
    payload: MoveInitiativePayload
  ): Promise<Initiative> {
    const oldPath = path.join(
      this.workspacePath,
      "initiatives",
      currentState,
      name
    );
    const newPath = path.join(
      this.workspacePath,
      "initiatives",
      payload.targetState,
      name
    );

    await fs.rename(oldPath, newPath);

    // Update frontmatter status
    const initiativeFile = path.join(newPath, "INITIATIVE.md");
    const content = await fs.readFile(initiativeFile, "utf-8");
    const { frontmatter, content: markdownContent } =
      parseMarkdown<InitiativeFrontmatter>(content);

    frontmatter.status = payload.targetState;
    const updatedMarkdown = createMarkdown(frontmatter, markdownContent);
    await fs.writeFile(initiativeFile, updatedMarkdown);

    return (await this.getInitiative(payload.targetState, name))!;
  }

  /**
   * Delete an initiative.
   */
  async deleteInitiative(
    state: InitiativeState,
    name: string
  ): Promise<void> {
    const initiativePath = path.join(
      this.workspacePath,
      "initiatives",
      state,
      name
    );
    await fs.rm(initiativePath, { recursive: true });
  }

  private generateInitiativeContent(payload: CreateInitiativePayload): string {
    let content = `# ${payload.title}\n\n`;
    content += `## Goal\n\n${payload.goal}\n\n`;

    if (payload.scope) {
      content += `## Scope\n\n`;
      content += `### In Scope\n\n`;
      for (const item of payload.scope.inScope) {
        content += `- ${item}\n`;
      }
      content += `\n### Out of Scope\n\n`;
      for (const item of payload.scope.outOfScope) {
        content += `- ${item}\n`;
      }
      content += "\n";
    }

    if (payload.completionCriteria && payload.completionCriteria.length > 0) {
      content += `## Completion Criteria\n\n`;
      for (const criteria of payload.completionCriteria) {
        content += `- [ ] ${criteria}\n`;
      }
      content += "\n";
    }

    content += `## Current Status\n\n*No updates yet*\n\n`;
    content += `## Blockers\n\n*None*\n`;

    return content;
  }

  // ===========================================================================
  // Sessions
  // ===========================================================================

  private async readSessions(sessionsPath: string): Promise<Session[]> {
    try {
      const entries = await fs.readdir(sessionsPath);
      const sessions: Session[] = [];

      for (const entry of entries) {
        if (!entry.endsWith(".md")) continue;

        const filePath = path.join(sessionsPath, entry);
        const content = await fs.readFile(filePath, "utf-8");
        const { frontmatter, content: markdownContent } = parseMarkdown<{
          date?: string;
          branch?: string;
        }>(content);

        // Extract date from filename or frontmatter
        const dateMatch = entry.match(/^(\d{4}-\d{2}-\d{2})/);
        const date = frontmatter.date || dateMatch?.[1] || getCurrentDate();

        sessions.push({
          name: entry.replace(".md", ""),
          path: filePath,
          date,
          branch: frontmatter.branch,
          content: markdownContent,
        });
      }

      // Sort by date, most recent first
      return sessions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch {
      return [];
    }
  }

  /**
   * Create a new session document.
   */
  async createSession(payload: CreateSessionPayload): Promise<Session> {
    const initiativePath = path.join(
      this.workspacePath,
      "initiatives",
      payload.initiativeState,
      payload.initiativeName
    );
    const sessionsPath = path.join(initiativePath, "sessions");

    await fs.mkdir(sessionsPath, { recursive: true });

    const date = getCurrentDate();
    const filename = `${date}-${toKebabCase(payload.description)}.md`;
    const filePath = path.join(sessionsPath, filename);

    const frontmatter: { date: string; branch?: string } = { date };
    if (payload.branch) frontmatter.branch = payload.branch;

    const content = this.generateSessionContent(payload);
    const markdown = createMarkdown(frontmatter, content);

    await fs.writeFile(filePath, markdown);

    return {
      name: filename.replace(".md", ""),
      path: filePath,
      date,
      branch: payload.branch,
      content,
    };
  }

  private generateSessionContent(payload: CreateSessionPayload): string {
    let content = `# ${payload.description}\n\n`;

    if (payload.context) {
      content += `## Context\n\n${payload.context}\n\n`;
    }

    if (payload.completed && payload.completed.length > 0) {
      content += `## Completed\n\n`;
      for (const item of payload.completed) {
        content += `- ${item}\n`;
      }
      content += "\n";
    }

    if (payload.decisions && payload.decisions.length > 0) {
      content += `## Decisions Made\n\n`;
      for (const item of payload.decisions) {
        content += `- ${item}\n`;
      }
      content += "\n";
    }

    if (payload.blockers && payload.blockers.length > 0) {
      content += `## Blockers / Open Questions\n\n`;
      for (const item of payload.blockers) {
        content += `- ${item}\n`;
      }
      content += "\n";
    }

    if (payload.nextSteps && payload.nextSteps.length > 0) {
      content += `## Next Session\n\n`;
      for (const item of payload.nextSteps) {
        content += `- [ ] ${item}\n`;
      }
      content += "\n";
    }

    if (payload.filesChanged && payload.filesChanged.length > 0) {
      content += `## Files Changed\n\n`;
      for (const file of payload.filesChanged) {
        content += `- \`${file}\`\n`;
      }
      content += "\n";
    }

    return content;
  }

  // ===========================================================================
  // Decisions & Plans
  // ===========================================================================

  private async readDecisions(decisionsPath: string): Promise<Decision[]> {
    try {
      const entries = await fs.readdir(decisionsPath);
      const decisions: Decision[] = [];

      for (const entry of entries) {
        if (!entry.endsWith(".md")) continue;

        const filePath = path.join(decisionsPath, entry);
        const content = await fs.readFile(filePath, "utf-8");
        const { frontmatter, content: markdownContent } = parseMarkdown<{
          date?: string;
          status?: Decision["status"];
        }>(content);

        decisions.push({
          name: entry.replace(".md", ""),
          path: filePath,
          date: frontmatter.date || getCurrentDate(),
          status: frontmatter.status || "proposed",
          content: markdownContent,
        });
      }

      return decisions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch {
      return [];
    }
  }

  private async readPlans(plansPath: string): Promise<Plan[]> {
    try {
      const entries = await fs.readdir(plansPath);
      const plans: Plan[] = [];

      for (const entry of entries) {
        if (!entry.endsWith(".md")) continue;

        const filePath = path.join(plansPath, entry);
        const content = await fs.readFile(filePath, "utf-8");

        plans.push({
          name: entry.replace(".md", ""),
          path: filePath,
          content,
        });
      }

      return plans.sort((a, b) => a.name.localeCompare(b.name));
    } catch {
      return [];
    }
  }

  // ===========================================================================
  // Todos
  // ===========================================================================

  /**
   * List all todos.
   */
  async listTodos(): Promise<TodoSummary[]> {
    const todosPath = path.join(this.workspacePath, "todos");

    try {
      const entries = await fs.readdir(todosPath);
      const summaries: TodoSummary[] = [];

      for (const entry of entries) {
        if (!entry.endsWith(".md")) continue;

        const filePath = path.join(todosPath, entry);
        const content = await fs.readFile(filePath, "utf-8");
        const { frontmatter } = parseMarkdown<TodoFrontmatter>(content);

        summaries.push({
          name: entry.replace(".md", ""),
          path: filePath,
          title: frontmatter.title || entry.replace(".md", ""),
          created: frontmatter.created || getCurrentDate(),
          priority: frontmatter.priority,
          tags: frontmatter.tags,
        });
      }

      // Sort by priority (high first), then by date
      return summaries.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2, undefined: 3 };
        const aPriority = priorityOrder[a.priority || "undefined"];
        const bPriority = priorityOrder[b.priority || "undefined"];
        if (aPriority !== bPriority) return aPriority - bPriority;
        return (
          new Date(b.created).getTime() - new Date(a.created).getTime()
        );
      });
    } catch {
      return [];
    }
  }

  /**
   * Get a full todo.
   */
  async getTodo(name: string): Promise<Todo | null> {
    const filePath = path.join(this.workspacePath, "todos", `${name}.md`);

    try {
      const content = await fs.readFile(filePath, "utf-8");
      const { frontmatter, content: markdownContent } =
        parseMarkdown<TodoFrontmatter>(content);

      return {
        name,
        path: filePath,
        frontmatter,
        content: markdownContent,
      };
    } catch {
      return null;
    }
  }

  /**
   * Create a new todo.
   */
  async createTodo(payload: CreateTodoPayload): Promise<Todo> {
    const kebabName = toKebabCase(payload.name);
    const filePath = path.join(this.workspacePath, "todos", `${kebabName}.md`);

    const frontmatter: TodoFrontmatter = {
      title: payload.title,
      created: getCurrentDate(),
      priority: payload.priority,
      tags: payload.tags,
    };

    const content = `# ${payload.title}\n\n${payload.description}\n`;
    const markdown = createMarkdown(frontmatter, content);

    await fs.writeFile(filePath, markdown);

    return (await this.getTodo(kebabName))!;
  }

  /**
   * Delete a todo.
   */
  async deleteTodo(name: string): Promise<void> {
    const filePath = path.join(this.workspacePath, "todos", `${name}.md`);
    await fs.unlink(filePath);
  }

  // ===========================================================================
  // Ideas
  // ===========================================================================

  /**
   * List all ideas.
   */
  async listIdeas(): Promise<IdeaSummary[]> {
    const ideasPath = path.join(this.workspacePath, "ideas");

    try {
      const entries = await fs.readdir(ideasPath);
      const summaries: IdeaSummary[] = [];

      for (const entry of entries) {
        if (!entry.endsWith(".md")) continue;

        const filePath = path.join(ideasPath, entry);
        const content = await fs.readFile(filePath, "utf-8");
        const { frontmatter } = parseMarkdown<IdeaFrontmatter>(content);

        summaries.push({
          name: entry.replace(".md", ""),
          path: filePath,
          title: frontmatter.title || entry.replace(".md", ""),
          created: frontmatter.created || getCurrentDate(),
          tags: frontmatter.tags,
        });
      }

      return summaries.sort(
        (a, b) =>
          new Date(b.created).getTime() - new Date(a.created).getTime()
      );
    } catch {
      return [];
    }
  }

  /**
   * Get a full idea.
   */
  async getIdea(name: string): Promise<Idea | null> {
    const filePath = path.join(this.workspacePath, "ideas", `${name}.md`);

    try {
      const content = await fs.readFile(filePath, "utf-8");
      const { frontmatter, content: markdownContent } =
        parseMarkdown<IdeaFrontmatter>(content);

      return {
        name,
        path: filePath,
        frontmatter,
        content: markdownContent,
      };
    } catch {
      return null;
    }
  }

  /**
   * Create a new idea.
   */
  async createIdea(payload: CreateIdeaPayload): Promise<Idea> {
    const kebabName = toKebabCase(payload.name);
    const filePath = path.join(this.workspacePath, "ideas", `${kebabName}.md`);

    const frontmatter: IdeaFrontmatter = {
      title: payload.title,
      created: getCurrentDate(),
      tags: payload.tags,
    };

    let content = `# ${payload.title}\n\n${payload.description}\n`;

    if (payload.valueProposition) {
      content += `\n## Why This Could Be Valuable\n\n${payload.valueProposition}\n`;
    }

    content += `\n---\n*Captured: ${getCurrentDate()}*\n`;

    const markdown = createMarkdown(frontmatter, content);
    await fs.writeFile(filePath, markdown);

    return (await this.getIdea(kebabName))!;
  }

  /**
   * Delete an idea.
   */
  async deleteIdea(name: string): Promise<void> {
    const filePath = path.join(this.workspacePath, "ideas", `${name}.md`);
    await fs.unlink(filePath);
  }

  /**
   * Promote an idea to an initiative.
   */
  async promoteIdeaToInitiative(
    ideaName: string,
    initiativePayload: CreateInitiativePayload
  ): Promise<Initiative> {
    // Create the initiative
    const initiative = await this.createInitiative(initiativePayload);

    // Delete the idea
    await this.deleteIdea(ideaName);

    return initiative;
  }
}

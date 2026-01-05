#!/usr/bin/env node

/**
 * CLI entry point for Project Tracker.
 * Usage: project-tracker [workspace-path] [options]
 *
 * Options:
 *   --dev       Run in development mode
 *   --port, -p  Specify port (default: auto-find starting at 4600)
 *   --open      Open browser after starting
 *   --help, -h  Show help
 */

import { spawn } from "child_process";
import * as path from "path";
import * as fs from "fs";
import * as net from "net";

const DEFAULT_PORT_START = 4600;

interface CliArgs {
  workspacePath: string;
  dev: boolean;
  port: number | null;
  open: boolean;
  help: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const result: CliArgs = {
    workspacePath: "./workspace",
    dev: false,
    port: null,
    open: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--dev") {
      result.dev = true;
    } else if (arg === "--open") {
      result.open = true;
    } else if (arg === "--help" || arg === "-h") {
      result.help = true;
    } else if (arg === "--port" || arg === "-p") {
      const portStr = args[++i];
      if (portStr) {
        result.port = parseInt(portStr, 10);
      }
    } else if (!arg.startsWith("-")) {
      result.workspacePath = arg;
    }
  }

  return result;
}

function showHelp(): void {
  console.log(`
Project Tracker - Track initiatives, todos, and ideas

Usage: project-tracker [workspace-path] [options]

Arguments:
  workspace-path    Path to workspace directory (default: ./workspace)

Options:
  --dev             Run in development mode with hot reloading
  --port, -p PORT   Specify port number (default: auto-find starting at ${DEFAULT_PORT_START})
  --open            Automatically open browser after starting
  --help, -h        Show this help message

Examples:
  project-tracker                       Start with ./workspace directory
  project-tracker ./my-project          Start with custom workspace path
  project-tracker --dev --open          Development mode with auto-open
  project-tracker -p 3000               Use specific port
`);
}

async function findAvailablePort(startPort: number): Promise<number> {
  const isPortAvailable = (port: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.once("error", () => resolve(false));
      server.once("listening", () => {
        server.close();
        resolve(true);
      });
      server.listen(port);
    });
  };

  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port++;
    if (port > startPort + 100) {
      throw new Error(`Could not find available port after trying ${port - startPort} ports`);
    }
  }
  return port;
}

async function ensureWorkspaceExists(workspacePath: string): Promise<void> {
  const dirs = [
    path.join(workspacePath, "initiatives", "active"),
    path.join(workspacePath, "initiatives", "backlog"),
    path.join(workspacePath, "initiatives", "completed"),
    path.join(workspacePath, "todos"),
    path.join(workspacePath, "ideas"),
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created: ${dir}`);
    }
  }
}

async function waitForServer(port: number, maxAttempts: number = 30): Promise<boolean> {
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`http://localhost:${port}/api/workspace/config`);
      if (response.ok) {
        return true;
      }
    } catch {
      // Server not ready yet
    }
    await delay(1000);
  }
  return false;
}

async function openBrowser(url: string): Promise<void> {
  const { default: open } = await import("open");
  await open(url);
}

async function main(): Promise<void> {
  const args = parseArgs();

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  // Resolve workspace path
  const workspacePath = path.resolve(process.cwd(), args.workspacePath);
  console.log(`Workspace: ${workspacePath}`);

  // Ensure workspace directory exists
  await ensureWorkspaceExists(workspacePath);

  // Find available port
  const port = args.port || (await findAvailablePort(DEFAULT_PORT_START));
  console.log(`Starting server on port ${port}...`);

  // Get the directory where this CLI script is located
  const cliDir = path.dirname(__filename);
  const projectRoot = path.resolve(cliDir, "..");

  // Set environment variables
  const env = {
    ...process.env,
    PROJECT_TRACKER_WORKSPACE: workspacePath,
    PROJECT_TRACKER_PROJECT_ROOT: process.cwd(),
    PORT: port.toString(),
  };

  // Spawn Next.js server
  const command = args.dev ? "npm" : "npm";
  const commandArgs = args.dev ? ["run", "dev"] : ["run", "start"];

  const child = spawn(command, commandArgs, {
    cwd: projectRoot,
    env,
    stdio: "inherit",
  });

  // Handle process termination
  const cleanup = () => {
    child.kill();
    process.exit();
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  // Wait for server to be ready and optionally open browser
  if (args.open) {
    console.log("Waiting for server to start...");
    const ready = await waitForServer(port);
    if (ready) {
      const url = `http://localhost:${port}`;
      console.log(`Opening ${url} in browser...`);
      await openBrowser(url);
    } else {
      console.log("Server did not start in time. You can manually open the browser.");
    }
  }

  child.on("exit", (code) => {
    process.exit(code || 0);
  });
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});

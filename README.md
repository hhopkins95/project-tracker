# @hhopkins/project-tracker

A dual-interface project tracking system - web app for humans, plugin for AI agents.

## Features

- **Initiatives** - Major project milestones or features with sessions and decisions
- **Todos** - Actionable tasks with priority levels
- **Ideas** - Captured thoughts for future consideration
- **Sessions** - Track work sessions with context and decisions

## Installation

```bash
npm install -g @hhopkins/project-tracker
```

## Usage

### CLI

```bash
# Start with default workspace (./workspace)
project-tracker

# Start with custom workspace path
project-tracker ./my-project

# Start with auto-open browser
project-tracker --open

# Development mode with hot reloading
project-tracker --dev

# Specify port
project-tracker --port 3000
```

### Options

| Option | Description |
|--------|-------------|
| `--dev` | Run in development mode with hot reloading |
| `--port, -p` | Specify port number (default: auto-find starting at 4600) |
| `--open` | Automatically open browser after starting |
| `--help, -h` | Show help message |

## Workspace Structure

```
workspace/
├── initiatives/
│   ├── active/      # Currently active initiatives
│   ├── backlog/     # Planned initiatives
│   └── completed/   # Finished initiatives
├── todos/           # Task files
└── ideas/           # Idea files
```

## Requirements

- Node.js >= 18.0.0

## License

MIT

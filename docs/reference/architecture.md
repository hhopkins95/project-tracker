---
title: Architecture Overview
description: Technical architecture and design patterns used in Project Tracker
autoLoad: true
autoLoadPriority: 2
agentRole: instructions
---

# Architecture Overview

## Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Directory Conventions

| Directory | Purpose |
|-----------|---------|
| `src/app/` | Next.js app router pages and layouts |
| `src/components/` | Reusable React components |
| `src/lib/` | Shared utilities and helpers |
| `workspace/` | Project data files (JSON/Markdown) |

## Coding Standards

- Use TypeScript for all new files
- Follow Next.js App Router conventions
- Components use functional style with hooks
- Prefer server components where possible

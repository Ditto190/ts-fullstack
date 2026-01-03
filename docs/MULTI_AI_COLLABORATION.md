# Multi-AI-Agent Collaboration Workflow

> **Git worktree-based workflow for multiple AI Agent IDEs + humans working simultaneously**

## Overview

This monorepo supports **multiple AI Agent IDEs** (GitHub Copilot, Claude, Cursor, Windsurf, Aider, etc.) and **human developers** working concurrently on different tasks without conflicts.

## Architecture

\\\
Main Repo (main branch)
├── worktrees/
│   ├── copilot-ui-refactor/      # GitHub Copilot working on UI
│   ├── claude-backend-api/       # Claude working on backend
│   ├── cursor-tests/             # Cursor writing tests
│   ├── human-docs/               # Human updating docs
│   └── windsurf-optimization/    # Windsurf optimizing performance
\\\

## Key Benefits

✅ **Zero Conflicts**: Each agent has isolated working directory  
✅ **Parallel Development**: Multiple tasks progress simultaneously  
✅ **No Branch Switching**: Agents never disrupt each other  
✅ **Fast Context Switching**: Instant access to any task  
✅ **Clean History**: Each task = one branch = clear git log

## Quick Start

### 1. Setup AI Agent Worktree

\\\powershell
# GitHub Copilot works on UI refactor
.\scripts\setup-ai-worktree.ps1 agent ui-refactor copilot

# Claude works on backend API
.\scripts\setup-ai-worktree.ps1 agent backend-api claude

# Cursor works on test coverage
.\scripts\setup-ai-worktree.ps1 agent tests cursor
\\\

### 2. Open in IDE

\\\powershell
# Open Copilot's worktree in VS Code
code worktrees/copilot-ui-refactor

# Open Claude's worktree in another VS Code window
code worktrees/claude-backend-api
\\\

### 3. Work Independently

Each AI agent works in its own worktree:
- ✅ Full access to codebase
- ✅ Independent git state
- ✅ No interference with other agents
- ✅ Can run dev server on different ports

### 4. Merge When Ready

\\\ash
# Agent finishes task
cd worktrees/copilot-ui-refactor
git add .
git commit -m "feat: UI refactor complete"
git push origin agent/copilot-ui-refactor

# Create PR and merge to main
gh pr create --base main --head agent/copilot-ui-refactor

# After merge, remove worktree
cd ../..
.\scripts\setup-ai-worktree.ps1 remove copilot-ui-refactor
\\\

## Supported AI Agents

| Agent | Color | Branch Prefix | Use Case |
|-------|-------|---------------|----------|
| **GitHub Copilot** | 🔵 Blue | \gent/copilot-*\ | Code generation, refactoring |
| **Claude** | �� Magenta | \gent/claude-*\ | Complex logic, documentation |
| **Cursor** | 🔷 Cyan | \gent/cursor-*\ | Full-stack features |
| **Windsurf** | �� Green | \gent/windsurf-*\ | Performance optimization |
| **Aider** | 🟡 Yellow | \gent/aider-*\ | CLI-based coding |
| **Other** | ⚫ Gray | \gent/other-*\ | Custom AI tools |

## Workflow Patterns

### Pattern 1: Parallel Feature Development

\\\
Timeline:
├─ Copilot: UI Component Refactor (2 hours)
├─ Claude: API Endpoint Development (3 hours)
└─ Cursor: Test Suite Expansion (2 hours)

Result: 3 features delivered in 3 hours instead of 7 hours sequentially
\\\

### Pattern 2: AI Agent Handoff

\\\
1. Copilot scaffolds feature structure
2. Merge to main
3. Claude picks up from main to add business logic
4. Merge to main
5. Cursor adds comprehensive tests
6. Final merge
\\\

### Pattern 3: Human + AI Collaboration

\\\
Human (worktrees/human-architecture):
  - Reviews AI-generated code
  - Makes architectural decisions
  - Writes specifications

Copilot (worktrees/copilot-implementation):
  - Implements features per spec
  - Generates boilerplate
  - Refactors code

Claude (worktrees/claude-docs):
  - Writes comprehensive docs
  - Creates examples
  - Updates README
\\\

## Commands Reference

### Create Worktrees

\\\powershell
# AI Agent worktree
.\scripts\setup-ai-worktree.ps1 agent <task-name> <agent-type>

# Human developer worktree
.\scripts\setup-ai-worktree.ps1 human <feature-name>

# Hotfix worktree
.\scripts\setup-ai-worktree.ps1 hotfix <bug-name>
\\\

### View Status

\\\powershell
# Show all active worktrees with metadata
.\scripts\setup-ai-worktree.ps1 status

# List worktrees (basic)
.\scripts\setup-ai-worktree.ps1 list
\\\

### Remove Worktree

\\\powershell
.\scripts\setup-ai-worktree.ps1 remove <worktree-name>

# Example
.\scripts\setup-ai-worktree.ps1 remove copilot-ui-refactor
\\\

## Best Practices

### ✅ DO

- **One agent = One worktree = One focused task**
- **Keep tasks scoped and independent**
- **Merge frequently to avoid drift**
- **Delete worktree after merge**
- **Use descriptive task names**
- **Document agent assignments**

### ❌ DON'T

- **Share worktrees between agents**
- **Work on same files in parallel**
- **Leave stale worktrees inactive for weeks**
- **Forget to pull main before creating worktree**
- **Mix multiple unrelated changes in one worktree**

## Port Allocation

When running dev servers in multiple worktrees:

\\\
Main repo:     localhost:3000 (Next.js), localhost:8000 (Agent)
Copilot:       localhost:3001 (Next.js), localhost:8001 (Agent)
Claude:        localhost:3002 (Next.js), localhost:8002 (Agent)
Cursor:        localhost:3003 (Next.js), localhost:8003 (Agent)
Windsurf:      localhost:3004 (Next.js), localhost:8004 (Agent)
\\\

Set in each worktree's \.env\:
\\\ash
PORT=3001  # Increment for each worktree
AGENT_PORT=8001
\\\

## Conflict Resolution

If agents need to work on overlapping code:

1. **Coordinate via issues**: Use GitHub issues to claim files
2. **Stagger work**: Agent A merges first, Agent B rebases
3. **Split work**: Divide into truly independent chunks
4. **Human review**: Let human resolve conflicts manually

## Troubleshooting

### Problem: "Branch already exists"
**Solution**: Worktree reuses existing branch. Delete old branch first if needed:
\\\ash
git branch -D agent/copilot-ui-refactor
\\\

### Problem: "Worktree path conflicts"
**Solution**: Each worktree needs unique name. Use agent prefix:
\\\ash
copilot-ui-refactor  # ✅ Good
claude-ui-refactor   # ✅ Good (different agent)
ui-refactor          # ❌ Bad (ambiguous)
\\\

### Problem: "Can't remove worktree with uncommitted changes"
**Solution**: Commit or stash changes first:
\\\ash
cd worktrees/copilot-ui-refactor
git add . && git commit -m "WIP" || git stash
cd ../..
.\scripts\setup-ai-worktree.ps1 remove copilot-ui-refactor
\\\

## Agent Metadata

Each agent worktree includes \.agent-metadata.json\:

\\\json
{
  "agent_type": "copilot",
  "task_name": "ui-refactor",
  "branch": "agent/copilot-ui-refactor",
  "created_at": "2026-01-03T12:30:00Z",
  "workspace_path": "C:\\Users\\dylan\\modme-monorepo\\worktrees\\copilot-ui-refactor"
}
\\\

This enables:
- **Status tracking**: See which agents are active
- **Task history**: Audit who worked on what
- **Automation**: Scripts can detect agent type

## CI/CD Integration

GitHub Actions can run tests on all agent branches:

\\\yaml
on:
  push:
    branches:
      - 'agent/**'
      - 'feature/**'
      - 'hotfix/**'
\\\

## Related Documentation

- [MIGRATION_IMPLEMENTATION_PLAN.md](./MIGRATION_IMPLEMENTATION_PLAN.md) - Overall migration strategy
- [REFACTORING_PATTERNS.md](./REFACTORING_PATTERNS.md) - Code patterns for agents
- [setup-ai-worktree.ps1](../scripts/setup-ai-worktree.ps1) - Worktree management script

## Success Metrics

Track multi-agent productivity:
- **Parallel tasks**: Number of simultaneous worktrees
- **Cycle time**: Hours from worktree creation to merge
- **Conflict rate**: % of merges requiring manual conflict resolution
- **Agent utilization**: Active worktrees per agent type

---

**Last Updated**: 2026-01-03  
**Maintained by**: ModMe GenUI Team  
**Status**: Production-Ready ✅

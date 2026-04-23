# kasir-toko — Monorepo Agent Instructions

Shared guidance for working from the repository root.

## Monorepo Context

- `frontend/`: Next.js 16 + React 19 + TypeScript + Tailwind CSS 4
- `backend/`: Spring Boot 4 + Java 21 + Maven + JPA + Spring Security

Use this root document for cross-cutting defaults. Use subproject docs for framework-specific implementation rules.

## Instruction Precedence

When instructions differ, apply the most specific scope first:

1. Task-specific user instruction
2. Subproject instruction file (`frontend/*` or `backend/*`)
3. Root instruction file (this file)

This keeps behavior deterministic when operating from the parent directory.

## Task Routing Rules

- Frontend-only tasks: follow `frontend/CLAUDE.md` and `frontend/AGENTS.md`.
- Backend-only tasks: follow `backend/CLAUDE.md` and `backend/AGENTS.md`.
- Cross-cutting tasks: apply root rules first, then apply each touched subproject's rules.

## Shared Coding Principles

- Prefer the smallest change that fully solves the requested problem.
- Keep edits surgical and directly related to the task.
- Match existing code style and project conventions in each subproject.
- State assumptions when context is incomplete or ambiguous.
- Validate work with the most relevant checks for changed areas.

## Command Scope

- Run frontend commands from `frontend/`.
- Run backend commands from `backend/`.
- Run repository-wide inspection from the root when appropriate.

## Sync Contract (Root)

- Root `CLAUDE.md` and root `AGENTS.md` must remain logically equivalent.
- If one root file changes, apply the same logical change to the other in the same task.
- Sync is manual (no automation script by default).

## Non-Goals

- Do not duplicate full framework-specific guidance from subproject docs here.
- Do not alter frontend generated-doc flow or backend manual-sync flow from this root policy.

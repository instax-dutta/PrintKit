# DOX framework

- DOX is highly performant AGENTS.md hierarchy installed here
- Agent must follow DOX instructions across any edits

## Core Contract

- AGENTS.md files are binding work contracts for their subtrees
- Work products, source materials, instructions, records, assets, and durable docs must stay understandable from the nearest applicable AGENTS.md plus every parent AGENTS.md above it

## Read Before Editing

1. Read the root AGENTS.md
2. Identify every file or folder you expect to touch
3. Walk from the repository root to each target path
4. Read every AGENTS.md found along each route
5. If a parent AGENTS.md lists a child AGENTS.md whose scope contains the path, read that child and continue from there
6. Use the nearest AGENTS.md as the local contract and parent docs for repo-wide rules
7. If docs conflict, the closer doc controls local work details, but no child doc may weaken DOX

Do not rely on memory. Re-read the applicable DOX chain in the current session before editing.

## Update After Editing

Every meaningful change requires a DOX pass before the task is done.

Update the closest owning AGENTS.md when a change affects:

- purpose, scope, ownership, or responsibilities
- durable structure, contracts, workflows, or operating rules
- required inputs, outputs, permissions, constraints, side effects, or artifacts
- user preferences about behavior, communication, process, organization, or quality
- AGENTS.md creation, deletion, move, rename, or index contents

Update parent docs when parent-level structure, ownership, workflow, or child index changes. Update child docs when parent changes alter local rules. Remove stale or contradictory text immediately. Small edits that do not change behavior or contracts may leave docs unchanged, but the DOX pass still must happen.

## Hierarchy

- Root AGENTS.md is the DOX rail: project-wide instructions, global preferences, durable workflow rules, and the top-level Child DOX Index
- Child AGENTS.md files own domain-specific instructions and their own Child DOX Index
- Each parent explains what its direct children cover and what stays owned by the parent
- The closer a doc is to the work, the more specific and practical it must be

## Child Doc Shape

- Create a child AGENTS.md when a folder becomes a durable boundary with its own purpose, rules, responsibilities, workflow, materials, or quality standards
- Work Guidance must reflect the current standards of the project or user instructions; if there are no specific standards or instructions yet, leave it empty
- Verification must reflect an existing check; if no verification framework exists yet, leave it empty and update it when one exists

Default section order:
- Purpose
- Ownership
- Local Contracts
- Work Guidance
- Verification
- Child DOX Index

## Style

- Keep docs concise, current, and operational
- Document stable contracts, not diary entries
- Put broad rules in parent docs and concrete details in child docs
- Prefer direct bullets with explicit names
- Do not duplicate rules across many files unless each scope needs a local version
- Delete stale notes instead of explaining history
- Trim obvious statements, repeated rules, misplaced detail, and warnings for risks that no longer exist

## Closeout

1. Re-check changed paths against the DOX chain
2. Update nearest owning docs and any affected parents or children
3. Refresh every affected Child DOX Index
4. Remove stale or contradictory text
5. Run existing verification when relevant
6. Report any docs intentionally left unchanged and why

## User Preferences

When the user requests a durable behavior change, record it here or in the relevant child AGENTS.md

## Project Overview

PrintKit - offline-first PWA pocket toolkit for FDM printing. Vite 5 + React 18 + TypeScript (strict) + Tailwind 3.4 + Vitest. Spec of record: `PRD.md`; run status and gate evidence: `GATES.md`; setup, tools list, and engineering decisions: `README.md`.

Project-wide contracts:

- All math is pure TypeScript with zero UI, lives under `src/lib/calc/`, and is tested against the PRD §10 vectors; never embed formulas in tool pages beyond calling calc functions.
- Comma is a decimal separator (`1,5` -> 1.5, `1,234` -> 1.234); documented as a decision in README, not a bug.
- `settings.decimals = 3` means per-kind expansion (3 for length, 2 for money, 1 for percent); any other value 0-6 is a global override.
- Store key is exactly `printkit:v1`; recents live in `printkit-recents`. Changes to store shape require a versioned migration in `src/lib/store.ts`.
- Broken references (`GATES.md` M1/M2 unmet): public deploy and Lighthouse mobile run are outstanding; keep that ledger current with evidence when runnable gates change.
- Ponytail discipline: smallest complete change; no new dependencies for a few lines; no unsolicited features.
- No emojis in output or files.

## Verification

- `npx vitest run` - full suite (currently 56 passing) is the minimum bar; PRD §10 numeric vectors must stay green.
- `npm run build` - fails on any TS error (strict, no unused); GATES.md G2 checks dist assets (index.html, sw.js, manifest.webmanifest, icon-192/512, CSS).

## User Preferences

- Never use emojis. Use dashes, not em dashes.
- Do not create new files that are not needed; code without comments unless a comment explains an unavoidable why.

## Child DOX Index

- `src/lib/AGENTS.md` - app-state and platform glue: formatting, hash router, localStorage store, theme, service worker registration
- `src/lib/calc/AGENTS.md` - pure math modules and the PRD §10 vector contract
- `src/tools/AGENTS.md` - tool pages, registry, lazy loading, and page conventions
- `public/AGENTS.md` - PWA assets: service worker, manifest, generated icons
- `tests/AGENTS.md` - test layout and what each suite owns

Folders intentionally skipped: `src/components/` (small shared ui/icons files, no durable boundary yet), `src/data/` (three JSON tables edited with their consuming tools), `scripts/` (single icon generator, documented in `public/AGENTS.md` and README).

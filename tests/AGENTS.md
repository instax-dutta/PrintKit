# tests - what each suite owns

## Purpose

Vitest suites proving the PRD holds. `vite.config.ts` sets the jsdom environment for the suite files that render.

## Ownership

- `calc.test.ts` - every `src/lib/calc` formula against the `PRD.md` §10 numeric vectors (46 tests)
- `store.test.ts` - store load/save, versioned migration, and import/export validation
- `smoke.test.tsx` - React Testing Library render flows mirroring PRD §4: converter computes live, no-NaN rule, search palette finds tools

## Local Contracts

- jsdom is declared per-file where needed via `// @vitest-environment jsdom` in the smoke test; calc and store tests stay node-fast.
- Smoke tests navigate by hash (`window.location.hash`), await lazy routes with `findBy*`/`waitFor`, and query by role/aria-label; keep that pattern.
- Location hash and localStorage leak across tests in jsdom, so each smoke test calls `cleanup()` and sets its own hash before rendering.
- A §10 vector may never be edited to make a failing formula pass; fix the formula or the vector changes go through the PRD.

## Work Guidance

- New calc module: write the vector test first in `calc.test.ts`, then the module.
- New tool with a user flow worth guarding: extend `smoke.test.tsx` with one focused render test, not a page-by-page snapshot farm.

## Verification

- `npx vitest run` - full suite; currently 56 passing and the minimum bar for any commit.
- Gate bindings live in `GATES.md` (G1 runs this suite and expects the pass count line).

## Child DOX Index

(None - flat folder.)

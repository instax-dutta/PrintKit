# src/tools - tool pages and registry

## Purpose

One file per user-facing tool, plus `registry.tsx`, which is the single source of truth for the home grid, search palette (keywords), recents, and routing.

## Ownership

- `registry.tsx` - `Tool` list (slug, name, desc, keywords), per-tool `lazy(() => import(...))` entries; adding a tool starts here
- Tool pages: `Convert`, `Scale`, `Filament`, `Cost`, `Shrinkage`, `Tolerance`, `Flow`, `Calibration`, `Layers`, `Weight`, `Reference`, `Presets`, `Settings`

## Local Contracts

- Every tool is a default-exported React component loaded via `lazy` in `registry.tsx`; `App.tsx` wraps routes in `<Suspense>`. Never import a tool page statically.
- Tool pages call `src/lib/calc` functions for all math; formulas are never re-derived in a page.
- Shared input/output primitives come from `src/components/ui.tsx` (Field, ResultRow, FractionRow, FormulaNote, PresetSelect, Toast); do not hand-roll lookalikes.
- Invalid input renders the neutral `—` empty state, never `NaN` in any visible string (including composed labels like `${raw} mm = ${x} cm`).
- Each tool page labels its formulas with `FormulaNote` so users see the arithmetic being applied.
- Route URLs are hash-based (`#/convert`); slugs must stay stable once shipped (bookmarks and recents depend on them).

## Work Guidance

- Keep pages lean: layout, calls to calc + format helpers, and reference tables. Anything reusable moves down to `src/components/ui.tsx`.
- New tool checklist: calc module + tests first, then page, then registry entry with keywords that match what users would type.

## Verification

- `npx vitest run tests/smoke.test.tsx` - rendered smoke flows (converter computes live, no-NaN rule, search palette). These are the PRD §4 user flows and must stay green.
- `npm run build` fails on unused imports; keep tool pages tidy.

## Child DOX Index

(None - flat folder, registry plus pages.)

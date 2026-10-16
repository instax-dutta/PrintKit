# src/lib/calc - pure math for every tool

## Purpose

All formulas behind PrintKit's tools as pure, UI-free TypeScript. These are the numbers users trust to slice and print; they are the most guarded code in the repo.

## Ownership

- `length.ts` - unit conversions (mm/cm/m/in/ft/µm)
- `scale.ts` - scale factor from percent, target dimension, or fit-to-build-volume
- `filament.ts` - filament length <-> grams via `π*(d/2)^2` volume and material density
- `cost.ts` - print cost roll-up (filament, electricity, machine wear, labor, failure buffer)
- `shrinkage.ts` - shrinkage division model `1/(1-s/100)`
- `tolerance.ts` - clearance and fit guidance (editable ranges)
- `flow.ts` - extrusion flow factor for line width/nozzle/layer height
- `calibration.ts` - e-steps / Klipper rotation distance, axis steps/mm, dimensional correction
- `layers.ts` - layer height guidance and print-time estimation

## Local Contracts

- Pure functions only: no React, no DOM, no localStorage, no imports from `src/tools`, `src/components`, or `src/lib/useStore`.
- Zero dependencies; if a formula needs a constant, define it here.
- Results that can be invalid return `NaN` or a documented sentinel - never throw for bad user input, and never emit formatted strings.
- Every formula surfaced by a tool page here must be covered by `tests/calc.test.ts` against the `PRD.md` §10 vectors; when adding a formula, add its vector first.

## Work Guidance

- Tool pages call these functions directly; do not re-derive math in a page.
- Changing a formula means updating the PRD §10 expectation and its vector together, in the same commit.

## Verification

- `npx vitest run tests/calc.test.ts` - 46 passing tests, all PRD §10 numeric vectors. This must stay green; a failing vector blocks any commit.

## Child DOX Index

(None - leaf folder.)

# src/lib - app-state and platform glue

## Purpose

Everything that connects UI to state, platform, and formatting: number parsing/formatting, hash router, localStorage store, theme, and service worker registration. Zero business math lives here.

## Ownership

- `format.ts` - `parseNumber` (comma-as-decimal + mixed fractions), `fmt` per-kind formatting, `fractionalInch` nearest-1/64 with signed mm error
- `store.ts` / `useStore.ts` / `storeContext.tsx` - persisted app state under key `printkit:v1`, versioned migrations, JSON import/export validation
- `router.ts` - `currentPath` / `useHashRoute`, hash navigation
- `theme.ts` - dark-default theme toggle, matchMedia-guarded (jsdom safe)
- `pwa.ts` - service worker registration and update flow

## Local Contracts

- Store key is exactly `printkit:v1`, and settings, materials, printers and recents all live in that one object. Any shape change requires a `migrations` entry keyed by schema version - never mutate in place.
- `fmt(value, kind, decimals)`: `decimals = 3` expands per-kind (length 3, money 2, percent 1); other values 0-6 override globally. `parseNumber` treats comma as decimal separator; do not "fix" this.
- One shared store instance via `storeContext`; tool pages never create their own store.
- `theme.ts` reads `window.matchMedia` defensively so vitest jsdom can import it without crashing.

## Work Guidance

- Keep these files UI-free except `storeContext.tsx` (it is the one provider).
- New cross-tool state goes through the Store type + migration; tool-local state stays in the tool page.

## Verification

- `npx vitest run tests/store.test.ts` - store, migration, and import/export behavior.
- Tailwind theme tokens (`bg/panel/line/dim/accent` under `theme.extend.colors`) are referenced as `text-kit-dim` style classes; keep names stable.

## Child DOX Index

- `src/lib/calc/AGENTS.md` - pure math modules and the PRD §10 vector contract

# PrintKit

Offline-first PWA pocket toolkit for FDM printing: unit conversion, scaling, material and cost math, print settings, and machine calibration checks. Static files, no backend, works with the network off.

Stack: Vite 5, React 18, TypeScript (strict), Tailwind CSS 3.4, Vitest.

## Setup

```
npm install
npm run dev       # dev server
npm run test      # vitest, 56 tests
npm run build     # tsc -b && vite build -> dist/
npm run icons     # regenerate PWA PNGs from public/icon.svg
```

Serve `dist/` from any static host. Install from the browser (Add to Home Screen); the service worker (`public/sw.js`) caches app assets after the first visit and exposes an update banner when a new build ships.

## Tools

- Length Converter - mm, cm, m, in, ft, microns; inch results show nearest-fraction bars.
- Scale Factor - target size, scale %, or fit to a printer build volume (with a bed margin).
- Filament Amount & Weight - length <-> grams by material from the built-in materials list.
- Print Cost - filament + electricity + machine wear + labor + failure buffer, editable per print.
- Shrinkage - accounts for material shrinkage so the modeled part arrives on size.
- Tolerance Fit - clearance-hole and fit guidance against the fastener table.
- Extrusion & Flow - flow-rate factor for line width, nozzle and layer height; slicer flow % suggestion.
- Calibration Helper - e-steps, Klipper rotation distance, axis steps/mm, dimensional correction.
- Layer Time & Strength Calculators - layer height vs nozzle guidance and estimated print time from volume and rate.
- Estimated Weight - object weight from dimensions per material.
- Reference & Drilling Tables - drill sizes, tap clearance, nozzle guidance table.
- Presets - material presets and three example printer templates, one tap each.
- Settings - export/import JSON backup, theme, currency, decimals (see below), reset.

State lives in `localStorage` under `printkit:v1` (settings, materials, printers and recents in one versioned object). All math is pure TypeScript in `src/lib/calc/` and tested against the PRD §10 vectors.

## Decisions

- **Comma as decimal separator.** Locale conventions vary; this build treats `1,5` as 1.5 and `1,234` as 1.234 (not one-thousand-two-hundred-thirty-four). Rationale: printer settings rarely carry thousands, and most non-English users type commas as decimal points. Documented so nobody "fixes" it silently.
- **Decimals default is `3`**, which per-kind expansion means 3 for lengths, 2 for money, 1 for percent. Any other value (0-6) is a global precision override. This is an escape hatch, not a hidden feature: the Settings slider writes exactly what you choose.
- **Testing Library smoke tests instead of Playwright.** The PRD names three user flows; those are covered by three rendered smoke tests in `tests/smoke.test.tsx`. Full Playwright coverage is the upgrade path if scripted end-to-end flows are ever needed.
- **Service worker is hand-written, not injected.** `public/sw.js` runtime-caches same-origin GETs after the first visit. `vite.config.ts` stamps a fresh cache version into `dist/sw.js` on every build (`public/sw.js` keeps the `printkit-v1` placeholder), so clients pick up updates through a SKIP_WAITING message and in-app banner, and `activate` drops the previous cache.
- **Icons are generated, not vendored.** `scripts/gen-icons.mjs` renders `public/icon.svg` to 180/192/512 PNGs with a zero-dependency Node PNG writer, so no image tool is needed to rebuild the PWA icons.
- **Fraction resolution is nearest 1/64 inch.** The converter additionally prints the signed mm error next to the fraction, so a "2 1/4 in" label never hides that the true value was 57.1499 mm.

## Offline & install

First visit: app caches itself; banner offers refresh-on-update. Install targets Chrome/Safari mobile: `manifest.webmanifest` + 192/512 px icons (any + maskable). Storage is localStorage; if it is unavailable (private browsing in some browsers) the app shows a notice and runs with in-memory state for the session.

## Verification

Run `npm run test && npm run build`. Gates and their evidence are tracked in `GATES.md` (tests and build are checked and green under `unlazy`; public deploy and Lighthouse mobile run remain manual - see that file).

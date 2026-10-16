# PRD: PrintKit — A 3D Printing Toolkit Web App

**Status:** Draft v1 · **Owner:** Abhishek · **Audience:** Coding agent (build exactly what is specified; where something is marked *DEFAULT*, use it without asking)

---

## 1. Summary

PrintKit is a fast, offline-capable web app that bundles the small calculators a 3D printing hobbyist or small print business reaches for constantly: mm ↔ cm conversion, filament weight/length, print cost, scaling, shrinkage compensation, flow rate, and calibration math. It must be usable in under 2 seconds from a cold open, on a phone standing next to a printer, with no login and no backend.

## 2. Goals and Non-Goals

### Goals
1. Any common calculation reachable in **≤ 2 taps/clicks** from the home screen, with results updating **live as the user types** (no "Calculate" button).
2. Works **fully offline** after first load (installable PWA).
3. Correct, tested math. A wrong number that causes a failed 8-hour print is the worst possible bug.
4. Remembers the user's setup (printer, materials, electricity rate, currency) in the browser.

### Non-Goals (v1)
- No user accounts, no backend, no database, no analytics that track individuals.
- No slicing, no STL/3MF parsing, no 3D viewer. (Considered for v2; see §12.)
- No print-farm management, no order management, no payments.

## 3. Target User

- **Primary:** Hobbyist/maker with an FDM printer (Ender-3 class, Bambu, Prusa, Voron, etc.), frequently on a phone while at the printer.
- **Secondary:** Small seller printing to order who needs quick quote/cost numbers.
- Assumes basic familiarity with terms like layer height, nozzle, infill. No teaching UI needed; short helper text only.

## 4. Platform and Tech Stack (DEFAULT, do not re-litigate)

| Concern | Decision |
|---|---|
| App type | Static single-page app, PWA (installable, offline via service worker) |
| Framework | Vite + React + TypeScript (strict mode) |
| Styling | Tailwind CSS; mobile-first; dark mode default, light mode toggle, follows system on first load |
| Routing | Hash or history router; every tool has its own URL (e.g. `/convert`, `/filament`) |
| State persistence | `localStorage` for settings/presets; versioned schema with migration function |
| Math | Pure functions in `src/lib/calc/*.ts`, **zero UI imports**, fully unit tested |
| Tests | Vitest for math; Playwright (or Testing Library) for 3 smoke flows |
| Hosting | Cloudflare Pages or Vercel free tier (static). Output must be deployable as plain static files |
| Backend | None |
| Dependencies | Keep minimal. No UI kit libraries beyond Tailwind (+ optionally `lucide-react` for icons) |

## 5. Global Requirements

### 5.1 Input/Output behavior
- All numeric inputs accept `.` as decimal separator; also accept `,` and normalize it.
- Live recalculation on every keystroke (debounce ≤ 50 ms or none).
- Empty or invalid input shows a neutral empty state, never `NaN`, `Infinity`, or a crash.
- Every result has a **tap-to-copy** button (copies the plain number with unit, e.g. `120 mm`), with a brief "Copied" toast.
- Result rounding: default 3 significant decimals for lengths, 2 for money, 1 for percentages; user can change "decimal places" in Settings (0–6).
- Never silently round input values. Only round for display.

### 5.2 Layout and navigation
- **Home:** responsive grid of tool cards (icon + name + one-line description). Recently used tools pinned at top (last 3).
- **Command palette / search:** `Ctrl/Cmd+K` (and a visible search field on mobile) filters tools by name and keyword (e.g. typing "mm" finds the converter, "cost" finds print cost).
- Persistent top bar: app name, search, settings, theme toggle.
- Each tool page has: title, inputs on top, results directly beneath (not off-screen on mobile), a collapsible "Formula & notes" section showing the exact math used.
- Touch targets ≥ 44 px. Numeric inputs use `inputmode="decimal"` so mobile shows the number pad.

### 5.3 Settings (global, stored locally)
- Currency symbol/code (DEFAULT: ₹ INR; options: ₹ $ € £ or custom text).
- Electricity price per kWh (DEFAULT: 8.00 in selected currency; user editable).
- Default filament diameter (DEFAULT 1.75 mm; options 1.75, 2.85).
- Default nozzle diameter (DEFAULT 0.4 mm).
- Decimal places.
- Theme.
- **Export settings/presets to JSON** and **Import from JSON** (for moving between devices). Validate on import; reject malformed files with a clear message.
- "Reset all data" with confirmation dialog.

### 5.4 Presets (stored locally)
- **Materials:** name, density (g/cm³), default price per kg, shrinkage %. Ship with the built-in list in §7 (marked "built-in", editable via "duplicate and edit"; the built-in values can be reset).
- **Printers:** name, build volume X/Y/Z (mm), nozzle diameter, average power draw (W), hourly machine cost (optional). Ship with none; user adds. Ship with 3 example templates they can add in one tap (generic 220×220×250, 256×256×256, 350×350×350).
- A tool that needs a material/printer shows a dropdown of presets plus "Custom…".

### 5.5 Accessibility and quality
- WCAG AA contrast, visible focus states, labels on all inputs, full keyboard operability.
- Lighthouse targets (mobile): Performance ≥ 95, Accessibility ≥ 95, PWA installable.
- First load JS ≤ 150 KB gzipped (initial route). Lazy-load each tool route.

## 6. Tools (v1 scope)

Priority key: **P0** = must ship in v1.0 · **P1** = ship in v1.1 if time allows.

### 6.1 Length Converter — **P0**
The core ask: mm ↔ cm, extended.
- Units: mm, cm, m, in (decimal), in (fractional, shown as nearest 1/64), ft, µm.
- UI: a **single input with a unit selector**, and live results for *all* other units shown below as a list, each with copy button. Additionally a prominent **mm ⇄ cm swap** quick-toggle at the top because it is the most used pair.
- Accept fractional input like `1 3/8` or `3/16` when unit is inches.
- Fractional-inch output rounds to nearest 1/64 and shows the decimal error (e.g. `≈ 5/16" (+0.004 mm)`) so users know it is approximate.
- Constants: 1 in = 25.4 mm exactly. 1 ft = 304.8 mm exactly.
- Nice-to-have (P1): "Batch mode" textarea: paste a list of numbers (one per line) with a chosen from/to unit, output a copyable list.

### 6.2 Scale Calculator — **P0**
- Mode A: given original dimension and **target dimension** → output scale % to enter in the slicer.
- Mode B: given original dimensions (X, Y, Z) and a scale % → output new dimensions.
- Mode C: **Fit to build volume** — given part X/Y/Z and a printer preset (or custom volume) → max uniform scale % that fits, plus which axis is the limiting one. Optional margin input (default 0 mm) to keep a clearance from bed edges.
- Show both mm and cm for all outputs.

### 6.3 Filament Calculator — **P0**
Convert between **weight (g)**, **length (m)**, and **volume (cm³)** for a given material and diameter.
- Inputs: material preset (density) or custom density, filament diameter (1.75 / 2.85 / custom), and *one* of weight, length, or volume.
- Outputs: the other two.
- Also: **spool remaining estimator** — input current spool weight (gross), empty spool weight (preset default 250 g, editable), and output remaining filament in g and m.
- Formulas:
  - `volume_cm3 = π × (d_mm/20)² × length_cm` (diameter mm → radius cm is `d/20`)
  - `weight_g = volume_cm3 × density`

### 6.4 Print Cost Calculator — **P0**
- Inputs:
  - Filament used (g) — or length (m) with material (auto-converts via 6.3)
  - Material price per kg (prefilled from preset)
  - Print time (h + m inputs)
  - Printer power draw (W) and electricity price per kWh (prefilled from settings/preset)
  - Machine wear/depreciation per hour (optional, default 0)
  - Labor/handling cost (flat, optional, default 0)
  - Failure/waste margin % (DEFAULT 5%)
  - Markup % (DEFAULT 0%)
  - Quantity (DEFAULT 1)
- Output **breakdown table**: material, electricity, machine wear, labor, subtotal, + failure margin, + markup, **total per piece**, **total for quantity**, and suggested price.
- Formulas:
  ```
  material    = (grams / 1000) × price_per_kg
  electricity = (watts / 1000) × hours × price_per_kwh
  wear        = hours × wear_per_hour
  base        = material + electricity + wear + labor
  with_fail   = base × (1 + fail_pct/100)
  total       = with_fail × (1 + markup_pct/100)
  ```
- "Copy as text" button producing a short quote summary the user can paste into WhatsApp/email.

### 6.5 Shrinkage / Dimensional Compensation — **P0**
- Inputs: desired final dimension, material preset (shrinkage %, editable per-run).
- Output: **compensated dimension** to model/scale, and the scale % to apply in the slicer.
- DEFAULT formula (division model): `scale_pct = 100 / (1 − shrink_pct/100)`; `compensated = desired / (1 − shrink_pct/100)`. Document this in "Formula & notes" and note that a simple `1 + s` approximation differs slightly at high shrinkage.
- Show a warning banner: "Shrinkage varies by brand, temperature, and geometry. Print a test piece and refine the value."

### 6.6 Tolerance / Fit Helper — **P0**
- Input: nominal dimension (mm) and fit type: *press fit*, *snug*, *slip/sliding*, *loose/free*.
- Output: recommended **hole dimension** and **shaft/peg dimension** offsets using a configurable clearance table (DEFAULT, user-editable in-app):

  | Fit | Clearance per side (mm) |
  |---|---|
  | Press | 0.00–0.05 |
  | Snug | 0.05–0.10 |
  | Slip | 0.10–0.20 |
  | Loose | 0.20–0.35 |

  Show a **range** (min–max), not one fake-precise number. Add note: depends on printer calibration and nozzle size; verify with a test print.
- Hole compensation: allow optional "FDM holes print small" extra offset input (DEFAULT 0.0 mm, with helper text suggesting 0.1–0.2 as a common starting point).

### 6.7 Flow Rate Calculator — **P0**
- Inputs: line width (DEFAULT nozzle × 1.1 → show as editable), layer height, print speed (mm/s).
- Output: volumetric flow in **mm³/s**.
- Reverse mode: given hotend max volumetric flow (mm³/s) and layer height + line width → **max speed (mm/s)**.
- Formula: `Q = line_width × layer_height × speed`.
- Include a small reference list of typical hotend limits (labelled "rough guide, varies by hotend/filament"): standard V6-style ~10–15 mm³/s, high-flow ~20–30+ mm³/s.

### 6.8 Calibration Helper (E-steps / Rotation Distance / Steps-per-mm) — **P0**
- **Extruder e-steps:** inputs: current e-steps/mm, requested extrusion length (DEFAULT 100 mm), actual extruded length (measured). Output: new e-steps/mm. Formula: `new = current × requested / actual`. Show the equivalent Klipper `rotation_distance` if the user toggles "Klipper": `new_rd = current_rd × actual / requested`.
- **Axis steps/mm:** inputs: motor full steps/rev (DEFAULT 200), microstepping (DEFAULT 16), belt pitch (DEFAULT 2 mm), pulley teeth (DEFAULT 20). Output: steps/mm = `(full_steps × microsteps) / (pitch × teeth)`. Also lead-screw mode: `(full_steps × microsteps) / lead_mm`.
- **Dimensional-error correction:** inputs: current steps/mm, expected length, measured length → new steps/mm = `current × expected / measured`.
- A guard: if the correction factor deviates by more than ±10%, show a warning to double-check measurements.

### 6.9 Layer & Time Helper — **P1**
- Inputs: model height (mm), first layer height, layer height → **number of layers** and the Z value of the top layer.
- Rough print-time estimate from volume ÷ effective flow (clearly labelled "rough estimate; your slicer is authoritative").
- Layer-height sanity check: warn if layer height > 80% of nozzle diameter or < 10%.

### 6.10 Filament Weight From Model Volume — **P1**
- Input: model volume (cm³ or mm³ as shown in slicer/CAD), infill %, perimeters/solid fraction (simple model: `effective_solid_fraction` input, DEFAULT 35%), material → estimated grams and cost. Labelled as an estimate.

### 6.11 Reference Sheets — **P1**
Static, searchable, offline pages:
- **Material cheat sheet:** nozzle temp range, bed temp, drying temp/time, enclosure needed (yes/no), notes.
- **Hole size guide:** metric screw tap/clearance holes (M2–M8), heat-set insert hole sizes, magnet pocket allowances.
- **Nozzle/line width/layer height pairing guide.**
- All values need a visible "typical values — check manufacturer datasheet" disclaimer and must be stored as data files (`src/data/*.json`) so they are easy to edit.

## 7. Built-in Material Defaults (data file `src/data/materials.json`)

Values are typical figures, **editable by the user**; display a "typical, varies by brand" tag. *Confidence: [Likely] for density/shrinkage ranges, brand-specific values will differ.*

| Material | Density g/cm³ | Shrinkage % (default) | Nozzle °C | Bed °C | Dry |
|---|---|---|---|---|---|
| PLA | 1.24 | 0.3 | 190–220 | 50–65 | 45 °C, 4–6 h |
| PLA+ | 1.24 | 0.3 | 200–230 | 50–65 | 45 °C, 4–6 h |
| PETG | 1.27 | 0.4 | 230–250 | 70–85 | 65 °C, 4–6 h |
| ABS | 1.04 | 0.7 | 230–260 | 90–110 | 80 °C, 4 h |
| ASA | 1.07 | 0.6 | 240–260 | 90–110 | 80 °C, 4 h |
| TPU (95A) | 1.21 | 0.5 | 210–240 | 30–60 | 50 °C, 6 h |
| Nylon (PA12/PA6) | 1.01–1.14 (use 1.10) | 1.5 | 240–270 | 70–90 | 80 °C, 8–12 h |
| PC | 1.20 | 0.7 | 260–300 | 100–120 | 80 °C, 6 h |
| PLA-CF / PETG-CF | 1.30 | 0.2 | per base | per base | per base |

## 8. Data Model (localStorage)

Key: `printkit:v1`. Single JSON object, versioned.

```ts
type Settings = {
  currency: string;            // "₹"
  electricityPerKwh: number;   // 8
  filamentDiameter: number;    // 1.75
  nozzleDiameter: number;      // 0.4
  decimals: number;            // 3
  theme: "system" | "dark" | "light";
};

type Material = {
  id: string; name: string; density: number;
  pricePerKg?: number; shrinkagePct?: number; builtIn: boolean;
};

type Printer = {
  id: string; name: string;
  buildX: number; buildY: number; buildZ: number;   // mm
  nozzle: number; powerW: number; wearPerHour?: number;
};

type Store = {
  version: 1;
  settings: Settings;
  materials: Material[];
  printers: Printer[];
  recentTools: string[];   // tool slugs, max 3
};
```
- Provide `migrate(store)` stub so future versions do not wipe data.
- If `localStorage` is unavailable or corrupt: fall back to defaults, show a non-blocking notice.

## 9. Project Structure (suggested)

```
printkit/
├─ public/            # manifest.webmanifest, icons
├─ src/
│  ├─ lib/calc/       # pure math: length.ts, filament.ts, cost.ts, shrinkage.ts,
│  │                  #   tolerance.ts, flow.ts, calibration.ts, scale.ts, layers.ts
│  ├─ lib/format.ts   # rounding, number parsing ("1 3/8", comma decimals)
│  ├─ lib/store.ts    # localStorage, migration, import/export
│  ├─ data/           # materials.json, hole-sizes.json, etc.
│  ├─ components/     # Field, ResultRow (with copy), ToolCard, FormulaNote
│  ├─ tools/          # one folder per tool page (lazy-loaded)
│  ├─ App.tsx, main.tsx
├─ tests/             # *.test.ts for every file in lib/calc
└─ README.md
```

## 10. Acceptance Criteria and Test Vectors

The agent must include unit tests covering **at least** these exact cases (tolerance ±0.001 unless stated):

**Length**
- 25.4 mm → 1 in; 1 in → 25.4 mm; 304.8 mm → 1 ft
- 150 mm → 15 cm; 12.5 cm → 125 mm; 0.5 mm → 0.05 cm
- `"1 3/8"` inches → 34.925 mm; `"3/16"` in → 4.7625 mm
- `"1,5"` (comma) parsed as 1.5

**Filament** (PLA 1.24 g/cm³, 1.75 mm)
- 1 m → ≈ 2.983 g (volume ≈ 2.405 cm³)
- 1000 g → ≈ 335.2 m
- 2.85 mm, PLA, 1 m → ≈ 7.911 g (±0.01)

**Flow**
- 0.4 line × 0.2 layer × 60 mm/s → 4.8 mm³/s
- Max speed for 12 mm³/s at 0.44 × 0.2 → ≈ 136.36 mm/s

**Shrinkage**
- 100 mm desired, 0.5% → compensated ≈ 100.503 mm; scale ≈ 100.503%

**Calibration**
- e-steps 93, requested 100, actual 96 → 96.875
- 200 steps × 16 µsteps, 2 mm pitch, 20 teeth → 80 steps/mm
- Dimensional: current 80, expected 100, measured 99.5 → ≈ 80.402

**Cost**
- 250 g, ₹1000/kg, 5 h, 120 W, ₹8/kWh, 0 wear, 0 labor, 5% fail, 20% markup →
  material 250.00 + electricity 4.80 = base 254.80; with fail 267.54; total **321.048 → ₹321.05**

**Fit to build volume**
- Part 300×100×50, bed 220×220×250, 0 margin → max scale ≈ 73.33%, limiting axis X

**UX acceptance**
- Cold load to usable converter on mid-range Android over 4G in < 2.5 s.
- Airplane mode after first visit: app loads and all P0 tools work.
- Invalid input never shows `NaN`/`Infinity`.
- Settings export → clear data → import restores identical state.
- Installable to home screen on Android Chrome and iOS Safari ("Add to Home Screen").

## 11. Milestones

1. **M1 — Foundation (day 1):** Vite+React+TS+Tailwind scaffold, routing, theme, settings store, PWA shell, number parser/formatter with tests.
2. **M2 — Core tools (days 2–3):** Length Converter, Scale, Filament, Print Cost. Unit tests per §10.
3. **M3 — Remaining P0 (days 3–4):** Shrinkage, Tolerance, Flow, Calibration. Presets UI, import/export.
4. **M4 — Polish (day 5):** command palette, copy buttons, formula notes, a11y pass, Lighthouse pass, README, deploy.
5. **M5 — P1 tools:** Layer/Time helper, Volume→Weight, reference sheets.

## 12. Future Ideas (explicitly out of scope for v1)

- STL upload with in-browser volume/bounding-box calculation (can be done client-side, no backend).
- Resin printing tools (resin volume/cost, exposure notes).
- Multi-material/multicolor purge waste estimate.
- Saved quote history with PDF export.
- Optional cloud sync (only if multi-device use proves painful; JSON export/import should cover this first).

## 13. Risks and Notes for the Agent

- **Correctness over cleverness:** keep all math in `lib/calc`, tested, with the formula visible on-page.
- **Do not invent precision.** Estimate tools (time, weight from volume, fit clearances, shrinkage) must say they are estimates and show ranges where specified.
- **Reference data is approximate.** Material properties vary by brand; always allow user edits and show disclaimer text.
- **Service worker caching:** use a versioned cache and an update prompt ("New version available — reload") so users never get stuck on stale builds.
- If any requirement here conflicts or is ambiguous, pick the simplest option that satisfies the acceptance criteria and document the decision in `README.md` under "Decisions".

## 14. Definition of Done (v1.0)

- All P0 tools implemented per §6 and passing the §10 test vectors.
- PWA installable and offline-capable.
- Lighthouse targets in §5.5 met.
- README with setup, scripts (`dev`, `build`, `test`), deploy instructions, and a list of tools.
- Deployed to a public static URL.

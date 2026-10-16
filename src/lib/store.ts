// localStorage-backed store (PRD 8). Single versioned JSON under key printkit:v1.
// Falls back to defaults with a notice when storage is unavailable or corrupt.

import materialsData from '../data/materials.json'

export type Settings = {
  currency: string
  electricityPerKwh: number
  filamentDiameter: number
  nozzleDiameter: number
  decimals: number
  theme: 'system' | 'dark' | 'light'
}

export type Material = {
  id: string
  name: string
  density: number
  pricePerKg?: number
  shrinkagePct?: number
  builtIn: boolean
}

export type Printer = {
  id: string
  name: string
  buildX: number
  buildY: number
  buildZ: number
  nozzle: number
  powerW: number
  wearPerHour?: number
}

export type Store = {
  version: 1
  settings: Settings
  materials: Material[]
  printers: Printer[]
  recentTools: string[]
  initialized: boolean
}

export const KEY = 'printkit:v1'

export const defaultSettings = (): Settings => ({
  currency: '₹',
  electricityPerKwh: 8.0,
  filamentDiameter: 1.75,
  nozzleDiameter: 0.4,
  decimals: 3,
  theme: 'system',
})

const num = (v: unknown, fallback: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback)

// Trust boundary (PRD 5.3): an imported or stored file may carry wrong types.
// Every field is coerced to the shape Settings promises, so no bad import can
// later reach fmt() and render NaN.
export function sanitizeSettings(raw: unknown): Settings {
  const base = defaultSettings()
  if (!raw || typeof raw !== 'object') return base
  const s = raw as Record<string, unknown>
  const decimals = num(s.decimals, base.decimals)
  return {
    currency: typeof s.currency === 'string' && s.currency !== '' ? s.currency : base.currency,
    electricityPerKwh: num(s.electricityPerKwh, base.electricityPerKwh),
    filamentDiameter: num(s.filamentDiameter, base.filamentDiameter),
    nozzleDiameter: num(s.nozzleDiameter, base.nozzleDiameter),
    decimals: Number.isInteger(decimals) && decimals >= 0 && decimals <= 6 ? decimals : base.decimals,
    theme: s.theme === 'dark' || s.theme === 'light' || s.theme === 'system' ? s.theme : base.theme,
  }
}

function sanitizeMaterials(raw: unknown, fallback: Material[]): Material[] {
  if (!Array.isArray(raw)) return fallback
  return raw.flatMap((item): Material[] => {
    if (!item || typeof item !== 'object') return []
    const m = item as Record<string, unknown>
    if (typeof m.id !== 'string' || typeof m.name !== 'string' || !(num(m.density, 0) > 0)) return []
    return [{
      id: m.id,
      name: m.name,
      density: num(m.density, 0),
      pricePerKg: typeof m.pricePerKg === 'number' && Number.isFinite(m.pricePerKg) ? m.pricePerKg : undefined,
      shrinkagePct: typeof m.shrinkagePct === 'number' && Number.isFinite(m.shrinkagePct) ? m.shrinkagePct : undefined,
      builtIn: m.builtIn === true,
    }]
  })
}

function sanitizePrinters(raw: unknown): Printer[] {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((item): Printer[] => {
    if (!item || typeof item !== 'object') return []
    const p = item as Record<string, unknown>
    if (typeof p.id !== 'string' || typeof p.name !== 'string') return []
    const x = num(p.buildX, 0)
    const y = num(p.buildY, 0)
    const z = num(p.buildZ, 0)
    if (!(x > 0 && y > 0 && z > 0)) return []
    return [{
      id: p.id,
      name: p.name,
      buildX: x,
      buildY: y,
      buildZ: z,
      nozzle: num(p.nozzle, 0.4),
      powerW: num(p.powerW, 0),
      wearPerHour: typeof p.wearPerHour === 'number' && Number.isFinite(p.wearPerHour) ? p.wearPerHour : undefined,
    }]
  })
}

export function builtinMaterials(): Material[] {
  return (materialsData as Array<Record<string, unknown>>).map((m) => ({
    id: `built-in-${m.id as string}`,
    name: m.name as string,
    density: m.density as number,
    pricePerKg: m.pricePerKg as number | undefined,
    shrinkagePct: m.shrinkagePct as number | undefined,
    builtIn: true,
  }))
}

export const EXAMPLE_PRINTERS: Printer[] = [
  { id: 'tpl-e3', name: 'Generic 220×220×250', buildX: 220, buildY: 220, buildZ: 250, nozzle: 0.4, powerW: 120 },
  { id: 'tpl-256', name: 'Generic 256×256×256', buildX: 256, buildY: 256, buildZ: 256, nozzle: 0.4, powerW: 150 },
  { id: 'tpl-350', name: 'Generic 350×350×350', buildX: 350, buildY: 350, buildZ: 350, nozzle: 0.4, powerW: 200 },
]

export function defaultStore(): Store {
  return {
    version: 1,
    settings: defaultSettings(),
    materials: builtinMaterials(),
    printers: [],
    recentTools: [],
    initialized: false,
  }
}

// Future-proofing hook (PRD 8): a migrate() stub future versions extend so we
// never wipe user data.
export function migrate(raw: unknown): Store {
  if (!raw || typeof raw !== 'object') return defaultStore()
  const s = raw as Partial<Store>
  const base = defaultStore()
  return {
    version: 1,
    settings: sanitizeSettings(s.settings),
    materials: sanitizeMaterials(s.materials, base.materials),
    printers: sanitizePrinters(s.printers),
    recentTools: Array.isArray(s.recentTools) ? s.recentTools.filter((x): x is string => typeof x === 'string').slice(0, 3) : [],
    initialized: typeof s.initialized === 'boolean' ? s.initialized : false,
  }
}

export function load(): { store: Store; degraded: boolean } {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { store: defaultStore(), degraded: false }
    return { store: migrate(JSON.parse(raw)), degraded: false }
  } catch {
    return { store: defaultStore(), degraded: true }
  }
}

export function save(store: Store): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
    return true
  } catch {
    return false
  }
}

export function exportJson(store: Store): string {
  return JSON.stringify(store, null, 2)
}

// Import validation: reject anything that is not a plausible store without
// throwing (PRD 5.3). Returns null when the file is malformed.
export function importJson(text: string): Store | null {
  try {
    const raw = JSON.parse(text) as unknown
    if (!raw || typeof raw !== 'object') return null
    const s = raw as Partial<Store>
    if (typeof s.version !== 'number') return null
    if (!s.settings || typeof s.settings !== 'object') return null
    // migrate() type-checks every field, so the returned store is always safe.
    return migrate(s)
  } catch {
    return null
  }
}

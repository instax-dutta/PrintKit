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
    settings: { ...base.settings, ...(s.settings ?? {}) },
    materials: Array.isArray(s.materials) ? s.materials : base.materials,
    printers: Array.isArray(s.printers) ? s.printers : base.printers,
    recentTools: Array.isArray(s.recentTools) ? s.recentTools.slice(0, 3) : [],
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
    if (typeof s.settings !== 'object') return null
    const st = migrate(s)
    if (!Array.isArray(st.materials) || !Array.isArray(st.printers)) return null
    return st
  } catch {
    return null
  }
}

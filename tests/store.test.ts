import { describe, expect, it } from 'vitest'
import { exportJson, importJson, migrate, defaultStore, KEY } from '../src/lib/store'
import { fmt, fractionalInch } from '../src/lib/format'

describe('store (PRD 8, 10 UX)', () => {
  it('default store shape matches PRD', () => {
    const s = defaultStore()
    expect(s.version).toBe(1)
    expect(s.settings).toMatchObject({ currency: '₹', electricityPerKwh: 8, filamentDiameter: 1.75, nozzleDiameter: 0.4, decimals: 3, theme: 'system' })
    expect(s.materials.length).toBe(9)
    expect(s.recentTools).toEqual([])
  })
  it('migrate fills missing fields from defaults', () => {
    const s = migrate({ version: 1, settings: { currency: '$' } })
    expect(s.settings.currency).toBe('$')
    expect(s.settings.electricityPerKwh).toBe(8)
    expect(s.materials.length).toBe(9)
  })
  it('round trip export -> import is identical (PRD UX acceptance)', () => {
    const s = defaultStore()
    s.materials = [...s.materials, { id: 'x1', name: 'My ABS mix', density: 1.02, pricePerKg: 900, shrinkagePct: 0.9, builtIn: false }]
    s.printers = [{ id: 'p1', name: 'Voron V2.4 350', buildX: 350, buildY: 350, buildZ: 340, nozzle: 0.6, powerW: 250, wearPerHour: 2 }]
    s.recentTools = ['cost']
    s.settings = { ...s.settings, decimals: 4, theme: 'light', currency: '€' }
    const imported = importJson(exportJson(s))
    expect(imported).toEqual(s)
  })
  it('rejects malformed or non-store imports', () => {
    expect(importJson('')).toBeNull()
    expect(importJson('{}')).toBeNull()
    expect(importJson('[]')).toBeNull()
    expect(importJson('{"version":"1"}')).toBeNull()
    expect(importJson('not json')).toBeNull()
    expect(importJson('{"version":1,"settings":{"currency":"$"}}')).not.toBeNull()
  })
  it('KEY constant is the PRD key', () => expect(KEY).toBe('printkit:v1'))
})

describe('negative UX guards (PRD 5.1, §10)', () => {
  it('no NaN shown: empty or invalid inputs give empty strings', () => {
    expect(fmt(Number.NaN)).toBe('')
    expect(fmt(Number.NaN, 'length')).toBe('')
  })
  it('fractional inch of huge values still safe', () => {
    expect(fractionalInch(Number.NaN)).toBeNull()
    expect(fractionalInch(3)?.text).toBe('3"')
  })
})

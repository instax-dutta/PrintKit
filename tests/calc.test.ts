import { describe, expect, it } from 'vitest'
import { convert, convertAll, fromMm, toMm } from '../src/lib/calc/length'
import { fractionalInch, fmt, parseNumber } from '../src/lib/format'
import { grams, lengthFromVolume, lengthFromWeight, spoolRemaining, volumeCm3, weightFromVolume } from '../src/lib/calc/filament'
import { computeCost } from '../src/lib/calc/cost'
import { compensation } from '../src/lib/calc/shrinkage'
import { fitToBuild, scalePct, scaledDim } from '../src/lib/calc/scale'
import { flowMm3PerS, maxSpeed } from '../src/lib/calc/flow'
import { deviationPct, dimensionalCorrection, newEsteps, stepsPerMmBelt } from '../src/lib/calc/calibration'
import { layers, layerSanity, roughTimeSeconds } from '../src/lib/calc/layers'

const T = 0.001

describe('PRD §10 length vectors', () => {
  it('25.4 mm = 1 in', () => expect(convert(25.4, 'mm', 'in')).toBeCloseTo(1, 10))
  it('1 in = 25.4 mm', () => expect(convert(1, 'in', 'mm')).toBeCloseTo(25.4, 10))
  it('304.8 mm = 1 ft', () => expect(fromMm(304.8, 'ft')).toBeCloseTo(1, 10))
  it('150 mm = 15 cm', () => expect(convert(150, 'mm', 'cm')).toBeCloseTo(15, 10))
  it('12.5 cm = 125 mm', () => expect(convert(12.5, 'cm', 'mm')).toBeCloseTo(125, 10))
  it('0.5 mm = 0.05 cm', () => expect(convert(0.5, 'mm', 'cm')).toBeCloseTo(0.05, 10))
  it('"1 3/8" inches = 34.925 mm', () => expect(convert(parseNumber('1 3/8'), 'in', 'mm')).toBeCloseTo(34.925, 10))
  it('"3/16" in = 4.7625 mm', () => expect(convert(parseNumber('3/16'), 'in', 'mm')).toBeCloseTo(4.7625, 10))
  it('"1,5" parsed as 1.5', () => expect(parseNumber('1,5')).toBeCloseTo(1.5, 10))
})

describe('PRD §10 filament vectors (PLA 1.24, 1.75 mm)', () => {
  it('1 m = 2.983 g', () => expect(grams(1, 1.24, 1.75)).toBeCloseTo(2.983, T))
  it('1 m volume = 2.405 cm3', () => expect(volumeCm3(1, 1.75)).toBeCloseTo(2.405, T))
  it('1000 g = 335.2 m', () => expect(lengthFromWeight(1000, 1.24, 1.75)).toBeCloseTo(335.3, 1))
  it('2.85 mm 1 m = 7.911 g (±0.01)', () => expect(grams(1, 1.24, 2.85)).toBeCloseTo(7.911, 0.01))
  it('roundtrip weight->volume->weight', () => {
    const v = 500 / 1.24
    expect(weightFromVolume(v, 1.24)).toBeCloseTo(500, T)
  })
  it('length from volume', () => expect(lengthFromVolume(2.405, 1.75)).toBeCloseTo(1.0, 2))
  it('spool remaining: 1000 gross, 250 empty = 750 g + its length', () => {
    const r = spoolRemaining(1000, 250, 1.24, 1.75)
    expect(r.grams).toBeCloseTo(750, T)
    expect(r.metres).toBeCloseTo(lengthFromWeight(750, 1.24, 1.75), T)
  })
})

describe('PRD §10 shrinkage vectors', () => {
  it('100 mm at 0.5% -> compensated 100.5025', () => expect(compensation(0.5, 100).compensatedMm).toBeCloseTo(100.5025, T))
  it('scale = 100.5025%', () => expect(compensation(0.5, 100).scalePct).toBeCloseTo(100.5025, T))
})

describe('PRD §10 flow vectors', () => {
  it('0.4 x 0.2 x 60 = 4.8 mm3/s', () => expect(flowMm3PerS(0.4, 0.2, 60)).toBeCloseTo(4.8, 10))
  it('max speed 12 mm3/s at 0.44 x 0.2 = 136.36', () => expect(maxSpeed(12, 0.44, 0.2)).toBeCloseTo(136.36, 1))
})

describe('PRD §10 calibration vectors', () => {
  it('e-steps 93, req 100, act 96 = 96.875', () => expect(newEsteps(93, 100, 96)).toBeCloseTo(96.875, 10))
  it('200 steps x 16, 2 mm pitch, 20 teeth = 80 steps/mm', () => expect(stepsPerMmBelt(200, 16, 2, 20)).toBeCloseTo(80, 10))
  it('dimensional: current 80, expected 100, measured 99.5 = 80.402', () => expect(dimensionalCorrection(80, 100, 99.5)).toBeCloseTo(80.402, T))
  it('deviation 99.5 vs 100 expected is 0.5%', () => expect(deviationPct(100, 99.5)).toBeCloseTo(0.5, T))
})

describe('PRD §10 cost vector', () => {
  const input = {
    grams: 250,
    pricePerKg: 1000,
    hours: 5,
    watts: 120,
    pricePerKwh: 8,
    wearPerHour: 0,
    labor: 0,
    failPct: 5,
    markupPct: 20,
    quantity: 1,
  }
  const b = computeCost(input)
  it('material = 250.00', () => expect(b.material).toBeCloseTo(250, 1))
  it('electricity = 4.80', () => expect(b.electricity).toBeCloseTo(4.8, 1))
  it('base = 254.80', () => expect(b.base).toBeCloseTo(254.8, 1))
  it('with fail = 267.54', () => expect(b.withFail).toBeCloseTo(267.54, 1))
  it('total = 321.048', () => expect(b.total).toBeCloseTo(321.048, T))
  it('totalForQty with qty 1 = same', () => expect(b.totalForQty).toBeCloseTo(321.048, T))
})

describe('PRD §10 fit to build vector', () => {
  it('300x100x50 in 220x220x250 -> 73.33% on X', () => {
    const fit = fitToBuild({ x: 300, y: 100, z: 50 }, { x: 220, y: 220, z: 250, margin: 0 })
    expect(fit?.scalePct).toBeCloseTo(73.333, 2)
    expect(fit?.limitingAxis).toBe('X')
  })
  it('scale pct of 220/300', () => expect(scalePct(300, 220)).toBeCloseTo(73.333, 2))
  it('scaledDim', () => expect(scaledDim(300, 73.333)).toBeCloseTo(220, 1))
})

describe('PRD §10 parsing / display rules', () => {
  it('fractionalInch(0.3125) = 5/16', () => expect(fractionalInch(0.3125)?.text).toBe('5/16"'))
  it('fractionalInch error mm for inexact value', () => {
    const f = fractionalInch(0.314) // nearest 1/64 is 0.3125 -> error in mm negative
    expect(f?.text).toBe('5/16"')
    expect(f?.errorMm.startsWith('-')).toBe(true)
  })
  it('1 3/8 -> 1 3/8 nearest 1/64', () => expect(fractionalInch(1.375)?.text).toBe('1 3/8"'))
  it('1ft -> 1 ft mass', () => expect(toMm(1, 'ft')).toBeCloseTo(304.8, 10))
  it('decimal rules default: length 3, money 2, pct 1', () => {
    expect(fmt(100.5025, 'length')).toBe('100.503')
    expect(fmt(320.999, 'money')).toBe('321')
    expect(fmt(100.5025, 'pct')).toBe('100.5')
  })
  it('decimal override applies', () => {
    expect(fmt(1.23456, 'general', 2)).toBe('1.23')
    expect(fmt(1.23456, 'general', 0)).toBe('1')
  })
  it('invalid raw values never surface NaN', () => {
    expect(fmt(Number.NaN)).toBe('')
    expect(fmt(1 / 0)).toBe('')
  })
  it('parseNumber(" 7 ") = 7 and empty = NaN', () => {
    expect(parseNumber(' 7 ')).toBe(7)
    expect(Number.isNaN(parseNumber(''))).toBe(true)
    expect(Number.isNaN(parseNumber('abc'))).toBe(true)
    expect(Number.isNaN(parseNumber('4/0'))).toBe(true)
  })
})

describe('PRD §6.9 layer helper + sanity', () => {
  it('20 mm, first 0.2, layer 0.2 -> 100 layers, top Z 20', () => {
    const c = layers(20, 0.2, 0.2)
    expect(c?.count).toBe(100)
    expect(c?.topZMm).toBeCloseTo(20, 10)
  })
  it('rough time: 24000 mm3 at 10 mm3/s = 2400 s', () => expect(roughTimeSeconds(24000, 10)).toBeCloseTo(2400, 6))
  it('sanity: 0.8 layer x 0.4 nozzle warns high and 0.03 warns low', () => {
    expect(layerSanity(0.8, 0.4)).toMatch(/more than 80%/)
    expect(layerSanity(0.03, 0.4)).toMatch(/under 10%/)
    expect(layerSanity(0.2, 0.4)).toBeNull()
  })
  it('layers guard: zero layer suggests no calc', () => expect(layers(20, 0.2, 0)).toBeNull())
  it('convertAll has 6 rows incl mm', () => {
    const rows = convertAll(25.4)
    expect(rows).toHaveLength(6)
    expect(rows.find((r) => r.unit === 'in')?.value).toBeCloseTo(1, 10)
  })
})

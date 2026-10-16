// Pure length math. 1 in = 25.4 mm exactly; 1 ft = 304.8 mm exactly (PRD 6.1).

export type LenUnit = 'mm' | 'cm' | 'm' | 'in' | 'ft' | 'um'

export const UNITS: readonly LenUnit[] = ['mm', 'cm', 'm', 'in', 'ft', 'um']

export const MM_PER: Record<LenUnit, number> = {
  mm: 1,
  cm: 10,
  m: 1000,
  in: 25.4,
  ft: 304.8,
  um: 0.001,
}

export function toMm(value: number, unit: LenUnit): number {
  return value * MM_PER[unit]
}

export function fromMm(mm: number, unit: LenUnit): number {
  return mm / MM_PER[unit]
}

export function convert(value: number, from: LenUnit, to: LenUnit): number {
  return fromMm(toMm(value, from), to)
}

export function convertAll(mm: number): Array<{ unit: LenUnit; value: number }> {
  return UNITS.map((unit) => ({ unit, value: fromMm(mm, unit) }))
}

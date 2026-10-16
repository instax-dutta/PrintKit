// Parsing and display formatting. Locale rule (PRD 5.1): "." and "," are both
// accepted decimal separators; fractional inches accept "1 3/8" and "3/16".

export function parseNumber(input: string): number {
  const s = input.trim()
  if (!s) return Number.NaN
  if (s.includes('/')) {
    const f = parseFraction(s)
    if (!Number.isNaN(f)) return f
  }
  const cleaned = s.replace(/,/g, '.')
  if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(cleaned)) return Number.NaN
  const v = Number(cleaned)
  return Number.isFinite(v) ? v : Number.NaN
}

function parseFraction(s: string): number {
  const mixed = /^([+-]?)\s*(\d+)?\s+(\d+)\/(\d+)$/.exec(s)
  if (mixed) {
    const den = Number(mixed[4])
    if (den === 0 || Number(mixed[3]) >= den) return Number.NaN
    const whole = Number(mixed[2]) || 0
    const v = ((whole * den + Number(mixed[3])) / den) * (mixed[1] === '-' ? -1 : 1)
    return Number.isFinite(v) ? v : Number.NaN
  }
  const simple = /^([+-]?)\s*(\d+)\/(\d+)$/.exec(s)
  if (simple) {
    const den = Number(simple[3])
    if (den === 0) return Number.NaN
    const v = (Number(simple[2]) / den) * (simple[1] === '-' ? -1 : 1)
    return Number.isFinite(v) ? v : Number.NaN
  }
  return Number.NaN
}

export function isValid(input: string): boolean {
  return Number.isFinite(parseNumber(input))
}

type Kind = 'length' | 'money' | 'pct' | 'general'

const KIND_DECIMALS: Record<Kind, number> = { length: 3, money: 2, pct: 1, general: 3 }

// PRD 5.1: a single Settings.decimals value (0-6, default 3) with one escape
// hatch: the shipped default 3 means per-kind defaults (lengths 3, money 2,
// percentages 1); any other value applies globally.
export function fmt(v: number, kind: Kind = 'general', decimals = 3): string {
  if (!Number.isFinite(v)) return ''
  return round(v, decimalsFor(kind, decimals)).toString()
}

function decimalsFor(kind: Kind, decimals: number): number {
  return decimals === 3 ? KIND_DECIMALS[kind] : decimals
}

function round(v: number, d: number): number {
  if (d <= 0) return Math.round(v)
  const f = Math.pow(10, d)
  return Math.round(v * f) / f
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

// Nearest 1/64 fractional inch plus the signed mm error of the approximation
// (PRD 6.1: e.g. `5/16" (+0.004 mm)`). Returns null when inches is not finite.
export function fractionalInch(inches: number): { text: string; errorMm: string } | null {
  if (!Number.isFinite(inches)) return null
  const y = Math.round(inches * 64)
  if (y === 0) return { text: '0"', errorMm: exact(0, inches) }
  const sign = y < 0 ? '-' : ''
  const abs = Math.abs(y)
  if (abs % 64 === 0) return { text: `${sign}${abs / 64}"`, errorMm: exact(sign === '-' ? -abs / 64 : abs / 64, inches) }
  const whole = Math.floor(abs / 64)
  let frac = abs % 64
  let den = 64
  while (den > 1 && frac % 2 === 0) {
    frac /= 2
    den /= 2
  }
  const g = gcd(frac, den)
  const text = `${sign}${whole > 0 ? `${whole} ` : ''}${frac / g}/${den / g}"`
  return { text, errorMm: exact(sign === '-' ? -(whole + frac / den) : whole + frac / den, inches) }
}

function exact(approxInches: number, actualInches: number): string {
  const mm = (approxInches - actualInches) * 25.4
  if (Math.abs(mm) < 0.0005) return '0 mm'
  return `${mm > 0 ? '+' : ''}${round(mm, 3).toString()} mm`
}

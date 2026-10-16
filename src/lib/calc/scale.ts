// Scale calculator math (PRD 6.2).

export function scalePct(original: number, target: number): number {
  return (target / original) * 100
}

export function scaledDim(original: number, pct: number): number {
  return (original * pct) / 100
}

export type FitResult = {
  scalePct: number
  limitingAxis: 'X' | 'Y' | 'Z'
}

// Max uniform scale so the scaled part fits inside the build volume, with a
// margin (mm) kept clear on each horizontal bed edge (PRD 6.2 Mode C).
export function fitToBuild(part: { x: number; y: number; z: number }, volume: { x: number; y: number; z: number; margin: number }): FitResult | null {
  const inner = (avail: number, partLen: number) => (partLen > 0 ? avail / partLen : 0)
  const fx = inner(volume.x - 2 * volume.margin, part.x)
  const fy = inner(volume.y - 2 * volume.margin, part.y)
  const fz = inner(volume.z, part.z)
  const min = Math.min(fx, fy, fz)
  if (min <= 0) return null
  const limitingAxis = min === fx ? 'X' : min === fy ? 'Y' : 'Z'
  return { scalePct: min * 100, limitingAxis }
}

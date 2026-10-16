// Tolerance / fit helper (PRD 6.6). Clearances are per side, shown as ranges.

export type FitType = 'press' | 'snug' | 'slip' | 'loose'

export const DEFAULT_CLEARANCE: Record<FitType, [number, number]> = {
  press: [0.0, 0.05],
  snug: [0.05, 0.1],
  slip: [0.1, 0.2],
  loose: [0.2, 0.35],
}

// Hole grows by clearance + optional FDM hole offset; shaft/peg shrinks by
// clearance. holeOffset is the "FDM holes print small" extra (mm, per side).
export function fit(nominalMm: number, type: FitType, clearance: [number, number] = DEFAULT_CLEARANCE[type], holeOffsetMm = 0): {
  holeMin: number
  holeMax: number
  shaftMin: number
  shaftMax: number
} {
  const [cMin, cMax] = clearance
  return {
    holeMin: nominalMm + cMin + holeOffsetMm,
    holeMax: nominalMm + cMax + holeOffsetMm,
    shaftMin: nominalMm - cMax,
    shaftMax: nominalMm - cMin,
  }
}

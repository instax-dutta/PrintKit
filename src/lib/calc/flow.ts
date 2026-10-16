// Flow rate math (PRD 6.7). Q = line_width x layer_height x speed.

export function flowMm3PerS(lineWidthMm: number, layerHeightMm: number, speedMmS: number): number {
  return lineWidthMm * layerHeightMm * speedMmS
}

// Reverse: hotend max volumetric flow -> max print speed (mm/s).
export function maxSpeed(maxFlowMm3PerS: number, lineWidthMm: number, layerHeightMm: number): number {
  const cross = lineWidthMm * layerHeightMm
  if (cross === 0) return Number.NaN
  return maxFlowMm3PerS / cross
}

// Rough hotend reference (PRD 6.7), labelled loose in UI.
export const HOTEND_LIMITS: Array<{ kind: string; range: string }> = [
  { kind: 'Standard V6-style', range: '~10-15 mm3/s' },
  { kind: 'High-flow', range: '~20-30+ mm3/s' },
]

// Layer count, rough time estimate and layer-height sanity (PRD 6.9).
// Explicit estimate: the slicer is authoritative.

export function layers(modelHeightMm: number, firstLayerMm: number, layerMm: number): { count: number; topZMm: number } | null {
  if (layerMm <= 0 || modelHeightMm <= 0) return null
  if (modelHeightMm <= firstLayerMm) return { count: 1, topZMm: modelHeightMm }
  const count = Math.ceil((modelHeightMm - firstLayerMm) / layerMm) + 1
  return { count, topZMm: firstLayerMm + (count - 1) * layerMm }
}

// Rough seconds-of-print from part volume (mm3) and volumetric flow (mm3/s).
export function roughTimeSeconds(volumeMm3: number, flowMm3PerS: number): number {
  if (flowMm3PerS <= 0) return Number.NaN
  return volumeMm3 / flowMm3PerS
}

// Warn when layer height is above 80% or below 10% of nozzle diameter.
export function layerSanity(layerMm: number, nozzleMm: number): string | null {
  if (layerMm <= 0 || nozzleMm <= 0) return null
  if (layerMm > nozzleMm * 0.8) return `Layer height is more than 80% of the ${fmtNozzle(nozzleMm)} mm nozzle. Prints may be weak or unreliable.`
  if (layerMm < nozzleMm * 0.1) return `Layer height is under 10% of the ${fmtNozzle(nozzleMm)} mm nozzle. Very slow and can under-extrude.`
  return null
}

function fmtNozzle(n: number): string {
  return `${Math.round(n * 100) / 100}`
}

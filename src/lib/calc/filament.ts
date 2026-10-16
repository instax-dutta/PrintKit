// Filament weight/length/volume math (PRD 6.3).
// Cross-section in cm^2: d mm -> radius cm is d/20 (PRD formula).
// volume_cm3 = PI * (d_mm/20)^2 * length_cm ; weight_g = volume_cm3 * density.

const PI = Math.PI

function area(diameterMm: number): number {
  return PI * (diameterMm / 20) ** 2
}

export function volumeCm3(lengthM: number, diameterMm: number): number {
  return area(diameterMm) * (lengthM * 100)
}

export function grams(lengthM: number, density: number, diameterMm: number): number {
  return volumeCm3(lengthM, diameterMm) * density
}

// Metres of filament for a weight in grams.
export function lengthFromWeight(weightG: number, density: number, diameterMm: number): number {
  const a = area(diameterMm)
  if (a === 0) return Number.NaN
  return (weightG / density / a) / 100
}

export function lengthFromVolume(volumeCm3v: number, diameterMm: number): number {
  const a = area(diameterMm)
  if (a === 0) return Number.NaN
  return (volumeCm3v / a) / 100
}

export function weightFromVolume(volumeCm3v: number, density: number): number {
  return volumeCm3v * density
}

// Spool remaining estimator (PRD 6.3): remaining filament grams and length in m.
export function spoolRemaining(grossWeightG: number, emptySpoolG: number, density: number, diameterMm: number): { grams: number; metres: number } {
  const g = grossWeightG - emptySpoolG
  return { grams: g, metres: lengthFromWeight(g, density, diameterMm) }
}

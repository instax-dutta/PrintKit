// Calibration math (PRD 6.8).

// Extruder e-steps: new = current x requested / actual.
export function newEsteps(current: number, requestedMm: number, actualMm: number): number {
  if (actualMm === 0) return Number.NaN
  return (current * requestedMm) / actualMm
}

// Klipper rotation distance: new = current x actual / requested.
export function newRotationDistance(currentRd: number, requestedMm: number, actualMm: number): number {
  if (requestedMm === 0) return Number.NaN
  return (currentRd * actualMm) / requestedMm
}

// Cartesian steps/mm for a belt driven axis (PRD 6.8).
export function stepsPerMmBelt(fullSteps: number, microsteps: number, beltPitchMm: number, pulleyTeeth: number): number {
  return (fullSteps * microsteps) / (beltPitchMm * pulleyTeeth)
}

// Cartesian steps/mm for a lead screw: steps per mm of screw lead.
export function stepsPerMmLeadScrew(fullSteps: number, microsteps: number, leadMm: number): number {
  if (leadMm === 0) return Number.NaN
  return (fullSteps * microsteps) / leadMm
}

// Dimensional-error correction: new = current x expected / measured.
export function dimensionalCorrection(currentStepsmm: number, expectedMm: number, measuredMm: number): number {
  if (measuredMm === 0) return Number.NaN
  return (currentStepsmm * expectedMm) / measuredMm
}

// Deviation between expected and measured, as a percentage of expected.
export function deviationPct(expectedMm: number, measuredMm: number): number {
  if (expectedMm === 0) return Number.NaN
  return (Math.abs(measuredMm - expectedMm) / expectedMm) * 100
}

// Shrinkage / dimensional compensation (PRD 6.5). Division model:
// scale = 100 / (1 - s/100); compensated = desired / (1 - s/100).

export function compensation(shrinkPct: number, desiredMm: number): { compensatedMm: number; scalePct: number } {
  const denom = 1 - shrinkPct / 100
  return {
    compensatedMm: desiredMm / denom,
    scalePct: 100 / denom,
  }
}

// Approximation comparison shown in Formula & notes: a naive 1+s model.
export function naiveScale(shrinkPct: number): number {
  return 100 + shrinkPct
}

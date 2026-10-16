// Print cost breakdown (PRD 6.4).

export type CostInput = {
  grams: number
  pricePerKg: number
  hours: number
  watts: number
  pricePerKwh: number
  wearPerHour: number
  labor: number
  failPct: number
  markupPct: number
  quantity: number
}

export type CostBreakdown = {
  material: number
  electricity: number
  wear: number
  labor: number
  base: number
  withFail: number
  total: number
  totalForQty: number
}

const qty = (n: number): number => Math.max(1, Math.round(n))

export function computeCost(input: CostInput): CostBreakdown {
  const material = (input.grams / 1000) * input.pricePerKg
  const electricity = (input.watts / 1000) * input.hours * input.pricePerKwh
  const wear = input.hours * input.wearPerHour
  const base = material + electricity + wear + input.labor
  const withFail = base * (1 + input.failPct / 100)
  const total = withFail * (1 + input.markupPct / 100)
  return {
    material,
    electricity,
    wear,
    labor: input.labor,
    base,
    withFail,
    total,
    totalForQty: total * qty(input.quantity),
  }
}

// Short plain-text quote for pasting into WhatsApp/email (PRD 6.4).
export function quoteText(input: CostInput, b: CostBreakdown, currency: string): string {
  return [
    `Print quote (${qty(input.quantity)} pc):`,
    `material: ${currency}${b.material}`,
    `electricity: ${currency}${b.electricity}`,
    `wear: ${currency}${b.wear}`,
    `labor: ${currency}${b.labor}`,
    `failure margin ${input.failPct}% included; markup ${input.markupPct}%`,
    `total per piece: ${currency}${b.total}`,
    `total: ${currency}${b.totalForQty}`,
  ].join('\n')
}

import { useState } from 'react'
import { Card, Field, FormulaNote, ResultRow, ToolPage, useParsed } from '../components/ui'
import { compensation, naiveScale } from '../lib/calc/shrinkage'
import { useStoreCtx } from '../lib/storeContext'

export default function Shrinkage() {
  const { store } = useStoreCtx()
  const [matId, setMatId] = useState('')
  const [shrinkRaw, setShrinkRaw, okShrink, shrinkN] = useParsed('')
  const [desiredRaw, setDesiredRaw, okDesired, desiredN] = useParsed('')

  const material = store.materials.find((m) => m.id === matId)
  const shrinkPct = okShrink ? shrinkN : material?.shrinkagePct
  const result = shrinkPct != null && okDesired && Number.isFinite(shrinkPct) && shrinkPct < 100 ? compensation(shrinkPct, desiredN) : null

  return (
    <ToolPage title="Shrinkage Compensation">
      <Card title="Material shrinkage">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-kit-dim">Material preset</span>
          <select className="min-h-[44px] w-full rounded-lg border border-kit-line bg-kit-bg px-3 text-sm" value={matId} onChange={(e) => { setMatId(e.target.value); setShrinkRaw('') }}>
            <option value="">Choose material…</option>
            {store.materials.filter((m) => m.shrinkagePct != null).map((m) => <option key={m.id} value={m.id}>{`${m.name} (${m.shrinkagePct}%)`}</option>)}
          </select>
        </label>
        <div className="mt-3"><Field label="Shrinkage % (editable per run)" value={okShrink ? shrinkRaw : material?.shrinkagePct != null && matId ? String(material.shrinkagePct) : shrinkRaw} onChange={setShrinkRaw} suffix="%" hint="Override with your measured value" /></div>
        <div className="mt-3"><Field label="Desired final dimension" value={desiredRaw} onChange={setDesiredRaw} suffix="mm" /></div>
        <div className="my-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-300">Shrinkage varies by brand, temperature, and geometry. Print a test piece and refine the value.</div>
        <div className="divide-y divide-kit-line/60">
          <ResultRow label="Model / compensate to" value={result ? Math.round(result.compensatedMm * 1000) / 1000 : null} unit="mm" kind="length" decimals={store.settings.decimals} />
          <ResultRow label="Slicer scale" value={result ? result.scalePct : null} unit="%" kind="pct" decimals={store.settings.decimals} />
        </div>
        <FormulaNote>
          <p>Division model: scale % = 100 ÷ (1 − shrink% ÷ 100); compensated = desired ÷ (1 − shrink% ÷ 100). A simpler `1 + s` approximation (shown here: {shrinkPct != null ? naiveScale(shrinkPct) : '-'}% of desired) differs slightly at high shrinkage.</p>
        </FormulaNote>
      </Card>
    </ToolPage>
  )
}

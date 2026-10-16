import { useState } from 'react'
import { Card, Field, FormulaNote, ResultRow, ToolPage, useParsed } from '../components/ui'
import { useStoreCtx } from '../lib/storeContext'

export default function Weight() {
  const { store } = useStoreCtx()
  const [matId, setMatId] = useState('built-in-pla')
  const [volRaw, setVolRaw, okVol, volN] = useParsed('')
  const [unit, setUnit] = useState<'cm3' | 'mm3'>('cm3')
  const [infillRaw, setInfillRaw, okInfill, infillN] = useParsed('15')
  const [shellRaw, setShellRaw, okShell, shellN] = useParsed('35')
  const [priceRaw, setPriceRaw, okPrice, priceN] = useParsed(String(store.materials.find((m) => m.id === 'built-in-pla')?.pricePerKg ?? 1000))

  const material = store.materials.find((m) => m.id === matId)
  const volCm3 = okVol ? (unit === 'cm3' ? volN : volN / 1000) : Number.NaN
  const eff = okInfill && okShell ? (shellN / 100) + ((1 - shellN / 100) * infillN) / 100 : Number.NaN
  const g = volCm3 * (material?.density ?? Number.NaN) * eff
  const cost = (g / 1000) * (okPrice ? priceN : Number.NaN)

  return (
    <ToolPage title="Weight From Model Volume">
      <Card>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-kit-dim">Material</span>
            <select className="min-h-[44px] w-full  border border-kit-panel-border bg-kit-inset px-3 text-sm" value={matId} onChange={(e) => setMatId(e.target.value)}>
              {store.materials.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-kit-dim">Volume unit</span>
            <select className="min-h-[44px] w-full  border border-kit-panel-border bg-kit-inset px-3 text-sm" value={unit} onChange={(e) => setUnit(e.target.value as 'cm3' | 'mm3')}>
              <option value="cm3">cm³</option>
              <option value="mm3">mm³</option>
            </select>
          </label>
        </div>
        <div className="mt-3"><Field label="Model volume" value={volRaw} onChange={setVolRaw} suffix={unit === 'cm3' ? 'cm³' : 'mm³'} hint="What the slicer or CAD shows" /></div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <Field label="Infill" value={infillRaw} onChange={setInfillRaw} suffix="%" hint="Default 15%" />
          <Field label="Solid fraction (shell/perimeters part)" value={shellRaw} onChange={setShellRaw} suffix="%" hint="Default 35%; your printed estimate wins" />
          <Field label={`Material price`} value={priceRaw} onChange={setPriceRaw} suffix={`${store.settings.currency}/kg`} />
        </div>
        <div className="divide-y divide-kit-line">
          <ResultRow label="Estimated weight" value={Number.isFinite(g) && eff > 0 && eff <= 1 ? g : null} unit="g" decimals={store.settings.decimals} />
          <ResultRow label="Estimated material cost" value={Number.isFinite(cost) ? cost : null} unit={store.settings.currency} kind="money" />
        </div>
        <p className="mt-2 text-xs text-kit-dim">Estimate only — actual use depends on overhangs, top/bottom layers, supports and purge.</p>
        <FormulaNote>
          <p>effective fraction = shell/100 + (1 − shell/100) × infill/100. weight g = volume cm³ × density g/cm³ × effective fraction. Cost = weight ÷ 1000 × price per kg.</p>
        </FormulaNote>
      </Card>
    </ToolPage>
  )
}

import { useState } from 'react'
import { Card, Field, FormulaNote, ResultRow, ToolPage, useParsed } from '../components/ui'
import { grams, lengthFromWeight, lengthFromVolume, volumeCm3, weightFromVolume, spoolRemaining } from '../lib/calc/filament'
import { useStoreCtx } from '../lib/storeContext'

type Known = 'weight' | 'length' | 'volume'

export default function Filament() {
  const { store } = useStoreCtx()
  const [matId, setMatId] = useState('built-in-pla')
  const [customDensity, setCustomDensity] = useState('')
  const [customDiamOpen, setCustomDiamOpen] = useState(false)
  const [diam, setDiam] = useState(String(store.settings.filamentDiameter))
  const [known, setKnown] = useState<Known>('weight')
  const [w, setW, okW, wN] = useParsed('')
  const [l, setL, okL, lN] = useParsed('')
  const [v, setV, okV, vN] = useParsed('')

  const material = matId === '__custom' ? null : store.materials.find((m) => m.id === matId)
  const density = material ? material.density : Number(customDensity.replace(',', '.'))
  const d = Number(diam.replace(',', '.'))

  const [spoolG, setSpoolG, okSpool, spoolN] = useParsed('')
  const [emptySpoolG, setEmptySpoolG, okEmpty, emptyN] = useParsed('250')
  const remaining = okSpool && okEmpty && density > 0 && d > 0 ? spoolRemaining(spoolN, emptyN, density, d) : null

  return (
    <ToolPage title="Filament Calculator">
      <Card title="Material">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-kit-dim">Material</span>
            <select className="min-h-[44px] w-full rounded-lg border border-kit-line bg-kit-bg px-3 text-sm" value={matId} onChange={(e) => setMatId(e.target.value)}>
              {store.materials.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.density} g/cm³)</option>)}
              <option value="__custom">Custom density…</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-kit-dim">Diameter</span>
            <select className="min-h-[44px] w-full rounded-lg border border-kit-line bg-kit-bg px-3 text-sm" value={customDiamOpen ? '__custom' : ['1.75', '2.85'].includes(diam) ? diam : ''} onChange={(e) => { if (e.target.value === '__custom') { setCustomDiamOpen(true) } else { setCustomDiamOpen(false); setDiam(e.target.value) } }}>
              {['1.75', '2.85'].map((dd) => <option key={dd} value={dd}>{dd} mm</option>)}
              <option value="__custom">Custom…</option>
            </select>
          </label>
        </div>
        {(matId === '__custom' || customDiamOpen) && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {matId === '__custom' ? <Field label="Density" value={customDensity} onChange={setCustomDensity} suffix="g/cm³" /> : null}
            {customDiamOpen ? <Field label="Diameter" value={diam} onChange={setDiam} suffix="mm" hint="From the spool label" /> : null}
          </div>
        )}
      </Card>

      <Card title="Weight, length, volume">
        <div className="mb-3 flex gap-2">
          {(['weight', 'length', 'volume'] as const).map((k) => (
            <button key={k} type="button" onClick={() => setKnown(k)} aria-pressed={known === k} className={`min-h-[44px] flex-1 rounded-lg border px-2 text-xs font-semibold ${known === k ? 'border-kit-accent text-kit-accent' : 'border-kit-line text-kit-dim'}`}>
              I know the {k}
            </button>
          ))}
        </div>
        {density > 0 && d > 0 ? (
          known === 'weight' ? (
            <>
              <Field label="Weight" value={w} onChange={setW} suffix="g" />
              <ResultRow label="Length" value={okW ? lengthFromWeight(wN, density, d) : null} unit="m" kind="length" decimals={store.settings.decimals} />
              <ResultRow label="Volume" value={okW ? wN / density : null} unit="cm³" decimals={store.settings.decimals} />
            </>
          ) : known === 'length' ? (
            <>
              <Field label="Length" value={l} onChange={setL} suffix="m" />
              <ResultRow label="Weight" value={okL ? grams(lN, density, d) : null} unit="g" decimals={store.settings.decimals} />
              <ResultRow label="Volume" value={okL ? volumeCm3(lN, d) : null} unit="cm³" decimals={store.settings.decimals} />
            </>
          ) : (
            <>
              <Field label="Volume" value={v} onChange={setV} suffix="cm³" />
              <ResultRow label="Weight" value={okV ? weightFromVolume(vN, density) : null} unit="g" decimals={store.settings.decimals} />
              <ResultRow label="Length" value={okV ? lengthFromVolume(vN, d) : null} unit="m" kind="length" decimals={store.settings.decimals} />
            </>
          )
        ) : (
          <div className="divide-y divide-kit-line/60"><ResultRow label="Pick a material, then enter a value" value="" /></div>
        )}
        <FormulaNote>
          <p>volume cm³ = π × (diameter mm ÷ 20)² × length cm; weight g = volume cm³ × density g/cm³. Diameter in mm → radius cm is d ÷ 20.</p>
        </FormulaNote>
      </Card>

      <Card title="Spool remaining">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Current spool weight (gross)" value={spoolG} onChange={setSpoolG} suffix="g" />
          <Field label="Empty spool weight" value={emptySpoolG} onChange={setEmptySpoolG} suffix="g" hint="Typical 250 g; on the spool" />
        </div>
        {density > 0 && d > 0 ? (
          <>
            <ResultRow label="Remaining filament" value={remaining ? remaining.grams : null} unit="g" decimals={store.settings.decimals} />
            <ResultRow label="Remaining length" value={remaining ? remaining.metres : null} unit="m" kind="length" decimals={store.settings.decimals} />
          </>
        ) : (
          <p className="text-xs text-kit-dim">Choose a material above first.</p>
        )}
      </Card>
    </ToolPage>
  )
}

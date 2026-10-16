import { useState } from 'react'
import { Card, Field, ResultRow, FormulaNote, ToolPage, PresetSelect, useParsed } from '../components/ui'
import { fitToBuild, scalePct, scaledDim } from '../lib/calc/scale'
import { EXAMPLE_PRINTERS } from '../lib/store'
import { useStoreCtx } from '../lib/storeContext'

type Mode = 'target' | 'scale' | 'fit'

const fmt2 = (n: number): string => `${(Math.round(n * 1000) / 1000).toString()}`

export default function Scale() {
  const { store } = useStoreCtx()
  const [mode, setMode] = useState<Mode>('target')

  // Mode A: original -> target
  const [oa, setOA, okAo, origA_n] = useParsed('')
  const [ta, setTA, okT, targetA_n] = useParsed('')
  const scaleA = okAo && okT && origA_n !== 0 ? scalePct(origA_n, targetA_n) : null

  // Mode B: dims + scale %
  const [ox, setOx, okX, oxN] = useParsed('')
  const [oy, setOy, okY, oyN] = useParsed('')
  const [oz, setOz, okZ, ozN] = useParsed('')
  const [sp, setSp, okS, spN] = useParsed('100')

  // Mode C: part + printer volume + margin
  const [fx, setFx, okFx, fxN] = useParsed('')
  const [fy, setFy, okFy, fyN] = useParsed('')
  const [fz, setFz, okFz, fzN] = useParsed('')
  const [margin, setMargin, okM, marginN] = useParsed('0')
  const printers = [...store.printers, ...EXAMPLE_PRINTERS]
  const [printerId, setPrinterId] = useState('')
  const [cv, setCv] = useState({ x: 0, y: 0, z: 0 })
  const volume = printerId === '__custom' ? cv : ((p) => (p ? { x: p.buildX, y: p.buildY, z: p.buildZ } : null))(printers.find((p) => p.id === printerId))
  const fit = okFx && okFy && okFz && volume && volume.x > 0 ? fitToBuild({ x: fxN, y: fyN, z: fzN }, { x: volume.x, y: volume.y, z: volume.z, margin: okM ? marginN : 0 }) : null

  const modeBtn = (m: Mode, label: string) => (
    <button key={m} type="button" onClick={() => setMode(m)} aria-pressed={mode === m} className={`min-h-[44px] flex-1 rounded-lg border px-2 text-xs font-semibold ${mode === m ? 'border-kit-accent text-kit-accent' : 'border-kit-line text-kit-dim'}`}>{label}</button>
  )

  return (
    <ToolPage title="Scale Calculator">
      <div className="flex gap-2">{modeBtn('target', 'Target size')}{modeBtn('scale', 'Scale %')}{modeBtn('fit', 'Fit to build')}</div>

      {mode === 'target' && (
        <Card>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Original dimension" value={oa} onChange={setOA} suffix="mm" />
            <Field label="Target dimension" value={ta} onChange={setTA} suffix="mm" />
          </div>
          <ResultRow label="Scale to enter in slicer" value={scaleA} unit="%" kind="pct" decimals={store.settings.decimals} />
          {scaleA != null && okAo ? <ResultRow label="Same scale ratio" value={targetA_n / origA_n} unit="x" decimals={store.settings.decimals} /> : null}
          <FormulaNote><p>scale % = target ÷ original × 100.</p></FormulaNote>
        </Card>
      )}

      {mode === 'scale' && (
        <Card>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Length X" value={ox} onChange={setOx} suffix="mm" />
            <Field label="Length Y" value={oy} onChange={setOy} suffix="mm" />
            <Field label="Height Z" value={oz} onChange={setOz} suffix="mm" />
          </div>
          <div className="mt-3"><Field label="Scale" value={sp} onChange={setSp} suffix="%" /></div>
          {okS && (
            <div className="divide-y divide-kit-line/60">
              {okX && <ResultRow label="New X" value={fmc(scaledDim(oxN, spN))} unit="mm" kind="length" decimals={store.settings.decimals} hint={`${fmc(scaledDim(oxN, spN) / 10)} cm`} />}
              {okY && <ResultRow label="New Y" value={fmc(scaledDim(oyN, spN))} unit="mm" kind="length" decimals={store.settings.decimals} hint={`${fmc(scaledDim(oyN, spN) / 10)} cm`} />}
              {okZ && <ResultRow label="New Z" value={fmc(scaledDim(ozN, spN))} unit="mm" kind="length" decimals={store.settings.decimals} hint={`${fmc(scaledDim(ozN, spN) / 10)} cm`} />}
            </div>
          )}
          <FormulaNote><p>new dim = original × scale% ÷ 100.</p></FormulaNote>
        </Card>
      )}

      {mode === 'fit' && (
        <Card>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Part X" value={fx} onChange={setFx} suffix="mm" />
            <Field label="Part Y" value={fy} onChange={setFy} suffix="mm" />
            <Field label="Part Z" value={fz} onChange={setFz} suffix="mm" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <PresetSelect label="Printer build volume" value={printerId} onChange={setPrinterId} options={[...store.printers, ...EXAMPLE_PRINTERS].map((p) => ({ value: p.id, title: `${p.name} (${p.buildX}×${p.buildY}×${p.buildZ})` }))} customLabel="Custom…" />
            <Field label="Bed margin" value={margin} onChange={setMargin} suffix="mm" hint="Clearance kept from bed edges" />
          </div>
          {printerId === '__custom' && (
            <div className="mt-3 grid grid-cols-3 gap-3">
              <Field label="Volume X" value={cv.x ? String(cv.x) : ''} onChange={(v) => setCv({ ...cv, x: parseFloat(v) || 0 })} suffix="mm" />
              <Field label="Volume Y" value={cv.y ? String(cv.y) : ''} onChange={(v) => setCv({ ...cv, y: parseFloat(v) || 0 })} suffix="mm" />
              <Field label="Volume Z" value={cv.z ? String(cv.z) : ''} onChange={(v) => setCv({ ...cv, z: parseFloat(v) || 0 })} suffix="mm" />
            </div>
          )}
          {fit && (
            <ResultRow label="Max uniform scale" value={fit.scalePct} unit="%" kind="pct" decimals={store.settings.decimals} hint={`Limiting axis: ${fit.limitingAxis}${okM && marginN > 0 ? ` (margin ${fmc(marginN)} mm)` : ''}`} />
          )}
          {!fit && printerId && okFx && okFy && okFz ? <p className="text-xs text-red-400">Did not fit; check the part and volume inputs.</p> : null}
          <FormulaNote><p>scale = min((volumeX − 2·margin) ÷ partX, (volumeY − 2·margin) ÷ partY, volumeZ ÷ partZ) × 100. Margin applies to X and Y only.</p></FormulaNote>
        </Card>
      )}
    </ToolPage>
  )
}

function fmc(v: number): string {
  return Number.isFinite(v) ? fmt2(v) : ''
}


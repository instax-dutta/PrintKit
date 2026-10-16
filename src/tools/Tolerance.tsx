import { useState } from 'react'
import { Card, Field, FormulaNote, ResultRow, ToolPage, useParsed } from '../components/ui'
import { DEFAULT_CLEARANCE, fit, type FitType } from '../lib/calc/tolerance'
import { useStoreCtx } from '../lib/storeContext'

const FITS: Array<{ id: FitType; label: string }> = [
  { id: 'press', label: 'Press fit' },
  { id: 'snug', label: 'Snug' },
  { id: 'slip', label: 'Slip / sliding' },
  { id: 'loose', label: 'Loose / free' },
]

const fmt = (n: number): string => `${Math.round(n * 1000) / 1000}`

export default function Tolerance() {
  const { store } = useStoreCtx()
  const [nomRaw, setNomRaw, okNom, nomN] = useParsed('')
  const [fitType, setFitType] = useState<FitType>('snug')
  const [holeOffsetRaw, setHoleOffsetRaw, okOffset, offsetN] = useParsed('0')
  const [edited, setEdited] = useState(false)

  const cl = DEFAULT_CLEARANCE[fitType]
  const r = okNom ? fit(nomN, fitType, cl, okOffset ? offsetN : 0) : null

  return (
    <ToolPage title="Tolerance / Fit Helper">
      <Card>
        <div className="grid gap-3">
          <Field label="Nominal dimension" value={nomRaw} onChange={setNomRaw} suffix="mm" hint="e.g. the bolt shaft or the pin size" />
          <div className="grid grid-cols-2 gap-2">
            {FITS.map((f) => (
              <button key={f.id} type="button" onClick={() => setFitType(f.id)} aria-pressed={fitType === f.id} className={`min-h-[44px] rounded-lg border px-2 text-xs font-semibold ${fitType === f.id ? 'border-kit-accent text-kit-accent' : 'border-kit-line text-kit-dim'}`}>
                {f.label}
                <span className="block text-[10px] font-normal opacity-80">{`clearance ${fmt(cl[0])}-${fmt(cl[1])} mm per side`}</span>
              </button>
            ))}
          </div>
          <Field
            label="FDM holes print small - extra hole offset"
            value={edited || !okOffset ? holeOffsetRaw : '0.0'}
            onChange={(v) => { setEdited(true); setHoleOffsetRaw(v) }}
            suffix="mm"
            hint="0.1-0.2 mm is a common starting point; default 0"
          />
        </div>
        {r && (
          <div className="divide-y divide-kit-line/60">
            <ResultRow label="Hole diameter (range)" value={`${fmt(r.holeMin)} - ${fmt(r.holeMax)}`} unit="mm" decimals={store.settings.decimals} />
            <ResultRow label="Hole as rad +/-" value={`+${fmt(r.holeMin - nomN)}/${fmt(r.holeMax - nomN)}`} unit="mm per side" />
            <ResultRow label="Shaft / peg diameter (range)" value={`${fmt(r.shaftMin)} - ${fmt(r.shaftMax)}`} unit="mm" decimals={store.settings.decimals} />
            <ResultRow label="Shaft as - range" value={`-${fmt(nomN - r.shaftMax)}/${fmt(nomN - r.shaftMin)}`} unit="mm per side" />
          </div>
        )}
        <FormulaNote>
          <p>Clearance is per side, so hole = nominal + clearance (+ optional hole offset) and shaft = nominal − clearance. Real parts depend on printer calibration and nozzle size; verify with a test print. The clearances are a starting range, not exact specs.</p>
        </FormulaNote>
      </Card>
    </ToolPage>
  )
}

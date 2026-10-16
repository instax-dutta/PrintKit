import { useState } from 'react'
import { Card, Field, FormulaNote, ResultRow, ToolPage, useParsed } from '../components/ui'
import { DEFAULT_CLEARANCE, fit, type FitType } from '../lib/calc/tolerance'
import { fmt } from '../lib/format'
import { useStoreCtx } from '../lib/storeContext'

const FITS: Array<{ id: FitType; label: string }> = [
  { id: 'press', label: 'Press fit' },
  { id: 'snug', label: 'Snug' },
  { id: 'slip', label: 'Slip / sliding' },
  { id: 'loose', label: 'Loose / free' },
]

type Edges = [string, string]
const asEdges = ([lo, hi]: [number, number]): Edges => [String(lo), String(hi)]
const defaultTable = (): Record<FitType, Edges> => ({
  press: asEdges(DEFAULT_CLEARANCE.press),
  snug: asEdges(DEFAULT_CLEARANCE.snug),
  slip: asEdges(DEFAULT_CLEARANCE.slip),
  loose: asEdges(DEFAULT_CLEARANCE.loose),
})
const toNum = (s: string): number => Number(s.replace(',', '.'))

export default function Tolerance() {
  const { store } = useStoreCtx()
  const d = store.settings.decimals
  const [nomRaw, setNomRaw, okNom, nomN] = useParsed('')
  const [fitType, setFitType] = useState<FitType>('snug')
  const [holeOffsetRaw, setHoleOffsetRaw, okOffset, offsetN] = useParsed('0')
  const [table, setTable] = useState<Record<FitType, Edges>>(defaultTable)
  const [editing, setEditing] = useState(false)

  const edges = table[fitType]
  const cl: [number, number] = [toNum(edges[0]), toNum(edges[1])]
  const clValid = Number.isFinite(cl[0]) && Number.isFinite(cl[1]) && cl[0] <= cl[1]
  const r = okNom && clValid ? fit(nomN, fitType, cl, okOffset ? offsetN : 0) : null
  const range = (a: number, b: number): string => `${fmt(a, 'general', d)} - ${fmt(b, 'general', d)}`
  const setEdge = (t: FitType, i: 0 | 1, v: string) =>
    setTable((prev) => {
      const next: Edges = [prev[t][0], prev[t][1]]
      next[i] = v
      return { ...prev, [t]: next }
    })

  return (
    <ToolPage title="Tolerance / Fit Helper">
      <Card>
        <div className="grid gap-3">
          <Field label="Nominal dimension" value={nomRaw} onChange={setNomRaw} suffix="mm" hint="e.g. the bolt shaft or the pin size" />
          <div className="grid grid-cols-2 gap-2">
            {FITS.map((f) => {
              const [lo, hi] = table[f.id]
              const on = fitType === f.id
              return (
                <button key={f.id} type="button" onClick={() => setFitType(f.id)} aria-pressed={on} className={`min-h-[44px] border px-2 text-left text-xs font-semibold ${on ? 'border-dashed border-kit-accent text-kit-accent' : 'border-kit-panel-border text-kit-dim'}`}>
                  {f.label}
                  <span className="block font-mono text-[10px] font-normal opacity-80">{`clearance ${lo}-${hi} mm per side`}</span>
                </button>
              )
            })}
          </div>
          <Field
            label="FDM holes print small - extra hole offset"
            value={holeOffsetRaw}
            onChange={setHoleOffsetRaw}
            suffix="mm"
            hint="0.1-0.2 mm is a common starting point; default 0"
          />
          <button type="button" onClick={() => setEditing(!editing)} aria-expanded={editing} className="w-max font-mono text-[10px] font-bold tracking-[0.16em] text-kit-pink underline underline-offset-2">
            {editing ? 'CLOSE CLEARANCE TABLE' : 'EDIT CLEARANCE TABLE'}
          </button>
          {editing ? (
            <div className="border border-dashed border-kit-accent bg-kit-panel p-3">
              <p className="mb-2 font-mono text-[10px] tracking-[0.14em] text-kit-dim">CLEARANCE PER SIDE (MM)</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {FITS.map((f) => (
                  <div key={f.id} className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
                    <label className="block">
                      <span className="mb-1 block font-mono text-[9px] tracking-[0.14em] text-kit-dim">{f.label.toUpperCase()} MIN</span>
                      <input type="text" inputMode="decimal" value={table[f.id][0]} onChange={(e) => setEdge(f.id, 0, e.target.value)} className="num min-h-[44px] w-full border border-kit-panel-border bg-kit-inset px-3 text-sm outline-none focus:border-kit-accent" />
                    </label>
                    <span className="pb-3 text-kit-dim">-</span>
                    <label className="block">
                      <span className="mb-1 block font-mono text-[9px] tracking-[0.14em] text-kit-dim">MAX</span>
                      <input type="text" inputMode="decimal" value={table[f.id][1]} onChange={(e) => setEdge(f.id, 1, e.target.value)} className="num min-h-[44px] w-full border border-kit-panel-border bg-kit-inset px-3 text-sm outline-none focus:border-kit-accent" />
                    </label>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setTable(defaultTable())} className="mt-3 min-h-[44px] border border-kit-panel-border px-3 text-xs text-kit-dim">Reset to defaults</button>
            </div>
          ) : null}
        </div>
        {r ? (
          <div className="divide-y divide-kit-line">
            <ResultRow label="Hole diameter (range)" value={range(r.holeMin, r.holeMax)} unit="mm" />
            <ResultRow label="Hole as rad +/-" value={`+${fmt(r.holeMin - nomN, 'general', d)}/${fmt(r.holeMax - nomN, 'general', d)}`} unit="mm per side" />
            <ResultRow label="Shaft / peg diameter (range)" value={range(r.shaftMin, r.shaftMax)} unit="mm" />
            <ResultRow label="Shaft as - range" value={`-${fmt(nomN - r.shaftMax, 'general', d)}/${fmt(nomN - r.shaftMin, 'general', d)}`} unit="mm per side" />
          </div>
        ) : null}
        <FormulaNote>
          <p>Clearance is per side, so hole = nominal + clearance (+ optional hole offset) and shaft = nominal − clearance. The clearance table is editable above and starts from the defaults in the PRD. Real parts depend on printer calibration and nozzle size; verify with a test print. These are a starting range, not exact specs.</p>
        </FormulaNote>
      </Card>
    </ToolPage>
  )
}

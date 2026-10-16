import { useState } from 'react'
import { Card, Field, ResultRow, FractionRow, FormulaNote, ToolPage } from '../components/ui'
import { IcoSwap } from '../components/icons'
import { UNITS, convertAll, fromMm, toMm, type LenUnit } from '../lib/calc/length'
import { parseNumber } from '../lib/format'
import { useStoreCtx } from '../lib/storeContext'

const UNIT_LABEL: Record<LenUnit, string> = { mm: 'mm', cm: 'cm', m: 'm', in: 'inches', ft: 'ft', um: 'µm' }
const noun = (u: LenUnit, n: number): string => (u === 'in' && Math.abs(n) === 1 ? 'inch' : UNIT_LABEL[u])

export default function Convert() {
  const { store } = useStoreCtx()
  const [units, setUnits] = useState<[LenUnit, LenUnit]>(['mm', 'cm'])
  const [raw, setRaw] = useState('')
  const num = parseNumber(raw)
  const ok = raw.trim() !== '' && Number.isFinite(num)
  const mm = toMm(num, units[0])
  const [a, b] = units
  const quick = fromMm(mm, b)

  return (
    <ToolPage title="Length Converter">
      <Card>
        <div className="mb-3 flex items-end gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1 font-mono text-[9px] tracking-[0.16em] text-kit-dim">FROM</div>
            <select className="num min-h-[44px] w-full border border-kit-panel-border bg-kit-inset px-2 text-sm" value={a} onChange={(e) => setUnits([e.target.value as LenUnit, b])} aria-label="From unit">
              {UNITS.map((u) => <option key={u} value={u}>{UNIT_LABEL[u]}</option>)}
            </select>
          </div>
          <button type="button" onClick={() => setUnits([b, a])} aria-label="Swap units" className="flex h-10 w-10 shrink-0 items-center justify-center border border-dashed border-kit-panel-border text-kit-dim active:border-kit-accent active:text-kit-accent">
            <IcoSwap />
          </button>
          <div className="min-w-0 flex-1">
            <div className="mb-1 font-mono text-[9px] tracking-[0.16em] text-kit-dim">TO</div>
            <select className="num min-h-[44px] w-full border border-kit-panel-border bg-kit-inset px-2 text-sm" value={b} onChange={(e) => setUnits([a, e.target.value as LenUnit])} aria-label="To unit">
              {UNITS.map((u) => <option key={u} value={u}>{UNIT_LABEL[u]}</option>)}
            </select>
          </div>
        </div>
        <Field label={`Value in ${UNIT_LABEL[a]}`} value={raw} onChange={setRaw} placeholder={a === 'in' ? 'e.g. 1 3/8' : 'e.g. 25.4'} suffix={UNIT_LABEL[a]} />
        {ok ? (
          <div className="mt-3 divide-y divide-kit-line">
            <ResultRow label={`${raw} ${noun(a, num)} in ${noun(b, quick)}:`} value={quick} unit={noun(b, quick)} kind="length" decimals={store.settings.decimals} />
            {a === 'in' ? <FractionRow inches={num} label={`${UNIT_LABEL[a]} fractional`} /> : b === 'in' ? <FractionRow inches={quick} label="to nearest fraction" /> : null}
          </div>
        ) : (
          <div className="mt-3">
            <ResultRow label={b === 'in' && a === 'in' ? 'inches → inches' : `${UNIT_LABEL[a]} → ${UNIT_LABEL[b]}`} value="" />
          </div>
        )}

      </Card>

      <Card>
        <div className="mb-2 w-max -rotate-1 bg-[#efe9e2] px-2 py-0.5 font-mono text-[9px] font-bold tracking-[0.18em] text-[#5a564c]">ALL UNITS</div>
        <div className="divide-y divide-kit-line">
          {ok
            ? convertAll(mm)
                .filter((r) => r.unit !== a && r.unit !== b)
                .map((r) => <ResultRow key={r.unit} label={`in ${noun(r.unit, r.value)}`} value={r.value} unit={noun(r.unit, r.value)} kind="length" decimals={store.settings.decimals} />)
            : (UNITS.map((u) => <ResultRow key={u} label={`in ${UNIT_LABEL[u]}`} value="" unit={UNIT_LABEL[u]} />))}
        </div>
      </Card>

      <FormulaNote>
        <p>1 in = 25.4 mm exactly; 1 ft = 304.8 mm exactly; 1 m = 1000 mm; 1 µm = 0.001 mm. Fractional inches accept mixed numbers like <code>1 3/8</code> or plain fractions like <code>3/16</code>. Fractional output rounds to the nearest 1/64 and shows the decimal error of that approximation. Comma decimals (<code>1,5</code>) are normalized to <code>1.5</code>.</p>
      </FormulaNote>
    </ToolPage>
  )
}

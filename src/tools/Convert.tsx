import { useState } from 'react'
import { Card, Field, ResultRow, FractionRow, FormulaNote, ToolPage } from '../components/ui'
import { IcoSwap } from '../components/icons'
import { UNITS, convertAll, fromMm, toMm, type LenUnit } from '../lib/calc/length'
import { parseNumber } from '../lib/format'
import { useStoreCtx } from '../lib/storeContext'

const UNIT_LABEL: Record<LenUnit, string> = { mm: 'mm', cm: 'cm', m: 'm', in: 'inches', ft: 'ft', um: 'µm' }

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
        <div className="mb-3 flex gap-2">
          <button type="button" onClick={() => setUnits(['mm', 'cm'])} className={`flex h-10 flex-1 items-center justify-center gap-1 rounded-lg border text-sm font-semibold ${a === 'mm' && b === 'cm' ? 'border-kit-accent text-kit-accent' : 'border-kit-line text-kit-dim'}`} aria-pressed={a === 'mm' && b === 'cm'}>
            mm <IcoSwap /> cm
          </button>
          <div className="flex w-1/2 gap-1">
            <select className="min-h-[44px] w-1/2 rounded-lg border border-kit-line bg-kit-bg px-2 text-sm" value={a} onChange={(e) => setUnits([e.target.value as LenUnit, b])} aria-label="From unit">
              {UNITS.map((u) => <option key={u} value={u}>{UNIT_LABEL[u]}</option>)}
            </select>
            <select className="min-h-[44px] w-1/2 rounded-lg border border-kit-line bg-kit-bg px-2 text-sm" value={b} onChange={(e) => setUnits([a, e.target.value as LenUnit])} aria-label="To unit">
              {UNITS.map((u) => <option key={u} value={u}>{UNIT_LABEL[u]}</option>)}
            </select>
          </div>
        </div>
        <Field label={`Value in ${UNIT_LABEL[a]}`} value={raw} onChange={setRaw} placeholder={a === 'in' ? 'e.g. 1 3/8' : 'e.g. 25.4'} suffix={UNIT_LABEL[a]} />
        <div className="mt-3 rounded-lg border border-kit-line bg-kit-bg p-3">
          {ok ? (
            <>
              <ResultRow label={`${raw} ${UNIT_LABEL[a]} in ${UNIT_LABEL[b]}:`} value={quick} unit={UNIT_LABEL[b]} kind="length" decimals={store.settings.decimals} />
              {a === 'in' ? <FractionRow inches={num} label={`${UNIT_LABEL[a]} fractional`} /> : b === 'in' ? <FractionRow inches={quick} label="to nearest fraction" /> : null}
            </>
          ) : (
            <ResultRow label={b === 'in' && a === 'in' ? 'inches → inches' : `${UNIT_LABEL[a]} → ${UNIT_LABEL[b]}`} value="" />
          )}
        </div>
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-semibold text-kit-dim">All units</h2>
        <div className="divide-y divide-kit-line/60">
          {ok
            ? convertAll(mm)
                .filter((r) => r.unit !== a)
                .map((r) => <ResultRow key={r.unit} label={`in ${UNIT_LABEL[r.unit]}`} value={r.value} unit={UNIT_LABEL[r.unit]} kind="length" decimals={store.settings.decimals} />)
            : (UNITS.map((u) => <ResultRow key={u} label={`in ${UNIT_LABEL[u]}`} value="" unit={UNIT_LABEL[u]} />))}
        </div>
      </Card>

      <FormulaNote>
        <p>1 in = 25.4 mm exactly; 1 ft = 304.8 mm exactly; 1 m = 1000 mm; 1 µm = 0.001 mm. Fractional inches accept mixed numbers like <code>1 3/8</code> or plain fractions like <code>3/16</code>. Fractional output rounds to the nearest 1/64 and shows the decimal error of that approximation. Comma decimals (<code>1,5</code>) are normalized to <code>1.5</code>.</p>
      </FormulaNote>
    </ToolPage>
  )
}

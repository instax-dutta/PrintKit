import { useState } from 'react'
import { Card, CopyButton, Field, FormulaNote, ResultRow, ToolPage, useParsed } from '../components/ui'
import { computeCost, quoteText } from '../lib/calc/cost'
import { grams } from '../lib/calc/filament'
import { fmt } from '../lib/format'
import { useStoreCtx } from '../lib/storeContext'

export default function Cost() {
  const { store } = useStoreCtx()
  const s = store.settings
  const cur = s.currency
  const money = (v: number): string => `${cur}${fmt(v, 'money', s.decimals)}`
  const [inputMode, setInputMode] = useState<'grams' | 'length'>('grams')
  const [matId, setMatId] = useState('')
  const [customPrice, setCustomPrice, okPrice, customPriceN] = useParsed('')
  const [gRaw, setGRaw, okG, gN] = useParsed('')
  const [mRaw, setMRaw, okM, mN] = useParsed('')
  const [hRaw, setHRaw, okH, hN] = useParsed('')
  const [minRaw, setMinRaw, okMin, minN] = useParsed('0')
  const [wRaw, setWRaw, okW, wN] = useParsed('0')
  const [kwhRaw, setKwhRaw, okKwh, kwhN] = useParsed(String(s.electricityPerKwh))
  const [wearRaw, setWearRaw, , wearN] = useParsed('0')
  const [laborRaw, setLaborRaw, , laborN] = useParsed('0')
  const [failRaw, setFailRaw, , failN] = useParsed('5')
  const [markupRaw, setMarkupRaw, , markupN] = useParsed('0')
  const [qtyRaw, setQtyRaw, okQty, qtyN] = useParsed('1')

  const material = matId === '__custom' ? null : store.materials.find((m) => m.id === matId)
  const pricePerKg = material?.pricePerKg ?? (okPrice ? customPriceN : Number.NaN)
  const hours = (okH ? hN : 0) + (okMin ? minN / 60 : 0)
  const totalHours = hRaw.trim() !== '' || minRaw.trim() !== '' ? hours : Number.NaN
  const gramsIn =
    inputMode === 'grams'
      ? okG ? gN : Number.NaN
      : okM && pricePerKg === pricePerKg
        ? grams(mN, material?.density ?? Number.NaN, s.filamentDiameter)
        : Number.NaN
  const broke = computeCost({
    grams: gramsIn,
    pricePerKg: Number.isFinite(pricePerKg) ? pricePerKg : 0,
    hours: Number.isFinite(totalHours) ? totalHours : 0,
    watts: okW ? wN : 0,
    pricePerKwh: okKwh ? kwhN : 0,
    wearPerHour: wearN,
    labor: laborN,
    failPct: failN,
    markupPct: markupN,
    quantity: qtyN,
  })
  const ready = Number.isFinite(gramsIn) && gramsIn > 0 && Number.isFinite(pricePerKg)

  return (
    <ToolPage title="Print Cost">
      <Card title="Material used">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-kit-dim">Material</span>
            <select className="min-h-[44px] w-full  border border-kit-panel-border bg-kit-inset px-3 text-sm" value={matId} onChange={(e) => setMatId(e.target.value)}>
              <option value="">Choose material…</option>
              {store.materials.filter((m) => m.pricePerKg).map((m) => <option key={m.id} value={m.id}>{`${m.name} (${m.pricePerKg}${cur}/kg)`}</option>)}
              <option value="__custom">Custom…</option>
            </select>
          </label>
          <div className="flex gap-1  border border-kit-panel-border p-1">
            {(['grams', 'length'] as const).map((md) => (
              <button key={md} type="button" onClick={() => setInputMode(md)} aria-pressed={inputMode === md} className={`min-h-[36px] flex-1 text-xs font-semibold ${inputMode === md ? 'bg-kit-accent text-[#171a05]' : 'text-kit-dim'}`}>{md === 'grams' ? 'Grams' : 'Metres'}</button>
            ))}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {matId === '__custom' ? <Field label="Price per kg" value={customPrice} onChange={setCustomPrice} suffix={`${cur}/kg`} /> : null}
          {inputMode === 'grams'
            ? <Field label="Filament used" value={gRaw} onChange={setGRaw} suffix="g" />
            : <Field label={`Filament used${material ? ` (${material.name})` : ''}`} value={mRaw} onChange={setMRaw} suffix="m" hint="Converts via the filament calculator" />}
        </div>
      </Card>

      <Card title="Machine and time">
        <div className="grid grid-cols-2 gap-3">
          <div className="grid grid-cols-[3fr_2fr] gap-2">
            <Field label="Print time" value={hRaw} onChange={setHRaw} suffix="h" />
            <Field label="minutes" value={minRaw} onChange={setMinRaw} suffix="m" />
          </div>
          <Field label="Power draw" value={wRaw} onChange={setWRaw} suffix="W" hint="From printer preset" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label="Electricity price" value={kwhRaw} onChange={setKwhRaw} suffix={`${cur}/kWh`} hint={`From settings: ${cur}${s.electricityPerKwh}`} />
          <Field label="Machine wear / hour" value={wearRaw} onChange={setWearRaw} suffix={`${cur}/h`} hint="Optional" />
          <Field label="Labour / handling" value={laborRaw} onChange={setLaborRaw} suffix={cur} hint="Optional flat cost" />
          <Field label="Failure / waste margin" value={failRaw} onChange={setFailRaw} suffix="%" hint="Default 5%" />
        </div>
      </Card>

      <Card title="Quote">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Markup" value={markupRaw} onChange={setMarkupRaw} suffix="%" hint="Default 0%" />
          <Field label="Quantity" value={qtyRaw} onChange={setQtyRaw} hint="Default 1" />
        </div>
        <div className="divide-y divide-kit-line">
          <ResultRow label="Material" value={ready ? money(broke.material) : null} />
          <ResultRow label="Electricity" value={ready && Number.isFinite(totalHours) ? money(broke.electricity) : null} />
          <ResultRow label="Machine wear" value={ready && Number.isFinite(totalHours) ? money(broke.wear) : null} />
          <ResultRow label="Labour" value={ready ? money(broke.labor) : null} />
          <ResultRow label="Subtotal" value={ready ? money(broke.base) : null} />
          <ResultRow label="Failure margin" value={ready ? money(broke.withFail - broke.base) : null} hint={`+${failRaw}%`} />
          <ResultRow label="Total per piece" value={ready ? money(broke.total) : null} hint={markupN > 0 ? `markup ${markupRaw}%` : ''} />
          <ResultRow label="Total for quantity" value={ready ? money(broke.totalForQty) : null} hint={okQty ? `× ${qtyRaw} pc` : ''} />
        </div>
        {ready ? (
          <div className="mt-3 flex items-center gap-3">
            <CopyButton text={quoteText({ grams: gramsIn, pricePerKg, hours: totalHours, watts: wN, pricePerKwh: kwhN, wearPerHour: wearN, labor: laborN, failPct: failN, markupPct: markupN, quantity: qtyN }, broke, cur)} />
            <span className="text-xs text-kit-dim">Copy quote as text</span>
          </div>
        ) : null}
        {ready && inputMode === 'length' ? <p className="mt-1 text-xs text-kit-dim">{`${fmt(gramsIn, 'general', store.settings.decimals)} g equivalent`}</p> : null}
      </Card>

      <FormulaNote>
        <pre className="mb-2 overflow-x-auto whitespace-pre text-[11px]">{`material    = (grams / 1000) x price_per_kg
electricity = (watts / 1000) x hours x price_per_kwh
wear        = hours x wear_per_hour
base        = material + electricity + wear + labor
with_fail   = base x (1 + fail_pct/100)
total       = with_fail x (1 + markup_pct/100)
qty total   = total x quantity`}</pre>
        <p>Metre input converts through the filament formulas (density × cross-section), so results match the Filament tool.</p>
      </FormulaNote>
    </ToolPage>
  )
}

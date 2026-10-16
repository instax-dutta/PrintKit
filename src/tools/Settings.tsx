import { useRef, useState } from 'react'
import { Card, FormulaNote, ToolPage, Toast } from '../components/ui'
import { exportJson, importJson, save } from '../lib/store'
import { useStoreCtx } from '../lib/storeContext'

const CURRENCIES = ['₹', '$', '€', '£']

export default function SettingsPage() {
  const { store, setSettings, setStoreAll, reset, degraded } = useStoreCtx()
  const [currencyCustom, setCurrencyCustom] = useState(!CURRENCIES.includes(store.settings.currency))
  const [importMsg, setImportMsg] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 1600) }

  const currency = store.settings.currency

  const doExport = () => {
    const blob = new Blob([exportJson(store)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'printkit-settings.json'
    a.click()
    URL.revokeObjectURL(a.href)
    flash('Settings exported')
  }

  const onImportFile = async (f: File) => {
    const text = await f.text()
    const parsed = importJson(text)
    if (!parsed) {
      setImportMsg('Import failed: not a valid PrintKit settings file.')
      return
    }
    setStoreAll({ ...parsed, initialized: true })
    void save(parsed)
    setImportMsg(`Imported settings and presets (version ${parsed.version}).`)
    flash('Import complete')
    if (!CURRENCIES.includes(parsed.settings.currency)) setCurrencyCustom(true)
  }

  return (
    <ToolPage title="Settings">
      <Card title="General">
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-kit-dim">Currency</span>
              <select
                className="min-h-[44px] w-full rounded-lg border border-kit-line bg-kit-bg px-3 text-sm"
                value={currencyCustom ? '__c' : currency}
                onChange={(e) => { const c = e.target.value; setCurrencyCustom(c === '__c'); if (c !== '__c') setSettings({ currency: c }) }}
              >
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                <option value="__c">Custom text…</option>
              </select>
              {currencyCustom ? <input type="text" className="mt-2 min-h-[44px] w-full rounded-lg border border-kit-line bg-kit-bg px-3 text-sm" value={currency} onChange={(e) => setSettings({ currency: e.target.value.slice(0, 4) })} aria-label="Custom currency symbol" /> : null}
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-kit-dim">Theme</span>
              <select className="min-h-[44px] w-full rounded-lg border border-kit-line bg-kit-bg px-3 text-sm" value={store.settings.theme} onChange={(e) => setSettings({ theme: e.target.value as 'system' | 'dark' | 'light' })}>
                <option value="system">Follow system</option>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-kit-dim">Electricity price per kWh</span>
            <input type="text" inputMode="decimal" className="min-h-[44px] w-full rounded-lg border border-kit-line bg-kit-bg px-3 text-sm" value={String(store.settings.electricityPerKwh)} onChange={(e) => { const v = parseFloat(e.target.value.replace(',', '.')); setSettings({ electricityPerKwh: Number.isFinite(v) ? v : store.settings.electricityPerKwh }) }} aria-label="Electricity price per kWh" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-kit-dim">Default filament diameter</span>
              <select className="min-h-[44px] w-full rounded-lg border border-kit-line bg-kit-bg px-3 text-sm" value={String(store.settings.filamentDiameter)} onChange={(e) => setSettings({ filamentDiameter: parseFloat(e.target.value) })}>
                <option value="1.75">1.75 mm</option>
                <option value="2.85">2.85 mm</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-kit-dim">Default nozzle diameter</span>
              <input type="text" inputMode="decimal" className="min-h-[44px] w-full rounded-lg border border-kit-line bg-kit-bg px-3 text-sm" value={String(store.settings.nozzleDiameter)} onChange={(e) => { const v = parseFloat(e.target.value.replace(',', '.')); setSettings({ nozzleDiameter: Number.isFinite(v) ? v : store.settings.nozzleDiameter }) }} aria-label="Nozzle diameter" />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-kit-dim">Decimal places ({store.settings.decimals})</span>
            <input type="range" min={0} max={6} step={1} value={store.settings.decimals} onChange={(e) => setSettings({ decimals: Number(e.target.value) })} className="w-full accent-sky-500" aria-label="Decimal places" />
          </label>
        </div>
      </Card>

      <Card title="Move your data (export / import)">
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={doExport} className="min-h-[44px] rounded-lg border border-kit-accent text-sm font-semibold text-kit-accent">Export as JSON</button>
          <button type="button" onClick={() => fileRef.current?.click()} className="min-h-[44px] rounded-lg border border-kit-line text-sm">Import from JSON</button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void onImportFile(f) }} />
        </div>
        {importMsg ? <p className={`mt-2 text-xs ${importMsg.startsWith('Import failed') ? 'text-red-400' : 'text-green-400'}`}>{importMsg}</p> : null}
      </Card>

      <Card title="Danger zone">
        {!confirmReset ? (
          <button type="button" onClick={() => setConfirmReset(true)} className="min-h-[44px] w-full rounded-lg border border-red-500/60 text-sm font-semibold text-red-400">Reset all data…</button>
        ) : (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm">
            <p className="mb-3">This clears settings, materials, printers and recents from this browser.</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => { reset(); setConfirmReset(false); flash('All data reset') }} className="min-h-[44px] flex-1 rounded-lg bg-red-500 text-sm font-semibold text-white">Yes, reset everything</button>
              <button type="button" onClick={() => setConfirmReset(false)} className="min-h-[44px] flex-1 rounded-lg border border-kit-line text-sm">Cancel</button>
            </div>
          </div>
        )}
      </Card>

      {degraded ? <p className="text-xs text-amber-400">Note: localStorage is unavailable in this browser context, so data will not persist.</p> : null}
      <FormulaNote><p>Theme default follows the system on first load; dark is used when systems allow both. All data stays in this browser (key printkit:v1), nothing is uploaded.</p></FormulaNote>
      <Toast msg={toast} />
    </ToolPage>
  )
}

import { useState } from 'react'
import { Card, Field, FormulaNote, ToolPage, Toast } from '../components/ui'
import { builtinMaterials, EXAMPLE_PRINTERS, type Material, type Printer } from '../lib/store'
import { useStoreCtx } from '../lib/storeContext'

const uid = (): string => `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export default function Presets() {
  const { store, setMaterials, setPrinters } = useStoreCtx()
  const [tab, setTab] = useState<'materials' | 'printers'>('materials')
  const [toast, setToast] = useState<string | null>(null)
  const [edit, setEdit] = useState<Partial<Material> | null>(null)
  const [editP, setEditP] = useState<Partial<Printer> | null>(null)

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 1600) }

  const saveMaterial = () => {
    if (!edit?.name?.trim() || !Number.isFinite(edit.density)) return
    const m: Material = {
      id: edit.id ?? uid(),
      name: edit.name.trim(),
      density: Number(edit.density),
      pricePerKg: edit.pricePerKg != null && Number(edit.pricePerKg) >= 0 ? Number(edit.pricePerKg) : undefined,
      shrinkagePct: edit.shrinkagePct != null && Number(edit.shrinkagePct) >= 0 ? Number(edit.shrinkagePct) : undefined,
      builtIn: false,
    }
    setMaterials([...store.materials.filter((x) => x.id !== m.id), m])
    setEdit(null)
    flash('Material saved')
  }

  const savePrinter = () => {
    if (!editP?.name?.trim() || Number(editP.buildX) <= 0 || Number(editP.buildY) <= 0 || Number(editP.buildZ) <= 0) return
    const p: Printer = {
      id: editP.id ?? uid(),
      name: editP.name.trim(),
      buildX: Number(editP.buildX),
      buildY: Number(editP.buildY),
      buildZ: Number(editP.buildZ),
      nozzle: Number(editP.nozzle ?? 0.4),
      powerW: Number(editP.powerW ?? 0),
      wearPerHour: editP.wearPerHour != null ? Number(editP.wearPerHour) : undefined,
    }
    setPrinters([...store.printers.filter((x) => x.id !== p.id), p])
    setEditP(null)
    flash('Printer saved')
  }

  const duplicate = (m: Material) => setEdit({ ...m, id: undefined, name: `${m.name} (copy)` })
  const delMat = (m: Material) => setMaterials(store.materials.filter((x) => x.id !== m.id))

  return (
    <ToolPage title="Presets">
      <div className="flex gap-2">
        {(['materials', 'printers'] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} aria-pressed={tab === t} className={`min-h-[44px] flex-1  border px-2 text-xs font-semibold ${tab === t ? 'border-kit-accent text-kit-accent' : 'border-kit-panel-border text-kit-dim'}`}>{t === 'materials' ? 'Materials' : 'Printers'}</button>
        ))}
      </div>

      {tab === 'materials' && (
        <Card>
          <ul className="divide-y divide-kit-line">
            {store.materials.map((m) => (
              <li key={m.id} className="flex min-h-[44px] items-center justify-between gap-2 py-2 text-sm">
                <span className="min-w-0">
                  <span className="font-semibold">{m.name}</span>
                  <span className="ml-2 text-xs text-kit-dim">{m.density} g/cm³{m.pricePerKg ? ` · ${m.pricePerKg}/kg` : ''}{m.shrinkagePct != null ? ` · shrink ${m.shrinkagePct}%` : ''}</span>
                  {m.builtIn ? <span className="ml-2 rounded bg-white/10 px-1 text-[10px] text-kit-dim">built-in</span> : null}
                </span>
                <span className="flex gap-1">
                  {m.builtIn ? <button type="button" onClick={() => duplicate(m)} className="min-h-[44px]  border border-kit-panel-border px-2 text-xs">Duplicate & edit</button>
                    : <button type="button" onClick={() => setEdit(m)} className="min-h-[44px]  border border-kit-panel-border px-2 text-xs">Edit</button>}
                  {!m.builtIn ? <button type="button" onClick={() => delMat(m)} className="min-h-[44px]  border border-kit-panel-border px-2 text-xs text-kit-pink">Delete</button> : null}
                </span>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => setEdit({})} className="mt-3 min-h-[44px] w-full  border border-kit-accent text-sm font-semibold text-kit-accent">+ Add material</button>
          <button type="button" onClick={() => { setMaterials(builtinMaterials()); flash('Built-in materials reset') }} className="mt-2 min-h-[44px] w-full  border border-kit-panel-border text-xs text-kit-dim">Reset built-in materials</button>
        </Card>
      )}

      {tab === 'printers' && (
        <Card>
          <ul className="divide-y divide-kit-line">
            {store.printers.map((p) => (
              <li key={p.id} className="flex min-h-[44px] items-center justify-between gap-2 py-2 text-sm">
                <span className="min-w-0">
                  <span className="font-semibold">{p.name}</span>
                  <span className="ml-2 text-xs text-kit-dim">{p.buildX}×{p.buildY}×{p.buildZ} · {p.powerW}W</span>
                </span>
                <span className="flex gap-1">
                  <button type="button" onClick={() => setEditP(p)} className="min-h-[44px]  border border-kit-panel-border px-2 text-xs">Edit</button>
                  <button type="button" onClick={() => setPrinters(store.printers.filter((x) => x.id !== p.id))} className="min-h-[44px]  border border-kit-panel-border px-2 text-xs text-kit-pink">Delete</button>
                </span>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => setEditP({})} className="mt-3 min-h-[44px] w-full  border border-kit-accent text-sm font-semibold text-kit-accent">+ Add printer</button>
          <div className="mt-2">
            <p className="mb-1 text-xs text-kit-dim">Templates, one tap to add:</p>
            <div className="grid grid-cols-1 gap-2">
              {EXAMPLE_PRINTERS.map((tpl) => (
                <button key={tpl.id} type="button" onClick={() => { setPrinters([...store.printers.filter((x) => x.id !== tpl.id), { ...tpl, id: uid() }]); flash(`${tpl.name} added`) }} className="min-h-[44px]  border border-kit-panel-border px-3 text-left text-xs">
                  + {tpl.name}, {tpl.powerW}W typical
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {edit && (
        <Card title={edit.id ? 'Edit material' : 'New material'}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name" value={String(edit.name ?? '')} onChange={(v) => setEdit({ ...edit, name: v })} />
            <Field label="Density" value={String(edit.density ?? '')} onChange={(v) => setEdit({ ...edit, density: parseFloat(v) })} suffix="g/cm³" />
            <Field label="Price per kg" value={String(edit.pricePerKg ?? '')} onChange={(v) => setEdit({ ...edit, pricePerKg: parseFloat(v) })} suffix="/kg" />
            <Field label="Shrinkage" value={String(edit.shrinkagePct ?? '')} onChange={(v) => setEdit({ ...edit, shrinkagePct: parseFloat(v) })} suffix="%" />
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={saveMaterial} className="min-h-[44px] flex-1  bg-kit-accent text-sm font-semibold text-black">Save</button>
            <button type="button" onClick={() => setEdit(null)} className="min-h-[44px] flex-1  border border-kit-panel-border text-sm">Cancel</button>
          </div>
        </Card>
      )}

      {editP && (
        <Card title={editP.id ? 'Edit printer' : 'New printer'}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name" value={String(editP.name ?? '')} onChange={(v) => setEditP({ ...editP, name: v })} />
            <Field label="Nozzle" value={String(editP.nozzle ?? '')} onChange={(v) => setEditP({ ...editP, nozzle: parseFloat(v) })} suffix="mm" />
            <Field label="Build X" value={String(editP.buildX ?? '')} onChange={(v) => setEditP({ ...editP, buildX: parseFloat(v) })} suffix="mm" />
            <Field label="Build Y" value={String(editP.buildY ?? '')} onChange={(v) => setEditP({ ...editP, buildY: parseFloat(v) })} suffix="mm" />
            <Field label="Build Z" value={String(editP.buildZ ?? '')} onChange={(v) => setEditP({ ...editP, buildZ: parseFloat(v) })} suffix="mm" />
            <Field label="Power draw" value={String(editP.powerW ?? '')} onChange={(v) => setEditP({ ...editP, powerW: parseFloat(v) })} suffix="W" />
            <Field label="Wear / hour" value={String(editP.wearPerHour ?? '')} onChange={(v) => setEditP({ ...editP, wearPerHour: parseFloat(v) })} suffix="/h" />
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={savePrinter} className="min-h-[44px] flex-1  bg-kit-accent text-sm font-semibold text-black">Save</button>
            <button type="button" onClick={() => setEditP(null)} className="min-h-[44px] flex-1  border border-kit-panel-border text-sm">Cancel</button>
          </div>
        </Card>
      )}
      <Toast msg={toast} />
      <FormulaNote><p>Presets live in localStorage and travel with Settings export/import. Built-in rows are marked and can only be duplicated, not edited.</p></FormulaNote>
    </ToolPage>
  )
}

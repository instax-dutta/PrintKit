import { Card, Field, FormulaNote, ResultRow, ToolPage, useParsed } from '../components/ui'
import { flowMm3PerS, maxSpeed, HOTEND_LIMITS } from '../lib/calc/flow'
import { useStoreCtx } from '../lib/storeContext'

const fmt = (v: number): string => (Number.isFinite(v) ? `${Math.round(v * 100) / 100}` : '')

export default function Flow() {
  const { store } = useStoreCtx()
  const nw = store.settings.nozzleDiameter
  const [lineRaw, setLineRaw, , lineN] = useParsed(String(Math.round((nw / 1.1) * 1.1 * 100) / 100))
  const [layerRaw, setLayerRaw, okLayer, layerN] = useParsed('0.2')
  const [speedRaw, setSpeedRaw, okSpeed, speedN] = useParsed('60')
  const [maxFlowRaw, setMaxFlowRaw, , maxFlowN] = useParsed('12')

  const useAuto = lineRaw.trim() === ''
  const line = useAuto ? nw * 1.1 : lineN
  const q = okLayer && okSpeed && line > 0 ? flowMm3PerS(line, layerN, speedN) : null
  const maxSpeedOut = okLayer && line > 0 ? maxSpeed(maxFlowN, line, layerN) : null

  return (
    <ToolPage title="Flow Rate">
      <Card title="Forward: flow used">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Line width" value={useAuto ? '' : lineRaw} onChange={setLineRaw} suffix="mm" placeholder={`auto (nozzle × 1.1 = ${fmt(line)})`} />
          <Field label="Layer height" value={layerRaw} onChange={setLayerRaw} suffix="mm" />
          <Field label="Print speed" value={speedRaw} onChange={setSpeedRaw} suffix="mm/s" />
        </div>
        <ResultRow label="Volumetric flow" value={q} unit="mm³/s" decimals={Math.max(1, store.settings.decimals)} />
        <FormulaNote><p>Q = line width × layer height × speed (mm/s). Line width left empty uses nozzle × 1.1 (nozzle {nw} mm in Settings).</p></FormulaNote>
      </Card>

      <Card title="Reverse: max speed for your hotend">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Hotend max flow" value={maxFlowRaw} onChange={setMaxFlowRaw} suffix="mm³/s" />
          <Field label="Layer height" value={layerRaw} onChange={setLayerRaw} suffix="mm" />
        </div>
        <ResultRow label="Max speed (approx, extrusion-limited)" value={Number.isFinite(maxSpeedOut) ? maxSpeedOut : null} unit="mm/s" decimals={store.settings.decimals} />
        <div className="mt-2 rounded-lg bg-white/5 p-3 text-xs text-kit-dim">
          <p className="mb-1 font-semibold">Rough hotend limits (varies by hotend / filament)</p>
          <ul className="list-disc pl-4">
            {HOTEND_LIMITS.map((h) => <li key={h.kind}>{h.kind}: {h.range}</li>)}
          </ul>
        </div>
      </Card>
    </ToolPage>
  )
}

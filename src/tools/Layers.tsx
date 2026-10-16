import { Card, Field, FormulaNote, ResultRow, ToolPage, useParsed } from '../components/ui'
import { layerSanity, layers, roughTimeSeconds } from '../lib/calc/layers'
import { flowMm3PerS } from '../lib/calc/flow'
import { useStoreCtx } from '../lib/storeContext'

export default function Layers() {
  const { store } = useStoreCtx()
  const nw = store.settings.nozzleDiameter
  const [hRaw, setHRaw, okH, hN] = useParsed('')
  const [firstRaw, setFirstRaw, okFirst, firstN] = useParsed('0.2')
  const [layerRaw, setLayerRaw, okLayer, layerN] = useParsed('0.2')
  const [volRaw, setVolRaw, okVol, volN] = useParsed('')
  const [flowRaw, setFlowRaw, okFlow, flowN] = useParsed('10')
  const [lineRaw, setLineRaw, okLine, lineN] = useParsed(String(nw / 1.1))

  const c = okH && okLayer && okFirst ? layers(hN, firstN, layerN) : null
  const sanity = okLayer ? layerSanity(layerN, nw) : null
  const q = okLine && okLayer && okFlow && lineN > 0 && flowN > 0 ? flowMm3PerS(lineN, layerN, flowN) : null
  const secs = c && q != null && okVol ? roughTimeSeconds(volN * 1000, q) : null
  const fmtHms = (s: number): string => {
    if (!Number.isFinite(s)) return ''
    const h = Math.floor(s / 3600)
    const m = Math.round((s % 3600) / 60)
    return h > 0 ? `${h}h ${m}m` : `${Math.round(s / 60)}m`
  }

  return (
    <ToolPage title="Layer & Time Helper">
      <Card title="Layer count">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Model height" value={hRaw} onChange={setHRaw} suffix="mm" />
          <Field label="First layer height" value={firstRaw} onChange={setFirstRaw} suffix="mm" />
          <Field label="Layer height" value={layerRaw} onChange={setLayerRaw} suffix="mm" />
        </div>
        <ResultRow label="Number of layers" value={c ? c.count : null} decimals={0} />
        <ResultRow label="Top layer Z" value={c ? c.topZMm : null} unit="mm" kind="length" decimals={store.settings.decimals} />
        {sanity ? <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-300">{sanity}</div> : null}
        <FormulaNote>
          <p>layers = ceil((height − first layer) ÷ layer height) + 1; top Z = first layer + (layers − 1) × layer height. Guidance: keep layer height 10-80% of your {nw} mm nozzle.</p>
        </FormulaNote>
      </Card>

      <Card title="Rough time estimate">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Model volume" value={volRaw} onChange={setVolRaw} suffix="cm³" hint="From the slicer print statistics" />
          <Field label="Line width" value={lineRaw} onChange={setLineRaw} suffix="mm" />
          <Field label="Layer height" value={layerRaw} onChange={setLayerRaw} suffix="mm" />
          <Field label="Speed" value={flowRaw} onChange={setFlowRaw} suffix="mm/s" />
        </div>
        <ResultRow label="Volumetric flow" value={q} unit="mm³/s" decimals={Math.max(1, store.settings.decimals)} />
        <ResultRow label="Rough total time" value={secs != null ? fmtHms(secs) : null} decimals={store.settings.decimals} hint="Rough estimate; your slicer is authoritative" />
      </Card>
    </ToolPage>
  )
}

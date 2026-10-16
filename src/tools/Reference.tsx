import { useState } from 'react'
import { Card, ToolPage } from '../components/ui'
import materialsJson from '../data/materials.json'
import holesJson from '../data/hole-sizes.json'
import nozzleJson from '../data/nozzle-guide.json'

type MatRow = { id: string; name: string; density: number; nozzleC: string; bedC: string; dry: string; enclosure: boolean; notes: string }
type HoleRow = { screw: string; clearanceDia: number; tapDia: number; heatSetDia: number; heatSetDepth: number }
type PairRow = { nozzle: number; lineWidth: string; layerHeight: string }

const MATERIALS = materialsJson as MatRow[]
const HOLES = holesJson as { disclaimer?: string; metricScrews: HoleRow[]; magnetPocketPerSideMm?: string; magnetPocketNote?: string }
const NOZZLE = nozzleJson as { disclaimer?: string; pairs: PairRow[]; ruleOfThumb?: string }

const DISCLAIMER = 'Typical values - check the manufacturer datasheet.'
const OTHER_TITLES = ['Material cheat sheet', 'Hole size guide', 'Nozzle / line width / layer height']

export default function Reference() {
  const [q, setQ] = useState('')
  const needle = q.trim().toLowerCase()
  const mats = needle ? MATERIALS.filter((m) => `${m.name} ${m.notes} ${m.dry}`.toLowerCase().includes(needle)) : MATERIALS
  const holes = needle ? HOLES.metricScrews.filter((h) => h.screw.toLowerCase().includes(needle)) : HOLES.metricScrews
  const pairs = needle ? NOZZLE.pairs.filter((p) => String(p.nozzle).includes(needle)) : NOZZLE.pairs

  return (
    <ToolPage title="Reference Sheets">
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${MATERIALS.length + HOLES.metricScrews.length + NOZZLE.pairs.length} entries`} className="mb-4 min-h-[44px] w-full  border border-kit-panel-border bg-kit-panel px-3 text-sm" aria-label="Search reference sheets" />
      <p className="mb-3 text-xs text-kit-dim">{DISCLAIMER} Editable in src/data/*.json.</p>

      {mats.length > 0 && (
        <Card title={OTHER_TITLES[0]}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-kit-dim">
                <tr className="border-b border-kit-panel-border">
                  <th className="py-2 pr-2">Material</th>
                  <th className="py-2 pr-2">Density g/cm³</th>
                  <th className="py-2 pr-2">Nozzle °C</th>
                  <th className="py-2 pr-2">Bed °C</th>
                  <th className="py-2 pr-2">Dry</th>
                  <th className="py-2 pr-2">Enclose</th>
                  <th className="py-2 pr-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {mats.map((m) => (
                  <tr key={m.id} className="border-b border-kit-panel-border">
                    <td className="py-2 pr-2 font-semibold">{m.name}</td>
                    <td className="py-2 pr-2">{m.density}</td>
                    <td className="py-2 pr-2">{m.nozzleC}</td>
                    <td className="py-2 pr-2">{m.bedC}</td>
                    <td className="py-2 pr-2">{m.dry}</td>
                    <td className="py-2 pr-2">{m.enclosure ? 'yes' : 'no'}</td>
                    <td className="py-2 pr-2 text-kit-dim">{m.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {holes.length > 0 && (
        <Card title={OTHER_TITLES[1]}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-kit-dim">
                <tr className="border-b border-kit-panel-border">
                  <th className="py-2 pr-2">Screw</th>
                  <th className="py-2 pr-2">Clearance hole</th>
                  <th className="py-2 pr-2">Tap drill</th>
                  <th className="py-2 pr-2">Heat-set hole</th>
                  <th className="py-2 pr-2">Heat-set depth</th>
                </tr>
              </thead>
              <tbody>
                {holes.map((h) => (
                  <tr key={h.screw} className="border-b border-kit-panel-border">
                    <td className="py-2 pr-2 font-semibold">{h.screw}</td>
                    <td className="py-2 pr-2">{h.clearanceDia} mm</td>
                    <td className="py-2 pr-2">{h.tapDia} mm</td>
                    <td className="py-2 pr-2">ø {h.heatSetDia} mm</td>
                    <td className="py-2 pr-2">{h.heatSetDepth} mm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-kit-dim">Magnet pocket: add {HOLES.magnetPocketPerSideMm} mm per side. {HOLES.magnetPocketNote}</p>
        </Card>
      )}

      {pairs.length > 0 && (
        <Card title={OTHER_TITLES[2]}>
          <div className="mb-3 text-xs text-kit-dim">{NOZZLE.ruleOfThumb}</div>
          <table className="w-full text-left text-xs">
            <thead className="text-kit-dim">
              <tr className="border-b border-kit-panel-border">
                <th className="py-2 pr-2">Nozzle</th>
                <th className="py-2 pr-2">Line width</th>
                <th className="py-2 pr-2">Layer height</th>
              </tr>
            </thead>
            <tbody>
              {pairs.map((p) => (
                <tr key={p.nozzle} className="border-b border-kit-panel-border">
                  <td className="py-2 pr-2 font-semibold">{p.nozzle} mm</td>
                  <td className="py-2 pr-2">{p.lineWidth} mm</td>
                  <td className="py-2 pr-2">{p.layerHeight} mm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </ToolPage>
  )
}

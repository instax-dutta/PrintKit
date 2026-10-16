import { useMemo, useState } from 'react'
import { Card, Field, FormulaNote, ResultRow, ToolPage, useParsed } from '../components/ui'
import { deviationPct, dimensionalCorrection, newEsteps, newRotationDistance, stepsPerMmBelt, stepsPerMmLeadScrew } from '../lib/calc/calibration'
import { useStoreCtx } from '../lib/storeContext'

const fmt = (v: number, d = 3): string => (Number.isFinite(v) ? `${Math.round(v * Math.pow(10, d)) / Math.pow(10, d)}` : '')

type Tab = 'esteps' | 'axis' | 'dim'

export default function Calibration() {
  const { store } = useStoreCtx()
  const [tab, setTab] = useState<Tab>('esteps')
  const [klipper, setKlipper] = useState(false)

  // E-steps / rotation distance
  const [curRaw, setCurRaw, okCur, curN] = useParsed('93')
  const [reqRaw, setReqRaw, okReq, reqN] = useParsed('100')
  const [actRaw, setActRaw, okAct, actN] = useParsed('')
  const esteps = klipper && okCur && okReq && okAct ? newRotationDistance(curN, reqN, actN) : okCur && okReq && okAct ? newEsteps(curN, reqN, actN) : null

  // Axis steps
  const [fullRaw, setFullRaw, okFull, fullN] = useParsed('200')
  const [microRaw, setMicroRaw, okMicro, microN] = useParsed('16')
  const [pitchRaw, setPitchRaw, okPitch, pitchN] = useParsed('2')
  const [teethRaw, setTeethRaw, okTeeth, teethN] = useParsed('20')
  const [leadRaw, setLeadRaw, okLead, leadN] = useParsed('8')
  const [screwMode, setScrewMode] = useState(false)
  const axis = screwMode
    ? okFull && okMicro && okLead ? stepsPerMmLeadScrew(fullN, microN, leadN) : null
    : okFull && okMicro && okPitch && okTeeth ? stepsPerMmBelt(fullN, microN, pitchN, teethN) : null

  // Dimensional correction
  const [cStepsRaw, setCStepsRaw, okCSteps, cStepsN] = useParsed('')
  const [expRaw, setExpRaw, okExp, expN] = useParsed('')
  const [measRaw, setMeasRaw, okMeas, measN] = useParsed('')
  const corr = okCSteps && okExp && okMeas ? dimensionalCorrection(cStepsN, expN, measN) : null
  const dev = okExp && okMeas ? deviationPct(expN, measN) : null
  const warnHigh = dev != null && Number.isFinite(dev) && dev > 10

  const tabBtn = (t: Tab, label: string) => (
    <button key={t} type="button" onClick={() => setTab(t)} aria-pressed={tab === t} className={`min-h-[44px] flex-1 rounded-lg border px-2 text-xs font-semibold ${tab === t ? 'border-kit-accent text-kit-accent' : 'border-kit-line text-kit-dim'}`}>{label}</button>
  )
  const devHint = useMemo(
    () => (dev != null && Number.isFinite(dev) ? `deviation ${fmt(dev, 2)}% from the expected ${fmt(expN, 2)} mm` : ''),
    [dev, expN],
  )

  return (
    <ToolPage title="Calibration Helper">
      <div className="flex gap-2">{tabBtn('esteps', 'E-steps / Rotation')}{tabBtn('axis', 'Axis steps/mm')}{tabBtn('dim', 'Dimensional fix')}</div>

      {tab === 'esteps' && (
        <Card>
          <label className="mb-3 flex min-h-[44px] items-center gap-3 text-sm">
            <input type="checkbox" className="size-5 accent-sky-500" checked={klipper} onChange={(e) => setKlipper(e.target.checked)} />
            Klipper mode (rotation distance)
          </label>
          <div className="grid grid-cols-3 gap-3">
            <Field label={klipper ? 'Current rotation distance' : 'Current e-steps/mm'} value={curRaw} onChange={setCurRaw} />
            <Field label="Requested extrusion" value={reqRaw} onChange={setReqRaw} suffix="mm" hint="Default 100" />
            <Field label="Actual extruded" value={actRaw} onChange={setActRaw} suffix="mm" hint="Measure what came out" />
          </div>
          <ResultRow
            label={klipper ? 'New rotation distance' : 'New e-steps/mm'}
            value={esteps}
            decimals={store.settings.decimals}
            hint={klipper ? 'new_rd = current_rd × actual ÷ requested' : ''}
          />
          {klipper && esteps != null ? <ResultRow label="Lost steps precision (1/step equiv)" value={1 / esteps} unit="mm" decimals={6} /> : null}
          <FormulaNote>
            <p>{klipper ? 'Klipper: new_rd = current_rd × actual ÷ requested.' : 'E-steps: new = current × requested ÷ actual. Examples: 93 × 100 ÷ 96 = 96.875 e-steps/mm; Klipper RD flips the ratio.'}</p>
          </FormulaNote>
        </Card>
      )}

      {tab === 'axis' && (
        <Card>
          <label className="mb-3 flex min-h-[44px] items-center gap-3 text-sm">
            <input type="checkbox" className="size-5 accent-sky-500" checked={screwMode} onChange={(e) => setScrewMode(e.target.checked)} />
            Lead screw drive
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Motor full steps / rev" value={fullRaw} onChange={setFullRaw} hint="Default 200" />
            <Field label="Microstepping" value={microRaw} onChange={setMicroRaw} hint="Default 16" />
            {screwMode
              ? <Field label="Screw lead" value={leadRaw} onChange={setLeadRaw} suffix="mm" hint="mm per full turn" />
              : <>
                  <Field label="Belt pitch" value={pitchRaw} onChange={setPitchRaw} suffix="mm" hint="Default 2 (GT2)" />
                  <Field label="Pulley teeth" value={teethRaw} onChange={setTeethRaw} hint="Default 20" />
                </>}
          </div>
          <ResultRow label="Steps / mm" value={axis} decimals={store.settings.decimals} />
          <FormulaNote>
            <p>{screwMode ? 'steps/mm = (full steps × microsteps) ÷ lead' : 'steps/mm = (full steps × microsteps) ÷ (belt pitch × pulley teeth)'}, e.g. 200 × 16 ÷ (2 × 20) = 80.</p>
          </FormulaNote>
        </Card>
      )}

      {tab === 'dim' && (
        <Card>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Current steps/mm" value={cStepsRaw} onChange={setCStepsRaw} />
            <Field label="Expected length" value={expRaw} onChange={setExpRaw} suffix="mm" />
            <Field label="Measured length" value={measRaw} onChange={setMeasRaw} suffix="mm" />
          </div>
          <ResultRow label="New steps / mm" value={corr} decimals={store.settings.decimals} hint={devHint} />
          {warnHigh ? <p className="text-xs text-red-400">Deviation over ±10% - double-check the measurements before applying.</p> : null}
          <FormulaNote><p>new steps/mm = current × expected ÷ measured.</p></FormulaNote>
        </Card>
      )}
    </ToolPage>
  )
}

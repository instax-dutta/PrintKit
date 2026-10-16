// Shared UI primitives. Numeric inputs take raw strings from the user and pass
// them through lib/format parseNumber for live recalculation (PRD 5.1).
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { IcoCopy } from './icons'
import { parseNumber, fmt, fractionalInch } from '../lib/format'

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && document.hasFocus()) {
      await navigator.clipboard.writeText(text)
      return true
    }
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

export const Card = (p: { children: ReactNode; className?: string; title?: string }) => (
  <section className={`border border-kit-panel-border bg-kit-panel p-4 ${p.className ?? ''}`}>{p.title ? <h2 className="mb-3 font-mono text-[10px] tracking-[0.16em] text-kit-dim">{p.title.toUpperCase()}</h2> : null}{p.children}</section>
)

export const Field = (p: {
  label: string
  value: string
  onChange: (v: string) => void
  suffix?: ReactNode
  hint?: string
  placeholder?: string
}) => (
  <label className="block">
    <span className="mb-1 block font-mono text-[10px] tracking-[0.14em] text-kit-dim">{p.label.toUpperCase()}</span>
    <div className="flex items-stretch border border-kit-panel-border bg-kit-inset focus-within:border-kit-accent">
      <input
        type="text"
        inputMode="decimal"
        className="num min-h-[44px] w-full bg-transparent px-3 py-2 text-lg outline-none"
        value={p.value}
        placeholder={p.placeholder}
        onChange={(e) => p.onChange(e.target.value)}
        spellCheck={false}
        autoComplete="off"
      />
      {p.suffix ? <span className="num flex min-h-[44px] items-center px-3 text-sm text-kit-dim">{p.suffix}</span> : null}
    </div>
    {p.hint ? <span className="mt-1 block text-[11px] text-kit-dim">{p.hint}</span> : null}
  </label>
)

// A single numeric result row with tap-to-copy of "<fmt> <unit>". Invalid or
// empty input renders one neutral double-dash row instead (PRD 5.1).
export const CopyButton = (p: { text: string }) => {
  const [copied, setCopied] = useState(false)
  const t = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (t.current) clearTimeout(t.current) }, [])
  return (
    <button type="button" onClick={() => { void copyText(p.text); setCopied(true); t.current = setTimeout(() => setCopied(false), 1200) }} className="num border border-kit-panel-border px-2.5 py-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[11px] tracking-wider active:bg-kit-inset" aria-label={`Copy ${p.text}`}>
      {copied ? <span className="text-[10px] font-bold tracking-wider text-kit-pink">COPIED</span> : <IcoCopy />}
    </button>
  )
}

export const ResultRow = (p: { label: string; value: number | string | null; unit?: string; kind?: 'length' | 'money' | 'pct' | 'general'; hint?: string; decimals?: number }) => {
  const hasNumber = typeof p.value === 'number' && Number.isFinite(p.value)
  const display = hasNumber
    ? fmt(p.value as number, p.kind ?? 'general', p.decimals ?? 3)
    : typeof p.value === 'string' && p.value
      ? p.value
      : ''
  const copy = display ? `${display}${p.unit ? ' ' + p.unit : ''}` : ''
  return (
    <div className="flex min-h-[44px] items-center justify-between gap-3 py-1.5">
      <div className="min-w-0">
        <div className="font-mono text-[10px] tracking-[0.12em] text-kit-dim">{p.label}</div>
        <div className="num truncate text-xl font-bold" key={display ? display : 'empty'}>
          {display ? (
            <>
              <span className="flash-num">{display}</span>
              {p.unit ? <span className="ml-1 text-sm font-normal text-kit-dim">{p.unit}</span> : null}
            </>
          ) : '—'}
        </div>
        {p.hint ? <div className="text-[11px] text-kit-dim">{p.hint}</div> : null}
      </div>
      {display ? <CopyButton text={copy} /> : <span aria-hidden="true" className="w-[44px]" />}
    </div>
  )
}

// Fractional inch row: shows nearest 1/64 plus its signed mm error (PRD 6.1).
export const FractionRow = (p: { inches: number | null; label?: string }) => {
  const frac = p.inches != null && Number.isFinite(p.inches) ? fractionalInch(p.inches) : null
  if (!frac) return null
  const text = frac.text === '0"' ? '0"' : frac.text
  const full = frac.errorMm !== '0 mm' ? `${text} (≈ ${frac.errorMm} off)` : text
  return (
    <div className="flex min-h-[44px] items-center justify-between gap-3 py-1.5">
      <div className="min-w-0">
        <div className="font-mono text-[10px] tracking-[0.12em] text-kit-dim">{p.label ?? 'fractional (nearest 1/64)'}</div>
        <div className="num truncate text-xl font-bold">{full}</div>
      </div>
      <CopyButton text={full} />
    </div>
  )
}

export const FormulaNote = (p: { children: ReactNode }) => {
  const [open, setOpen] = useState(false)
  return (
    <section className="mt-4">
      <button type="button" onClick={() => setOpen(!open)} className="font-mono text-[10px] font-bold tracking-[0.16em] text-kit-pink underline underline-offset-2" aria-expanded={open}>
        {open ? 'TAKE OFF THE TAPE' : 'FORMULA & NOTES'}
      </button>
      {open ? <div className="mt-2 border border-dashed border-kit-accent bg-kit-panel p-3 text-xs leading-relaxed text-kit-dim">{p.children}</div> : null}
    </section>
  )
}

// Prefer a preset from the store in a plain <select> with an optional Custom…
export const PresetSelect = (p: { label: string; options: Array<{ value: string; title: string }>; value: string; onChange: (v: string) => void; customLabel?: string }) => (
  <label className="block">
    <span className="mb-1 block font-mono text-[10px] tracking-[0.14em] text-kit-dim">{p.label.toUpperCase()}</span>
    <select className="num min-h-[44px] w-full border border-kit-panel-border bg-kit-inset px-3 text-sm" value={p.value} onChange={(e) => p.onChange(e.target.value)}>
      {p.options.map((o) => (
        <option key={o.value} value={o.value}>{o.title}</option>
      ))}
      {p.customLabel ? <option value="__custom">{p.customLabel}</option> : null}
    </select>
  </label>
)

// Small toast bottom center, used for confirmations.
export const Toast = (p: { msg: string | null }) =>
  p.msg ? <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center"><div className="bg-kit-accent px-4 py-2 font-mono text-[11px] font-bold tracking-wider text-[#171a05] shadow-lg">{p.msg}</div></div> : null

// Hook for the "type → parse" pattern used by every tool.
export const useParsed = (initial: string) => {
  const [raw, setRaw] = useState(initial)
  const num = parseNumber(raw)
  const valid = raw.trim() !== '' && Number.isFinite(num)
  return [raw, setRaw, valid, num] as const
}

export const ToolPage = (p: { title: string; children: ReactNode; note?: ReactNode }) => (
  <div className="animate-fadein">
    <div className="mb-1 h-1.5 w-12 bg-kit-accent" aria-hidden="true" />
    <h1 className="text-xl font-extrabold tracking-tight">{p.title}</h1>
    {p.note ?? null}
    <div className="mt-4 space-y-4">{p.children}</div>
  </div>
)

import { Suspense, useEffect, useMemo, useState, type CSSProperties } from 'react'
import { StoreProvider, useStoreCtx } from './lib/storeContext'
import { useHashRoute } from './lib/router'
import { TOOLS, forSlug, searchTools, type Tool } from './tools/registry'
import { IcoSearch, IcoSettings, IcoTheme } from './components/icons'
import { applyTheme } from './theme'
import { registerSw, applyUpdate } from './pwa'

// Slight per-flag rotations make the pinned scrap of tape look hand-placed.
const TILT = [-0.8, 0.6, 1.1, -0.5, 0.7, -1]

function AppInner() {
  const { store, setSettings, addRecent, degraded, saveFailed } = useStoreCtx()
  const [route, navigate] = useHashRoute()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [swUpdate, setSwUpdate] = useState(false)
  useEffect(() => { void registerSw(() => setSwUpdate(true)) }, [])
  useEffect(() => { applyTheme(store.settings.theme) }, [store.settings.theme])

  // Ctrl/Cmd+K toggles the palette (PRD 5.2).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      }
      if (e.key === 'Escape') setPaletteOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (route !== '/') addRecent(route.replace(/^\/+|\/+$/g, ''))
  }, [route, addRecent])

  const slug = route.replace(/^\/+|\/+$/g, '')
  const tool = slug === '' ? null : forSlug(slug)

  // Recent tools pinned on the home board (PRD 5.2), stored in the single store.
  const recents = useMemo(() => store.recentTools.map(forSlug).filter((t): t is Tool => Boolean(t)), [store.recentTools])

  const num = (t: Tool) => `#${String(TOOLS.findIndex((x) => x.slug === t.slug) + 1).padStart(2, '0')}`

  const pinned = recents.length > 0 ? recents : null
  const rest = pinned ? TOOLS.filter((t) => !recents.some((r) => r.slug === t.slug)) : TOOLS

  const home = (
    <div className="animate-fadein">
      {pinned ? (
        <>
          <div className="mb-4 inline-block relative z-20 ml-1 rotate-[1.4deg] bg-kit-pink px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.18em] text-[#2a0a18]">PINNED</div>
          <div className="mb-6 space-y-3">
            {pinned.map((t, i) => (
              <Flag key={t.slug} tool={t} label={num(t)} index={i} wide navigate={navigate} />
            ))}
          </div>
          <div className="relative z-20 mb-5 w-max ml-1 rotate-[1.4deg] bg-kit-pink px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.18em] text-[#2a0a18]">ALL TOOLS</div>
        </>
      ) : (
        <div className="relative z-20 mb-6 w-max ml-1 rotate-[1.4deg] bg-kit-pink px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.18em] text-[#2a0a18]">ON THE BENCH</div>
      )}
      <div className="flex flex-wrap gap-2.5">
        {rest.map((t, i) => (
          <Flag key={t.slug} tool={t} label={num(t)} index={i} navigate={navigate} />
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-40 border-b border-kit-panel-border">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-2">
          <button type="button" onClick={() => navigate('/')} className="flex min-h-[44px] items-center gap-2 px-1" aria-label="PrintKit home">
            <span className="bg-kit-accent px-2 py-1 text-sm font-extrabold leading-none tracking-tight text-[#171a05] [clip-path:polygon(0_0,100%_0,100%_72%,94%_100%,0_100%)]">
              PrintKit<span aria-hidden="true">&#8599;</span>
            </span>
          </button>
          <span className="hidden font-mono text-[9px] tracking-[0.18em] text-kit-dim sm:inline">FDM BENCH / REV C</span>
          <button type="button" onClick={() => setPaletteOpen(true)} className="ml-auto flex min-h-[44px] items-center gap-2 border border-kit-panel-border px-3 font-mono text-[11px] tracking-[0.08em] text-kit-dim active:bg-kit-inset" aria-label="Search tools">
            <IcoSearch /> <span className="hidden sm:inline">SEARCH</span> <kbd className="hidden border border-kit-panel-border px-1 font-mono text-[9px] sm:inline">⌘K</kbd>
          </button>
          <button type="button" onClick={() => setSettings({ theme: store.settings.theme === 'dark' ? 'light' : 'dark' })} className="flex min-h-[44px] min-w-[44px] items-center justify-center border border-kit-panel-border" aria-label="Toggle theme">
            <IcoTheme />
          </button>
          <button type="button" onClick={() => navigate('/settings')} className="flex min-h-[44px] min-w-[44px] items-center justify-center border border-kit-panel-border" aria-label="Settings">
            <IcoSettings />
          </button>
        </div>
      </header>

      {degraded || saveFailed ? (
        <div className="mx-auto max-w-3xl px-4 pt-3">
          <p className="border border-dashed border-kit-pink p-2 font-mono text-[11px] tracking-wide text-kit-pink">
            {degraded ? 'STORAGE TAPE PEELING OFF - settings will not persist this session.' : 'COULD NOT SAVE - storage is full; recent changes may be lost.'}
          </p>
        </div>
      ) : null}

      <main className="mx-auto max-w-3xl px-4 py-5">
        {tool ? (
          <Suspense fallback={<div className="p-6 font-mono text-xs tracking-widest text-kit-dim">UNROLLING…</div>}>
            <tool.Component />
          </Suspense>
        ) : (
          home
        )}
      </main>

      <Palette open={paletteOpen} onClose={() => setPaletteOpen(false)} onGo={(slug2) => { navigate(`/${slug2}`); setPaletteOpen(false) }} />

      {swUpdate ? (
        <div className="fixed inset-x-0 top-14 z-50 mx-auto max-w-sm px-4">
          <div className="border border-dashed border-kit-accent bg-kit-panel p-3 text-xs shadow-xl">
            <span className="font-mono tracking-wide">NEW CUT AVAILABLE.</span>
            <button type="button" onClick={() => { setSwUpdate(false); void applyUpdate() }} className="ml-2 font-mono font-bold text-kit-pink underline">RELOAD</button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

// One tool = one taped flag on the bench grid.
function Flag(p: { tool: Tool; label: string; index: number; wide?: boolean; navigate: (to: string) => void }) {
  const tilt = TILT[p.index % TILT.length]
  const fork = p.index % 3 === 0 ? 'bg-kit-accent' : p.index % 3 === 1 ? 'bg-kit-pink' : 'bg-[#efe9e2]'
  return (
    <button
      type="button"
      onClick={() => p.navigate(`/${p.tool.slug}`)}
      style={{ '--tilt': `${tilt}deg` } as CSSProperties}
      className={`group relative isolate rotate-[var(--tilt)] border border-kit-panel-border bg-kit-panel p-3 pb-3 pt-3.5 text-left shadow-[0_1px_0_rgba(0,0,0,0.35)] transition-transform duration-100 active:rotate-0 active:translate-y-0.5 ${p.wide ? 'w-full max-w-md' : 'w-[calc(50%-5px)] hover:z-10'}`}
    >
      <span aria-hidden="true" className={`absolute -top-1.5 left-2.5 h-3 w-10 ${fork} opacity-90`} />
      <span className="absolute right-2 top-1.5 font-mono text-[9px] tracking-[0.12em] text-kit-text opacity-50">{p.label}</span>
      <span className="block pr-6 text-[13px] font-bold leading-tight tracking-tight">{p.tool.name}</span>
      <span className="mt-1 block font-mono text-[9.5px] leading-relaxed tracking-[0.04em] text-kit-text opacity-70">{p.tool.desc}</span>
    </button>
  )
}

function Palette(p: { open: boolean; onClose: () => void; onGo: (slug: string) => void }) {
  const [q, setQ] = useState('')
  useEffect(() => { if (!p.open) setQ('') }, [p.open])
  if (!p.open) return null
  const results = searchTools(q)
  return (
    <div className="fixed inset-0 z-50 bg-black/60 px-4 pt-20">
      <button type="button" aria-label="Close search" onClick={p.onClose} className="absolute inset-0 cursor-default" />
      <div className="relative mx-auto w-full max-w-md border border-kit-panel-border bg-kit-panel shadow-2xl">
        <div className="flex items-center gap-2 border-b border-kit-panel-border px-3">
          <IcoSearch className="text-kit-dim" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tools… try “mm”, “cost”, “flow”"
            className="min-h-[48px] w-full bg-transparent text-sm outline-none"
            aria-label="Search tools"
          />
          <kbd className="border border-kit-panel-border px-1 font-mono text-[9px] text-kit-dim">Esc</kbd>
        </div>
        <ul className="max-h-80 overflow-auto p-1">
          {results.length === 0 ? (
            <li className="p-3 font-mono text-[11px] tracking-wide text-kit-dim">NO MATCHING TOOL.</li>
          ) : (
            results.map((t) => (
              <li key={t.slug}>
                <button type="button" onClick={() => p.onGo(t.slug)} className="min-h-[44px] w-full p-2 text-left active:bg-kit-inset">
                  <span className="text-sm font-bold">{t.name}</span>
                  <span className="block font-mono text-[10px] text-kit-dim">{t.desc}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  )
}

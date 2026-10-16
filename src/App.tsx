import { Suspense, useEffect, useMemo, useState } from 'react'
import { StoreProvider, useStoreCtx } from './lib/storeContext'
import { useHashRoute } from './lib/router'
import { TOOLS, pushRecent, recentTools, forSlug, searchTools, type Tool } from './tools/registry'
import { IcoSearch, IcoSettings, IcoTheme } from './components/icons'
import { applyTheme } from './theme'
import { registerSw, applyUpdate } from './pwa'

function AppInner() {
  const { store, setSettings, degraded } = useStoreCtx()
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
    if (route !== '/') pushRecent(route.slice(1))
  }, [route])

  const slug = route.replace(/^\/+|\/+$/g, '')
  const tool = slug === '' ? null : forSlug(slug)

  // Recent tools pinned on the home grid (PRD 5.2).
  const recents = useMemo(() => recentTools().map(forSlug).filter((t): t is Tool => Boolean(t)), [route])

  const ToolList = ({ items, title }: { items: Tool[]; title?: string }) => (
    <div className="mb-4">
      {title ? <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-kit-dim">{title}</h2> : null}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {items.map((t) => (
          <button key={t.slug} type="button" onClick={() => navigate(`/${t.slug}`)} className="flex flex-col items-start rounded-xl border border-kit-line bg-kit-panel p-3 text-left hover:border-kit-accent/60 focus-visible:border-kit-accent">
            <span className="text-sm font-semibold">{t.name}</span>
            <span className="text-[11px] leading-snug text-kit-dim">{t.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )

  const home = (
    <div>
      {(recents.length ? [...recents, ...TOOLS.filter((t) => !recents.some((r) => r.slug === t.slug))] : TOOLS).length > 3 && recents.length > 0 ? (
        <ToolList items={recents} title="Recently used" />
      ) : null}
      <ToolList items={TOOLS} title="All tools" />
    </div>
  )

  return (
    <div className="min-h-screen bg-kit-bg text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-kit-line bg-kit-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-2">
          <button type="button" onClick={() => navigate('/')} className="flex min-h-[44px] items-center px-1 text-sm font-bold tracking-tight" aria-label="PrintKit home">
            Print<span className="text-kit-accent">Kit</span>
          </button>
          <button type="button" onClick={() => setPaletteOpen(true)} className="ml-auto flex min-h-[44px] items-center gap-2 rounded-lg border border-kit-line px-3 text-xs text-kit-dim" aria-label="Search tools">
            <IcoSearch /> <span className="hidden sm:inline">Search</span> <kbd className="hidden rounded border border-kit-line px-1 text-[10px] sm:inline">⌘K</kbd>
          </button>
          <button type="button" onClick={() => setSettings({ theme: store.settings.theme === 'dark' ? 'light' : 'dark' })} className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-kit-line" aria-label="Toggle theme">
            <IcoTheme />
          </button>
          <button type="button" onClick={() => navigate('/settings')} className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-kit-line" aria-label="Settings">
            <IcoSettings />
          </button>
        </div>
      </header>

      {degraded ? (
        <div className="mx-auto max-w-3xl px-4 pt-3">
          <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-300">Storage unavailable, settings will not persist this session.</p>
        </div>
      ) : null}

      <main className="mx-auto max-w-3xl px-4 py-5">
        {tool ? (
          <Suspense fallback={<div className="p-6 text-sm text-kit-dim">Loading…</div>}>
            <tool.Component />
          </Suspense>
        ) : (
          home
        )}
      </main>

      <Palette open={paletteOpen} onClose={() => setPaletteOpen(false)} onGo={(slug2) => { navigate(`/${slug2}`); setPaletteOpen(false) }} />

      {swUpdate ? (
        <div className="fixed inset-x-0 top-14 z-50 mx-auto max-w-sm px-4">
          <div className="rounded-lg border border-kit-accent/50 bg-kit-panel p-3 text-xs shadow-xl">
            New version available.
            <button type="button" onClick={() => { setSwUpdate(false); void applyUpdate() }} className="ml-2 font-semibold text-kit-accent underline">Reload</button>
          </div>
        </div>
      ) : null}
    </div>
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
      <div className="relative mx-auto w-full max-w-md rounded-xl border border-kit-line bg-kit-panel shadow-2xl">
        <div className="flex items-center gap-2 border-b border-kit-line px-3">
          <IcoSearch className="text-kit-dim" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tools… try “mm”, “cost”, “flow”"
            className="min-h-[48px] w-full bg-transparent text-sm outline-none"
            aria-label="Search tools"
          />
          <kbd className="rounded border border-kit-line px-1 text-[10px] text-kit-dim">Esc</kbd>
        </div>
        <ul className="max-h-80 overflow-auto p-1">
          {results.length === 0 ? (
            <li className="p-3 text-xs text-kit-dim">No matching tool.</li>
          ) : (
            results.map((t) => (
              <li key={t.slug}>
                <button type="button" onClick={() => p.onGo(t.slug)} className="min-h-[44px] w-full rounded-lg p-2 text-left hover:bg-white/5">
                  <span className="text-sm font-semibold">{t.name}</span>
                  <span className="block text-[11px] text-kit-dim">{t.desc}</span>
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

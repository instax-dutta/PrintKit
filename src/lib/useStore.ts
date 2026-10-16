// Global store hook: settings, materials, printers persisted per PRD 8.
import { useCallback, useEffect, useState } from 'react'
import type { Material, Printer, Settings, Store } from './store'
import { load, save } from './store'

export const useStore = () => {
  const [initial] = useState(() => load())
  const [store, setStore] = useState<Store>(initial.store)
  const [degraded] = useState(initial.degraded)
  const [saveFailed, setSaveFailed] = useState(false)

  useEffect(() => {
    if (store.initialized && !save(store)) setSaveFailed(true)
  }, [store])

  const setSettings = useCallback((patch: Partial<Settings>) => {
    setStore((s) => ({ ...s, settings: { ...s.settings, ...patch }, initialized: true }))
  }, [])

  const addRecent = useCallback((slug: string) => {
    setStore((s) => {
      const next = [slug, ...s.recentTools.filter((t) => t !== slug)].slice(0, 3)
      return next.join(',') === s.recentTools.join(',') ? s : { ...s, recentTools: next, initialized: true }
    })
  }, [])

  const setMaterials = useCallback((materials: Material[]) => {
    setStore((s) => ({ ...s, materials, initialized: true }))
  }, [])

  const setPrinters = useCallback((printers: Printer[]) => {
    setStore((s) => ({ ...s, printers, initialized: true }))
  }, [])

  const setStoreAll = useCallback((next: Store) => {
    setStore(next)
    if (!save(next)) setSaveFailed(true)
  }, [])

  const reset = useCallback(() => {
    try {
      localStorage.removeItem('printkit:v1')
    } catch {
      /* storage unavailable already flagged degraded */
    }
    setStore(load().store)
    setSaveFailed(false)
  }, [])

  return { store, setSettings, addRecent, setMaterials, setPrinters, setStoreAll, reset, degraded, saveFailed }
}

export type UseStore = ReturnType<typeof useStore>

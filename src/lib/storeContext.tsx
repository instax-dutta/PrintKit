// One shared store instance for the whole app (context provider).
import { createContext, useContext, type ReactNode } from 'react'
import { useStore, type UseStore } from './useStore'

const Ctx = createContext<UseStore | null>(null)

export const StoreProvider = ({ children }: { children: ReactNode }) => (
  <Ctx.Provider value={useStore()}>{children}</Ctx.Provider>
)

export const useStoreCtx = (): UseStore => {
  const v = useContext(Ctx)
  if (!v) throw new Error('StoreProvider missing')
  return v
}

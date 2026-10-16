// Theme class handling: dark is the default (index.html ships it); 'system'
// follows prefers-color-scheme until the user picks dark or light explicitly.
import type { Settings } from './lib/store'

const mq = (): MediaQueryList | null =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: light)') : null

export function isDarkPrefNow(theme: Settings['theme']): boolean {
  return theme === 'dark' || (theme === 'system' && !(mq()?.matches ?? false))
}

export function applyTheme(theme: Settings['theme']): void {
  const root = document.documentElement
  const dark = isDarkPrefNow(theme)
  root.classList.toggle('dark', dark)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', dark ? '#15181f' : '#f4f6f9')
}

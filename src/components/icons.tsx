// Minimal icon set, hand-rolled so we ship no icon library (PRD 4).
type P = { className?: string }

export const IcoCopy = ({ className = 'size-4' }: P) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>
)
export const IcoSwap = ({ className = 'size-4' }: P) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true"><path d="M7 16V6l-4 4 4 4M17 8v10l4-4-4-4" /></svg>
)
export const IcoSearch = ({ className = 'size-4' }: P) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
)
export const IcoSettings = ({ className = 'size-4' }: P) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true"><circle cx="12" cy="12" r="3.2" /><path d="M4 12h2.5M17.5 12H20M12 4v2.5M12 17.5V20" strokeLinecap="round" /><circle cx="12" cy="12" r="7.5" /></svg>
)
export const IcoTheme = ({ className = 'size-4' }: P) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9" fill="currentColor" stroke="none" opacity=".9" /><path d="M12 3v2m0 14v2M3 12h2m14 0h2" strokeLinecap="round" /></svg>
)

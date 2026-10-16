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
export const IcoRule = ({ className = 'size-4' }: P) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true"><rect x="3" y="7" width="18" height="10" rx="1.5" /><path d="M7 7v3M11 7v4M15 7v3M19 7v4" /></svg>
)
export const IcoScale = ({ className = 'size-4' }: P) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true"><path d="M4 20 20 4M8 4h12v12" /></svg>
)
export const IcoSpool = ({ className = 'size-4' }: P) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true"><circle cx="12" cy="9" r="5" /><circle cx="12" cy="9" r="1.6" /><path d="M7 9H4m13 0h3M7 18c3 0 10 0 10 0" strokeLinecap="round" /></svg>
)
export const IcoCost = ({ className = 'size-4' }: P) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true"><path d="M6 6h9a3.5 3.5 0 0 1 0 7H8m10 5H6m2-5 4 5m6-10h3m-6 5h3" strokeLinecap="round" /></svg>
)
export const IcoShrink = ({ className = 'size-4' }: P) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true"><path d="M9 15 4 20M4 20v-5m0 5h5M15 9h6m0 0V4.5M15 9l6-5" strokeLinecap="round" /></svg>
)
export const IcoFit = ({ className = 'size-4' }: P) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><rect x="8" y="8" width="8" height="8" rx="1" /></svg>
)
export const IcoFlow = ({ className = 'size-4' }: P) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true"><path d="M3 12c2-2 3-2 5 0s3 2 5 0 3-2 5 0 3 2 5 0M3 17c2-2 3-2 5 0s3 2 5 0 3-2 5 0 3 2 5 0M3 7c2-2 3-2 5 0s3 2 5 0 3-2 5 0 3 2 5 0" strokeLinecap="round" /></svg>
)
export const IcoCal = ({ className = 'size-4' }: P) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true"><path d="M12 3v4m0 4v10" strokeLinecap="round" /><circle cx="12" cy="9" r="2" /><path d="M5 21h14" /></svg>
)
export const IcoLayers = ({ className = 'size-4' }: P) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true"><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" opacity=".7" /></svg>
)
export const IcoBox = ({ className = 'size-4' }: P) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true"><path d="M12 3 21 8v8l-9 5-9-5V8l9-5Z" /><path d="M12 12v9m7-9v-4M5 8l7 4" opacity=".8" /></svg>
)
export const IcoBook = ({ className = 'size-4' }: P) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h14v18H6a2 2 0 0 1-2-2V5Zm2 12a2 2 0 0 1 2-2h12" /></svg>
)
export const IcoPresets = ({ className = 'size-4' }: P) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true"><rect x="3" y="4" width="18" height="6" rx="1.5" /><rect x="3" y="14" width="18" height="6" rx="1.5" /><circle cx="8" cy="7" r="1.2" fill="currentColor" /><circle cx="16" cy="17" r="1.2" fill="currentColor" /></svg>
)

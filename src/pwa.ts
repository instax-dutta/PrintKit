// Service worker glue: register, detect a waiting update, and let the user
// apply it (PRD 13: never leave users stuck on a stale build).
let onUpdate: (() => void) | null = null
let reg: ServiceWorkerRegistration | null = null

export function registerSw(onWaiting: () => void): void {
  onUpdate = onWaiting
  if (!('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').then((r) => {
      reg = r
      if (r.waiting && navigator.serviceWorker.controller) onUpdate?.()
      r.addEventListener('updatefound', () => {
        const installing = r.installing
        if (!installing) return
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) onUpdate?.()
        })
      })
    }).catch(() => void 0)
  })
  let reloading = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return
    reloading = true
    window.location.reload()
  })
}

export function applyUpdate(): void {
  reg?.waiting?.postMessage('SKIP_WAITING')
}

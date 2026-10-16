// PrintKit service worker: versioned runtime cache, offline-first for
// same-origin GETs, kills itself on UPDATE so repeat visits get fresh builds.
const VERSION = 'printkit-v1'
const CORE = ['/', '/index.html', '/manifest.webmanifest', '/icon.svg', '/icon-180.png', '/icon-192.png', '/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match(req).then((r) => r || caches.match('/index.html'))))
    return
  }
  event.respondWith(
    caches.match(req).then((hit) => {
      const fetching = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone()
            void caches.open(VERSION).then((c) => c.put(req, clone))
          }
          return res
        })
        .catch(() => hit || Response.error())
      return hit || fetching
    }),
  )
})

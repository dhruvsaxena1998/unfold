// Offline shell: pages network-first, assets cache-first.
const CACHE = 'held-v1'
const SHELL = ['/', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/favicon.svg']

self.addEventListener('install', (e) => {
  // Also precache the hashed JS/CSS/font files the page references, so the first visit works offline.
  e.waitUntil(
    caches.open(CACHE).then(async (c) => {
      await c.addAll(SHELL)
      const html = await (await c.match('/')).text()
      const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1])
      await c.addAll(assets)
      const css = assets.filter((a) => a.endsWith('.css'))
      for (const a of css) {
        const text = await (await c.match(a)).text()
        const fonts = [...text.matchAll(/url\((\/assets\/[^)]+-latin-\d+[^)]*\.woff2)\)/g)].map((m) => m[1])
        await c.addAll(fonts)
      }
    }),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          caches.open(CACHE).then((c) => c.put('/', res.clone()))
          return res
        })
        .catch(() => caches.match('/')),
    )
    return
  }

  e.respondWith(
    // ignoreVary: the server sends Vary: Origin, and module scripts carry an Origin header the precache didn't.
    caches.match(req, { ignoreVary: true }).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()))
          return res
        }),
    ),
  )
})

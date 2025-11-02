self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open('dna-cache-v2').then((cache) => cache.addAll([
      '/',
      '/tickets',
      // Do NOT pre-cache private/admin routes
      '/manifest.json',
    ]))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k !== 'dna-cache-v2').map((k) => caches.delete(k)))
      await self.clients.claim()
    })()
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  const isPrivate = url.pathname.startsWith('/admin') || url.pathname.startsWith('/api')
  const isHTMLNavigation = request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html')

  // Bypass cache for private routes and API, always go to network
  if (isPrivate) {
    event.respondWith(fetch(request))
    return
  }

  // Network-first for navigations to keep content fresh
  if (isHTMLNavigation) {
    event.respondWith(
      fetch(request).then((response) => {
        const copy = response.clone()
        caches.open('dna-cache-v2').then((cache) => cache.put(request, copy)).catch(()=>{})
        return response
      }).catch(() => caches.match(request))
    )
    return
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      const copy = response.clone()
      caches.open('dna-cache-v2').then((cache) => cache.put(request, copy)).catch(()=>{})
      return response
    }))
  )
})

// Push notifications
self.addEventListener('push', (event) => {
  let data = {}
  try { data = event.data?.json() || {} } catch { data = { title: 'Notification', body: '' } }
  const title = data.title || 'Notification'
  const body = data.body || ''
  const options = { body, icon: '/placeholder-logo.png', badge: '/placeholder-logo.png' }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow('/')
    })
  )
})

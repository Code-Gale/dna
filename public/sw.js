self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('dna-cache-v1').then((cache) => cache.addAll([
      '/',
      '/tickets',
      '/admin',
      '/manifest.json',
    ]))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      const copy = response.clone()
      caches.open('dna-cache-v1').then((cache) => cache.put(request, copy)).catch(()=>{})
      return response
    }).catch(()=> cached))
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

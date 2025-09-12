// Killer Service Worker - temporary cleanup to remove legacy cached SW & assets
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
      // Unregister self so future loads are uncontrolled
      await self.registration.unregister();
      const clientsArr = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
      for (const client of clientsArr) {
        // Force reload (strip hash fragments)
        client.navigate(client.url.split('#')[0]);
      }
    } catch (err) {
      // noop
    }
  })());
});

self.addEventListener('fetch', (e) => {
  // Bypass any cache logic: always network
  return; // allow default fetch
});

const CACHE_NAME = 'moz-solidaria-v3';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/logo-moz-solidaria-v2.png',
  '/manifest.json'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Cache apenas recursos que realmente existem
        return cache.addAll([
          '/',
          '/logo-moz-solidaria-v2.png',
          '/manifest.json'
        ]).catch(err => {
          console.warn('SW: Alguns recursos não puderam ser cacheados:', err);
          return Promise.resolve(); // Continue sem falhar
        });
      })
      .then(() => self.skipWaiting())
      .catch(err => {
        console.warn('SW: Falha na instalação:', err);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle same-origin requests; let the browser handle cross-origin (e.g., API to localhost:8000)
  if (url.origin !== self.location.origin) {
    return; // do not call respondWith -> avoids SW interfering with API calls
  }

  // Only cache GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Bypass caching for dynamic API and media endpoints
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/media/')) {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).catch(() => {
        // Optional: offline fallback for navigations
        if (request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
  }).then(() => self.clients.claim())
  );
});

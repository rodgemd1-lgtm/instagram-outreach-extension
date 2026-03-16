self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (e) => {
  // Pass-through to network, no caching
  e.respondWith(fetch(e.request));
});

// Also unregister
if (typeof self.registration.unregister === 'function') {
  self.registration.unregister();
}

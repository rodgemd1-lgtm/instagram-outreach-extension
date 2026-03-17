const CACHE_NAME = 'jacobs-command-v2';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/images/image-1773714384388-1.png',
  '/images/image-1773714390904-1.png',
];

// Install: pre-cache critical assets + splash screen
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for static, stale-while-revalidate for API, network-first for HTML
self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip Chrome extensions and other origins
  if (url.origin !== self.location.origin) return;

  // API routes: stale-while-revalidate (return cached immediately, update in background)
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, clone);
              });
            }
            return response;
          })
          .catch(() => {
            // If network fails and no cache, return offline JSON
            if (!cached) {
              return new Response(
                JSON.stringify({ error: 'Offline', offline: true }),
                { headers: { 'Content-Type': 'application/json' } }
              );
            }
            return cached;
          });

        // Return cached response immediately if available, otherwise wait for network
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Static assets: cache-first
  if (
    url.pathname.startsWith('/logos/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.woff2')
  ) {
    e.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // HTML pages: network-first with offline fallback returning cached dashboard + X-Offline header
  e.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          // Offline: return cached dashboard with X-Offline header
          return caches.match('/dashboard').then((dashboardResponse) => {
            if (!dashboardResponse) return dashboardResponse;
            // Clone and add offline header
            const headers = new Headers(dashboardResponse.headers);
            headers.set('X-Offline', 'true');
            return new Response(dashboardResponse.body, {
              status: dashboardResponse.status,
              statusText: dashboardResponse.statusText,
              headers,
            });
          });
        });
      })
  );
});

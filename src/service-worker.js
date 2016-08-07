const CACHE_VERSION = 'v1';
const URLS_TO_PREFETCH = [
  './',
  './index.html',
  './js/app.js',
];

self.addEventListener('install', event => {
  console.log('[ServiceWorker] Installed');

  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_VERSION).then(cache => cache.addAll(URLS_TO_PREFETCH)));
});

self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activated');

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(cacheNames.map(cacheName => {
        if (cacheName !== CACHE_VERSION) {
          console.log(`[ServiceWorker] removing cached files from cache - ${cacheName}`);
          return caches.delete(cacheName);
        }
      }));
    })
  );
});

self.addEventListener('fetch', event => {
  console.log(`[ServiceWorker] is fetching ${event.request.url}`);

  if (event.request.headers.get('range')) {
    const position = Number(/^bytes\=(\d+)\-$/g.exec(event.request.headers.get('range'))[1]);

    console.log(`[ServiceWorker] Range request for ${event.request.url}, starting position: ${position}`);

    event.respondWith(
      caches
        .open(CACHE_VERSION)
        .then(cache => cache.match(event.request.url))
        .then(response => {
          if (!response) return fetch(event.request).then(res => res.arrayBuffer());

          return response.arrayBuffer();
        })
        .then(ab => {
          return new Response(ab.slice(position), {
            status: 206,
            statusText: 'Partial Content',
            headers: [
              // ['Content-Type', 'video/webm'],
              ['Content-Range', 'bytes ' + position + '-' +
              (ab.byteLength - 1) + '/' + ab.byteLength]]
          });
        }));
  } else {
    console.log(`[ServiceWorker] Non-range request for ${event.request.url}`);

    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          console.log(`[ServiceWorker] Found response in cache: ${response}`);
          return response;
        }

        console.log('[ServiceWorker] No response found in cache. About to fetch from network...');

        return fetch(event.request)
          .then(response => {
            console.log(`[ServiceWorker] Response from network is: ${response}`);
            return response;
          })
          .catch(error => {
            console.error(`[ServiceWorker] Fetching failed: ${error}`);
            throw error;
          });
      })
    );
  }
});

const CACHE_NAME = 'v1';
const CACHE_FILES = [
  './',
  './index.html',
  './js/app.js',
];

self.addEventListener('install', event => {
  console.log('[ServiceWorker] Installed');

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] is caching...');
      return cache.addAll(CACHE_FILES);
    })
  );
});

self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activated');

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(cacheNames.map(thisCacheName => {
        if (thisCacheName !== CACHE_NAME) {
          console.log(`[ServiceWorker] removing cached files from cache - ${thisCacheName}`);
          return caches.delete(thisCacheName);
        }
      }));
    })
  );
});

self.addEventListener('fetch', event => {
  console.log(`[ServiceWorker] is fetching ${event.request.url}`);

  event.respondWith(
    caches
      .match(event.request)
      .then(response => {
        if (response) {
          console.log(`[ServiceWorker] found in cache ${event.request.url} ${response}`);
          return response;
        }

        const requestClone = event.request.clone();
        fetch(requestClone).then(response => {
          if (!response) {
            console.log('[ServiceWorker] no response from fetch');
            return response;
          }

          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
            console.log(`[ServiceWorker] new data cached ${event.request.url}`);
            return response;

          });
        }).catch(error => {
          console.log(`[ServiceWorker] error fetching & caching new data ${error}`);
        });
      })
  );
});

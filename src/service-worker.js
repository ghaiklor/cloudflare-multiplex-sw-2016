self.addEventListener('install', event => console.log('[ServiceWorker] Installed'));
self.addEventListener('activate', event => console.log('[ServiceWorker] Activated'));
self.addEventListener('fetch', event => {
  const url = event.request.url;
  const headers = event.request.headers;

  if (headers.get('range')) {
    const position = Number(/^bytes\=(\d+)\-$/g.exec(headers.get('range'))[1]);

    console.log(`[ServiceWorker] Range request for ${url}, starting position: ${position}`);

    event.respondWith(
      fetch(event.request)
        .then(response => response.arrayBuffer())
        .then(ab => {
          return new Response(ab.slice(position), {
            status: 206,
            statusText: 'Partial Content',
            headers: [
              ['Content-Range', `bytes ${position}-${ab.byteLength - 1}/${ab.byteLength}`]
            ]
          });
        })
    );
  }
});

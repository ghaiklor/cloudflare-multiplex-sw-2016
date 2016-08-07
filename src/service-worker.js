self.addEventListener('install', event => console.log('[ServiceWorker] Installed'));
self.addEventListener('activate', event => console.log('[ServiceWorker] Activated'));
self.addEventListener('fetch', event => {
  if (event.request.headers.get('range')) {
    const position = Number(/^bytes\=(\d+)\-$/g.exec(event.request.headers.get('range'))[1]);

    console.log(`[ServiceWorker] Range request for ${event.request.url}, starting position: ${position}`);

    event.respondWith(
      fetch(event.request)
        .then(response => response.arrayBuffer())
        .then(ab => {
          return new Response(ab.slice(position), {
            status: 206,
            statusText: 'Partial Content',
            headers: [
              // ['Content-Type', 'video/webm'],
              ['Content-Range', 'bytes ' + position + '-' +
              (ab.byteLength - 1) + '/' + ab.byteLength]]
          });
        })
    )
  } else {
    console.log(`[ServiceWorker] Non-range request for ${event.request.url}`);

    event.respondWith(
      fetch(event.request)
        .then(response => {
          console.log(`[ServiceWorker] Response from network is: ${response}`);
          return response;
        })
        .catch(error => {
          console.error(`[ServiceWorker] Fetching failed: ${error}`);
          throw error;
        })
    );
  }
});

/**
 * Concat two ArrayBuffers
 * @param {ArrayBuffer} ab1
 * @param {ArrayBuffer} ab2
 * @returns {ArrayBuffer} Returns new ArrayBuffer
 */
function concatArrayBuffer(ab1, ab2) {
  const tmp = new Uint8Array(ab1.byteLength + ab2.byteLength);
  tmp.set(new Uint8Array(ab1), 0);
  tmp.set(new Uint8Array(ab2), ab1.byteLength);
  return tmp.buffer;
}

self.addEventListener('install', event => console.log('[ServiceWorker] Installed'));
self.addEventListener('activate', event => console.log('[ServiceWorker] Activated'));
self.addEventListener('fetch', event => {
  const url = event.request.url;
  const headers = event.request.headers;
  const requests = [];

  if (headers.get('range')) {
    event.respondWith(
      fetch(url, {
        method: 'HEAD'
      }).then(response => {
        const contentLength = response.headers.get('content-length');

        for (let i = 0; i < 4; i++) {
          requests.push(
            fetch(url, {
              headers: new Headers({
                'Accept': '*/*',
                'Accept-Encoding': 'identity;q=1, *;q=0',
                'Accept-Language': 'en-US,en;q=0.8',
                'Range': `bytes=${i * 100000}-${(i * 100000) + 100000}/${contentLength}`
              })
            })
          );
        }

        return Promise
          .all(requests)
          .then(responses => Promise.all(responses.map(res => res.arrayBuffer())))
          .then(buffers => {
            const result = buffers.reduce((acc, ab) => concatArrayBuffer(acc, ab));

            return new Response(result, {
              status: 206,
              statusText: 'Partial Content',
              headers: [
                ['Accept-Ranges', 'bytes'],
                ['Content-Length', contentLength],
                ['Content-Range', `bytes=0-${result.byteLength - 1}/${contentLength}`],
                ['Content-Type', 'video/mp4']
              ]
            });
          });
      })
    );
  }
});

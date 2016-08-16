/**
 * Size of one chunk when requesting with Range
 * @type {Number}
 * @private
 */
const CHUNK_SIZE = 102400;

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

        for (let i = 0; i < contentLength / CHUNK_SIZE; i++) {
          requests.push(
            fetch(url, {
              headers: new Headers({
                'Range': `bytes=${i * CHUNK_SIZE}-${(i * CHUNK_SIZE) + CHUNK_SIZE - 1}/${contentLength}`
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
              status: 200,
              headers: [
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

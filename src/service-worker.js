/**
 * Size of one chunk when requesting with Range
 * @type {Number}
 * @private
 */
const CHUNK_SIZE = 204800;

/**
 * Concat two ArrayBuffers
 * @param {ArrayBuffer} ab1
 * @param {ArrayBuffer} ab2
 * @returns {ArrayBuffer} Returns new ArrayBuffer
 * @private
 */
function concatArrayBuffer(ab1, ab2) {
  const tmp = new Uint8Array(ab1.byteLength + ab2.byteLength);
  tmp.set(new Uint8Array(ab1), 0);
  tmp.set(new Uint8Array(ab2), ab1.byteLength);
  return tmp.buffer;
}

/**
 * Builds an array of separate requests to URL with specified ContentLength
 * @param {String} url Target URL
 * @param {Number} length Total length of content located by URL
 * @returns {Array<Promise>} Returns an array of promises built by fetch()
 * @private
 */
function buildPartialRequests(url, length) {
  return Array
    .from({length: Math.ceil(length / CHUNK_SIZE)})
    .map((_, i) => {
      return fetch(url, {
        headers: new Headers({
          'Range': `bytes=${i * CHUNK_SIZE}-${(i * CHUNK_SIZE) + CHUNK_SIZE - 1}/${length}`
        })
      })
    });
}

/**
 * Triggers each time when HEAD requests is successful
 * @param {Response} response
 * @returns {Promise} Returns promise that fullfils into new Response object
 * @private
 */
function onHeadResponse(response) {
  const contentLength = response.headers.get('content-length');
  const url = response.url;

  return Promise
    .all(buildPartialRequests(url, contentLength))
    .then(responses => Promise.all(responses.map(res => res.arrayBuffer())))
    .then(buffers => new Response(buffers.reduce(concatArrayBuffer)));
}

// Registers all needed events in Service Worker
self.addEventListener('install', event => console.log('[ServiceWorker] Installed'));
self.addEventListener('activate', event => console.log('[ServiceWorker] Activated'));
self.addEventListener('fetch', event => event.respondWith(fetch(event.request.url, {method: 'HEAD'}).then(onHeadResponse)));

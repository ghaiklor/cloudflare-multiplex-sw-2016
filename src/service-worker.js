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
 * Triggers each time when HEAD request is successful
 * @param {Request} request Original request
 * @param {Response} response HEAD response from a server
 * @returns {Promise} Returns promise that fulfils into new Response object
 * @fulfils {Response}
 * @private
 */
function onHeadResponse(request, response) {
  const contentLength = response.headers.get('content-length');
  const promises = Array
    .from({length: Math.ceil(contentLength / CHUNK_SIZE)})
    .map((_, i) => {
      const headers = new Headers(request.headers);
      headers.append('Range', `bytes=${i * CHUNK_SIZE}-${(i * CHUNK_SIZE) + CHUNK_SIZE - 1}/${contentLength}`);

      return fetch(new Request(request, {headers}));
    });

  return Promise
    .all(promises)
    .then(responses => Promise.all(responses.map(res => res.arrayBuffer())))
    .then(buffers => new Response(buffers.reduce(concatArrayBuffer), {headers: response.headers}));
}

/**
 * Triggers each time when fetch event fires in Service Worker
 * @param {FetchEvent} event
 * @returns {Promise}
 * @fulfils {Response}
 * @private
 */
function onFetch(event) {
  const url = new URL(event.request.url);

  if (event.request.mode === 'navigate') return event.respondWith(fetch(event.request));
  if (event.request.mode === 'no-cors' && url.origin !== location.origin) return event.respondWith(fetch(event.request));

  let mode = 'cors';
  if (url.origin === location.origin) mode = 'same-origin';

  const request = new Request(event.request, {mode});
  return event.respondWith(fetch(new Request(request, {method: 'HEAD'})).then(onHeadResponse.bind(this, request)));
}

self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', onFetch);

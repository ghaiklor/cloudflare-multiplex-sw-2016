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
 * @param {FetchEvent} event Original FetchEvent from request
 * @param {Response} response HEAD response from a server
 * @returns {Promise} Returns promise that fulfils into new Response object
 * @fulfils {Response}
 * @private
 */
function onHeadResponse(event, response) {
  const contentLength = response.headers.get('content-length');
  const promises = Array
    .from({length: Math.ceil(contentLength / CHUNK_SIZE)})
    .map((_, i) => {
      const headers = new Headers();

      for (let pair of event.request.headers.entries()) headers.append(pair[0], pair[1]);
      headers.append('Range', `bytes=${i * CHUNK_SIZE}-${(i * CHUNK_SIZE) + CHUNK_SIZE - 1}/${contentLength}`);

      const request = new Request(event.request, {headers: headers});
      return fetch(request);
    });

  return Promise
    .all(promises)
    .then(responses => Promise.all(responses.map(res => res.arrayBuffer())))
    .then(buffers => new Response(buffers.reduce(concatArrayBuffer)));
}

/**
 * Triggers each time when fetch event fires in Service Worker
 * @param {FetchEvent} event
 * @returns {Promise}
 * @fulfils {Response}
 * @private
 */
function onFetch(event) {
  const request = new Request(event.request, {method: 'HEAD'});

  return event.respondWith(fetch(request).then(onHeadResponse.bind(this, event)));
}

self.addEventListener('fetch', onFetch);

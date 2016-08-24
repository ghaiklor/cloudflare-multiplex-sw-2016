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
 * @param {Request} request Request object from original request
 * @param {Number} length Total length of content located by URL
 * @returns {Array<Promise>} Returns an array of promises built by fetch()
 * @private
 */
function buildPartialRequests(request, length) {
  return Array
    .from({length: Math.ceil(length / CHUNK_SIZE)})
    .map((_, i) => {
      //FIXME: Failed to execute 'set' on 'Headers': Headers are immutable
      const newHeaders = request.headers;
      newHeaders.set('Range', `bytes=${i * CHUNK_SIZE}-${(i * CHUNK_SIZE) + CHUNK_SIZE - 1}/${length}`);

      const newRequest = new Request(request.url, {
        method: request.method,
        headers: newHeaders,
        body: request.body,
        mode: request.mode,
        credentials: request.credentials,
        cache: request.cache,
        redirect: request.redirect,
        referrer: request.referrer,
        integrity: request.integrity
      });

      return fetch(newRequest);
    });
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

  return Promise
    .all(buildPartialRequests(event.request.clone(), contentLength))
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
  //TODO: make request constructor more flexible
  const request = new Request(event.request.url, {
    method: 'HEAD',
    headers: event.request.headers,
    body: event.request.body,
    mode: event.request.mode,
    credentials: event.request.credentials,
    cache: event.request.cache,
    redirect: event.request.redirect,
    referrer: event.request.referrer,
    integrity: event.request.integrity
  });

  return event.respondWith(fetch(request).then(onHeadResponse.bind(this, event)));
}

self.addEventListener('fetch', onFetch);

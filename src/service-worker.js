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
 * Clones Request object.
 * The reason for this method is because you can override init properties.
 * @param {Request} request Request object you would like to clone
 * @param {Object} init Object with properties you would like to override in clone
 * @returns {Request}
 */
function cloneRequest(request, init) {
  if (Object.prototype.toString.call(init) !== '[object Object]') return request.clone();

  return new Request(init.url || request.url, {
    method: init.method || request.method,
    headers: init.headers || request.headers,
    body: init.body || request.body,
    referrer: init.referrer || request.referrer,
    referrerPolicy: init.referrerPolicy || request.referrerPolicy,
    mode: init.mode || /.*cors/.test(request.mode) ? 'cors' : 'same-origin',
    credentials: init.credentials || request.credentials,
    cache: init.cache || request.cache,
    redirect: init.redirect || request.redirect,
    integrity: init.integrity || request.integrity
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
  const promises = Array
    .from({length: Math.ceil(contentLength / CHUNK_SIZE)})
    .map((_, i) => {
      const headers = new Headers(event.request.headers);
      headers.append('Range', `bytes=${i * CHUNK_SIZE}-${(i * CHUNK_SIZE) + CHUNK_SIZE - 1}/${contentLength}`);

      const request = cloneRequest(event.request, {headers});
      return fetch(request);
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
  if (event.request.mode === 'navigate') return event.respondWith(fetch(event.request));

  const request = cloneRequest(event.request, {method: 'HEAD'});
  return event.respondWith(fetch(request).then(onHeadResponse.bind(this, event)));
}

self.addEventListener('fetch', onFetch);

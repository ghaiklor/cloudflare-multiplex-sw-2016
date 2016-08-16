self.addEventListener('install', event => console.log('[ServiceWorker] Installed'));
self.addEventListener('activate', event => console.log('[ServiceWorker] Activated'));
self.addEventListener('fetch', event => {
  function concatArrayBuffer(ab1, ab2) {
    var tmp = new Uint8Array(ab1.byteLength + ab2.byteLength);
    tmp.set(new Uint8Array(ab1), 0);
    tmp.set(new Uint8Array(ab2), ab1.byteLength);
    return tmp.buffer;
  }

  function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
  }

  const url = event.request.url;
  const headers = event.request.headers;
  const promises = [];

  if (headers.get('range')) {
    const position = Number(/^bytes\=(\d+)\-$/g.exec(headers.get('range'))[1]);

    console.log(`[ServiceWorker] Range request for ${url}, starting position: ${position}`);

    for (let i = 0; i < 4; i++) {
      promises.push(
        fetch(url, {
          headers: new Headers({
            'Range': `bytes=${i * 10000}-${((i * 10000) + 10000)}`
          })
        })
      );
    }

    event.respondWith(
      Promise
        .all(promises)
        .then(responses => Promise.all(responses.map(res => res.arrayBuffer())))
        .then(buffers => {
          const result = buffers.reduce((acc, ab) => concatArrayBuffer(acc, ab));

          return new Response(result, {
            status: 206,
            statusText: 'Partial Content'
          });
        })
    );
  }
});

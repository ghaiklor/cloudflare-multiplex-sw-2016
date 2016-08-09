"use strict";

const fs = require('fs');
const path = require('path');
const http2 = require('http2');

const KEY = fs.readFileSync(path.join(__dirname, '../cert/localhost.key'));
const CERT = fs.readFileSync(path.join(__dirname, '../cert/localhost.crt'));
const PORT = 8080;

function onRequest(request, response) {
  const filename = path.join(__dirname, request.url);

  if ((filename.indexOf(__dirname) === 0) && fs.existsSync(filename) && fs.statSync(filename).isFile()) {
    response.writeHead(200);
    const fileStream = fs.createReadStream(filename);
    fileStream.pipe(response);
    fileStream.on('finish', response.end);
  } else {
    response.writeHead(404);
    response.end();
  }
}

http2
  .createServer({key: KEY, cert: CERT}, onRequest)
  .listen(PORT);

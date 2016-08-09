"use strict";

const fs = require('fs');
const path = require('path');
const http2 = require('http2');
const serve = require('serve-static');

const KEY = fs.readFileSync(path.join(__dirname, '../cert/localhost.key'));
const CERT = fs.readFileSync(path.join(__dirname, '../cert/localhost.crt'));
const PORT = 8080;

http2
  .createServer({key: KEY, cert: CERT}, serve(__dirname))
  .listen(PORT);

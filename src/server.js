"use strict";

const connect = require('connect');
const serveStatic = require('serve-static');

connect()
  .use(serveStatic(__dirname))
  .listen(8080, () => console.log('Server is running on 8080...'));

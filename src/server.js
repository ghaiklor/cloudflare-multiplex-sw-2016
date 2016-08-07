"use strict";

const connect = require('connect');
const serveStatic = require('serve-static');

const PORT = 8080;

connect()
  .use(serveStatic(__dirname))
  .listen(PORT, () => console.log(`Server is running on ${PORT}...`));

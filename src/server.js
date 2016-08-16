"use strict";

const connect = require('connect');
const serve = require('serve-static');

const PORT = 8080;

connect()
  .use(serve(__dirname))
  .listen(PORT, () => console.log(`Server is listening on ${PORT}...`));

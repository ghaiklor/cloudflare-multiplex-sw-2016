"use strict";

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js', {scope: '/'});
} else {
  console.warn(`Your browser doesn't support Service Workers`);
}

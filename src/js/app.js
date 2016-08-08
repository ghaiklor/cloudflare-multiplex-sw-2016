"use strict";

navigator
  .serviceWorker
  .register('service-worker.js', {scope: '/'})
  .then(registration => {
    const videos = document.querySelectorAll('video');

    for (let i = 0; i < videos.length; i++) {
      videos[i].src = videos[i].getAttribute('data-src');
    }
  })
  .catch(() => alert('Switch to Google Chrome 52.0.2743.116 (64-bit)'));

"use strict";

navigator
  .serviceWorker
  .register('service-worker.js', {scope: '/'})
  .then(registration => {
    // This dirty hack is needed because
    // SW registers later than video starts playing OR because of caching
    // Anyway, fetch event in SW is not catching video fetching
    // So, I am replacing video source with URL and a timestamp for invalidating cache
    // And, finally, got this working
    const videos = document.querySelectorAll('video');

    for (let i = 0; i < videos.length; i++) {
      videos[i].src = `${videos[i].getAttribute('data-src')}?t=${Date.now()}`;
    }
  })
  .catch(() => alert('Switch to Google Chrome 52.0.2743.116 (64-bit)'));

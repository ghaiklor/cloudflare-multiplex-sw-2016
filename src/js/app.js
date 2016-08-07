if ('serviceWorker' in navigator) {
  navigator
    .serviceWorker
    .register('service-worker.js', {scope: './'})
    .then(registration => console.log('Service Worker successfully registered'))
    .catch(error => console.log('Service Worker failed to register', error));
}

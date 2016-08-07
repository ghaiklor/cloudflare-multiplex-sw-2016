// Register our service worker
if ('serviceWorker' in navigator) {
  navigator
    .serviceWorker
    .register('service-worker.js', {scope: './'})
    .then(registration => console.log('Service Worker successfully registered'))
    .catch(error => console.log('Service Worker failed to register', error));
}

// Enumerate all video tags and replace it with direct links
// I'm a lazy one programmer who doesn't like direct links to videos and storing them on a server
// Instead, I'm grabbing that one from YouTube
(function () {
  const videos = document.querySelectorAll('video');

  for (let i = 0, l = videos.length; i < l; i++) {
    const video = videos[i];
    const src = video.src;

    if (src) {
      const isYoutube = src && src.match(/(?:youtu|youtube)(?:\.com|\.be)\/([\w\W]+)/i);

      if (isYoutube) {
        let id = isYoutube[1].match(/watch\?v=|[\w\W]+/gi);
        id = (id.length > 1) ? id.splice(1) : id;
        id = id.toString();

        video.src = `http://www.youtubeinmp4.com/redirect.php?video=${id}`;
      }
    }
  }
})();

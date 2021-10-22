const CACHE_NAME = "static-cache-v2";

const FILES_TO_CACHE = [
  "/",
  "index.html",
  "manifest.webmanifest",
  "styles.css",
  "index.js",
  "db.js",
  "icons/icon-192x192.png",
  "icons/icon-512x512.png"
]

// Install
self.addEventListener('install', event => {
    event.waitUntil(
      caches.open(CACHE_NAME).then( cache => {
        return cache.addAll(FILES_TO_CACHE);
      })
    );
    console.log('Install');
    self.skipWaiting();
  });

// Activate
self.addEventListener("activate", function (evt) {
  evt.waitUntil(
      caches.keys().then(keyList => {
          return Promise.all(
              keyList.map(key => {
                  if (key !== CACHE_NAME) {
                      console.log("Removing old cache data", key);
                      return caches.delete(key);
                  }
              })
          );
      })
  );

  self.clients.claim();
});

self.addEventListener('fetch', function (evt) {
  evt.respondWith(
      caches.open(CACHE_NAME).then(cache => {
          return cache.match(evt.request).then(response => {
              return response || fetch(evt.request);
          }).catch(err => {});
      })
  )
})

// // retrieve assets from cache
// self.addEventListener('fetch', event => {
//   event.respondWith(
//     caches.match(event.request).then( response => {
//       return response || fetch(event.request);
//     })
//   );
// });
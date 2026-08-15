const CACHE_NAME = 'webmaths-v1';
const urlsToCache = [
  './',
  './index.html',
  './about.html',
  './service.html',
  './contact.html',
  './thinetha.html',
  './styles.css',
  './scripts.js',
  './pic2.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

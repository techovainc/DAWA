/* DAWA service worker — offline app shell, stale-while-revalidate for everything else */
const VERSION = 'dawa-v13';
const SHELL = [
  './',
  'index.html',
  'css/styles.css',
  'js/hero.js',
  'js/gallery.js',
  'js/app.js',
  'assets/gallery/steam-chalice.webp',
  'assets/gallery/gold-trim-pipe.webp',
  'assets/gallery/gold-papers-pack.webp',
  'assets/gallery/gold-cone.webp',
  'assets/gallery/dawa-wine.webp',
  'assets/gallery/tasting-2021-dinner.webp',
  'assets/gallery/tasting-2021-table.webp',
  'assets/gallery/event-glass-in-hand.webp',
  'assets/data/land.json',
  'manifest.webmanifest',
  'assets/icons/favicon-32.png',
  'assets/logo/dawa-logo.webp',
  'assets/logo/dawa-logo.png',
  'assets/logo/sfra-mark-engraved.webp',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  // Pages: network first so content stays fresh, cache as offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put('index.html', copy));
          return res;
        })
        .catch(() => caches.match('index.html'))
    );
    return;
  }

  // Assets: stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

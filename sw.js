const CACHE_NAME = 'radio-fe-v1';
const ASSETS = [
  '/',
  '/index.html',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

// Estrategia: Cache First para assets, Network First para la web
self.addEventListener('fetch', (e) => {
  // Ignoramos la petición del stream de audio para que siempre sea en vivo
  if (e.request.url.includes('sonicpanelradio.com')) return;

  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});

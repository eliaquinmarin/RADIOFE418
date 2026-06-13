const CACHE_NAME = 'radio-fe-v1';
const ASSETS = [
  './',
  './index.html',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.tailwindcss.com'
];

// Instalación: Guardamos los archivos esenciales en la caché local
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting()) // Fuerza al service worker a activarse de inmediato
  );
});

// Activación: Limpiamos versiones viejas de caché para evitar conflictos de diseño
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim()) // Toma el control de la app inmediatamente
  );
});

// Estrategia de carga: Cache First para diseño, Red Directa para el streaming de audio
self.addEventListener('fetch', (e) => {
  // EXCLUSIÓN CRÍTICA: Si la petición es el flujo de audio de la radio, directo a la red sin tocar la caché
  if (e.request.url.includes('sonicpanelradio.com') || e.request.url.includes(':8246')) {
    return e.respondWith(fetch(e.request));
  }

  // Para el resto de los elementos (HTML, CSS, Fuentes) usamos la caché local
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request).catch(() => {
        // En caso de que falle internet por completo, se asegura de servir la página guardada
        return caches.match('./index.html');
      });
    })
  );
});
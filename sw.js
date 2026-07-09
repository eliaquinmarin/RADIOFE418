const CACHE_NAME = 'radio-fe-v2';

// Usamos rutas relativas (./) para evitar fallos de resolución en subcarpetas
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json', // Agregamos el manifest a la caché
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.tailwindcss.com'
];

// 1. Instalación: Cachear App Shell de forma asíncrona y segura
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cacheando App Shell');
        // Usamos addAll, pero si falla un recurso externo crítico, podría fallar.
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// 2. Activación: Limpieza automática de cachés antiguas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Eliminando caché antigua:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Intercepción de peticiones (Estrategia Inteligente)
self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  // REGLA 1: Ignorar por completo el streaming de audio (Bypass total de caché y Service Worker)
  if (url.includes('sonicpanelradio.com') || url.includes(':8246') || e.request.destination === 'audio') {
    return; // Al no llamar a e.respondWith(), el navegador maneja la petición por la red normal
  }

  // REGLA 2: Ignorar peticiones que no sean GET (ej. POST de analíticas o formularios)
  if (e.request.method !== 'GET') return;

  // REGLA 3: Estrategia para el resto de la aplicación
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // Si está en caché, lo servimos inmediatamente (Cache First)
      if (cachedResponse) {
        return cachedResponse;
      }

      // Si no está en caché, vamos a la red
      return fetch(e.request)
        .then((networkResponse) => {
          // Validamos que la respuesta sea correcta antes de guardarla dinámicamente
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          // Clonamos la respuesta para guardarla en caché si es un asset estático útil
          // (Opcional: puedes habilitar esto si tienes imágenes dinámicas de la radio)
          /*
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
          */

          return networkResponse;
        })
        .catch(() => {
          // FALLBACK DE EMERGENCIA: Si falla la red (offline) y es una navegación de página,
          // devolvemos el index.html que está en caché.
          if (e.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
    })
  );
});

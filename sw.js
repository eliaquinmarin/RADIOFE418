const CACHE_NAME = 'radiofe-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/img/icon.png',
  '/img/caratula.png',
  '/img/logo.png',
  '/img/top5/IMAGEN1.png',
  '/img/top5/IMAGEN2.png',
  '/img/top5/IMAGEN3.png',
  '/img/top5/IMAGEN4.png',
  '/img/top5/IMAGEN5.png',
  '/img/contextopubli/imagen.png',
  '/img/directiva/director.webp',
  '/img/directiva/administradora.webp',
  '/img/directiva/vozoficial.webp'
];

// Evento de Instalación: Guarda en caché la estructura básica de la app
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Almacenando recursos estáticos en caché');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Evento de Activación: Limpia cachés antiguas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Eliminando caché antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de Estrategia de Red: Network First falling back to Cache
// Ideal para streaming y datos en vivo de Google Sheets, recurriendo al caché si falla la red.
self.addEventListener('fetch', (e) => {
  // Evitar interceptar peticiones de streaming de audio o scripts externos de analíticas de terceros si es necesario
  if (e.request.url.includes('stream') || e.request.url.includes('script.google.com')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Clonamos la respuesta y la guardamos en caché si es válida
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red (offline), busca en el almacenamiento de caché
        return caches.match(e.request);
      })
  );
});
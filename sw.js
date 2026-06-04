const CACHE_NAME = 'radio-fe-v1';
const ASSETS = [
    '/',
    '/index.html',
    // Agrega aquí tus archivos CSS y JS principales si es necesario
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Activación y limpieza de caché antigua
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
        })
    );
});

// Estrategia de red: Primero red, luego caché (ideal para radio en vivo)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
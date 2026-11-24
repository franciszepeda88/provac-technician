const CACHE_NAME = 'provac-technician-v33';
// Variables de diseño, barra PROVAC y tipografía vienen del Hub: se guardan aparte para que la app
// conserve su aspecto (y la barra) cuando el técnico está sin señal.
const CACHE_DS = 'provac-ds-v1';
const ORIGEN_DS = 'https://provac-hub.vercel.app';
const STATIC_ASSETS = [
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== CACHE_DS) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Las llamadas al backend (otro origen: host/puerto del API) nunca se
  // cachean, van directo a la red tal cual. Si fallan por falta de
  // conexión, cada formulario decide qué hacer (guardarlas en la cola
  // local de IndexedDB para sincronizar después).
  // Archivos del sistema de diseño (Hub): se sirve la copia guardada y se actualiza en segundo plano.
  if (request.method === 'GET' && url.origin === ORIGEN_DS && url.pathname.startsWith('/ds/')) {
    event.respondWith(
      caches.open(CACHE_DS).then(cache =>
        cache.match(request).then(guardada => {
          const red = fetch(request)
            .then(response => {
              if (response && (response.status === 200 || response.type === 'opaque')) cache.put(request, response.clone());
              return response;
            })
            .catch(() => guardada);
          return guardada || red;
        })
      )
    );
    return;
  }

  const esMismoOrigen = url.origin === self.location.origin;
  if (!esMismoOrigen || request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }

  // App (HTML, JS, CSS, assets) y estáticos del mismo origen: se intenta
  // la red primero y, si no hay conexión, se sirve la última copia en
  // caché. Así la app abre aunque el técnico esté sin señal, y siempre
  // se actualiza sola apenas hay conexión (por eso se prueba la red primero).
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

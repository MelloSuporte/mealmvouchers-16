const CACHE_NAME = 'voucher-system-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Não armazena em cache, apenas retorna a resposta
        return response;
      })
      .catch(() => {
        return new Response(JSON.stringify({
          error: 'Sistema offline',
          message: 'Por favor, verifique sua conexão com a internet'
        }), {
          status: 503,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      })
  );
});
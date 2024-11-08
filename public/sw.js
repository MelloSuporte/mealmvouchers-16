const CACHE_NAME = 'voucher-system-v1';

self.addEventListener('install', (event) => {
  // Skip caching during install
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Only try to fetch from network, don't use cache
  event.respondWith(
    fetch(event.request).catch(() => {
      // If fetch fails (offline), return error response
      return new Response('Sistema offline. Por favor, verifique sua conexão.', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
          'Content-Type': 'text/plain',
        }),
      });
    })
  );
});
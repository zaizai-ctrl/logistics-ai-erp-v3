// This file is a one-time cleanup worker for older PWA builds.
// It does not cache anything; it only removes old caches and unregisters itself.
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    if (self.caches) {
      const keys = await self.caches.keys();
      await Promise.all(keys.map((key) => self.caches.delete(key)));
    }

    const registration = await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) {
      const url = new URL(client.url);
      if (url.searchParams.get('swclean') !== '1') {
        url.searchParams.set('swclean', '1');
        client.navigate(url.href);
      } else {
        client.navigate(client.url);
      }
    }

    return registration;
  })());
});

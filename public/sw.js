/* Minimal service worker for Pickup Line Generator PWA.
   Keeps fast repeat opens on iOS home-screen (standalone) mode and
   serves an offline fallback page. */
const VERSION = "v1";
const STATIC_CACHE = `plg-static-${VERSION}`;
const PAGES_CACHE = `plg-pages-${VERSION}`;
const OFFLINE_URL = "/offline";
const PRECACHE = [
  OFFLINE_URL,
  "/manifest.json",
  "/logo.svg",
  "/ph_heart-fill.svg",
  "/content.svg",
  "/copy.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await cache.addAll(PRECACHE).catch(() => {
        /* best-effort precache */
      });
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("plg-") && key !== STATIC_CACHE && key !== PAGES_CACHE)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // Server Actions etc. go to network

  // App shell pages: network-first with offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(PAGES_CACHE);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const cache = await caches.open(PAGES_CACHE);
          return (
            (await cache.match(request)) ||
            (await caches.match(OFFLINE_URL)) ||
            Response.error()
          );
        }
      })(),
    );
    return;
  }

  // Same-origin static assets (RSC / JS, CSS, images): stale-while-revalidate.
  const url = new URL(request.url);
  if (url.origin === self.location.origin && (/_next\/static/.test(url.pathname) || /\.(?:png|jpe?g|webp|svg|ico|css|woff2?)$/.test(url.pathname))) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })(),
    );
  }
});

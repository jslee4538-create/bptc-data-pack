// Kyoto Leisure Guide - basic service worker
// Strategy:
//  - App shell precache (static assets list small to keep install fast)
//  - Runtime: network-first for navigation, cache-first for /_next/static and same-origin static assets
//  - OSM tiles: cache-first with size cap (added in Phase 3-3)

const CACHE_VERSION = "v1";
const SHELL_CACHE = `kg-shell-${CACHE_VERSION}`;
const STATIC_CACHE = `kg-static-${CACHE_VERSION}`;
const TILE_CACHE = `kg-tiles-${CACHE_VERSION}`;

const SHELL_URLS = ["/", "/icon.svg", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![SHELL_CACHE, STATIC_CACHE, TILE_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

function isOSMTile(url) {
  return /https:\/\/[abc]?\.?tile\.openstreetmap\.org\//.test(url);
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // OSM tiles: cache-first with cap
  if (isOSMTile(url.href)) {
    event.respondWith(
      caches.open(TILE_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;
        try {
          const fresh = await fetch(req);
          if (fresh.ok) {
            cache.put(req, fresh.clone());
            // Trim cache to ~200 entries
            const keys = await cache.keys();
            if (keys.length > 200) {
              for (const k of keys.slice(0, keys.length - 200)) {
                cache.delete(k);
              }
            }
          }
          return fresh;
        } catch {
          return cached || Response.error();
        }
      })
    );
    return;
  }

  // Same-origin static assets (Next.js bundles, images): cache-first
  if (url.origin === self.location.origin && url.pathname.startsWith("/_next/static")) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;
        const fresh = await fetch(req);
        if (fresh.ok) cache.put(req, fresh.clone());
        return fresh;
      })
    );
    return;
  }

  // Navigation requests: network-first with shell fallback
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Update shell cache with the root response
          if (url.pathname === "/" && res.ok) {
            const clone = res.clone();
            caches.open(SHELL_CACHE).then((c) => c.put("/", clone));
          }
          return res;
        })
        .catch(async () => {
          const cache = await caches.open(SHELL_CACHE);
          return (await cache.match(req)) || (await cache.match("/")) || Response.error();
        })
    );
    return;
  }
});

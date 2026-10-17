'use strict';

const CACHE_PREFIX = 'yemen-opportunities-portal-';
const CACHE_VERSION = 'v1';
const CACHE_NAME = CACHE_PREFIX + CACHE_VERSION;

const APP_SHELL = [
  './',
  './index.html',
  './detail.html',
  './about.html',
  './statistics.html',
  './suggest.html',
  './css/styles.css',
  './css/product-polish.css',
  './css/about.css',
  './css/statistics.css',
  './css/suggest.css',
  './js/list.js',
  './js/translations.js',
  './js/navigation.js',
  './js/deadlines.js',
  './js/favorites.js',
  './js/detail.js',
  './js/about.js',
  './js/statistics.js',
  './js/suggest.js',
  './js/offline.js',
  './data/opportunities.json',
  './assets/images/yemen-opportunities-logo.png',
  './assets/images/mohammed-tariq-profile.jpg'
];

function scopedRequest(asset) {
  return new Request(
    new URL(asset, self.registration.scope).href,
    { cache: 'reload' }
  );
}

async function precacheAppShell() {
  const cache = await caches.open(CACHE_NAME);

  await Promise.all(
    APP_SHELL.map(async (asset) => {
      try {
        const request = scopedRequest(asset);
        const response = await fetch(request);

        if (response.ok) {
          await cache.put(request, response.clone());
        }
      } catch (error) {
        // Individual failures are verified later by the offline test.
      }
    })
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      await precacheAppShell();
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();

      await Promise.all(
        names
          .filter(
            (name) =>
              name.startsWith(CACHE_PREFIX) &&
              name !== CACHE_NAME
          )
          .map((name) => caches.delete(name))
      );

      await self.clients.claim();
    })()
  );
});

async function cacheFirst(request) {
  const cached = await caches.match(request, { ignoreSearch: true });

  if (cached) {
    return cached;
  }

  const response = await fetch(request);

  if (response && response.ok) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }

  return response;
}

async function networkFirst(request, useIndexFallback) {
  try {
    const response = await fetch(request);

    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const cached = await caches.match(request, { ignoreSearch: true });

    if (cached) {
      return cached;
    }

    if (useIndexFallback) {
      const fallback = await caches.match(
        new URL("./index.html", self.registration.scope).href
      );

      if (fallback) {
        return fallback;
      }
    }

    throw error;
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, true));
    return;
  }

  if (url.pathname.endsWith('/data/opportunities.json')) {
    event.respondWith(networkFirst(request, false));
    return;
  }

  event.respondWith(cacheFirst(request));
});

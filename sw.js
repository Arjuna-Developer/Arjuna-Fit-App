// sw.js — Service Worker con cache agresivo
// Cache-first para assets, network-first para HTML y API
const CACHE_V = 'af-v3';
const STATIC_CACHE = 'af-static-v3';
const RUNTIME_CACHE = 'af-runtime-v3';

// Assets que se cachean en install (críticos)
const PRECACHE = [
  '/',
  '/index.html',
  '/pages/dashboard.html',
  '/pages/nutrition.html',
  '/pages/coach.html',
  '/pages/workout.html',
  '/pages/progress.html',
  '/pages/profile.html',
  '/offline.html',
  '/js/core/session-cache.js',
  '/js/core/auth-bootstrap.js',
  '/js/core/coach-ai.js',
  '/js/core/arju-prompts.js',
  '/js/core/trial-guard.js',
  '/js/nutrition/food-log.js',
  '/manifest.json',
];

// Instalar — pre-cachear críticos
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(STATIC_CACHE).then(function(cache) {
      return cache.addAll(PRECACHE).catch(function(err) {
        console.warn('[SW] Precache error:', err.message);
      });
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Activar — limpiar caches viejos
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== STATIC_CACHE && k !== RUNTIME_CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch — estrategia por tipo de recurso
self.addEventListener('fetch', function(e) {
  var url = new URL(e.request.url);

  // API calls — siempre network (nunca cachear)
  if (url.pathname.startsWith('/api/')) {
    return; // sin interceptar
  }

  // Assets estáticos (JS, CSS, fonts, imágenes) — cache-first
  if (e.request.destination === 'script' ||
      e.request.destination === 'style' ||
      e.request.destination === 'font' ||
      e.request.destination === 'image') {
    e.respondWith(
      caches.match(e.request).then(function(cached) {
        if (cached) return cached;
        return fetch(e.request).then(function(response) {
          if (response.ok) {
            var clone = response.clone();
            caches.open(RUNTIME_CACHE).then(function(cache) {
              cache.put(e.request, clone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // HTML pages — network-first con fallback a cache
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request).then(function(response) {
        if (response.ok) {
          var clone = response.clone();
          caches.open(RUNTIME_CACHE).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      }).catch(function() {
        return caches.match(e.request)
          .then(function(cached) { return cached || caches.match('/offline.html'); });
      })
    );
    return;
  }
});

// ArjunaFit Service Worker v3
// CAMBIO CLAVE: los HTML nunca se cachean — siempre vienen del servidor.
// Solo se cachean assets estáticos (CSS, JS, imágenes).

const CACHE = 'arjunafit-v3';

// Solo assets que no cambian frecuentemente
const PRECACHE = [
  '/styles/tokens.css',
  '/styles/reset.css',
  '/styles/components.css',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js'
];

// Nunca cachear estos patrones
const NO_CACHE = [
  '.html',        // TODOS los HTML siempre del servidor
  'supabase.co',  // API Supabase
  'api.openai',   // API OpenAI
  'hotmart.com',  // Hotmart
  'netlify/functions', // Netlify functions
  'fonts.googleapis',  // Google Fonts (tienen su propio cache)
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(PRECACHE).catch(err => console.warn('[SW] Precache error:', err)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => {
          console.log('[SW] Eliminando cache viejo:', k);
          return caches.delete(k);
        })
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = e.request.url;

  // Nunca interceptar si coincide con NO_CACHE
  const skip = NO_CACHE.some(pattern => url.includes(pattern));
  if (skip) return; // deja que el browser lo maneje directamente

  // Cache-first para assets estáticos (CSS, JS, imágenes, fuentes CDN)
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type !== 'opaque') {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return res;
      }).catch(() => {
        // Sin red y sin cache → nada que hacer
        console.warn('[SW] Sin red para:', url);
      });
    })
  );
});

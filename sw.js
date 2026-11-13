/* Inventario CINEX · service worker
   - Navegaciones: red primero (para que las actualizaciones lleguen) y
     caché de respaldo cuando no hay señal.
   - Iconos/manifest: caché primero (casi nunca cambian).
   - No toca peticiones a otros orígenes (Supabase, etc.). */

const CACHE = 'inventario-cinex-1794580733';
const SHELL = [
  './',
  './index.html',
  './css/estilos.css',
  './js/app.js',
  'https://gowtxlbyyjhsuefgyvoa.supabase.co/storage/v1/object/public/panel/js/datos.js?v=1794580733',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (ev) => {
  ev.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting())
      .catch(() => {})
  );
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== location.origin) return;   // solo nuestro propio origen

  // Red primero en todo: si hay internet se sirve la versión más reciente
  // y se guarda en caché; sin internet se sirve la caché (y si tampoco
  // está, la página de la app).
  ev.respondWith((async () => {
    try {
      const r = await fetch(req);
      if (r && r.ok) {
        const copia = r.clone();
        caches.open(CACHE).then((c) => c.put(req, copia)).catch(() => {});
      }
      return r;
    } catch (e) {
      const enCache = await caches.match(req);
      if (enCache) return enCache;
      if (req.mode === 'navigate') {
        const app = await caches.match('./index.html');
        if (app) return app;
      }
      return new Response('', { status: 504, statusText: 'Sin conexión' });
    }
  })());
});

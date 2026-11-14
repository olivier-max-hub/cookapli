/* Cookapli — service worker : rend l'appli installable et utilisable hors ligne */
const V = 'cookapli-v31';
const SHELL = ['./', 'index.html', 'courses.html', 'commentaire.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable.png', 'icon.svg', 'mascotte/pouce.webp', 'mascotte/caddie.webp', 'mascotte/boites.webp', 'mascotte/accueil-miroir.webp', 'mascotte/fete.webp'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('cookapli-') && k !== V).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  /* réseau d'abord (mises à jour immédiates), cache si hors ligne */
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(r => { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true })));
});

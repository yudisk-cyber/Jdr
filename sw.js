// Service worker : réseau d'abord (les mises à jour arrivent tout de suite), cache en secours (hors ligne).
const VERSION = 'codex-jdr-v7';
const FILES = ['./', 'index.html', 'app.js', 'data-starwars.js', 'data-starwars-trees.js', 'data-starwars-extra.js', 'data-starwars-adv.js', 'data-starwars-veh.js', 'data-sda.js', 'sys-sda.js', 'data-ygg.js', 'sys-ygg.js', 'data-motw.js', 'sys-motw.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(FILES.map(f => fetch(new Request(f, { cache: 'reload' })).then(r => r.ok && c.put(f, r)).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html'))));
});

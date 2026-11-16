/* Service Worker: cache-first do app shell, com versão e limpeza de caches antigos. */
const VERSION = 'v5'; // aumente a cada atualização do app para renovar o cache
const SHELL_CACHE = 'pwc-shell-' + VERSION;
const CONFIG_CACHE = 'pwc-config'; // guarda nome/cor do app para o manifest personalizado
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      // cache: 'reload' ignora o cache HTTP para não guardar uma versão antiga.
      .then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('pwc-shell-') && k !== SHELL_CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// A página envia nome e cor do app; o SW usa isso ao servir o manifest.json.
self.addEventListener('message', (event) => {
  const d = event.data || {};
  if (d.type !== 'config') return;
  const cfg = {
    name: String(d.name || '').slice(0, 40),
    color: /^#[0-9a-fA-F]{6}$/.test(d.color) ? d.color : null
  };
  event.waitUntil(
    caches.open(CONFIG_CACHE).then((c) => c.put('config', new Response(JSON.stringify(cfg), {
      headers: { 'Content-Type': 'application/json' }
    })))
  );
});

async function personalizedManifest(request) {
  const cache = await caches.open(SHELL_CACHE);
  const base = (await cache.match('./manifest.json')) || (await fetch(request));
  const manifest = await base.clone().json();
  try {
    const cfgRes = await (await caches.open(CONFIG_CACHE)).match('config');
    if (cfgRes) {
      const cfg = await cfgRes.json();
      if (cfg.name) { manifest.name = cfg.name; manifest.short_name = cfg.name.slice(0, 12); }
      if (cfg.color) manifest.theme_color = cfg.color;
    }
  } catch (e) { /* config ausente ou inválida: usa o manifest padrão */ }
  return new Response(JSON.stringify(manifest), {
    headers: { 'Content-Type': 'application/manifest+json' }
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.endsWith('/manifest.json')) {
    event.respondWith(personalizedManifest(req));
    return;
  }

  // Navegação: sempre devolve o index.html do cache (SPA por hash).
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then((r) => r || fetch(req))
    );
    return;
  }

  // Demais arquivos: cache-first, com rede como reserva (e guarda no cache).
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(SHELL_CACHE).then((c) => c.put(req, copy));
      }
      return res;
    }))
  );
});
